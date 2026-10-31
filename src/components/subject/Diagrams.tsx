// Small built-in diagrams for Learn cards. Content files refer to them by name.
import type { ReactNode } from 'react';
import { AngleDiagram } from '../practise/maths/AngleDiagram';
import { SCIENCE_DIAGRAMS } from '../practise/science/ScienceDiagrams';
import { GEO_DIAGRAMS } from '../practise/geography/GeoDiagrams';

const box = { width: '100%', maxWidth: 420, display: 'block', margin: '8px auto', background: 'var(--surface-solid)', borderRadius: 12 } as const;

const DIAGRAMS: Record<string, () => ReactNode> = {
  'angles-line': () => <AngleDiagram spec={{ type: 'line', angles: [130, 50], unknown: 1 }} label="Straight line: 130 degrees and x, so x is 50 degrees" />,
  'angles-triangle': () => <AngleDiagram spec={{ type: 'triangle', angles: [60, 70, 50], unknown: 2 }} label="Triangle: 60 and 70 degrees, so x is 50 degrees" />,
  'angles-quad': () => <AngleDiagram spec={{ type: 'quad', angles: [80, 110, 95, 75], unknown: 3 }} label="Quadrilateral: 80, 110 and 95 degrees, so x is 75 degrees" />,
  'bar-model': () => (
    <svg viewBox="0 0 320 90" style={box} role="img" aria-label="Bar model: 40 pounds split into 8 boxes of 5 pounds, 3 for one person and 5 for the other">
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={10 + i * 37.5} y={20} width={35} height={36} rx={5} fill={i < 3 ? '#4cc9f0' : '#f72585'} />
          <text x={27.5 + i * 37.5} y={43} textAnchor="middle" fontSize={13} fontWeight={700} fill="#111">£5</text>
        </g>
      ))}
      <text x={60} y={14} textAnchor="middle" className="svg-text" fontSize={12}>3 parts = £15</text>
      <text x={220} y={14} textAnchor="middle" className="svg-text" fontSize={12}>5 parts = £25</text>
      <text x={160} y={78} textAnchor="middle" className="svg-text" fontSize={12}>Total £40 ÷ 8 parts = £5 each</text>
    </svg>
  ),
  ...SCIENCE_DIAGRAMS,
  ...GEO_DIAGRAMS,
  'number-line': () => (
    <svg viewBox="0 0 340 70" style={box} role="img" aria-label="Number line from minus 5 to 5">
      <line x1={10} y1={35} x2={330} y2={35} stroke="var(--text)" strokeWidth={2} />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <line x1={20 + i * 30} y1={28} x2={20 + i * 30} y2={42} stroke="var(--text)" strokeWidth={2} />
          <text x={20 + i * 30} y={60} textAnchor="middle" fontSize={13} className="svg-text" fontWeight={i === 5 ? 700 : 400}>{i - 5 < 0 ? `−${5 - i}` : i - 5}</text>
        </g>
      ))}
      <text x={60} y={18} fontSize={12} className="svg-text">← smaller</text>
      <text x={250} y={18} fontSize={12} className="svg-text">bigger →</text>
    </svg>
  ),
};

export function registerDiagrams(more: Record<string, () => ReactNode>) { Object.assign(DIAGRAMS, more); }

export function Diagram({ name }: { name: string }) {
  const d = DIAGRAMS[name];
  return d ? <>{d()}</> : null;
}
