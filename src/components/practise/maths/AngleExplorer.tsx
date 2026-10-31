// Drag points to change angles and watch the total stay the same.
import { useRef, useState } from 'react';

type Mode = 'line' | 'point' | 'triangle' | 'quad';
type Pt = [number, number];
const W = 340, H = 240;

function useSvgDrag(onMove: (p: Pt) => void) {
  const ref = useRef<SVGSVGElement>(null);
  const toSvg = (e: React.PointerEvent): Pt => {
    const svg = ref.current!;
    const r = svg.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  return { ref, toSvg, onMove };
}

const angleOf = (c: Pt, p: Pt) => ((Math.atan2(-(p[1] - c[1]), p[0] - c[0]) * 180) / Math.PI + 360) % 360;
function interior(v: Pt, a: Pt, b: Pt) {
  const a1 = Math.atan2(a[1] - v[1], a[0] - v[0]), a2 = Math.atan2(b[1] - v[1], b[0] - v[0]);
  let d = Math.abs(a2 - a1) * 180 / Math.PI;
  if (d > 180) d = 360 - d;
  return d;
}
/** Round so whole-number angles still add up to the rounded total (largest remainder method). */
function roundSum(angles: number[]): number[] {
  const out = angles.map(Math.floor);
  let spare = Math.round(angles.reduce((a, b) => a + b, 0)) - out.reduce((a, b) => a + b, 0);
  angles.map((a, i) => [a - Math.floor(a), i]).sort((x, y) => y[0] - x[0]).forEach(([, i]) => { if (spare > 0) { out[i]++; spare--; } });
  return out;
}

export function AngleExplorer() {
  const [mode, setMode] = useState<Mode>('triangle');
  const [line, setLine] = useState<number[]>([50, 120]); // ray directions in degrees
  const [point, setPoint] = useState<number[]>([0, 100, 230]);
  const [tri, setTri] = useState<Pt[]>([[60, 200], [290, 200], [150, 50]]);
  const [quad, setQuad] = useState<Pt[]>([[60, 190], [270, 205], [290, 60], [100, 40]]);
  const [drag, setDrag] = useState<number | null>(null);
  const { ref, toSvg } = useSvgDrag(() => {});
  const C: Pt = [W / 2, mode === 'line' ? 190 : H / 2];

  const move = (e: React.PointerEvent) => {
    if (drag === null) return;
    const p = toSvg(e);
    const clamp = (q: Pt): Pt => [Math.max(15, Math.min(W - 15, q[0])), Math.max(15, Math.min(H - 15, q[1]))];
    if (mode === 'line') {
      const a = Math.max(5, Math.min(175, angleOf(C, p) > 180 ? (angleOf(C, p) > 270 ? 5 : 175) : angleOf(C, p)));
      setLine((l) => { const n = [...l]; n[drag] = a; n.sort((x, y) => x - y); return n; });
    } else if (mode === 'point') {
      setPoint((l) => { const n = [...l]; n[drag] = angleOf(C, p); return n; });
    } else if (mode === 'triangle') {
      setTri((t) => t.map((q, i) => (i === drag ? clamp(p) : q)));
    } else {
      setQuad((t) => t.map((q, i) => (i === drag ? clamp(p) : q)));
    }
  };

  let angles: number[] = [];
  let total = 0;
  let svgBody: React.ReactNode = null;
  const handle = (p: Pt, i: number) => (
    <circle key={`h${i}`} cx={p[0]} cy={p[1]} r={16} fill="var(--accent)" stroke="var(--text)" strokeWidth={2} style={{ cursor: 'grab', touchAction: 'none' }}
      onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); setDrag(i); }} aria-label={`Drag handle ${i + 1}`} />
  );
  const label = (p: Pt, text: string, k: string) => (
    <text key={k} x={p[0]} y={p[1]} textAnchor="middle" dominantBaseline="central" fontWeight={700} fontSize={15} fill="var(--text)"
      style={{ paintOrder: 'stroke', stroke: 'var(--surface-solid)', strokeWidth: 4 }}>{text}</text>
  );
  const at = (deg: number, r: number): Pt => [C[0] + r * Math.cos((deg * Math.PI) / 180), C[1] - r * Math.sin((deg * Math.PI) / 180)];

  if (mode === 'line') {
    const dirs = [0, ...line, 180];
    angles = dirs.slice(1).map((d, i) => d - dirs[i]);
    const R = roundSum(angles);
    svgBody = (
      <>
        <line x1={10} y1={C[1]} x2={W - 10} y2={C[1]} stroke="var(--text)" strokeWidth={3} />
        {line.map((d, i) => { const e = at(d, 130); return <line key={i} x1={C[0]} y1={C[1]} x2={e[0]} y2={e[1]} stroke="var(--text)" strokeWidth={3} />; })}
        {angles.map((a, i) => label(at(dirs[i] + a / 2, 52), `${R[i]}°`, `l${i}`))}
        {line.map((d, i) => handle(at(d, 130), i))}
      </>
    );
  } else if (mode === 'point') {
    const dirs = [...point].sort((a, b) => a - b);
    angles = dirs.map((d, i) => ((i === dirs.length - 1 ? dirs[0] + 360 : dirs[i + 1]) - d));
    const R = roundSum(angles);
    svgBody = (
      <>
        {dirs.map((d, i) => { const e = at(d, 100); return <line key={i} x1={C[0]} y1={C[1]} x2={e[0]} y2={e[1]} stroke="var(--text)" strokeWidth={3} />; })}
        {angles.map((a, i) => label(at(dirs[i] + a / 2, 46), `${R[i]}°`, `p${i}`))}
        {point.map((d, i) => handle(at(d, 100), i))}
      </>
    );
  } else {
    const pts = mode === 'triangle' ? tri : quad;
    const n = pts.length;
    angles = pts.map((v, i) => interior(v, pts[(i + n - 1) % n], pts[(i + 1) % n]));
    const R = roundSum(angles);
    // Concave shapes would break the rule, so flag them.
    svgBody = (
      <>
        <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="color-mix(in srgb, var(--accent) 12%, transparent)" stroke="var(--text)" strokeWidth={3} strokeLinejoin="round" />
        {pts.map((v, i) => {
          const cx = pts.reduce((s, p) => s + p[0], 0) / n, cy = pts.reduce((s, p) => s + p[1], 0) / n;
          const dx = cx - v[0], dy = cy - v[1], len = Math.hypot(dx, dy) || 1;
          return label([v[0] + (dx / len) * 34, v[1] + (dy / len) * 34], `${R[i]}°`, `t${i}`);
        })}
        {pts.map((p, i) => handle(p, i))}
      </>
    );
  }
  const target = mode === 'line' || mode === 'triangle' ? 180 : 360;
  const exact = angles.reduce((a, b) => a + b, 0);
  const rounded = roundSum(angles);
  total = rounded.reduce((a, b) => a + b, 0);
  const shownTotal = total;
  const concave = Math.abs(exact - target) > 1;

  return (
    <section className="card stack">
      <h2>Angle Explorer</h2>
      <div className="tabs" role="tablist">
        {([['line', 'Straight line'], ['point', 'Around a point'], ['triangle', 'Triangle'], ['quad', 'Quadrilateral']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} role="tab" className="tab" aria-selected={mode === m} onClick={() => setMode(m)}>{l}</button>
        ))}
      </div>
      <p className="muted small" style={{ margin: 0 }}>Drag the blue dots. Watch the angles change, but the total stays the same.</p>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 560, margin: '0 auto', display: 'block', touchAction: 'none', background: 'var(--surface-solid)', borderRadius: 14 }}
        onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} role="img" aria-label={`${mode} with angles ${rounded.join(', ')} degrees`}>
        {svgBody}
      </svg>
      <div className="card flat center" style={{ background: 'var(--surface-2)' }} aria-live="polite">
        <span className="display" style={{ fontSize: 'calc(1.3rem * var(--display-size))' }}>
          {rounded.map((a) => `${a}°`).join(' + ')} = <span style={{ color: 'var(--good)' }}>{shownTotal}°</span>
        </span>
        {concave && <div className="small" style={{ color: 'var(--warn)' }}>That shape has a dent (it’s concave), so one angle is really reflex. Drag it back out!</div>}
        <div className="small muted">{{ line: 'Angles on a straight line add up to 180°.', point: 'Angles around a point add up to 360°.', triangle: 'Angles in a triangle add up to 180°.', quad: 'Angles in a quadrilateral add up to 360°.' }[mode]}</div>
      </div>
    </section>
  );
}
