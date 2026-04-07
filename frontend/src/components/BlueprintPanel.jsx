/**
 * BlueprintPanel — Visual engineering preview for site creation.
 * Organic background + split layout: wireframe left, real UI components right.
 * Features: sticky panel, annotations, scanline effect, revision counter.
 */

import { useState, useEffect, useRef } from 'react';
import { Layout, Image, Users, MessageSquare, Star, HelpCircle, UserCheck, Zap, Mail, Check } from 'lucide-react';

const SECTION_DEFS = [
  { id: 'hero', label: 'Hero', icon: Layout, defaultOn: true, locked: true },
  { id: 'services', label: 'Services', icon: Zap, defaultOn: true },
  { id: 'about', label: 'À propos', icon: Users, defaultOn: true },
  { id: 'testimonials', label: 'Témoignages', icon: MessageSquare, defaultOn: true },
  { id: 'google-reviews', label: 'Avis Google', icon: Star, defaultOn: true },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, defaultOn: true },
  { id: 'team', label: 'Équipe', icon: UserCheck, defaultOn: false },
  { id: 'cta', label: 'Call to action', icon: Zap, defaultOn: true },
  { id: 'contact', label: 'Contact', icon: Mail, defaultOn: true },
];

function SectionSelector({ colors = {} }) {
  const primary = colors.primary || '#7c3aed';
  const [sections, setSections] = useState(() =>
    SECTION_DEFS.reduce((acc, s) => ({ ...acc, [s.id]: s.defaultOn }), {})
  );
  const activeCount = Object.values(sections).filter(Boolean).length;

  const toggle = (id) => {
    const def = SECTION_DEFS.find(s => s.id === id);
    if (def?.locked) return;
    setSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[7px] text-white/25 uppercase tracking-[0.15em] font-mono">SECTIONS</span>
        <span className="text-[8px] text-white/40 font-mono">{activeCount} actives</span>
      </div>
      {SECTION_DEFS.map(({ id, label, icon: Icon, locked }) => {
        const on = sections[id];
        return (
          <button
            key={id}
            onClick={() => toggle(id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left group"
            style={{
              backgroundColor: on ? '#161630' : '#111125',
              border: `1px solid ${on ? `${primary}30` : 'rgba(255,255,255,0.04)'}`,
            }}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                backgroundColor: on ? `${primary}25` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${on ? `${primary}50` : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {on ? (
                <Check size={10} style={{ color: primary }} />
              ) : (
                <Icon size={9} className="text-white/15" />
              )}
            </div>
            <span className={`text-[10px] font-medium transition-colors ${on ? 'text-white/70' : 'text-white/25'}`}>
              {label}
            </span>
            {locked && <span className="text-[7px] text-white/15 ml-auto font-mono">requis</span>}
          </button>
        );
      })}
    </div>
  );
}

export { SectionSelector, SECTION_DEFS };

// ─── Shared SVG helpers ───
const L = (x1, y1, x2, y2, o = {}) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={o.c || '#c8daf0'} strokeWidth={o.w || 1} strokeDasharray={o.d || ''} opacity={o.o || 0.6} />
);
const R = (x, y, rw, rh, o = {}) => (
  <rect x={x} y={y} width={rw} height={rh} stroke={o.c || '#c8daf0'} strokeWidth={o.w || 1} fill={o.f || 'none'} fillOpacity={o.fo || 0} rx={o.rx || 0} opacity={o.o || 0.65} />
);
const T = (x, y, text, o = {}) => (
  <text x={x} y={y} fill={o.c || '#c8daf0'} fontSize={o.fs || 7} fontFamily="'SF Mono', 'Fira Code', monospace" letterSpacing={o.ls || '1px'} opacity={o.o || 0.5} textAnchor={o.a || 'start'}>
    {text}
  </text>
);

// Dimension annotation line with end marks
function DimLine({ x1, y1, x2, y2, label, side = 'right' }) {
  const isVertical = x1 === x2;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = isVertical ? Math.abs(y2 - y1) : Math.abs(x2 - x1);
  if (len < 10) return null;
  const offset = side === 'right' ? 8 : -8;

  return (
    <g opacity="0.35">
      {isVertical ? (
        <>
          <line x1={x1 + offset} y1={y1} x2={x2 + offset} y2={y2} stroke="#7cb3f0" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1={x1 + offset - 2} y1={y1} x2={x1 + offset + 2} y2={y1} stroke="#7cb3f0" strokeWidth="0.5" />
          <line x1={x2 + offset - 2} y1={y2} x2={x2 + offset + 2} y2={y2} stroke="#7cb3f0" strokeWidth="0.5" />
          <text x={mx + offset + 4} y={my + 2} fill="#7cb3f0" fontSize="4" fontFamily="'SF Mono', monospace" opacity="0.9">{label}</text>
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 + offset} x2={x2} y2={y2 + offset} stroke="#7cb3f0" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1={x1} y1={y1 + offset - 2} x2={x1} y2={y1 + offset + 2} stroke="#7cb3f0" strokeWidth="0.5" />
          <line x1={x2} y1={y2 + offset - 2} x2={x2} y2={y2 + offset + 2} stroke="#7cb3f0" strokeWidth="0.5" />
          <text x={mx} y={my + offset + 6} fill="#7cb3f0" fontSize="4" fontFamily="'SF Mono', monospace" textAnchor="middle" opacity="0.9">{label}</text>
        </>
      )}
    </g>
  );
}

// Section number label
function SectionNum({ x, y, num }) {
  return (
    <text x={x} y={y} fill="#7cb3f0" fontSize="5" fontFamily="'SF Mono', monospace" letterSpacing="0.5px" opacity="0.45">
      {String(num).padStart(2, '0')}
    </text>
  );
}

function MiniWireframe({ template = 'modern', colors = {} }) {
  const w = 280;
  const h = 400;
  const p = 16;
  const iw = w - p * 2;
  const cx = w / 2;

  // Corner coordinates
  const corners = (
    <g opacity="0.3">
      <text x={2} y={7} fill="#7cb3f0" fontSize="3.5" fontFamily="'SF Mono', monospace">0,0</text>
      <text x={w - 22} y={7} fill="#7cb3f0" fontSize="3.5" fontFamily="'SF Mono', monospace">1440,0</text>
      <text x={2} y={h - 2} fill="#7cb3f0" fontSize="3.5" fontFamily="'SF Mono', monospace">0,900</text>
      <text x={w - 28} y={h - 2} fill="#7cb3f0" fontSize="3.5" fontFamily="'SF Mono', monospace">1440,900</text>
    </g>
  );

  // Cross markers at intersection points
  const crossMark = (x, y) => (
    <g opacity="0.3">
      <line x1={x - 3} y1={y} x2={x + 3} y2={y} stroke="#7cb3f0" strokeWidth="0.5" />
      <line x1={x} y1={y - 3} x2={x} y2={y + 3} stroke="#7cb3f0" strokeWidth="0.5" />
    </g>
  );

  if (template === 'modern') {
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none">
        {/* Frame */}
        <rect x="0.5" y="0.5" width={w - 1} height={h - 1} stroke="white" strokeWidth="0.6" fill="none" opacity="0.1" />
        {corners}
        {T(p, 16, 'MODERN / WIREFRAME', { fs: 6, o: 0.25 })}

        {/* Section 01 — NAV */}
        <SectionNum x={p} y={32} num={1} />
        {R(p, 34, iw, 24, { rx: 5 })}
        {R(p + 6, 39, 40, 14, { rx: 7, o: 0.25 })}
        {R(p + iw - 52, 39, 44, 14, { rx: 7, o: 0.3 })}
        <DimLine x1={p + iw + 4} y1={34} x2={p + iw + 4} y2={58} label="64px" />

        {/* Section 02 — HERO */}
        <SectionNum x={p} y={72} num={2} />
        {R(p, 74, iw, 130, { rx: 6, w: 1.2, o: 0.5 })}
        {/* Dot pattern */}
        {Array.from({ length: 9 }).map((_, i) =>
          Array.from({ length: 4 }).map((_, j) =>
            <circle key={`d${i}-${j}`} cx={p + 14 + i * 28} cy={86 + j * 16} r="0.8" fill="white" opacity="0.12" />
          )
        )}
        {R(cx - 36, 100, 72, 14, { rx: 7, o: 0.25 })}
        {L(cx - 46, 130, cx + 46, 130, { w: 1.2, o: 0.45 })}
        {L(cx - 30, 140, cx + 30, 140, { w: 0.6, o: 0.2 })}
        {T(cx, 158, 'SUBHEADLINE', { fs: 6, o: 0.25, a: 'middle' })}
        {R(cx - 40, 164, 36, 16, { rx: 8, o: 0.4 })}
        {R(cx + 4, 164, 36, 16, { rx: 8, w: 0.7, o: 0.25 })}
        <DimLine x1={p} y1={204 + 6} x2={p + iw} y2={204 + 6} label="1440px" />
        {crossMark(p, 74)}
        {crossMark(p + iw, 74)}

        {/* Alignment line */}
        {L(p, 210, w - p, 210, { d: '1 4', o: 0.08 })}

        {/* Section 03 — SERVICES */}
        <SectionNum x={p} y={224} num={3} />
        {T(p + 14, 224, 'SERVICES', { fs: 5, o: 0.18 })}
        {T(cx, 240, 'NOS SERVICES', { fs: 7.5, o: 0.3, a: 'middle' })}
        {[0, 1].map(row => [0, 1].map(col => {
          const x = p + col * (iw / 2 + 2);
          const y = 252 + row * 42;
          return (
            <g key={`s${row}${col}`}>
              {R(x, y, iw / 2 - 6, 38, { rx: 8, o: 0.35 })}
              {R(x + 8, y + 8, 14, 14, { rx: 4, o: 0.2 })}
              {L(x + 26, y + 14, x + iw / 2 - 18, y + 14, { o: 0.15 })}
              {L(x + 26, y + 24, x + iw / 2 - 28, y + 24, { w: 0.6, o: 0.1 })}
            </g>
          );
        }))}

        {/* Footer */}
        {L(p, h - 24, w - p, h - 24, { d: '3 6', o: 0.1 })}
        {T(cx, h - 10, '+ 7 SECTIONS', { fs: 5, o: 0.2, a: 'middle' })}

        {/* Vertical dimension full height */}
        <DimLine x1={w - 6} y1={0.5} x2={w - 6} y2={h - 0.5} label="900px" side="left" />
      </svg>
    );
  }

  if (template === 'bold') {
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none">
        <rect x="0.5" y="0.5" width={w - 1} height={h - 1} stroke="white" strokeWidth="0.6" fill="none" opacity="0.1" />
        {corners}
        {T(p, 16, 'BOLD / WIREFRAME', { fs: 6, o: 0.25 })}

        {/* Section 01 — NAV */}
        <SectionNum x={p} y={32} num={1} />
        <rect x={p} y={34} width={iw} height={26} stroke="white" strokeWidth="1.2" fill="white" fillOpacity="0.02" opacity="0.5" />
        {R(p + 8, 39, 12, 12, { o: 0.3 })}
        {R(p + iw - 56, 39, 48, 16, { o: 0.3 })}
        <DimLine x1={p + iw + 4} y1={34} x2={p + iw + 4} y2={60} label="80px" />

        {/* Section 02 — HERO */}
        <SectionNum x={p} y={72} num={2} />
        <rect x={p} y={74} width={iw} height={140} stroke="white" strokeWidth="1.4" fill="none" opacity="0.5" />
        <rect x={p} y={74} width={4} height={140} fill="white" opacity="0.45" />
        {Array.from({ length: 11 }).map((_, i) =>
          <line key={`diag${i}`} x1={p + 18 + i * 24} y1={74} x2={p + i * 24 - 10} y2={214} stroke="white" strokeWidth="0.3" opacity="0.06" />
        )}
        {T(p + 16, 120, 'HEADLINE', { fs: 22, o: 0.45, ls: '3px' })}
        {T(p + 16, 138, 'FONT-BLACK / UPPERCASE', { fs: 6, o: 0.2 })}
        <rect x={p + 16} y={150} width={72} height={20} fill="white" fillOpacity="0.03" stroke="white" strokeWidth="1.2" opacity="0.4" />
        {T(p + 28, 164, 'COMMENCER', { fs: 6, o: 0.35 })}
        {crossMark(p, 74)}
        {crossMark(p + iw, 214)}

        {/* Alignment line */}
        {L(p, 224, w - p, 224, { d: '1 4', o: 0.08 })}

        {/* Section 03 — SERVICES */}
        <SectionNum x={p} y={238} num={3} />
        {T(p + 14, 238, 'SERVICES', { fs: 5, o: 0.18 })}
        {L(p, 246, p + 30, 246, { w: 1.6, o: 0.35 })}
        {T(p + 34, 249, 'NOS SERVICES', { fs: 7.5, o: 0.35, ls: '1.5px' })}
        {[0, 1, 2].map(i => (
          <g key={`srv${i}`}>
            <rect x={p} y={258 + i * 30} width={iw} height={26} stroke="white" strokeWidth="0.7" opacity="0.25" />
            <rect x={p} y={258 + i * 30} width={3} height={26} fill="white" opacity="0.35" />
            {T(p + 12, 276 + i * 30, `0${i + 1}`, { fs: 10, o: 0.3, ls: '1.5px' })}
            {T(p + iw - 14, 276 + i * 30, '\u203A', { fs: 10, o: 0.18 })}
          </g>
        ))}

        {L(p, h - 24, w - p, h - 24, { d: '3 6', o: 0.1 })}
        {T(cx, h - 10, '+ 7 SECTIONS', { fs: 5, o: 0.2, a: 'middle' })}
        <DimLine x1={w - 6} y1={0.5} x2={w - 6} y2={h - 0.5} label="900px" side="left" />
      </svg>
    );
  }

  if (template === 'elegant') {
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none">
        <rect x="0.5" y="0.5" width={w - 1} height={h - 1} stroke="white" strokeWidth="0.6" fill="none" opacity="0.1" />
        {corners}
        {T(p, 16, 'ELEGANT / WIREFRAME', { fs: 6, o: 0.25 })}

        {/* Section 01 — NAV */}
        <SectionNum x={p} y={32} num={1} />
        <rect x={p + 8} y={36} width={1.5} height={18} fill="white" opacity="0.3" />
        {T(p + 14, 50, 'SITENAME', { fs: 7, o: 0.35, ls: '2px' })}
        {R(p + iw - 56, 36, 48, 20, { rx: 0, o: 0.3 })}
        {L(p, 62, w - p, 62, { w: 0.7, o: 0.2 })}
        <DimLine x1={p + iw + 4} y1={34} x2={p + iw + 4} y2={62} label="48px" />

        {/* Section 02 — HERO */}
        <SectionNum x={p} y={74} num={2} />
        {R(p, 76, iw, 120, { w: 0.5, o: 0.1 })}
        {L(p + 12, 84, p + 12, 100, { w: 0.7, o: 0.2 })}
        {L(p + 12, 84, p + 30, 84, { w: 0.7, o: 0.2 })}
        {L(p + iw - 12, 84, p + iw - 12, 100, { w: 0.7, o: 0.2 })}
        {L(p + iw - 30, 84, p + iw - 12, 84, { w: 0.7, o: 0.2 })}
        <polygon points={`${cx},92 ${cx + 5},97 ${cx},102 ${cx - 5},97`} stroke="white" strokeWidth="0.6" fill="none" opacity="0.3" />
        {L(p + 38, 97, cx - 10, 97, { w: 0.5, o: 0.18 })}
        {L(cx + 10, 97, w - p - 38, 97, { w: 0.5, o: 0.18 })}
        {T(cx, 130, 'HEADLINE', { fs: 16, o: 0.4, ls: '3px', a: 'middle' })}
        {T(cx, 146, 'SERIF / FONT-LIGHT', { fs: 6, o: 0.18, a: 'middle' })}
        {R(cx - 40, 154, 80, 20, { rx: 0, o: 0.3 })}
        {T(cx, 168, 'D\u00c9COUVRIR', { fs: 6.5, o: 0.25, a: 'middle' })}
        {crossMark(p, 76)}
        {crossMark(p + iw, 196)}

        {/* Alignment line */}
        {L(p, 206, w - p, 206, { d: '1 4', o: 0.08 })}

        {/* Section 03 — SERVICES */}
        <SectionNum x={p} y={220} num={3} />
        {T(p + 14, 220, 'SERVICES', { fs: 5, o: 0.18 })}
        {[0, 1, 2].map(i => (
          <g key={`esv${i}`}>
            {L(p, 250 + i * 28, w - p, 250 + i * 28, { w: 0.5, o: 0.15 })}
            {L(p + 8, 238 + i * 28, p + 100, 238 + i * 28, { o: 0.18 })}
            {T(p + iw - 12, 244 + i * 28, '\u203A', { fs: 9, o: 0.18 })}
          </g>
        ))}

        {L(p, h - 24, w - p, h - 24, { d: '3 6', o: 0.1 })}
        {T(cx, h - 10, '+ 7 SECTIONS', { fs: 5, o: 0.2, a: 'middle' })}
        <DimLine x1={w - 6} y1={0.5} x2={w - 6} y2={h - 0.5} label="900px" side="left" />
      </svg>
    );
  }

  if (template === 'minimal') {
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none">
        <rect x="0.5" y="0.5" width={w - 1} height={h - 1} stroke="white" strokeWidth="0.6" fill="none" opacity="0.1" />
        {corners}
        {T(p, 16, 'MINIMAL / WIREFRAME', { fs: 6, o: 0.25 })}

        {/* Section 01 — NAV */}
        <SectionNum x={p} y={34} num={1} />
        {T(p + 14, 46, 'SITENAME', { fs: 8, o: 0.3, ls: '0.5px' })}
        {R(p + iw - 50, 34, 44, 18, { rx: 4, o: 0.25 })}
        {L(p, 58, w - p, 58, { w: 0.6, o: 0.18 })}
        <DimLine x1={p + iw + 4} y1={34} x2={p + iw + 4} y2={58} label="48px" />

        {/* Section 02 — HERO */}
        <SectionNum x={p} y={70} num={2} />
        {R(p + 20, 72, iw - 40, 90, { rx: 3, w: 0.4, o: 0.08 })}
        {T(cx, 108, 'HEADLINE', { fs: 14, o: 0.3, ls: '1px', a: 'middle' })}
        {T(cx, 124, 'SUBTITLE / SIMPLE', { fs: 6, o: 0.18, a: 'middle' })}
        {R(cx - 34, 132, 68, 16, { rx: 4, o: 0.25 })}
        {T(cx, 144, 'COMMENCER', { fs: 5, o: 0.2, a: 'middle' })}
        {crossMark(p, 72)}

        {/* Alignment line */}
        {L(p, 170, w - p, 170, { d: '1 4', o: 0.08 })}

        {/* Section 03 — SERVICES */}
        <SectionNum x={p} y={184} num={3} />
        {T(p + 14, 184, 'SERVICES', { fs: 5, o: 0.18 })}
        {[0, 1, 2].map(i => (
          <g key={`msv${i}`}>
            {R(p, 196 + i * 34, iw, 30, { rx: 4, o: 0.2 })}
            {R(p + 10, 203 + i * 34, 12, 12, { rx: 3, o: 0.12 })}
            {L(p + 26, 209 + i * 34, p + 110, 209 + i * 34, { w: 0.6, o: 0.1 })}
            {L(p + 26, 218 + i * 34, p + 140, 218 + i * 34, { w: 0.5, o: 0.06 })}
          </g>
        ))}

        {L(p, h - 24, w - p, h - 24, { d: '3 6', o: 0.1 })}
        {T(cx, h - 10, '+ 7 SECTIONS', { fs: 5, o: 0.2, a: 'middle' })}
        <DimLine x1={w - 6} y1={0.5} x2={w - 6} y2={h - 0.5} label="900px" side="left" />
      </svg>
    );
  }

  // Artistic
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none">
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} stroke="white" strokeWidth="0.6" fill="none" opacity="0.1" />
      {corners}
      {T(p, 16, 'ARTISTIC / WIREFRAME', { fs: 6, o: 0.25 })}

      {/* Section 01 — NAV pill */}
      <SectionNum x={p} y={32} num={1} />
      {R(p + 10, 34, iw - 20, 24, { rx: 12, w: 1, o: 0.4 })}
      <rect x={p + 16} y={39} width={14} height={14} rx="5" stroke="white" strokeWidth="0.6" fill="none" opacity="0.25" transform={`rotate(3, ${p + 23}, 46)`} />
      {T(p + 34, 50, 'SITENAME', { fs: 6, o: 0.25 })}
      {R(p + iw - 50, 39, 34, 14, { rx: 7, o: 0.3 })}
      <DimLine x1={p + iw + 4} y1={34} x2={p + iw + 4} y2={58} label="64px" />

      {/* Section 02 — HERO */}
      <SectionNum x={p} y={70} num={2} />
      {R(p, 72, iw, 130, { rx: 14, w: 1.2, o: 0.5 })}
      <circle cx={w - p - 38} cy={112} r="28" stroke="white" strokeWidth="0.6" opacity="0.14" />
      <circle cx={w - p - 62} cy={134} r="16" stroke="white" strokeWidth="0.4" opacity="0.1" />
      {R(p + 14, 86, 54, 12, { rx: 6, o: 0.2 })}
      {T(p + 14, 122, 'HEADLINE', { fs: 16, o: 0.4, ls: '1.5px' })}
      {T(p + 14, 138, 'GRADIENT / POPPINS', { fs: 5, o: 0.18 })}
      {R(p + 14, 148, 70, 18, { rx: 9, w: 1, o: 0.35 })}
      {T(p + 28, 161, 'D\u00c9COUVRIR', { fs: 6, o: 0.3 })}
      {R(p + 90, 148, 46, 18, { rx: 9, w: 0.7, o: 0.2 })}
      {crossMark(p, 72)}
      {crossMark(p + iw, 202)}

      {/* Alignment line */}
      {L(p, 212, w - p, 212, { d: '1 4', o: 0.08 })}

      {/* Section 03 — SERVICES */}
      <SectionNum x={p} y={226} num={3} />
      {T(p + 14, 226, 'SERVICES', { fs: 5, o: 0.18 })}
      {[0, 1].map(col => [0, 1].map(row => {
        const x = p + col * (iw / 2 + 2);
        const y = 238 + row * 44 + (col % 2 === 1 ? 12 : 0);
        return (
          <g key={`asv${col}${row}`}>
            {R(x, y, iw / 2 - 6, 40, { rx: 12, w: 0.7, o: 0.3 })}
            <circle cx={x + 16} cy={y + 14} r="6" stroke="white" strokeWidth="0.5" fill="none" opacity="0.18" />
            {L(x + 26, y + 12, x + iw / 2 - 18, y + 12, { w: 0.6, o: 0.1 })}
            {L(x + 26, y + 22, x + iw / 2 - 26, y + 22, { w: 0.5, o: 0.06 })}
          </g>
        );
      }))}

      {L(p, h - 24, w - p, h - 24, { d: '3 6', o: 0.1 })}
      {T(cx, h - 10, '+ 7 SECTIONS', { fs: 5, o: 0.2, a: 'middle' })}
      <DimLine x1={w - 6} y1={0.5} x2={w - 6} y2={h - 0.5} label="900px" side="left" />
    </svg>
  );
}

