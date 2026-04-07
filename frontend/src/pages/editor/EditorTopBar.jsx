import { useState } from 'react';
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, RefreshCw, Loader2, Monitor, Tablet, Smartphone, Palette, Check, Droplets } from 'lucide-react';
import PublishButton from '../../components/PublishButton';
import { useIsAdmin } from '../../stores/authStore';
import { DESIGN_STYLES } from '../../components/DesignStyleSelector';

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

const VIEWPORT_MODES = [
  { key: 'desktop', icon: Monitor, label: 'Bureau' },
  { key: 'tablet', icon: Tablet, label: 'Tablette' },
  { key: 'mobile', icon: Smartphone, label: 'Mobile' },
];

function StatusBadge({ saving, building, dirty }) {
  if (saving) return <span className="text-[10px] text-amber-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Sauvegarde...</span>;
  if (building) return <span className="text-[10px] text-blue-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Construction...</span>;
  if (dirty) return <span className="text-[10px] text-amber-400">Modifié</span>;
  return <span className="text-[10px] text-emerald-400">Sauvegardé</span>;
}

function TemplateSwitcher({ currentStyle, onChangeStyle, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-40"
        title="Changer de template"
      >
        <Palette size={13} />
        <span className="capitalize">{currentStyle || 'modern'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 z-50 w-56 bg-[#1e1e35] border border-white/[0.07] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/[0.07]">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Style de design</p>
            </div>
            {DESIGN_STYLES.map(style => {
              const isActive = currentStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => { onChangeStyle(style.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    isActive ? 'bg-purple-500/10 text-white' : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Color dots */}
                  <div className="flex gap-1 shrink-0">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: style.colors.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: style.colors.secondary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: style.colors.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium">{style.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">{style.description}</span>
                  </div>
                  {isActive && <Check size={14} className="text-purple-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ColorPicker({ currentColors, onChangeColors, disabled }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('preset'); // preset | custom
  const [custom, setCustom] = useState(currentColors);

  const isActivePreset = (p) =>
    p.primary === currentColors.primary && p.secondary === currentColors.secondary && p.accent === currentColors.accent;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-40"
        title="Couleurs du site"
      >
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: currentColors.primary }} />
          <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: currentColors.accent }} />
        </div>
        <span>Couleurs</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 z-50 w-72 bg-[#1e1e35] border border-white/[0.07] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/[0.07]">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Palette de couleurs</p>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 px-3 pt-2">
              {[{ id: 'preset', label: 'Palettes' }, { id: 'custom', label: 'Personnalisé' }].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
                    mode === m.id ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Presets */}
            {mode === 'preset' && (
              <div className="grid grid-cols-2 gap-2 p-3">
                {COLOR_PALETTES.map(p => {
                  const active = isActivePreset(p);
                  return (
                    <button
                      key={p.name}
                      onClick={() => { onChangeColors(p); setOpen(false); }}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                        active ? 'bg-purple-500/15 ring-1 ring-purple-500/30' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex gap-0.5 shrink-0">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.secondary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.accent }} />
                      </div>
                      <span className="text-[10px] font-medium text-slate-300">{p.name}</span>
                      {active && <Check size={10} className="text-purple-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom */}
            {mode === 'custom' && (
              <div className="p-3 space-y-2">
                {[
                  { key: 'primary', label: 'Principale' },
                  { key: 'secondary', label: 'Secondaire' },
                  { key: 'accent', label: 'Accent' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="relative w-7 h-7 rounded-lg border border-white/10 cursor-pointer overflow-hidden shrink-0" style={{ backgroundColor: custom[key] }}>
                      <input type="color" value={custom[key]} onChange={e => setCustom(c => ({ ...c, [key]: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                    <span className="text-[10px] text-slate-400 w-16">{label}</span>
                    <input value={custom[key]} onChange={e => setCustom(c => ({ ...c, [key]: e.target.value }))} className="flex-1 px-2 py-1 bg-[#151525] border border-white/[0.07] rounded text-[10px] text-slate-300 font-mono outline-none" />
                  </div>
                ))}
                <button
                  onClick={() => { onChangeColors(custom); setOpen(false); }}
                  className="w-full mt-2 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] rounded-lg hover:brightness-110 transition-all"
                >
                  Appliquer
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function EditorTopBar({
  page, siteId, viewport, setViewport,
  saving, building, dirty, designStyle,
  leftPanelOpen, setLeftPanelOpen,
  rightPanelOpen, setRightPanelOpen,
  onBack, onRebuild, onChangeDesignStyle, onChangeColors, currentColors,
}) {
  const isAdmin = useIsAdmin();

  return (
    <div className="h-11 flex items-center px-3 gap-2 shrink-0 bg-[#1a1a2e] border-b border-white/[0.07]">
      {/* Back button */}
      <button onClick={onBack} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors" title="Retour aux pages">
        <ArrowLeft size={16} />
      </button>

      <div className="h-5 w-px bg-white/[0.07]" />

      {/* Left panel toggle */}
      <button onClick={() => setLeftPanelOpen(!leftPanelOpen)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors" title={leftPanelOpen ? 'Masquer les sections' : 'Afficher les sections'}>
        {leftPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
      </button>

      {/* Page title & status */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-medium text-white truncate">{page?.title}</span>
        <StatusBadge saving={saving} building={building} dirty={dirty} />
      </div>

      {/* Template switcher */}
      {isAdmin && onChangeDesignStyle && (
        <TemplateSwitcher
          currentStyle={designStyle}
          onChangeStyle={onChangeDesignStyle}
          disabled={saving || building}
        />
      )}

      {/* Color picker */}
      {isAdmin && onChangeColors && currentColors && (
        <ColorPicker
          currentColors={currentColors}
          onChangeColors={onChangeColors}
          disabled={saving || building}
        />
      )}

      <div className="h-5 w-px bg-white/[0.07]" />

      {/* Viewport */}
      <div className="flex items-center gap-0.5 rounded-lg p-0.5 bg-white/[0.04]">
        {VIEWPORT_MODES.map(v => {
          const VIcon = v.icon;
          return (
            <button
              key={v.key}
              onClick={() => setViewport(v.key)}
              className={`p-1.5 rounded-md transition-colors ${viewport === v.key ? 'bg-[#1e1e35] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              title={v.label}
            >
              <VIcon size={14} />
            </button>
          );
        })}
      </div>

      <div className="h-5 w-px bg-white/[0.07]" />

      {/* Rebuild */}
      <button
        onClick={onRebuild}
        disabled={saving || building}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors disabled:opacity-40"
      >
        <RefreshCw size={12} className={building ? 'animate-spin' : ''} />
        {building ? 'Construction...' : 'Reconstruire'}
      </button>

      {/* Right panel toggle */}
      <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors" title={rightPanelOpen ? 'Masquer les propriétés' : 'Afficher les propriétés'}>
        {rightPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
      </button>

      {/* Publish */}
      {isAdmin && (
        <PublishButton siteId={siteId} status={page?.site?.status} domain={page?.site?.domain} compact />
      )}
    </div>
  );
}
