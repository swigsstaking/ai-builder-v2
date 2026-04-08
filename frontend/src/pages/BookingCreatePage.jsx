import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, Upload, X, Calendar, Palette, Check, Globe, Loader } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import useSiteStore from '../stores/siteStore';
import { pagesApi, aiApi, buildApi, mediaApi, migrationApi, sitesApi } from '../services/api';
import { mapBookingAiContentToSections, distributeImagesToSections } from '../lib/aiPageBuilder';
import CreateProgressModal from '../components/CreateProgressModal';
import DesignStyleSelector, { DESIGN_STYLES } from '../components/DesignStyleSelector';
import { Button, Card, Input } from '../ui';

const COLOR_PALETTES = [
  { name: 'Ocean',   primary: '#0ea5e9', secondary: '#0f172a', accent: '#f59e0b' },
  { name: 'Forest',  primary: '#22c55e', secondary: '#14532d', accent: '#eab308' },
  { name: 'Sunset',  primary: '#f97316', secondary: '#1c1917', accent: '#ec4899' },
  { name: 'Royal',   primary: '#8b5cf6', secondary: '#1e1b4b', accent: '#f472b6' },
  { name: 'Minimal', primary: '#3b82f6', secondary: '#111827', accent: '#10b981' },
  { name: 'Warm',    primary: '#ef4444', secondary: '#292524', accent: '#fbbf24' },
  { name: 'Cool',    primary: '#06b6d4', secondary: '#0c4a6e', accent: '#a855f7' },
  { name: 'Earth',   primary: '#d97706', secondary: '#422006', accent: '#84cc16' },
];

const SPECIALTIES = [
  'Ostéopathe', 'Kinésithérapeute', 'Psychologue', 'Sophrologue', 'Naturopathe',
  'Diététicien', 'Coach sportif', 'Hypnothérapeute', 'Réflexologue', 'Acupuncteur',
  'Chiropracteur', 'Orthophoniste', 'Podologue', 'Masseur', 'Coiffeur',
  'Esthéticienne', 'Barbier', 'Consultant', 'Avocat', 'Autre',
];

