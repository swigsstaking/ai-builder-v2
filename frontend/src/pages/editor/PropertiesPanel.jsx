import { useState, useRef } from 'react';
import {
  Sparkles, Palette, Trash2, Plus, X, Loader2, RefreshCw,
  Image as ImageIcon, ChevronDown as ChevDown,
} from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import { sitesApi } from '../../services/api';
import toast from 'react-hot-toast';

/* --- PropertiesPanel (right panel) --- */
export default function PropertiesPanel({
  section, selectedSection, editingHeader,
  currentSite, onChange, onAIRewrite, onMediaPick,
  updateSite, siteId, postToIframe, setDirty, needsFullReload,
  isAdmin,
}) {
  if (editingHeader && currentSite) {
    return (
      <div className="h-full overflow-y-auto bg-[#151525] border-l border-white/[0.07]">
        <div className="px-4 py-3 border-b border-white/[0.07]">
          <h3 className="text-sm font-semibold text-white">Header</h3>
        </div>
        <div className="p-4">
          <HeaderEditor
            site={currentSite}
            onSave={async (data) => { await updateSite(siteId, data); setDirty(true); needsFullReload.current = true; }}
            postToIframe={postToIframe}
          />
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="h-full flex items-center justify-center bg-[#151525] border-l border-white/[0.07]">
        <p className="text-xs text-slate-500 text-center px-6">Sélectionnez une section pour éditer ses propriétés</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#151525] border-l border-white/[0.07]">
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <h3 className="text-sm font-semibold text-white capitalize">{section.type.replace(/-/g, ' ')}</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Contenu & style</p>
      </div>
      <div className="p-4">
        <SectionEditor
          section={section}
          idx={selectedSection}
          onChange={onChange}
          onAIRewrite={isAdmin ? onAIRewrite : null}
          onMediaPick={onMediaPick}
          site={currentSite}
        />
      </div>
    </div>
  );
}

/* --- StyleColorBar --- */
function StyleColorBar({ section, idx, onChange, site }) {
  const design = site?.design || {};
  const [open, setOpen] = useState(false);
  const styleData = section.data?.style || {};
  const currentBg = styleData.backgroundColor || '';
  const currentText = styleData.textColor || '';

  const swatches = [
    { value: '', transparent: true },
    { value: '#ffffff', border: true },
    { value: '#1f2937' },
    { value: design.primaryColor || '#12203e' },
    { value: design.accentColor || '#c8a97e' },
  ];

  const setStyle = (field, value) => {
    onChange(idx, 'style', { ...styleData, [field]: value });
  };

  return (
    <div className="mb-3 border border-white/[0.07] rounded-lg">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/[0.04] rounded-lg transition-colors">
        <Palette size={11} />
        Couleurs
        <span className="ml-auto flex items-center gap-1">
          {currentBg && <span className="w-3.5 h-3.5 rounded-full border border-white/[0.1]" style={{ background: currentBg }} />}
          {currentText && <span className="w-3.5 h-3.5 rounded-full border border-white/[0.1]" style={{ background: currentText }} />}
          <ChevDown size={9} className={`text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        <div className="px-2.5 pb-2.5 pt-1 space-y-2 border-t border-white/[0.05]">
          <SwatchRow label="Fond" swatches={swatches} current={currentBg} onPick={(v) => setStyle('backgroundColor', v)} />
          <SwatchRow label="Texte" swatches={swatches} current={currentText} onPick={(v) => setStyle('textColor', v)} />
        </div>
      )}
    </div>
  );
}

function SwatchRow({ label, swatches, current, onPick }) {
  return (
    <div>
      <span className="text-[9px] uppercase tracking-wider text-slate-500">{label}</span>
      <div className="flex gap-1.5 mt-1 items-center">
        {swatches.map((s, i) => (
          <button
            key={i}
            onClick={() => onPick(s.value)}
            className={`w-6 h-6 rounded-full transition-all ${current === s.value ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-[#151525] scale-110' : 'hover:scale-110'} ${s.border ? 'border border-white/[0.15]' : ''}`}
            style={{ background: s.transparent ? 'repeating-conic-gradient(#d1d5db 0% 25%, transparent 0% 50%) 50%/6px 6px' : s.value }}
          />
        ))}
        <label className="w-6 h-6 rounded-full border border-dashed border-white/[0.15] flex items-center justify-center cursor-pointer hover:border-purple-500 relative overflow-hidden">
          <Plus size={8} className="text-slate-500" />
          <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={current || '#ffffff'} onChange={(e) => onPick(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

/*
 * SectionEditor - render HELPERS (called as functions, NOT components).
 * Prevents unmount/remount on re-render → no focus loss during typing.
 */
function SectionEditor({ section, idx, onChange, onAIRewrite, onMediaPick, site }) {
  const d = section.data || {};
  const [fetchingReviews, setFetchingReviews] = useState(false);

  const text = (label, field, opts = {}) => (
    <div key={field} className="mb-3" data-editor-field={field}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        {onAIRewrite && (
          <button onClick={() => onAIRewrite(field, d[field] || '')} className="text-[9px] text-purple-400/60 hover:text-purple-400 flex items-center gap-0.5 transition-colors">
            <Sparkles size={8} /> IA
          </button>
        )}
      </div>
      <textarea
        value={d[field] || ''}
        onChange={e => onChange(idx, field, e.target.value)}
        placeholder={opts.placeholder}
        rows={1}
        className="w-full px-2.5 py-1.5 bg-[#151525] border border-white/[0.07] rounded-lg text-xs text-[#e2e8f0] resize-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/15 outline-none overflow-hidden"
        onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
        ref={el => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
      />
    </div>
  );

  const richText = (label, field) => (
    <div key={field} className="mb-3" data-editor-field={field}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {onAIRewrite && (
          <button onClick={() => onAIRewrite(field, d[field] || '')} className="text-[9px] text-purple-400/60 hover:text-purple-400 flex items-center gap-0.5 transition-colors">
            <Sparkles size={8} /> IA
          </button>
        )}
      </div>
      <RichTextEditor value={d[field] || ''} onChange={val => onChange(idx, field, val)} />
    </div>
  );

  const image = (label, field) => (
    <div key={field} className="mb-3" data-editor-field={field}>
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
      <div className="flex gap-1.5">
        <button
          onClick={() => onMediaPick((mediaId) => onChange(idx, field, mediaId))}
          className={`flex-1 h-10 border-2 border-dashed rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 ${
            d[field] ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-white/[0.1] text-slate-500 hover:border-purple-500 hover:text-purple-400'
          }`}
        >
          <ImageIcon size={12} />
          {d[field] ? 'Changer l\'image' : 'Choisir une image'}
        </button>
        {d[field] && (
          <button onClick={() => onChange(idx, field, null)} className="h-10 w-10 shrink-0 border-2 border-dashed border-red-500/20 rounded-lg text-red-400 hover:border-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );

  const select = (label, field, options) => (
    <div key={field} className="mb-3" data-editor-field={field}>
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
      <select value={d[field] || options[0]?.value || ''} onChange={e => onChange(idx, field, e.target.value)} className="w-full px-2.5 py-1.5 bg-[#151525] border border-white/[0.07] rounded-lg text-xs text-[#e2e8f0] outline-none focus:border-purple-500/40">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const list = (label, field, itemFields, addLabel) => {
    const items = d[field] || [];
    return (
      <div key={field} className="mb-3" data-editor-field={field}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label} ({items.length})</label>
          <button
            onClick={() => { const empty = {}; itemFields.forEach(f => empty[f.key] = ''); onChange(idx, field, [...items, empty]); }}
            className="text-[9px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 font-medium transition-colors"
          >
            <Plus size={9} /> {addLabel || 'Ajouter'}
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="p-2.5 bg-white/[0.02] rounded-lg border border-white/[0.05] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500">#{i + 1}</span>
                <button onClick={() => onChange(idx, field, items.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
              {itemFields.map(({ key, label: fl, multiline, placeholder, type: fType }) => (
                fType === 'badge' ? (
                  item[key] ? <div key={key}><span className="inline-block px-1.5 py-0.5 text-[9px] font-medium bg-blue-500/15 text-blue-400 rounded">{fl}</span></div> : null
                ) : <div key={key}>
                  <label className="text-[9px] text-slate-500">{fl}</label>
                  {fType === 'image' ? (
                    <button
                      onClick={() => onMediaPick((mediaId) => onChange(idx, `${field}.${i}.${key}`, mediaId))}
                      className={`w-full h-8 border-2 border-dashed rounded text-[10px] flex items-center justify-center gap-1 transition-all ${
                        item[key] ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-white/[0.1] text-slate-500 hover:border-purple-500'
                      }`}
                    >
                      <ImageIcon size={10} />
                      {item[key] ? 'Changer' : 'Image'}
                    </button>
                  ) : (
                    <textarea value={item[key] || ''} onChange={e => onChange(idx, `${field}.${i}.${key}`, e.target.value)} placeholder={placeholder} rows={1}
                      className="w-full px-2 py-1 bg-[#151525] border border-white/[0.07] rounded text-[11px] text-[#e2e8f0] resize-none overflow-hidden focus:border-purple-500/40 outline-none"
                      onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      ref={el => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const colorBar = <StyleColorBar section={section} idx={idx} onChange={onChange} site={site} />;

  // Google Reviews import button helper
  const googleImportBtn = (field = 'testimonials') => (
    <button disabled={fetchingReviews} onClick={async () => {
      try {
        setFetchingReviews(true);
        const res = await sitesApi.fetchGoogleReviews(site._id);
        const existing = (d[field] || []).filter(t => !t.isGoogle);
        onChange(idx, field, [...existing, ...res.reviews]);
        onChange(idx, 'reviewCount', res.totalReviews);
        onChange(idx, 'rating', res.rating);
        onChange(idx, 'ctaText', `Voir nos ${res.totalReviews}+ avis`);
        if (res.googleMapsUri) onChange(idx, 'ctaUrl', res.googleMapsUri);
        toast.success(`${res.reviews.length} avis Google importés`);
      } catch (err) { toast.error(err.response?.data?.error || err.message); }
      finally { setFetchingReviews(false); }
    }} className="w-full mb-3 px-3 py-1.5 text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/15 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
      {fetchingReviews ? <><Loader2 size={11} className="animate-spin" /> Import...</> : <><RefreshCw size={11} /> Importer les avis Google</>}
    </button>
  );

  switch (section.type) {
    // === Universal 9 block types ===
    case 'hero': return <>{colorBar}{text("Titre H1", "headline")}{text("Sous-titre", "subheadline")}{list("Points clés", "bulletPoints", [{key:'value',label:'Point'}], "Point")}{text("Texte du bouton", "ctaText")}{text("Lien du bouton", "ctaUrl")}{image("Image", "backgroundMediaId")}</>;
    case 'services': return <>{colorBar}{text("Titre", "title")}{text("Sous-titre", "subtitle")}{list("Services", "services", [{key:'imageMediaId',label:'Image',type:'image'},{key:'name',label:'Nom'},{key:'shortDescription',label:'Description courte'},{key:'price',label:'Prix'},{key:'linkUrl',label:'Lien (URL page)'}], "Service")}</>;
    case 'about': return <>{colorBar}{text("Titre", "title")}{richText("Contenu", "body")}{list("Points clés", "bulletPoints", [{key:'value',label:'Point'}], "Point")}{image("Image", "imageMediaId")}{text("Texte du bouton", "ctaText")}{text("Lien du bouton", "ctaUrl")}</>;
    case 'testimonials': return <>{colorBar}{text("Titre", "title")}{list("Témoignages", "items", [{key:'name',label:'Nom'},{key:'location',label:'Ville'},{key:'rating',label:'Note'},{key:'text',label:'Témoignage',multiline:true}], "Témoignage")}</>;
    case 'faq': return <>{colorBar}{text("Titre", "title")}{list("Questions", "items", [{key:'question',label:'Question'},{key:'answer',label:'Réponse',multiline:true}], "Question")}</>;
    case 'google-reviews': return <>{colorBar}{text("Titre", "title")}{text("Nombre d'avis", "reviewCount")}{text("Note", "rating")}{googleImportBtn('testimonials')}{list("Témoignages", "testimonials", [{key:'text',label:'Témoignage',multiline:true},{key:'name',label:'Nom'},{key:'location',label:'Ville'},{key:'isGoogle',label:'Avis Google',type:'badge'}], "Témoignage")}{text("Texte du bouton", "ctaText")}{text("Lien des avis", "ctaUrl")}</>;
    case 'contact': return <>{colorBar}{text("Titre", "title")}{richText("Description", "body")}{text("Adresse", "address")}{text("Téléphone", "phone")}{text("Email", "email")}{text("Horaires", "hours")}{text("URL Google Maps", "embedUrl")}</>;
    case 'cta': return <>{colorBar}{text("Texte", "text")}{text("Texte du bouton", "ctaText")}{text("Lien", "ctaUrl")}{select("Style", "bannerStyle", [{value:'dark',label:'Sombre'},{value:'light',label:'Clair'},{value:'accent',label:'Accent'}])}</>;
    case 'team': return <>{colorBar}{text("Titre", "title")}{richText("Contenu", "body")}{image("Image", "imageMediaId")}{list("Membres", "members", [{key:'imageMediaId',label:'Photo',type:'image'},{key:'name',label:'Nom'},{key:'role',label:'Rôle'},{key:'bio',label:'Bio',multiline:true}], "Membre")}</>;

    // === Booking page types ===
    case 'hero-practitioner': return <>{colorBar}{text("Nom", "name")}{text("Spécialité", "specialty")}{text("Accroche", "tagline")}{image("Photo", "photoMediaId")}{text("Texte du bouton", "ctaText")}{text("Lien du bouton", "ctaUrl")}</>;
    case 'services-booking': return <>{colorBar}{text("Titre", "title")}{text("Sous-titre", "subtitle")}{list("Prestations", "services", [{key:'name',label:'Nom'},{key:'duration',label:'Durée'},{key:'price',label:'Prix'},{key:'description',label:'Description',multiline:true}], "Prestation")}</>;
    case 'booking-widget': return <>{colorBar}{text("Titre", "title")}{text("Slug Calendar", "calendarSlug")}</>;

    // === Legacy types (backward compat during migration) ===
    case 'services-grid': return <>{colorBar}{text("Titre", "title")}{text("Sous-titre", "subtitle")}{list("Services", "services", [{key:'imageMediaId',label:'Image',type:'image'},{key:'name',label:'Nom'},{key:'shortDescription',label:'Description courte'},{key:'linkUrl',label:'Lien (URL page)'}], "Service")}</>;
    case 'description': return <>{colorBar}{text("Titre", "title")}{richText("Contenu", "body")}{list("Points clés", "bulletPoints", [{key:'value',label:'Point'}], "Point")}{text("Texte du bouton", "ctaText")}{text("Lien du bouton", "ctaUrl")}{image("Image", "imageMediaId")}</>;
    case 'text-highlight': return <>{colorBar}{richText("Texte", "text")}</>;
    case 'why-us': return <>{colorBar}{text("Titre", "title")}{text("Sous-titre", "subtitle")}{richText("Contenu", "body")}{image("Image", "imageMediaId")}{list("Points clés", "reasons", [{key:'title',label:'Titre'},{key:'text',label:'Description'}], "Point")}{text("Texte du bouton", "ctaText")}{text("Lien du bouton", "ctaUrl")}</>;
    case 'cta-banner': return <>{colorBar}{text("Texte", "text")}{text("Texte du bouton", "ctaText")}{text("Lien", "ctaUrl")}{select("Style", "bannerStyle", [{value:'dark',label:'Sombre'},{value:'light',label:'Clair'},{value:'accent',label:'Accent'}])}</>;
    case 'guarantee': return <>{colorBar}{text("Titre", "title")}{richText("Texte", "text")}</>;
    case 'map': return <>{colorBar}{text("Titre", "title")}{text("Adresse", "address")}{text("Horaires", "hours")}{text("Téléphone", "phone")}{text("Email", "email")}{text("URL Google Maps", "embedUrl")}</>;
    case 'city-about': return <>{colorBar}{text("Titre", "title")}{richText("Contenu", "body")}{image("Image", "imageMediaId")}{text("Texte du bouton", "ctaText")}{text("Lien du bouton", "ctaUrl")}</>;
    case 'city-guarantee': return <>{colorBar}{text("Titre", "title")}{richText("Texte", "text")}</>;
    case 'city-reviews': return <>{colorBar}{text("Titre", "title")}{text("Nombre d'avis", "reviewCount")}{text("Note", "rating")}{googleImportBtn('testimonials')}{text("Texte du bouton", "ctaText")}{text("Lien des avis", "ctaUrl")}</>;
    default: return <p className="text-xs text-slate-500 text-center py-4">Section non éditable</p>;
  }
}

/* --- HeaderEditor --- */
function HeaderEditor({ site, onSave, postToIframe }) {
  const [form, setForm] = useState({
    ctaText: site.header?.ctaText || 'Nous contacter',
    ctaUrl: site.header?.ctaUrl || 'contact.html',
    bgColor: site.header?.bgColor || '',
    logoColor: site.header?.logoColor || '',
    ctaBgColor: site.header?.ctaBgColor || '',
    ctaTextColor: site.header?.ctaTextColor || '',
  });
  const [colorsOpen, setColorsOpen] = useState(false);
  const timer = useRef(null);

  const update = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    postToIframe({ type: 'resamatic:updateHeader', ...next });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave({ header: next }), 1000);
  };

  const design = site?.design || {};
  const swatches = [
    { value: '', transparent: true },
    { value: '#ffffff', border: true },
    { value: '#1f2937' },
    { value: design.primaryColor || '#12203e' },
    { value: design.accentColor || '#c8a97e' },
  ];

  return (
    <>
      <div className="mb-3">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Texte du bouton</label>
        <textarea value={form.ctaText} onChange={e => update('ctaText', e.target.value)} placeholder="Nous contacter" rows={1}
          className="w-full px-2.5 py-1.5 bg-[#151525] border border-white/[0.07] rounded-lg text-xs text-[#e2e8f0] resize-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/15 outline-none overflow-hidden" />
      </div>
      <div className="mb-3">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Lien du bouton</label>
        <textarea value={form.ctaUrl} onChange={e => update('ctaUrl', e.target.value)} placeholder="contact.html" rows={1}
          className="w-full px-2.5 py-1.5 bg-[#151525] border border-white/[0.07] rounded-lg text-xs text-[#e2e8f0] resize-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/15 outline-none overflow-hidden" />
      </div>
      <div className="mb-3 border border-white/[0.07] rounded-lg">
        <button onClick={() => setColorsOpen(!colorsOpen)} className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/[0.04] rounded-lg transition-colors">
          <Palette size={11} /> Couleurs
          <span className="ml-auto flex items-center gap-1">
            {form.bgColor && <span className="w-3.5 h-3.5 rounded-full border border-white/[0.1]" style={{ background: form.bgColor }} />}
            {form.ctaBgColor && <span className="w-3.5 h-3.5 rounded-full border border-white/[0.1]" style={{ background: form.ctaBgColor }} />}
            <ChevDown size={9} className={`text-slate-600 transition-transform ${colorsOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
        {colorsOpen && (
          <div className="px-2.5 pb-2.5 pt-1 space-y-2 border-t border-white/[0.05]">
            <SwatchRow label="Fond header" swatches={swatches} current={form.bgColor} onPick={v => update('bgColor', v)} />
            {!site.design?.logoMediaId && <SwatchRow label="Logo (texte)" swatches={swatches} current={form.logoColor} onPick={v => update('logoColor', v)} />}
            <SwatchRow label="Fond bouton" swatches={swatches} current={form.ctaBgColor} onPick={v => update('ctaBgColor', v)} />
            <SwatchRow label="Texte bouton" swatches={swatches} current={form.ctaTextColor} onPick={v => update('ctaTextColor', v)} />
          </div>
        )}
      </div>
    </>
  );
}
