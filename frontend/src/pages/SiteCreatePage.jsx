import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Globe, PenTool, Upload, X, ChevronDown, ChevronUp, Palette, Check, Pipette } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import useSiteStore from '../stores/siteStore';
import { pagesApi, aiApi, buildApi, mediaApi, sitesApi } from '../services/api';
import { trackSiteCreated, trackMediaUploaded, trackAIGeneration } from '../lib/posthog';
import { mapAiContentToSections, distributeImagesToSections } from '../lib/aiPageBuilder';
import { extractColorsFromImage } from '../lib/colorExtractor';
import CreateProgressModal from '../components/CreateProgressModal';
import DesignStyleSelector, { DESIGN_STYLES } from '../components/DesignStyleSelector';
import BlueprintPanel, { SectionSelector } from '../components/BlueprintPanel';
import { Button, Card, CardBody, Input } from '../ui';

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

const ACTIVITIES = [
  'Restaurant', 'Institut de beauté', 'Coiffeur', 'Garage automobile', 'Auto-école',
  'Cabinet médical', 'Cabinet juridique', 'Cabinet comptable', 'Agence immobilière',
  'Architecte', 'Photographe', 'Consultant', 'Coach sportif', 'Plombier',
  'Électricien', 'Paysagiste', 'Boulangerie', 'Fleuriste', 'Autre',
];

