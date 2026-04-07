import { Eye, EyeOff, ChevronUp, ChevronDown, LayoutTemplate, FileText, CheckCircle, Star, Megaphone, Wrench, Shield, MessageSquare, HelpCircle, Users, MapPin } from 'lucide-react';

const SECTION_META = {
  // Universal 9 block types
  'hero':             { label: 'Hero',               icon: LayoutTemplate },
  'services':         { label: 'Services',            icon: Wrench },
  'about':            { label: 'À propos',           icon: FileText },
  'testimonials':     { label: 'Témoignages',        icon: MessageSquare },
  'faq':              { label: 'FAQ',                 icon: HelpCircle },
  'google-reviews':   { label: 'Avis Google',        icon: Star },
  'contact':          { label: 'Contact',             icon: MapPin },
  'cta':              { label: 'Appel à l\'action',   icon: Megaphone },
  'team':             { label: 'Équipe',             icon: Users },
  // Legacy types (backward compat during migration)
  'text-highlight':   { label: 'Accroche',            icon: FileText },
  'description':      { label: 'Description',        icon: FileText },
  'why-us':           { label: 'Pourquoi nous',      icon: CheckCircle },
  'cta-banner':       { label: 'Bandeau CTA',        icon: Megaphone },
  'services-grid':    { label: 'Services (grille)',   icon: Wrench },
  'guarantee':        { label: 'Garantie',            icon: Shield },
  'map':              { label: 'Carte',               icon: MapPin },
  'city-about':       { label: 'Qui sommes nous',     icon: FileText },
  'city-guarantee':   { label: 'Garantie (ville)',    icon: Shield },
  'city-reviews':     { label: 'Avis (ville)',        icon: Star },
};

function getSectionMeta(type) {
  return SECTION_META[type] || { label: type, icon: LayoutTemplate };
}

export default function SectionNavigator({
  sections, selectedSection, editingHeader,
  onSelectSection, onSelectHeader,
  onToggleVisibility, onMoveSection,
  allPages, pageId, siteId, onNavigatePage,
}) {
  return (
    <div className="flex flex-col h-full bg-[#151525] border-r border-white/[0.07]">
      {/* Page selector */}
      {allPages.length > 1 && (
        <div className="px-3 py-2.5 border-b border-white/[0.07]">
          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Page</label>
          <select
            value={pageId}
            onChange={(e) => onNavigatePage(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#151525] border border-white/[0.07] rounded-lg text-xs text-[#e2e8f0] outline-none focus:border-purple-500/40"
          >
            {allPages.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}{p.isMainHomepage ? ' (Accueil)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Header */}
        <div
          onClick={onSelectHeader}
          className={`flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg text-xs cursor-pointer transition-all ${
            editingHeader
              ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/10 text-purple-300 border border-purple-500/10'
              : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
          }`}
        >
          <LayoutTemplate size={14} className="shrink-0" />
          <span className="flex-1 font-medium">Header</span>
        </div>

        {/* Sections */}
        {sections.map((s, idx) => {
          const meta = getSectionMeta(s.type);
          const Icon = meta.icon;
          const isSelected = selectedSection === idx;

          return (
            <div
              key={s._id || idx}
              onClick={() => onSelectSection(idx)}
              className={`flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg text-xs cursor-pointer transition-all group ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/10 text-purple-300 border border-purple-500/10'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              } ${!s.visible ? 'opacity-40' : ''}`}
            >
              <Icon size={14} className="shrink-0" />
              <span className="flex-1 truncate font-medium">{meta.label}</span>

              {/* Actions (visible on hover or when selected) */}
              <div className={`flex items-center gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(idx); }}
                  className="p-1 rounded hover:bg-white/[0.06] text-slate-500 hover:text-slate-300"
                  title={s.visible ? 'Masquer' : 'Afficher'}
                >
                  {s.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveSection(idx, -1); }}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 disabled:opacity-20"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveSection(idx, 1); }}
                  disabled={idx === sections.length - 1}
                  className="p-1 rounded hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 disabled:opacity-20"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