// ─── Template-specific UI components preview ───
function TemplateUIPreview({ template = 'modern', colors = {} }) {
  const primary = colors.primary || '#0ea5e9';
  const accent = colors.accent || '#f59e0b';

  const styles = {
    modern: { borderRadius: '12px', btnRadius: '10px', inputRadius: '10px', cardRadius: '16px', font: "'Inter', system-ui, sans-serif", uppercase: false, borderWidth: '1px' },
    bold: { borderRadius: '0px', btnRadius: '0px', inputRadius: '0px', cardRadius: '0px', font: "'Inter', system-ui, sans-serif", uppercase: true, borderWidth: '2px' },
    elegant: { borderRadius: '0px', btnRadius: '0px', inputRadius: '0px', cardRadius: '0px', font: "'Georgia', serif", uppercase: true, borderWidth: '1px' },
    minimal: { borderRadius: '8px', btnRadius: '6px', inputRadius: '6px', cardRadius: '10px', font: "'Inter', system-ui, sans-serif", uppercase: false, borderWidth: '1px' },
    artistic: { borderRadius: '20px', btnRadius: '24px', inputRadius: '16px', cardRadius: '24px', font: "'Poppins', system-ui, sans-serif", uppercase: false, borderWidth: '1px' },
  };

  const s = styles[template] || styles.modern;
  const textTransform = s.uppercase ? 'uppercase' : 'none';
  const letterSpacing = s.uppercase ? '0.08em' : 'normal';

  return (
    <div className="flex flex-col gap-3" style={{ fontFamily: s.font }}>
      <span className="text-[7px] text-white/30 uppercase tracking-[0.15em] block" style={{ fontFamily: "'SF Mono', monospace" }}>
        UI COMPONENTS
      </span>

      {/* Button primary */}
      <div>
        <span className="text-[8px] text-white/35 block mb-1.5" style={{ fontFamily: "'SF Mono', monospace" }}>Button</span>
        <div style={{ backgroundColor: primary, color: '#fff', borderRadius: s.btnRadius, padding: '7px 16px', fontSize: '10px', fontWeight: 600, fontFamily: s.font, textTransform, letterSpacing, textAlign: 'center', border: `${s.borderWidth} solid ${primary}` }}>
          {s.uppercase ? 'D\u00c9COUVRIR' : 'D\u00e9couvrir'}
        </div>
        <div style={{ backgroundColor: 'transparent', color: primary, borderRadius: s.btnRadius, padding: '7px 16px', fontSize: '10px', fontWeight: 600, fontFamily: s.font, textTransform, letterSpacing, textAlign: 'center', border: `${s.borderWidth} solid ${primary}`, marginTop: '5px' }}>
          {s.uppercase ? 'EN SAVOIR PLUS' : 'En savoir plus'}
        </div>
      </div>

      {/* Card */}
      <div>
        <span className="text-[8px] text-white/35 block mb-1.5" style={{ fontFamily: "'SF Mono', monospace" }}>Card</span>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: s.cardRadius, border: `${s.borderWidth} solid rgba(255,255,255,0.08)`, padding: '10px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: template === 'artistic' ? '10px' : template === 'bold' || template === 'elegant' ? '0px' : '8px', backgroundColor: `${primary}20`, border: `1px solid ${primary}40`, marginBottom: '6px' }} />
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: s.font, textTransform, letterSpacing, marginBottom: '3px' }}>
            {s.uppercase ? 'SERVICE TITLE' : 'Service title'}
          </div>
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: s.font, lineHeight: '1.4' }}>
            Description courte du service propos&eacute; par l'entreprise.
          </div>
        </div>
      </div>

      {/* Input */}
      <div>
        <span className="text-[8px] text-white/35 block mb-1.5" style={{ fontFamily: "'SF Mono', monospace" }}>Input</span>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: s.inputRadius, border: `${s.borderWidth} solid rgba(255,255,255,0.1)`, padding: '7px 10px', fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontFamily: s.font }}>
          {s.uppercase ? 'VOTRE EMAIL...' : 'Votre email...'}
        </div>
      </div>

      {/* Badge */}
      <div>
        <span className="text-[8px] text-white/35 block mb-1.5" style={{ fontFamily: "'SF Mono', monospace" }}>Badge</span>
        <div className="flex gap-1.5">
          <div style={{ backgroundColor: `${primary}20`, color: primary, borderRadius: template === 'artistic' ? '20px' : template === 'bold' || template === 'elegant' ? '0px' : '6px', padding: '3px 8px', fontSize: '8px', fontWeight: 500, fontFamily: s.font, textTransform, letterSpacing, border: `1px solid ${primary}30` }}>
            {s.uppercase ? 'POPULAIRE' : 'Populaire'}
          </div>
          <div style={{ backgroundColor: `${accent}20`, color: accent, borderRadius: template === 'artistic' ? '20px' : template === 'bold' || template === 'elegant' ? '0px' : '6px', padding: '3px 8px', fontSize: '8px', fontWeight: 500, fontFamily: s.font, textTransform, letterSpacing, border: `1px solid ${accent}30` }}>
            {s.uppercase ? 'NOUVEAU' : 'Nouveau'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorPaletteDots({ colors = {} }) {
  const items = [
    { label: 'PRIMARY', color: colors.primary || '#0ea5e9' },
    { label: 'SECONDARY', color: colors.secondary || '#1e293b' },
    { label: 'ACCENT', color: colors.accent || '#f59e0b' },
  ];

  return (
    <div className="flex items-center gap-5">
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: color }} />
          <div>
            <span className="text-[7px] text-white/40 uppercase tracking-[0.15em] block font-mono">{label}</span>
            <span className="text-[9px] text-white/60 font-mono">{color}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlueprintPanel({ siteName, activity, city, template, colors }) {
  // Revision counter
  const revRef = useRef(0);
  const prevPropsRef = useRef('');
  const propsKey = `${siteName}|${activity}|${city}|${template}|${JSON.stringify(colors)}`;
  if (propsKey !== prevPropsRef.current) {
    revRef.current += 1;
    prevPropsRef.current = propsKey;
  }
  const revNum = String(revRef.current).padStart(3, '0');

  // Template transition
  const [visible, setVisible] = useState(true);
  const prevTemplate = useRef(template);
  useEffect(() => {
    if (template !== prevTemplate.current) {
      setVisible(false);
      const t = setTimeout(() => {
        prevTemplate.current = template;
        setVisible(true);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [template]);

  const isReady = siteName && activity && city;

  const specs = [
    { label: 'PROJECT', value: siteName || '\u2014' },
    { label: 'TYPE', value: activity || '\u2014' },
    { label: 'LOCATION', value: city || '\u2014' },
    { label: 'TEMPLATE', value: (template || 'modern').toUpperCase() },
    { label: 'SECTIONS', value: '9 BLOCKS' },
    { label: 'RENDER', value: 'REACT SSG / STATIC HTML' },
    { label: 'STATUS', value: isReady ? 'READY' : 'AWAITING INPUT' },
  ];

  return (
    <div className="flex flex-col h-full relative rounded-xl"
      style={{ background: 'linear-gradient(145deg, #0c1628 0%, #0f1a2e 50%, #0c1225 100%)' }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] rounded-xl"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,160,255,0.015) 2px, rgba(100,160,255,0.015) 4px)',
        }}
      />

      <div className="relative z-20 flex flex-col h-full p-5">
        {/* Header */}
        <div className="mb-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[8px] text-white/35 uppercase tracking-[0.2em] font-mono">LIVE ENGINEERING PREVIEW</span>
            <span className="text-[7px] text-white/20 font-mono ml-auto">REV. {revNum}</span>
          </div>
          <h3 className="text-[12px] text-white/80 uppercase tracking-[0.25em] font-bold font-mono">
            {siteName ? `${siteName} \u2014 BLUEPRINT` : 'SITE BLUEPRINT'}
          </h3>
        </div>

        {/* Main content: wireframe left + sidebar right */}
        <div
          className="flex gap-4 flex-1 min-h-0 transition-all duration-300"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.98)',
          }}
        >
          {/* Left: wireframe — fills available height */}
          <div className="flex-1 min-w-0 flex flex-col">
            <MiniWireframe template={template || 'modern'} colors={colors || {}} />
          </div>

          {/* Right sidebar: UI components + spec sheet + color + status */}
          <div className="w-[200px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto scrollbar-none">
            {/* UI Components */}
            <TemplateUIPreview template={template || 'modern'} colors={colors || {}} />

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />

            {/* Color palette — compact horizontal */}
            <div>
              <span className="text-[7px] text-white/30 uppercase tracking-[0.15em] block mb-1.5 font-mono">COLOR SCHEME</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'PRIMARY', color: (colors || {}).primary || '#0ea5e9' },
                  { label: 'SECONDARY', color: (colors || {}).secondary || '#1e293b' },
                  { label: 'ACCENT', color: (colors || {}).accent || '#f59e0b' },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[6px] text-white/35 uppercase tracking-[0.1em] font-mono w-12">{label}</span>
                    <span className="text-[7px] text-white/55 font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />

            {/* Spec sheet — compact */}
            <div className="space-y-1">
              <span className="text-[7px] text-white/30 uppercase tracking-[0.15em] block mb-0.5 font-mono">SPECS</span>
              {specs.map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="text-[6px] text-white/30 uppercase tracking-[0.1em] w-14 shrink-0 font-mono">{label}</span>
                  <span className="text-[6px] text-white/6 flex-1 border-b border-dotted border-white/6" />
                  <span className={`text-[7px] font-mono tracking-wide ${value === '\u2014' ? 'text-white/20' : 'text-white/70'}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Status — compact */}
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-500 flex-shrink-0"
              style={{
                backgroundColor: isReady ? 'rgba(34,197,94,0.06)' : 'transparent',
                border: `1px solid ${isReady ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse flex-shrink-0`} />
              <span className="text-[6px] text-white/30 uppercase tracking-[0.1em] font-mono">
                {isReady ? 'READY TO BUILD' : 'AWAITING CONFIG'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
