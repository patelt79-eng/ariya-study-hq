// Learn-card diagrams for Science.
import type { ReactNode } from 'react';
import { CellSvg } from './CellSvg';

const wrap = { width: '100%', maxWidth: 420, display: 'block', margin: '8px auto', background: 'var(--surface-solid)', borderRadius: 12 } as const;

function Box({ children, label, vb = '0 0 320 140' }: { children: ReactNode; label: string; vb?: string }) {
  return <svg viewBox={vb} style={wrap} role="img" aria-label={label}>{children}</svg>;
}

function particles(kind: 'solid' | 'liquid' | 'gas', ox: number) {
  const pts: [number, number][] = [];
  if (kind === 'solid') for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) pts.push([ox + 18 + c * 18, 40 + r * 18]);
  if (kind === 'liquid') [[20, 70], [37, 72], [54, 68], [71, 74], [24, 87], [42, 90], [60, 86], [77, 91], [30, 54], [50, 52], [68, 56], [18, 104], [36, 106], [56, 103], [74, 107]].forEach(([x, y]) => pts.push([ox + x, y]));
  if (kind === 'gas') [[20, 40], [70, 50], [40, 80], [85, 95], [15, 110], [60, 115]].forEach(([x, y]) => pts.push([ox + x, y]));
  return (
    <g>
      <rect x={ox + 5} y={28} width={90} height={92} fill="none" stroke="var(--muted)" strokeWidth={2} rx={4} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7.5} fill={kind === 'solid' ? '#4cc9f0' : kind === 'liquid' ? '#4895ef' : '#b5179e'} />)}
      <text x={ox + 50} y={20} textAnchor="middle" className="svg-text" fontSize={13} fontWeight={700}>{kind[0].toUpperCase() + kind.slice(1)}</text>
    </g>
  );
}

export const SCIENCE_DIAGRAMS: Record<string, () => ReactNode> = {
  'animal-cell': () => <div style={{ maxWidth: 380, margin: '8px auto' }}><CellSvg kind="animal" showLabels /></div>,
  'plant-cell': () => <div style={{ maxWidth: 380, margin: '8px auto' }}><CellSvg kind="plant" showLabels /></div>,
  particles: () => <Box label="Particles in a solid, a liquid and a gas">{particles('solid', 5)}{particles('liquid', 112)}{particles('gas', 219)}</Box>,
  'food-chain': () => (
    <Box label="Food chain: grass is eaten by rabbit, which is eaten by fox" vb="0 0 320 80">
      {[['🌱', 'Grass', 'producer'], ['🐇', 'Rabbit', 'primary consumer'], ['🦊', 'Fox', 'secondary consumer']].map(([e, n, r], i) => (
        <g key={n}>
          <text x={50 + i * 110} y={34} textAnchor="middle" fontSize={26}>{e}</text>
          <text x={50 + i * 110} y={56} textAnchor="middle" className="svg-text" fontSize={12} fontWeight={700}>{n}</text>
          <text x={50 + i * 110} y={71} textAnchor="middle" className="svg-muted" fontSize={10}>{r}</text>
          {i < 2 && <path d={`M ${80 + i * 110} 26 L ${128 + i * 110} 26`} stroke="var(--accent)" strokeWidth={3} markerEnd="url(#arr)" />}
        </g>
      ))}
      <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--accent)" /></marker></defs>
    </Box>
  ),
  atoms: () => (
    <Box label="Element, compound and mixture shown as particles" vb="0 0 320 120">
      {[['Element', [[30, 50, '#4cc9f0'], [55, 50, '#4cc9f0'], [30, 75, '#4cc9f0'], [55, 75, '#4cc9f0']]],
        ['Compound', [[130, 50, '#f72585'], [146, 50, '#4cc9f0'], [175, 72, '#f72585'], [191, 72, '#4cc9f0']]],
        ['Mixture', [[235, 50, '#4cc9f0'], [270, 55, '#f72585'], [245, 82, '#ffd166'], [282, 85, '#4cc9f0']]]].map(([n, pts], k) => (
        <g key={n as string}>
          <text x={45 + k * 110} y={20} textAnchor="middle" className="svg-text" fontSize={13} fontWeight={700}>{n as string}</text>
          {(pts as [number, number, string][]).map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r={9} fill={c} />)}
          <text x={45 + k * 110} y={110} textAnchor="middle" className="svg-muted" fontSize={10}>{['one type of atom', 'atoms joined', 'not joined'][k]}</text>
        </g>
      ))}
    </Box>
  ),
  microscope: () => (
    <Box label="Light microscope with eyepiece, objective lens, stage, light and focus knobs" vb="0 0 320 200">
      <rect x={140} y={20} width={22} height={40} rx={4} fill="#adb5bd" /><text x={170} y={36} className="svg-text" fontSize={11}>eyepiece lens</text>
      <rect x={130} y={60} width={40} height={30} rx={4} fill="#6c757d" />
      <rect x={146} y={90} width={10} height={22} fill="#495057" /><text x={170} y={106} className="svg-text" fontSize={11}>objective lens</text>
      <rect x={100} y={118} width={110} height={8} fill="#343a40" /><text x={215} y={126} className="svg-text" fontSize={11}>stage</text>
      <circle cx={151} cy={150} r={9} fill="#ffd166" /><text x={165} y={154} className="svg-text" fontSize={11}>light</text>
      <rect x={95} y={40} width={16} height={130} rx={6} fill="#6c757d" />
      <circle cx={103} cy={95} r={10} fill="#868e96" /><text x={15} y={98} className="svg-text" fontSize={11}>focus knobs</text>
      <rect x={80} y={170} width={150} height={14} rx={4} fill="#495057" />
    </Box>
  ),
  'force-arrows': () => (
    <Box label="A box with a 20 newton force to the right and a 5 newton force to the left" vb="0 0 320 100">
      <rect x={130} y={30} width={60} height={50} rx={6} fill="var(--accent-2)" />
      <path d="M190 55 L290 55" stroke="var(--good)" strokeWidth={5} markerEnd="url(#fa)" /><text x={240} y={45} textAnchor="middle" className="svg-text" fontSize={13} fontWeight={700}>20 N</text>
      <path d="M130 55 L105 55" stroke="var(--bad)" strokeWidth={5} markerEnd="url(#fa2)" /><text x={100} y={45} textAnchor="middle" className="svg-text" fontSize={13} fontWeight={700}>5 N</text>
      <text x={160} y={96} textAnchor="middle" className="svg-muted" fontSize={11}>Resultant = 20 − 5 = 15 N to the right</text>
      <defs>
        <marker id="fa" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--good)" /></marker>
        <marker id="fa2" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--bad)" /></marker>
      </defs>
    </Box>
  ),
};
