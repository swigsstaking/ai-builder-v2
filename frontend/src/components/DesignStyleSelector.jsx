import { Check } from 'lucide-react';

const STYLES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean et professionnel',
    fonts: { heading: 'Inter', body: 'Inter' },
    borderRadius: 'rounded',
    preview: { navStyle: 'Navbar blanche, ombres douces', heroStyle: 'Gradient centré, dot-pattern' },
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Impact et énergie',
    fonts: { heading: 'Montserrat', body: 'Open Sans' },
    borderRadius: 'rounded',
    preview: { navStyle: 'Navbar sombre, uppercase', heroStyle: 'Plein écran, texte XXL' },
  },
  {
    id: 'elegant',
    name: 'Élégant',
    description: 'Raffiné et distingué',
    fonts: { heading: 'Playfair Display', body: 'Lora' },
    borderRadius: 'square',
    preview: { navStyle: 'Serif, espacement large', heroStyle: 'Centré, ornements dorés' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple et fonctionnel',
    fonts: { heading: 'Inter', body: 'Roboto' },
    borderRadius: 'square',
    preview: { navStyle: 'Ultra-clean, pas d\'ombres', heroStyle: 'Texte simple, compact' },
  },
  {
    id: 'artistic',
    name: 'Artistique',
    description: 'Créatif et expressif',
    fonts: { heading: 'Raleway', body: 'Nunito' },
    borderRadius: 'rounded',
    preview: { navStyle: 'Flottante, arrondie', heroStyle: 'Gradients, formes géométriques' },
  },
];

export { STYLES as DESIGN_STYLES };

export default function DesignStyleSelector({ value, onChange, recommended, compact = false }) {
  return (
    <div className={`grid ${compact ? 'grid-cols-5 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3'}`}>
      {STYLES.map((style) => {
        const isSelected = value === style.id;
        const isRecommended = recommended === style.id;

        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={`relative text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
              isSelected
                ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                : 'border-white/[0.07] hover:border-white/[0.15] hover:shadow-md'
            }`}
          >
            {/* Layout preview */}
            <div className="h-16 flex items-center justify-center" style={{ background: '#151525' }}>
              <div className="text-center">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{style.preview.navStyle}</span>
                <span className="text-[8px] text-slate-600">{style.preview.heroStyle}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3" style={{ background: '#1e1e35' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-slate-200">{style.name}</span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </span>
                )}
              </div>
              {!compact && (
                <p className="text-[11px] text-slate-500">{style.description}</p>
              )}
              {!compact && (
                <div className="mt-2 flex gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-500" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {style.fonts.heading}
                  </span>
                  {style.fonts.heading !== style.fonts.body && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-500" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {style.fonts.body}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Recommended badge */}
            {isRecommended && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                IA
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
