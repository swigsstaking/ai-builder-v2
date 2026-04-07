import { CheckCircle, Loader, AlertCircle, X, FolderPlus, ImageIcon, FileText, Star, Sparkles, Phone, Search, Hammer, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICON_MAP = {
  FolderPlus, ImageIcon, FileText, Star, Sparkles, Phone, Search, Hammer, Globe, CheckCircle,
};

function StepRow({ step, index, currentIndex, status }) {
  const state = status === 'error' ? (index <= currentIndex ? 'error' : 'pending')
    : status === 'done' ? 'done'
    : index < currentIndex ? 'done'
    : index === currentIndex ? 'active'
    : 'pending';

  const Icon = ICON_MAP[step.icon] || Globe;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
        state === 'done' ? 'bg-green-500/15 text-green-400' :
        state === 'active' ? 'bg-accent/15 text-accent-text ring-2 ring-accent/30' :
        state === 'error' ? 'bg-red-500/15 text-red-500' :
        'text-slate-600'
      }`}
      style={state === 'pending' ? { background: 'rgba(255,255,255,0.05)' } : undefined}>
        {state === 'done' ? <CheckCircle size={14} /> :
         state === 'active' ? <Loader size={14} className="animate-spin" /> :
         state === 'error' ? <AlertCircle size={14} /> :
         <Icon size={14} />}
      </div>
      <span className={`text-sm font-medium transition-colors duration-300 ${
        state === 'done' ? 'text-green-400' :
        state === 'active' ? 'text-white' :
        state === 'error' ? 'text-red-400' :
        'text-slate-500'
      }`}>
        {step.label}
      </span>
    </div>
  );
}

// ─── Template preview that colorizes progressively ───
function ProgressTemplate({ template = 'modern', colors = {}, progress = 0, siteName = '' }) {
  const primary = colors.primary || '#7c3aed';
  const secondary = colors.secondary || '#1e293b';
  const accent = colors.accent || '#f59e0b';

  const globalT = Math.min(progress / 100, 1);

  // Interpolate between monochrome and target color
  const lerp = (mono, color, amount) => {
    const a = Math.max(0, Math.min(1, amount));
    const m = mono.match(/\w\w/g).map(x => parseInt(x, 16));
    const c = color.match(/\w\w/g)?.map(x => parseInt(x, 16)) || m;
    return `rgb(${Math.round(m[0] + (c[0] - m[0]) * a)},${Math.round(m[1] + (c[1] - m[1]) * a)},${Math.round(m[2] + (c[2] - m[2]) * a)})`;
  };

  // Each element gets a local t based on its position (y + x*0.3) normalized to [0..1].
  // The wave front sweeps from top-left to bottom-right.
  // Elements colorize when the wave reaches them.
  const w = 240;
  const h = 360;
  const p = 14;
  const iw = w - p * 2;
  const cx = w / 2;
  const maxDist = h + w * 0.3; // max possible y + x*0.3

  // Returns local colorization amount [0..1] for an element at (x, y)
  // Wave front position = globalT * (maxDist + spread), element activates when wave reaches it
  const spread = 120; // how wide the transition zone is
  const waveAt = (ex, ey) => {
    const dist = ey + ex * 0.3;
    const waveFront = globalT * (maxDist + spread);
    return Math.max(0, Math.min(1, (waveFront - dist) / spread));
  };

  const mono = '#3a3a5c';
  const monoLight = '#2a2a44';
  const monoText = '#555577';

  // Color helpers that take position
  const cPri = (x, y) => lerp(mono, primary, waveAt(x, y));
  const cSec = (x, y) => lerp(monoLight, secondary, waveAt(x, y));
  const cAcc = (x, y) => lerp(monoText, accent, waveAt(x, y));
  const sOp = (x, y) => 0.15 + waveAt(x, y) * 0.45;
  const tOp = (x, y) => 0.2 + waveAt(x, y) * 0.5;
  const fOp = (x, y, base, range) => base + waveAt(x, y) * range;

  const borderRadius = template === 'bold' || template === 'elegant' ? 0
    : template === 'artistic' ? 12 : template === 'minimal' ? 4 : 8;

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow behind template */}
      <div className="absolute inset-0 rounded-2xl transition-all duration-1000" style={{
        background: `radial-gradient(ellipse at center, ${lerp(mono, primary, globalT)}15 0%, transparent 70%)`,
        filter: 'blur(20px)',
        opacity: globalT,
      }} />

      <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none" className="relative">
        {/* Background frame */}
        <rect x="1" y="1" width={w - 2} height={h - 2} rx={borderRadius + 4}
          stroke={cPri(cx, cx)} strokeWidth="0.8" opacity={sOp(cx, cx)}
          fill={cSec(cx, cx)} fillOpacity={fOp(cx, cx, 0.15, 0.15)} />

        {/* NAV */}
        <rect x={p} y={12} width={iw} height={22} rx={borderRadius}
          stroke={cPri(p, 12)} strokeWidth="0.8" opacity={sOp(p, 12)} />
        <rect x={p + 8} y={16} width={32} height={14} rx={borderRadius > 4 ? 7 : borderRadius}
          fill={cPri(p + 8, 16)} fillOpacity={fOp(p + 8, 16, 0.15, 0.2)} />
        <rect x={p + iw - 48} y={16} width={40} height={14} rx={borderRadius > 4 ? 7 : borderRadius}
          fill={cPri(p + iw - 48, 16)} fillOpacity={fOp(p + iw - 48, 16, 0.2, 0.4)} />
        <text x={p + iw - 38} y={26} fill="white" fontSize="5.5" opacity={tOp(p + iw - 38, 26)} fontFamily="Arial">CTA</text>

        {/* HERO */}
        <rect x={p} y={42} width={iw} height={100} rx={borderRadius}
          stroke={cPri(p, 42)} strokeWidth="1" opacity={sOp(p, 42) * 1.2}
          fill={cPri(p, 42)} fillOpacity={fOp(p, 42, 0.03, 0.06)} />
        <rect x={p + 16} y={62} width={iw * 0.6} height={8} rx={2}
          fill={cPri(p + 16, 62)} fillOpacity={fOp(p + 16, 62, 0.15, 0.35)} />
        <rect x={p + 16} y={76} width={iw * 0.4} height={5} rx={1.5}
          fill="white" fillOpacity={fOp(p + 16, 76, 0.08, 0.12)} />
        <rect x={p + 16} y={96} width={56} height={18} rx={borderRadius > 4 ? 9 : borderRadius}
          fill={cPri(p + 16, 96)} fillOpacity={fOp(p + 16, 96, 0.25, 0.55)} />
        <text x={p + 28} y={108} fill="white" fontSize="5.5" opacity={fOp(p + 28, 108, 0.3, 0.5)} fontFamily="Arial">Découvrir</text>
        <rect x={p + 78} y={96} width={44} height={18} rx={borderRadius > 4 ? 9 : borderRadius}
          stroke={cPri(p + 78, 96)} strokeWidth="0.8" opacity={sOp(p + 78, 96)} />

        {/* SERVICES label */}
        <text x={cx} y={160} fill={cPri(cx, 160)} fontSize="6" opacity={tOp(cx, 160) * 0.7}
          fontFamily="Arial" textAnchor="middle" letterSpacing="1.5px">SERVICES</text>

        {/* Service cards */}
        {[0, 1].map(row => [0, 1].map(col => {
          const x = p + col * (iw / 2 + 2);
          const y = 168 + row * 42;
          return (
            <g key={`s${row}${col}`}>
              <rect x={x} y={y} width={iw / 2 - 6} height={38} rx={borderRadius}
                stroke={cPri(x, y)} strokeWidth="0.7" opacity={sOp(x, y) * 0.8}
                fill={cPri(x, y)} fillOpacity={fOp(x, y, 0.02, 0.04)} />
              <rect x={x + 8} y={y + 8} width={12} height={12}
                rx={borderRadius > 4 ? 4 : borderRadius > 0 ? 2 : 0}
                fill={cAcc(x + 8, y + 8)} fillOpacity={fOp(x + 8, y + 8, 0.15, 0.4)} />
              <rect x={x + 24} y={y + 10} width={iw / 2 - 40} height={3.5} rx={1}
                fill="white" fillOpacity={fOp(x + 24, y + 10, 0.08, 0.12)} />
              <rect x={x + 24} y={y + 18} width={iw / 2 - 50} height={2.5} rx={1}
                fill="white" fillOpacity={fOp(x + 24, y + 18, 0.05, 0.07)} />
            </g>
          );
        }))}

        {/* TESTIMONIAL */}
        <rect x={p + 12} y={260} width={iw - 24} height={36} rx={borderRadius + 2}
          stroke={cPri(p + 12, 260)} strokeWidth="0.6" opacity={sOp(p + 12, 260) * 0.7}
          fill={cPri(p + 12, 260)} fillOpacity={fOp(p + 12, 260, 0.02, 0.03)} />
        <text x={cx} y={276} fill="white" fontSize="5" opacity={fOp(cx, 276, 0.1, 0.2)}
          fontFamily="Arial" textAnchor="middle">"Témoignage client"</text>
        <circle cx={cx - 16} cy={288} r="4"
          stroke={cAcc(cx - 16, 288)} strokeWidth="0.6" opacity={sOp(cx - 16, 288)}
          fill={cAcc(cx - 16, 288)} fillOpacity={fOp(cx - 16, 288, 0.1, 0.2)} />
        <rect x={cx - 8} y={286} width={30} height={3} rx={1}
          fill="white" fillOpacity={fOp(cx - 8, 286, 0.06, 0.1)} />

        {/* CTA bar */}
        <rect x={p} y={306} width={iw} height={26} rx={borderRadius}
          fill={cPri(p, 306)} fillOpacity={fOp(p, 306, 0.06, 0.18)}
          stroke={cPri(p, 306)} strokeWidth="0.7" opacity={sOp(p, 306)} />
        <rect x={cx - 28} y={313} width={56} height={14} rx={borderRadius > 4 ? 7 : borderRadius}
          fill={cPri(cx - 28, 313)} fillOpacity={fOp(cx - 28, 313, 0.2, 0.5)} />

        {/* FOOTER */}
        <rect x={p} y={340} width={iw} height={14} rx={0}
          fill={cSec(p, 340)} fillOpacity={fOp(p, 340, 0.1, 0.2)} />
        <rect x={p + 8} y={344} width={28} height={3} rx={1}
          fill="white" fillOpacity={fOp(p + 8, 344, 0.06, 0.08)} />
        <rect x={p + iw - 50} y={344} width={40} height={3} rx={1}
          fill="white" fillOpacity={fOp(p + iw - 50, 344, 0.04, 0.06)} />
      </svg>

      {/* Site name label */}
      <div className="mt-2 text-center transition-all duration-700" style={{ opacity: 0.3 + globalT * 0.5 }}>
        <span className="text-[9px] uppercase tracking-[0.15em] font-mono" style={{ color: lerp(mono, primary, globalT) }}>
          {siteName || 'VOTRE SITE'}
        </span>
      </div>
    </div>
  );
}

export default function CreateProgressModal({ steps, currentIndex, status, error, siteId, template, colors, siteName, onClose }) {
  const isDone = status === 'done';
  const isError = status === 'error';
  const progress = isDone ? 100 : steps.length > 1 ? Math.round((currentIndex / (steps.length - 1)) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative rounded-2xl w-full overflow-hidden flex" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.07)', maxWidth: template ? '720px' : '448px' }} onClick={e => e.stopPropagation()}>

        {/* Left side: steps */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDone ? 'bg-green-500/15' : isError ? 'bg-red-500/15' : 'bg-accent/10'
                }`}>
                  {isDone ? <CheckCircle size={20} className="text-green-400" /> :
                   isError ? <AlertCircle size={20} className="text-red-500" /> :
                   <Loader size={20} className="text-accent animate-spin" />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">
                    {isDone ? 'Site créé !' : isError ? 'Erreur de création' : 'Création en cours'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {isDone ? 'Votre site est prêt' : isError ? 'Une erreur est survenue' : steps[currentIndex]?.label || '...'}
                  </p>
                </div>
              </div>
              {(isDone || isError) && (
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="px-6 py-4 flex-1">
            <div className="space-y-0">
              {steps.map((step, i) => (
                <StepRow key={step.key} step={step} index={i} currentIndex={currentIndex} status={status} />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400">Progression</span>
              <span className="text-xs font-mono text-slate-400">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isError ? 'bg-red-400' : isDone ? 'bg-green-500' : 'bg-accent'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Error message */}
          {isError && error && (
            <div className="px-6 pb-4">
              <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
                <p className="text-xs text-red-400 font-mono break-all">{error.substring(0, 200)}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          {(isDone || isError) && (
            <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
              {isDone && siteId && (
                <Link
                  to={`/dashboard/sites/${siteId}/pages`}
                  className="px-5 py-2 rounded-lg font-medium text-sm bg-accent text-primary hover:bg-accent/90 transition-colors"
                >
                  Voir le site
                </Link>
              )}
              {isError && (
                <button onClick={onClose} className="px-5 py-2 rounded-lg font-medium text-sm bg-accent text-primary hover:bg-accent/90 transition-colors">
                  Fermer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right side: template that colorizes with progress */}
        {template && (
          <div className="w-[260px] flex-shrink-0 flex items-center justify-center p-5" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
            <ProgressTemplate
              template={template}
              colors={colors}
              progress={progress}
              siteName={siteName}
            />
          </div>
        )}
      </div>
    </div>
  );
}
