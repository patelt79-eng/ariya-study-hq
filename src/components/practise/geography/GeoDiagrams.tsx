// Learn-card diagrams for Geography.
import type { ReactNode } from 'react';
import { BaseMap } from './WorldMap';
import { WaterCycleScene } from './GeoTools';

const wrap = { width: '100%', maxWidth: 420, display: 'block', margin: '8px auto', background: 'var(--surface-solid)', borderRadius: 12 } as const;

export const GEO_DIAGRAMS: Record<string, () => ReactNode> = {
  'world-map': () => <div style={{ margin: '8px 0' }}><BaseMap /></div>,
  'water-cycle': () => <div style={{ maxWidth: 420, margin: '8px auto' }}><WaterCycleScene animate={false} /></div>,
  convection: () => (
    <svg viewBox="0 0 320 170" style={wrap} role="img" aria-label="Convection currents in the mantle: hot rock rises from the core, spreads under the plates, cools and sinks">
      <rect x={10} y={20} width={300} height={22} fill="#264653" /><text x={160} y={35} textAnchor="middle" fill="#fff" fontSize={11}>← plate   crust   plate →</text>
      <rect x={10} y={42} width={300} height={95} fill="#e76f51" opacity={0.8} />
      <rect x={10} y={137} width={300} height={25} fill="#f4a261" /><text x={160} y={154} textAnchor="middle" fontSize={11}>core (heat)</text>
      <path d="M160 130 C160 60 90 55 60 80 C40 100 60 125 100 130" fill="none" stroke="#fff" strokeWidth={3} markerEnd="url(#cv)" />
      <path d="M160 130 C160 60 230 55 260 80 C280 100 260 125 220 130" fill="none" stroke="#fff" strokeWidth={3} markerEnd="url(#cv)" />
      <text x={165} y={95} fontSize={10} fill="#fff">rises</text><text x={30} y={110} fontSize={10} fill="#fff">sinks</text>
      <defs><marker id="cv" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#fff" /></marker></defs>
    </svg>
  ),
  boundaries: () => (
    <svg viewBox="0 0 330 90" style={wrap} role="img" aria-label="Convergent: arrows towards each other. Divergent: arrows apart. Conservative: arrows sliding past each other.">
      {[['Convergent', '→ ←'], ['Divergent', '← →'], ['Conservative', '⇉ ⇇']].map(([n, a], i) => (
        <g key={n}><text x={55 + i * 110} y={40} textAnchor="middle" fontSize={26} className="svg-text">{a}</text><text x={55 + i * 110} y={70} textAnchor="middle" fontSize={12} className="svg-text" fontWeight={700}>{n}</text></g>
      ))}
    </svg>
  ),
};