export default function SiteCreatePage() {
  const [mode, setMode] = useState(null); // null | 'scratch'
  const navigate = useNavigate();
  const { createSite } = useSiteStore();

  // Core form fields (simplified)
  const [name, setName] = useState('');
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [city, setCity] = useState('');
  const [designStyle, setDesignStyle] = useState('modern');

  // Color selection
  const [colorMode, setColorMode] = useState('theme'); // 'theme' | 'logo' | 'custom'
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [customColors, setCustomColors] = useState({ primary: '#0ea5e9', secondary: '#0f172a', accent: '#f59e0b' });

  // Optional expanded fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [description, setDescription] = useState('');
  const [services, setServices] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Images
  const [images, setImages] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [suggestedColors, setSuggestedColors] = useState(null);

  // Creation state
  const [loading, setLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressSteps, setProgressSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [createStatus, setCreateStatus] = useState('in_progress');
  const [createError, setCreateError] = useState(null);
  const [createdSiteId, setCreatedSiteId] = useState(null);

  const selectedStyle = DESIGN_STYLES.find(s => s.id === designStyle) || DESIGN_STYLES[0];
  const effectiveActivity = activity === 'Autre' ? customActivity : activity;

  // Resolve active colors based on color mode
  const activeColors = colorMode === 'logo' && suggestedColors?.suggested
    ? { primary: suggestedColors.suggested.primaryColor, secondary: suggestedColors.suggested.backgroundColor || '#0f172a', accent: suggestedColors.suggested.accentColor }
    : colorMode === 'custom'
    ? customColors
    : selectedPalette;

  const onDropImages = useCallback((files) => {
    setImages(prev => [...prev, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
  }, []);
  const removeImage = (idx) => {
    setImages(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx); });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onDropImages, accept: { 'image/*': [] }, multiple: true });

  const validate = () => {
    if (!name.trim()) { toast.error('Le nom du site est requis'); return false; }
    if (!effectiveActivity.trim()) { toast.error("L'activité est requise"); return false; }
    if (!city.trim()) { toast.error('La ville est requise'); return false; }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);

    // Build site data
    const siteData = {
      name: name.trim(),
      business: {
        name: name.trim(),
        activity: effectiveActivity.trim(),
        city: city.trim(),
        description: description.trim() || undefined,
        services: services.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        tone: 'professionnel',
      },
      design: {
        designStyle,
        primaryColor: activeColors.primary,
        secondaryColor: activeColors.secondary,
        accentColor: activeColors.accent,
        backgroundColor: '#ffffff',
        textColor: '#333333',
        fontHeading: selectedStyle.fonts.heading,
        fontBody: selectedStyle.fonts.body,
        borderRadius: selectedStyle.borderRadius,
      },
    };

    // Auto-generate page keywords from activity + city
    const mainKeyword = `${effectiveActivity} ${city}`.trim();
    const pages = [{ title: mainKeyword, keyword: mainKeyword, serviceFocus: effectiveActivity, isMain: true }];

    // Build progress steps
    const steps = [{ key: 'creating', label: 'Création du site', icon: 'FolderPlus' }];
    if (images.length > 0) steps.push({ key: 'images', label: `Upload des images (0/${images.length})`, icon: 'ImageIcon' });
    steps.push({ key: 'pages', label: `Création des pages (${pages.length + 1})`, icon: 'FileText' });
    if (googleMapsUrl.trim()) steps.push({ key: 'reviews', label: 'Récupération des avis Google', icon: 'Star' });
    steps.push({ key: 'ai-page-0', label: 'IA — Page principale', icon: 'Sparkles' });
    steps.push({ key: 'ai-contact', label: 'IA — Page Contact', icon: 'Phone' });
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

      // Upload logo if provided
      if (logoFile) {
        try {
          const fd = new FormData(); fd.append('file', logoFile.file);
          const { media } = await mediaApi.upload(site._id, fd);
          const { updateSite } = useSiteStore.getState();
          await updateSite(site._id, { design: { ...site.design, logoMediaId: media._id } });
        } catch (err) { console.error('Logo upload error:', err); }
      }

      // 2. Upload images
      const uploadedMediaIds = [];
      if (images.length > 0) {
        advance('images');
        for (let i = 0; i < images.length; i++) {
          setProgressSteps(prev => prev.map(s => s.key === 'images' ? { ...s, label: `Upload des images (${i + 1}/${images.length})` } : s));
          try {
            const formData = new FormData();
            formData.append('file', images[i].file);
            const { media } = await mediaApi.upload(site._id, formData);
            uploadedMediaIds.push(media._id);
          } catch (err) { console.error('Image upload error:', err); }
        }
      }

      // 3. Create all pages (main + sub-pages)
      advance('pages');
      const createdPages = [];
      for (const pageConf of pages) {
        const page = await pagesApi.create(site._id, {
          title: pageConf.title || pageConf.keyword,
          keyword: pageConf.keyword || '',
          type: pageConf.isMain ? 'homepage' : 'subpage',
          isMainHomepage: pageConf.isMain,
        });
        createdPages.push({
          conf: pageConf,
          page: page.page,
          slug: page.page.slug,
          href: page.page.isMainHomepage ? 'index.html' : `${page.page.slug}.html`,
        });
      }

      // 4. Fetch Google reviews
      let googleReviewsData = null;
      if (googleMapsUrl.trim()) {
        try {
          advance('reviews');
          googleReviewsData = await sitesApi.fetchGoogleReviews(site._id);
        } catch (err) { console.warn('[GoogleReviews] Fetch failed:', err.message); }
      }

      // 5. AI generation for each page
      for (let i = 0; i < createdPages.length; i++) {
        const created = createdPages[i];
        advance(`ai-page-${i}`);
        try {
          const { content } = await aiApi.generatePage({
            siteId: site._id,
            keyword: created.conf.keyword,
            serviceFocus: created.conf.serviceFocus || created.conf.keyword,
          });

          const otherPages = createdPages.filter((_, j) => j !== i).map(op => ({
            title: op.conf.title, keyword: op.conf.keyword, serviceFocus: op.conf.serviceFocus, href: op.href,
          }));
          let sections = mapAiContentToSections(created.page.sections, content, {
            otherPages, currentPageIndex: i, googleReviewsData, siteBusiness: site.business,
          });
          sections = distributeImagesToSections(sections, uploadedMediaIds, i);

          if (created.conf.keyword) {
            const hero = sections.find(s => s.type === 'hero');
            if (hero) hero.data.headline = created.conf.keyword;
          }

          await pagesApi.updateSections(created.page._id, sections);
          if (content.seo) await pagesApi.update(created.page._id, { seo: content.seo });
        } catch (err) {
          console.error('AI generation error:', err);
          toast.error(`Erreur IA pour la page ${i + 1}`);
        }
      }

      // 6. Contact page + AI
      advance('ai-contact');
      try {
        const contactPage = await pagesApi.create(site._id, { title: 'Contact', slug: 'contact', type: 'contact' });
        try {
          const { content } = await aiApi.generateContact({ siteId: site._id });
          const contactSections = contactPage.page.sections.map(s => {
            const sData = { ...s };
            switch (s.type) {
              case 'hero':
                if (content.hero) { sData.data = { ...s.data, ...content.hero }; if (s.data.ctaUrl) sData.data.ctaUrl = s.data.ctaUrl; if (s.data.ctaText) sData.data.ctaText = s.data.ctaText; }
                break;
              case 'description':
                if (content.description) sData.data = { ...s.data, ...content.description };
                break;
              case 'faq':
                if (content.faq?.items) sData.data = { ...s.data, items: content.faq.items };
                break;
              case 'testimonials':
                if (content.testimonials?.items) sData.data = { ...s.data, items: content.testimonials.items };
                break;
              case 'map':
                if (content.map) sData.data = { ...s.data, ...content.map, address: s.data.address, phone: s.data.phone, email: s.data.email };
                break;
            }
            return sData;
          });
          await pagesApi.updateSections(contactPage.page._id, contactSections);
          if (content.seo) await pagesApi.update(contactPage.page._id, { seo: content.seo });
        } catch (err) { console.error('AI contact generation error:', err); }
      } catch (err) { console.error('Contact page creation error:', err); }

      // 7. SEO optimization
      try { advance('seo'); await aiApi.optimizeSeo(site._id); } catch (err) { console.warn('[SEO] optimization failed:', err.message); }

      // 8. Build
      trackSiteCreated(site, { pageCount: 2, useAI: true, imageCount: images.length });
      if (uploadedMediaIds.length > 0) trackMediaUploaded(site._id, uploadedMediaIds.length);
      advance('build');
      try { await buildApi.trigger(site._id); } catch {}
      advance('done');
      setCreateStatus('done');
    } catch (err) {
      const msg = err.error || err.message || 'Erreur lors de la création';
      setCreateError(msg);
      setCreateStatus('error');
      if (msg.includes('duplicate') || msg.includes('E11000') || msg.includes('domain')) {
        toast.error('Ce domaine est déjà utilisé', { duration: 5000 });
      } else {
        toast.error(msg, { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  // Mode choice screen
  if (mode === null) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-slate-500 hover:text-slate-300 mb-6 flex items-center gap-1 transition-colors">
            <ChevronUp size={14} className="rotate-[-90deg]" /> Retour au dashboard
          </button>
          <h1 className="text-2xl font-bold text-white mb-2">Nouveau site</h1>
          <p className="text-slate-500 mb-8">Comment souhaitez-vous créer votre site ?</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="interactive" className="p-6" onClick={() => setMode('scratch')}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/15 to-blue-500/15 border border-purple-500/15 flex items-center justify-center mb-4">
                <PenTool size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Créer de zéro</h3>
              <p className="text-sm text-slate-400">Renseignez votre activité et l'IA génère tout le contenu</p>
            </Card>

            <Card variant="interactive" className="p-6" onClick={() => navigate('/migrate')}>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center mb-4">
                <Globe size={24} className="text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Importer un site</h3>
              <p className="text-sm text-slate-400">Entrez l'URL d'un site existant pour migrer le contenu</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] blueprint-grid">

      {/* Main content: form left + blueprint right */}
      <div className="flex w-full px-8 gap-8">
        {/* Form column — opaque bg with right fade into blueprint grid */}
        <div className="flex-1 min-w-0 max-w-2xl py-6 pb-16 relative z-10 pr-6"
          style={{
            background: 'linear-gradient(to right, #0f0f1a 85%, transparent 100%)',
          }}
        >
        {/* Inline header with nav + CTA */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => setMode(null)} className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors mb-2">
              <ChevronUp size={14} className="rotate-[-90deg]" /> Retour
            </button>
            <h1 className="text-2xl font-bold text-white">Nouveau site</h1>
            <p className="text-sm text-slate-500">3 informations suffisent, l'IA s'occupe du reste.</p>
          </div>
          <Button icon={Sparkles} onClick={handleCreate} loading={loading} disabled={loading}>
            Créer avec l'IA
          </Button>
        </div>

      {/* Core fields */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <Input
            label="Nom du site *"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Institut Beauté Éclat"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Activité *</label>
            <select
              value={activity}
              onChange={e => setActivity(e.target.value)}
              className="w-full bg-[#151525] border border-white/[0.07] text-[#e2e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/15 transition-colors"
            >
              <option value="">Choisir une activité...</option>
              {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            {activity === 'Autre' && (
              <Input
                value={customActivity}
                onChange={e => setCustomActivity(e.target.value)}
                placeholder="Précisez votre activité"
                className="mt-2"
              />
            )}
          </div>

          <Input
            label="Ville *"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Ex: Lausanne"
          />
        </div>
      </Card>

      {/* Design style selector */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Style de design</h2>
      <div className="mb-6">
        <DesignStyleSelector value={designStyle} onChange={setDesignStyle} />
      </div>

      {/* Color selection */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Palette de couleurs</h2>
      <Card className="p-5 mb-6">
        {/* Color mode tabs */}
        <div className="flex gap-1 mb-4 bg-white/[0.03] rounded-lg p-1">
          {[
            { id: 'theme', label: 'Thèmes', icon: Palette },
            { id: 'logo', label: 'Depuis le logo', icon: Pipette },
            { id: 'custom', label: 'Manuel', icon: PenTool },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setColorMode(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                colorMode === tab.id
                  ? 'bg-purple-500/15 text-purple-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Theme palettes */}
        {colorMode === 'theme' && (
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PALETTES.map(palette => {
              const isActive = selectedPalette.name === palette.name;
              return (
                <button
                  key={palette.name}
                  onClick={() => setSelectedPalette(palette)}
                  className={`relative p-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-purple-500 ring-1 ring-purple-500/20'
                      : 'border-white/[0.07] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex gap-1.5 justify-center mb-2">
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: palette.primary }} />
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: palette.secondary }} />
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: palette.accent }} />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-center">{palette.name}</span>
                  {isActive && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Logo colors */}
        {colorMode === 'logo' && (
          <div>
            {suggestedColors ? (
              <div>
                <p className="text-xs text-emerald-400 mb-3">Couleurs extraites du logo :</p>
                <div className="flex gap-3 mb-3">
                  {suggestedColors.palette?.slice(0, 6).map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg border border-white/10 shadow-sm" style={{ backgroundColor: color }} />
                      <span className="text-[8px] text-slate-500 font-mono">{color}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.05]">
                  {[
                    { label: 'Primary', color: suggestedColors.suggested?.primaryColor },
                    { label: 'Secondary', color: suggestedColors.suggested?.backgroundColor || '#0f172a' },
                    { label: 'Accent', color: suggestedColors.suggested?.accentColor },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-white/15" style={{ backgroundColor: item.color }} />
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{item.label}</span>
                        <span className="text-[10px] text-slate-300 font-mono">{item.color}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Pipette className="mx-auto w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">Importez un logo ci-dessous pour extraire ses couleurs automatiquement</p>
              </div>
            )}
          </div>
        )}

        {/* Custom colors */}
        {colorMode === 'custom' && (
          <div className="space-y-3">
            {[
              { key: 'primary', label: 'Couleur principale' },
              { key: 'secondary', label: 'Couleur secondaire' },
              { key: 'accent', label: 'Couleur d\'accent' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label
                  className="relative w-10 h-10 rounded-lg border border-white/10 overflow-hidden cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: customColors[key] }}
                >
                  <input
                    type="color"
                    value={customColors[key]}
                    onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
                <div className="flex-1">
                  <span className="text-xs text-slate-400 block mb-0.5">{label}</span>
                  <input
                    type="text"
                    value={customColors[key]}
                    onChange={e => {
                      const v = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setCustomColors(prev => ({ ...prev, [key]: v }));
                    }}
                    className="w-24 bg-[#151525] border border-white/[0.07] text-slate-300 rounded px-2 py-1 text-xs font-mono outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Section selector */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Sections du site</h2>
      <Card className="p-5 mb-6">
        <SectionSelector colors={activeColors} />
      </Card>

      {/* Optional: images */}
      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Images (optionnel)</h3>
        <p className="text-xs text-slate-500 mb-3">Vos images seront automatiquement placées dans les bonnes sections.</p>

        <div {...getRootProps()} className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-purple-500 bg-purple-500/5' : 'border-white/[0.1] hover:border-purple-500/40'}`}>
          <input {...getInputProps()} />
          <Upload className="mx-auto w-5 h-5 text-slate-500 mb-1" />
          <p className="text-xs text-slate-500">{isDragActive ? 'Déposez ici' : 'Glissez des images ou cliquez'}</p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/[0.07]">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Logo */}
        <div className="mt-4 pt-4 border-t border-white/[0.07]">
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Logo (optionnel)</label>
          {logoFile ? (
            <div className="relative w-full h-16 rounded-lg border border-white/[0.07] overflow-hidden flex items-center justify-center bg-white/[0.02]">
              <img src={logoFile.preview} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
              <button onClick={() => { URL.revokeObjectURL(logoFile.preview); setLogoFile(null); setSuggestedColors(null); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                <X size={10} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center w-full h-16 rounded-lg border-2 border-dashed border-white/[0.1] hover:border-purple-500/40 cursor-pointer transition-colors">
              <Upload size={16} className="text-slate-500 mr-2" />
              <span className="text-xs text-slate-500">Importer</span>
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                const f = e.target.files?.[0];
                if (f) {
                  setLogoFile({ file: f, preview: URL.createObjectURL(f) });
                  try {
                    const result = await extractColorsFromImage(f);
                    if (result) setSuggestedColors(result);
                  } catch {}
                }
              }} />
            </label>
          )}
        </div>
      </Card>

      {/* Advanced (collapsible) */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
      >
        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Informations supplémentaires (pour une meilleure génération IA)
      </button>

      {showAdvanced && (
        <Card className="p-5 mb-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Description de votre activité</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Ex: Institut spécialisé dans les soins du visage haut de gamme..."
                className="w-full bg-[#151525] border border-white/[0.07] text-[#e2e8f0] placeholder:text-[#64748b] rounded-lg px-3 py-2 text-sm resize-y outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/15"
              />
            </div>
            <Input label="Services principaux (séparés par des virgules)" value={services} onChange={e => setServices(e.target.value)} placeholder="Soin visage, Massage, Épilation" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+41 21 xxx xx xx" />
              <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@exemple.ch" />
            </div>
            <Input label="Adresse" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rue de Bourg 12, 1003 Lausanne" />
            <Input label="Lien Google Maps (pour importer les vrais avis)" value={googleMapsUrl} onChange={e => setGoogleMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
        </Card>
      )}

      </div>{/* end form column */}

      {/* Blueprint column — scrolls with form */}
      <div className="hidden lg:block flex-1 min-w-0 relative sticky top-0 self-start h-screen py-4">
          {/* Gradient fade from form to blueprint */}
          <div className="absolute inset-y-0 -left-8 w-8 bg-gradient-to-r from-transparent to-[#0f0f1a] z-10 pointer-events-none" />
          <BlueprintPanel
            siteName={name}
            activity={activity === 'Autre' ? customActivity : activity}
            city={city}
            template={designStyle}
            colors={activeColors}
          />
      </div>
      </div>{/* end flex container */}

      {showProgressModal && (
        <CreateProgressModal
          steps={progressSteps}
          currentIndex={currentStepIdx}
          status={createStatus}
          error={createError}
          siteId={createdSiteId}
          template={designStyle}
          colors={activeColors}
          siteName={name}
          onClose={() => {
            setShowProgressModal(false);
            if (createStatus === 'done' && createdSiteId) navigate(`/dashboard/sites/${createdSiteId}/pages`);
          }}
        />
      )}
    </div>
  );
}