export default function BookingCreatePage() {
  const navigate = useNavigate();
  const { createSite } = useSiteStore();

  // Core fields
  const [practitionerName, setPractitionerName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [designStyle, setDesignStyle] = useState('modern');

  // Color
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);

  // Optional
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  // Photo
  const [photo, setPhoto] = useState(null);

  // URL import
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  const handleImportFromUrl = async () => {
    const url = importUrl.trim();
    if (!url) { toast.error('Entrez une URL'); return; }
    setImporting(true);
    setImportProgress('Lancement de l\'analyse...');

    try {
      const { migrationId } = await migrationApi.analyze({ sourceUrl: url });

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 2000));
        const { migration } = await migrationApi.getStatus(migrationId);

        if (migration.currentStep) {
          setImportProgress(migration.currentStep);
        }

        if ((migration.status === 'completed' || migration.status === 'analyzed') && migration.extractedContent) {
          const ec = migration.extractedContent;

          // Pre-fill form fields from extracted content
          if (ec.businessName && !practitionerName) setPractitionerName(ec.businessName);
          if (ec.businessType) {
            const match = SPECIALTIES.find(s => s.toLowerCase() === ec.businessType.toLowerCase());
            if (match) setSpecialty(match);
            else { setSpecialty('Autre'); setCustomSpecialty(ec.businessType); }
          }
          // Try city from contactInfo, then from SEO keywords, then from description
          const extractedCity = ec.contactInfo?.city
            || ec.seo?.keywords?.find(k => /^[A-Z][a-zéèêëàâùûôîïç]+$/.test(k))
            || '';
          if (extractedCity && !city) setCity(extractedCity);
          if (ec.contactInfo?.phone && !phone) { setPhone(ec.contactInfo.phone); setShowOptional(true); }
          if (ec.contactInfo?.email && !email) { setEmail(ec.contactInfo.email); setShowOptional(true); }
          if (ec.contactInfo?.address && !address) { setAddress(ec.contactInfo.address); setShowOptional(true); }
          if (ec.description && !description) { setDescription(ec.description); setShowOptional(true); }

          // Extract services as comma-separated for the AI prompt
          if (ec.services?.length) {
            const serviceNames = ec.services.map(s => s.title || s.name).filter(Boolean).join(', ');
            if (serviceNames && !description) {
              setDescription(prev => prev ? `${prev}\n\nPrestations : ${serviceNames}` : `Prestations : ${serviceNames}`);
              setShowOptional(true);
            }
          }

          toast.success('Informations importées avec succès');
          break;
        }

        if (migration.status === 'failed') {
          toast.error('L\'analyse a échoué');
          break;
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        toast.error('L\'analyse prend trop de temps');
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Erreur lors de l\'import');
    } finally {
      setImporting(false);
      setImportProgress('');
    }
  };

  // Creation state
  const [loading, setLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressSteps, setProgressSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [createStatus, setCreateStatus] = useState('in_progress');
  const [createError, setCreateError] = useState(null);
  const [createdSiteId, setCreatedSiteId] = useState(null);

  const selectedStyleObj = DESIGN_STYLES.find(s => s.id === designStyle) || DESIGN_STYLES[0];
  const effectiveSpecialty = specialty === 'Autre' ? customSpecialty : specialty;

  const onDropPhoto = useCallback((files) => {
    if (files[0]) setPhoto({ file: files[0], preview: URL.createObjectURL(files[0]) });
  }, []);
  const { getRootProps: getPhotoProps, getInputProps: getPhotoInput } = useDropzone({
    onDrop: onDropPhoto, accept: { 'image/*': [] }, multiple: false,
  });

  const validate = () => {
    if (!practitionerName.trim()) { toast.error('Le nom est requis'); return false; }
    if (!effectiveSpecialty.trim()) { toast.error('La spécialité est requise'); return false; }
    if (!city.trim()) { toast.error('La ville est requise'); return false; }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);

    const siteData = {
      name: practitionerName.trim(),
      business: {
        name: practitionerName.trim(),
        activity: effectiveSpecialty.trim(),
        city: city.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        tone: 'professionnel et chaleureux',
      },
      design: {
        designStyle,
        primaryColor: selectedPalette.primary,
        secondaryColor: selectedPalette.secondary,
        accentColor: selectedPalette.accent,
        backgroundColor: '#ffffff',
        textColor: '#333333',
        fontHeading: selectedStyleObj.fonts.heading,
        fontBody: selectedStyleObj.fonts.body,
        borderRadius: selectedStyleObj.borderRadius,
      },
    };

    const steps = [
      { key: 'creating', label: 'Création du site', icon: 'FolderPlus' },
    ];
    if (photo) steps.push({ key: 'photo', label: 'Upload de la photo', icon: 'ImageIcon' });
    if (googleMapsUrl.trim()) steps.push({ key: 'reviews', label: 'Import des avis Google', icon: 'Star' });
    steps.push({ key: 'page', label: 'Création de la page booking', icon: 'FileText' });
    steps.push({ key: 'ai', label: 'IA — Génération du contenu', icon: 'Sparkles' });
    steps.push({ key: 'seo', label: 'Optimisation SEO', icon: 'Search' });
    steps.push({ key: 'build', label: 'Construction du site', icon: 'Hammer' });
    steps.push({ key: 'done', label: 'Site prêt !', icon: 'CheckCircle' });

    setProgressSteps(steps);
    setCurrentStepIdx(0);
    setCreateStatus('in_progress');
    setCreateError(null);
    setShowProgressModal(true);

    let stepIdx = 0;
    const advance = (key) => { stepIdx = steps.findIndex(s => s.key === key); setCurrentStepIdx(stepIdx); };

    try {
      // 1. Create site
      advance('creating');
      const site = await createSite(siteData);
      setCreatedSiteId(site._id);

      // 2. Upload photo
      const uploadedMediaIds = [];
      if (photo) {
        advance('photo');
        try {
          const fd = new FormData();
          fd.append('file', photo.file);
          const { media } = await mediaApi.upload(site._id, fd);
          uploadedMediaIds.push(media._id);
        } catch (err) { console.error('Photo upload error:', err); }
      }

      // 2b. Import Google Reviews
      if (googleMapsUrl.trim()) {
        advance('reviews');
        try {
          await sitesApi.fetchGoogleReviews(site._id);
        } catch (err) { console.warn('[GoogleReviews] Import failed:', err.message); }
      }

      // 3. Create booking page
      advance('page');
      const { page } = await pagesApi.create(site._id, {
        title: `${practitionerName.trim()} — ${effectiveSpecialty.trim()}`,
        type: 'booking',
        isMainHomepage: true,
      });

      // 4. AI generation
      advance('ai');
      try {
        const { content } = await aiApi.generateBookingPage({
          siteId: site._id,
          specialty: effectiveSpecialty.trim(),
          practitionerName: practitionerName.trim(),
        });

        let sections = mapBookingAiContentToSections(page.sections, content);
        sections = distributeImagesToSections(sections, uploadedMediaIds, 0);

        // Force practitioner name in hero
        const hero = sections.find(s => s.type === 'hero-practitioner');
        if (hero) hero.data.name = practitionerName.trim();

        await pagesApi.updateSections(page._id, sections);
        if (content.seo) await pagesApi.update(page._id, { seo: content.seo });
      } catch (err) {
        console.error('AI booking generation error:', err);
        toast.error('Erreur lors de la génération IA');
      }

      // 5. SEO
      try { advance('seo'); await aiApi.optimizeSeo(site._id); } catch (err) { console.warn('[SEO] failed:', err.message); }

      // 6. Build
      advance('build');
      try { await buildApi.trigger(site._id); } catch {}
      advance('done');
      setCreateStatus('done');
    } catch (err) {
      const msg = err.error || err.message || 'Erreur lors de la création';
      setCreateError(msg);
      setCreateStatus('error');
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {showProgressModal && (
        <CreateProgressModal
          steps={progressSteps}
          currentIndex={currentStepIdx}
          status={createStatus}
          error={createError}
          siteId={createdSiteId}
          template={designStyle}
          colors={selectedPalette}
          siteName={practitionerName}
          onClose={() => {
            setShowProgressModal(false);
            if (createStatus === 'done' && createdSiteId) navigate(`/dashboard/sites/${createdSiteId}/pages`);
          }}
        />
      )}

      <div className="max-w-2xl mx-auto px-8 py-6 pb-16">
        <button
          onClick={() => navigate('/dashboard/new')}
          className="text-sm text-slate-500 hover:text-slate-300 mb-6 flex items-center gap-1 transition-colors"
        >
          <ChevronUp size={14} className="rotate-[-90deg]" /> Retour
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
            <Calendar size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Page de réservation</h1>
            <p className="text-sm text-slate-500">Créez votre page de prise de rendez-vous en ligne</p>
          </div>
        </div>

        {/* Import from URL */}
        <Card className="mb-6">
          <div className="p-5">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              <Globe size={14} className="inline mr-1.5" />Importer depuis un site web ou agenda.ch
            </label>
            <div className="flex gap-2">
              <Input
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                placeholder="https://www.agenda.ch/... ou site du praticien"
                className="flex-1"
                disabled={importing}
              />
              <button
                onClick={handleImportFromUrl}
                disabled={importing || !importUrl.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-500/90 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
              >
                {importing ? <Loader size={14} className="animate-spin" /> : <Globe size={14} />}
                {importing ? 'Analyse...' : 'Importer'}
              </button>
            </div>
            {importing && importProgress && (
              <p className="text-xs text-emerald-400 mt-2 animate-pulse">{importProgress}</p>
            )}
            <p className="text-xs text-slate-600 mt-1.5">Optionnel — pré-remplit le formulaire avec les infos du site</p>
          </div>
        </Card>

        {/* Core fields */}
        <Card className="mb-6">
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom du praticien / cabinet</label>
              <Input value={practitionerName} onChange={e => setPractitionerName(e.target.value)} placeholder="Dr. Marie Dupont" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Spécialité</label>
              <select
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="">Choisir...</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {specialty === 'Autre' && (
                <Input value={customSpecialty} onChange={e => setCustomSpecialty(e.target.value)} placeholder="Votre spécialité" className="mt-2" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Ville</label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Lausanne" />
            </div>
          </div>
        </Card>

        {/* Photo upload */}
        <Card className="mb-6">
          <div className="p-5">
            <label className="block text-sm font-medium text-slate-300 mb-3">Photo du praticien</label>
            {photo ? (
              <div className="flex items-center gap-4">
                <img src={photo.preview} alt="Photo" className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
                <button onClick={() => { URL.revokeObjectURL(photo.preview); setPhoto(null); }} className="text-sm text-red-400 hover:text-red-300">
                  <X size={14} className="inline mr-1" />Supprimer
                </button>
              </div>
            ) : (
              <div
                {...getPhotoProps()}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500/30 transition-colors"
              >
                <input {...getPhotoInput()} />
                <Upload size={24} className="mx-auto text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">Cliquez ou glissez une photo</p>
              </div>
            )}
          </div>
        </Card>

        {/* Design style */}
        <Card className="mb-6">
          <div className="p-5">
            <label className="block text-sm font-medium text-slate-300 mb-3">Style du site</label>
            <DesignStyleSelector value={designStyle} onChange={setDesignStyle} />
          </div>
        </Card>

        {/* Color palette */}
        <Card className="mb-6">
          <div className="p-5">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              <Palette size={14} className="inline mr-1.5" />Palette de couleurs
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PALETTES.map(p => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPalette(p)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                    selectedPalette.name === p.name
                      ? 'border-accent/50 bg-accent/5'
                      : 'border-white/5 hover:border-white/15 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.secondary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
                  </div>
                  <span className="text-xs text-slate-400">{p.name}</span>
                  {selectedPalette.name === p.name && <Check size={12} className="text-accent ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Optional fields */}
        <Card className="mb-8">
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="w-full p-5 flex items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-slate-300">Informations complémentaires</span>
            <ChevronUp size={16} className={`text-slate-500 transition-transform ${showOptional ? '' : 'rotate-180'}`} />
          </button>
          {showOptional && (
            <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Téléphone" />
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Adresse" />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description de votre activité (optionnel)"
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                rows={3}
              />
              <div>
                <Input
                  value={googleMapsUrl}
                  onChange={e => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/... ou https://g.page/..."
                />
                <p className="text-xs text-slate-600 mt-1">Lien Google Maps — pour afficher la carte précise et importer vos avis Google</p>
              </div>
            </div>
          )}
        </Card>

        {/* Create button */}
        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3 text-base font-semibold"
        >
          {loading ? 'Création en cours...' : 'Créer ma page de réservation'}
        </Button>
      </div>
    </div>
  );
}
