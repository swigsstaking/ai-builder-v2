import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Globe, Loader2, ArrowRight, ArrowLeft, Sparkles, Check,
  Eye, EyeOff, ChevronUp, ChevronDown, AlertCircle, Wand2,
  Copy, Palette, LayoutTemplate, Rocket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useMigrationStore from '../stores/migrationStore';
import DesignStyleSelector, { DESIGN_STYLES } from '../components/DesignStyleSelector';
import { buildApi } from '../services/api';

const BG = '#0f0f1a';
const CARD = '#1e1e35';
const BORDER = 'rgba(255,255,255,0.07)';
const INPUT_BG = '#151525';
const GRADIENT = 'linear-gradient(135deg, #7c3aed, #3b82f6)';

const STEPS = [
  { label: 'URL du site', icon: Globe },
  { label: 'Analyse', icon: Sparkles },
  { label: 'Contenu extrait', icon: Copy },
  { label: 'Style', icon: Palette },
  { label: 'Sections', icon: LayoutTemplate },
  { label: 'Création', icon: Rocket },
];

export default function MigrationWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    migration, status, error,
    startAnalysis, pollStatus, updateExtracted,
    triggerMapping, updateMapping, createSite, reset,
  } = useMigrationStore();

  const [step, setStep] = useState(0);
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [mode, setMode] = useState('faithful');
  const [siteName, setSiteName] = useState('');
  const [designStyle, setDesignStyle] = useState('modern');
  const [extractedEdit, setExtractedEdit] = useState(null);
  const [mappingEdit, setMappingEdit] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { reset(); }, []);

  useEffect(() => {
    if (migration?.extractedContent?.businessName && (!extractedEdit || !extractedEdit.businessName)) {
      setExtractedEdit({ ...migration.extractedContent });
      setSiteName(migration.extractedContent.businessName || '');
    }
  }, [migration?.extractedContent]);

  useEffect(() => {
    if (migration?.sectionMapping?.length && !mappingEdit) {
      setMappingEdit([...migration.sectionMapping]);
    }
  }, [migration?.sectionMapping]);

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) { toast.error('Veuillez entrer une URL'); return; }
    try {
      setStep(1);
      const migrationId = await startAnalysis(url.trim(), mode);
      const result = await pollStatus(migrationId);
      if (result.status === 'analyzed') {
        setStep(2);
        const type = result.extractedContent?.businessType || '';
        setDesignStyle(suggestStyle(type));
      }
    } catch {
      toast.error('Erreur lors de l\'analyse');
    }
  }, [url, mode, startAnalysis, pollStatus]);

  const handleSaveExtracted = useCallback(async () => {
    if (!migration?._id) return;
    try {
      await updateExtracted(migration._id, extractedEdit, designStyle);
      setStep(3);
    } catch { toast.error('Erreur de sauvegarde'); }
  }, [migration, extractedEdit, designStyle, updateExtracted]);

  const handleTriggerMapping = useCallback(async () => {
    if (!migration?._id) return;
    try {
      const result = await triggerMapping(migration._id, designStyle);
      if (result.sectionMapping?.length) setMappingEdit([...result.sectionMapping]);
      setStep(4);
    } catch { toast.error('Erreur de mapping'); }
  }, [migration, designStyle, triggerMapping]);

  const handleCreate = useCallback(async () => {
    if (!migration?._id) return;
    setCreating(true);
    try {
      await updateMapping(migration._id, mappingEdit, designStyle);
      const result = await createSite(migration._id, { name: siteName || extractedEdit?.businessName || 'Mon site' });
      if (result.site?._id) {
        try { await buildApi.trigger(result.site._id); } catch {}
        toast.success('Site créé avec succès !');
        setStep(5);
        setTimeout(() => navigate(`/dashboard/sites/${result.site._id}/pages`), 1500);
      }
    } catch {
      toast.error('Erreur lors de la création');
    } finally { setCreating(false); }
  }, [migration, mappingEdit, designStyle, siteName, extractedEdit, updateMapping, createSite, navigate]);

  const toggleSection = (idx) => {
    setMappingEdit(prev => prev.map((s, i) => i === idx ? { ...s, visible: !s.visible } : s));
  };

  const moveSection = (idx, dir) => {
    setMappingEdit(prev => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr.map((s, i) => ({ ...s, order: i }));
    });
  };

  return (
    <div className="min-h-screen" style={{ background: BG, color: '#e2e8f0' }}>
      {/* Progress bar */}
      <div className="sticky top-0 z-10" style={{ background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft size={12} /> Accueil
            </button>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-sm font-semibold text-white">Migration de site</span>
          </div>
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    active ? 'text-purple-300' : done ? 'text-green-400' : 'text-gray-500'
                  }`} style={active ? { background: 'rgba(124,58,237,0.15)' } : {}}>
                    {done ? <Check size={13} /> : <Icon size={13} />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${done ? 'bg-green-500/40' : 'bg-white/5'}`} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 0: URL input */}
        {step === 0 && (
          <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-white mb-2">Importer un site existant</h1>
            <p className="text-gray-400 mb-8">Entrez l'URL du site que vous souhaitez migrer. Notre IA analysera le contenu et le design.</p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">URL du site</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url" value={url} onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                    placeholder="https://www.example.com" autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
                    style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.1)` }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Mode de migration</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'faithful', icon: Copy, label: 'Fidèle', desc: 'Reprend le contenu tel quel dans un nouveau design' },
                    { id: 'modernize', icon: Wand2, label: 'Moderniser', desc: 'L\'IA améliore et réécrit le contenu' },
                  ].map(m => (
                    <button key={m.id} type="button" onClick={() => setMode(m.id)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background: mode === m.id ? 'rgba(124,58,237,0.1)' : CARD,
                        border: `1px solid ${mode === m.id ? 'rgba(124,58,237,0.4)' : BORDER}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <m.icon size={16} className={mode === m.id ? 'text-purple-300' : 'text-gray-500'} />
                        <span className="text-sm font-semibold text-white">{m.label}</span>
                      </div>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleAnalyze} disabled={!url.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 text-white rounded-xl font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: GRADIENT }}
              >
                <Sparkles size={18} /> Analyser le site
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Analysis in progress */}
        {step === 1 && (
          <div className="max-w-md mx-auto text-center py-16">
            <Loader2 size={40} className="animate-spin text-purple-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Analyse en cours...</h2>
            <p className="text-sm text-gray-400 mb-4">{migration?.currentStep || 'Préparation'}</p>
            {migration?.progress > 0 && (
              <div className="w-full rounded-full h-1.5 mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${migration.progress}%`, background: GRADIENT }} />
              </div>
            )}
            <p className="text-xs text-gray-500">Cela peut prendre 30 secondes à 2 minutes</p>
            {status === 'error' && (
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <AlertCircle size={16} /><span className="font-semibold text-sm">Erreur</span>
                </div>
                <p className="text-sm text-red-300">{error}</p>
                <button onClick={() => setStep(0)} className="mt-2 text-sm text-red-400 underline">Réessayer</button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review extracted content */}
        {step === 2 && extractedEdit && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">Contenu extrait</h1>
                <p className="text-sm text-gray-400">Vérifiez et modifiez les informations détectées</p>
              </div>
              <button onClick={handleSaveExtracted}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold transition-all hover:brightness-110"
                style={{ background: GRADIENT }}
              >Continuer <ArrowRight size={16} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nom de l'entreprise" value={extractedEdit.businessName}
                onChange={v => setExtractedEdit(p => ({ ...p, businessName: v }))} />
              <Field label="Type d'activité" value={extractedEdit.businessType}
                onChange={v => setExtractedEdit(p => ({ ...p, businessType: v }))} />
              <div className="md:col-span-2">
                <Field label="Description" value={extractedEdit.description} multiline
                  onChange={v => setExtractedEdit(p => ({ ...p, description: v }))} />
              </div>
              <Field label="Slogan" value={extractedEdit.tagline}
                onChange={v => setExtractedEdit(p => ({ ...p, tagline: v }))} />
              <Field label="Téléphone" value={extractedEdit.contactInfo?.phone}
                onChange={v => setExtractedEdit(p => ({ ...p, contactInfo: { ...p.contactInfo, phone: v } }))} />
              <Field label="Email" value={extractedEdit.contactInfo?.email}
                onChange={v => setExtractedEdit(p => ({ ...p, contactInfo: { ...p.contactInfo, email: v } }))} />
              <Field label="Adresse" value={extractedEdit.contactInfo?.address}
                onChange={v => setExtractedEdit(p => ({ ...p, contactInfo: { ...p.contactInfo, address: v } }))} />

              <div className="md:col-span-2 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <label className="text-sm font-medium text-gray-300 block mb-3">Couleurs détectées</label>
                <div className="flex gap-4">
                  {['primary', 'secondary', 'accent'].map(key => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="relative w-8 h-8 rounded-lg border border-white/10 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: extractedEdit.colors?.[key] || '#000' }}>
                        <input type="color" value={extractedEdit.colors?.[key] || '#000000'}
                          onChange={e => setExtractedEdit(p => ({ ...p, colors: { ...p.colors, [key]: e.target.value } }))}
                          className="absolute inset-0 opacity-0 cursor-pointer" />
                      </label>
                      <span className="text-xs text-gray-400 capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <label className="text-sm font-medium text-gray-300 block mb-3">
                  Services détectés ({extractedEdit.services?.length || 0})
                </label>
                <div className="space-y-2">
                  {(extractedEdit.services || []).map((s, i) => (
                    <input key={i} value={s.title}
                      onChange={e => {
                        const services = [...extractedEdit.services];
                        services[i] = { ...services[i], title: e.target.value };
                        setExtractedEdit(p => ({ ...p, services }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500/30"
                      style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.08)` }}
                      placeholder="Nom du service"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Design style */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">Choisissez un style</h1>
                <p className="text-sm text-gray-400">Sélectionnez le design qui correspond à votre activité</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex items-center gap-1 px-4 py-2 text-sm text-gray-300 rounded-xl transition-colors hover:text-white" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <ArrowLeft size={14} /> Retour
                </button>
                <button onClick={handleTriggerMapping}
                  className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold transition-all hover:brightness-110"
                  style={{ background: GRADIENT }}
                >Continuer <ArrowRight size={16} /></button>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Nom du site</label>
              <input value={siteName} onChange={e => setSiteName(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/40"
                style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.1)` }}
                placeholder={extractedEdit?.businessName || 'Mon site'}
              />
            </div>
            <DesignStyleSelector value={designStyle} onChange={setDesignStyle} recommended={suggestStyle(extractedEdit?.businessType)} />
          </div>
        )}

        {/* Step 4: Section mapping */}
        {step === 4 && mappingEdit && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">Structure du site</h1>
                <p className="text-sm text-gray-400">Réorganisez, masquez ou affichez les sections</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="flex items-center gap-1 px-4 py-2 text-sm text-gray-300 rounded-xl transition-colors hover:text-white" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <ArrowLeft size={14} /> Retour
                </button>
                <button onClick={handleCreate} disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: GRADIENT }}
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                  Créer le site
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {mappingEdit.map((section, idx) => (
                <div key={idx}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section.visible ? '' : 'opacity-40'}`}
                  style={{ background: CARD, border: `1px solid ${BORDER}` }}
                >
                  <span className="w-6 text-center text-xs text-gray-500 font-mono">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white">{SECTION_LABELS[section.sectionType] || section.sectionType}</span>
                    <p className="text-xs text-gray-500 truncate">{section.data?.headline || section.data?.title || section.data?.text || ''}</p>
                  </div>
                  <button onClick={() => toggleSection(idx)} className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors">
                    {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="p-1 text-gray-600 hover:text-white disabled:opacity-20">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moveSection(idx, 1)} disabled={idx === mappingEdit.length - 1} className="p-1 text-gray-600 hover:text-white disabled:opacity-20">
                    <ChevronDown size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <Check size={32} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Site créé !</h2>
            <p className="text-sm text-gray-400 mb-6">Redirection vers l'éditeur...</p>
            <Loader2 size={20} className="animate-spin text-purple-300 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline = false }) {
  return (
    <div className="rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <label className="text-sm font-medium text-gray-300 block mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm text-white resize-none outline-none focus:ring-1 focus:ring-purple-500/30"
          style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.08)` }} />
      ) : (
        <input value={value || ''} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-purple-500/30"
          style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.08)` }} />
      )}
    </div>
  );
}

function suggestStyle(businessType) {
  const t = (businessType || '').toLowerCase();
  if (/restaurant|hotel|luxe|bijou/.test(t)) return 'elegant';
  if (/agence|startup|tech|digital|marketing/.test(t)) return 'bold';
  if (/portfolio|photo|artist|design/.test(t)) return 'artistic';
  if (/consultant|médic|avocat|cabinet/.test(t)) return 'minimal';
  return 'modern';
}

const SECTION_LABELS = {
  'hero': 'Hero (bannière)', 'text-highlight': 'Texte d\'accroche', 'description': 'Description',
  'services-grid': 'Services (grille)', 'why-us': 'Pourquoi nous',
  'cta-banner': 'Bandeau CTA', 'guarantee': 'Garantie', 'testimonials': 'Témoignages', 'faq': 'FAQ',
  'team': 'Équipe', 'map': 'Carte / Contact',
  'google-reviews': 'Avis Google',
};
