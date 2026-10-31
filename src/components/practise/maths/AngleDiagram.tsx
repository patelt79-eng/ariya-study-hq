// Angle diagrams drawn to scale with SVG.
export type AngleSpec =
  | { type: 'line'; angles: number[]; unknown: number }
  | { type: 'point'; angles: number[]; unknown: number }
  | { type: 'triangle'; angles: number[]; unknown: number; hide?: number[]; isosceles?: boolean }
  | { type: 'quad'; angles: number[]; unknown: number };

type Pt = [number, number];
const W = 320, H = 220;
const rad = (d: number) => (d * Math.PI) / 180;

/** Point at math-angle `deg` (anticlockwise from east) and distance r from c, in SVG coords. */
function polar(c: Pt, deg: number, r: number): Pt {
  return [c[0] + r * Math.cos(rad(deg)), c[1] - r * Math.sin(rad(deg))];
}

function arcPath(c: Pt, from: number, sweep: number, r: number): string {
  const a = polar(c, from, r), b = polar(c, from + sweep, r);
  return `M ${a[0]} ${a[1]} A ${r} ${r} 0 0 0 ${b[0]} ${b[1]}`;
}

function AngleMark({ c, from, sweep, label, unknown }: { c: Pt; from: number; sweep: number; label: string; unknown: boolean }) {
  const r = sweep < 40 ? 34 : 26;
  const lp = polar(c, from + sweep / 2, r + (sweep < 40 ? 20 : 18));
  const colour = unknown ? 'var(--warn)' : 'var(--accent)';
  const right = Math.abs(sweep - 90) < 0.5;
  return (
    <g>
      {right ? (
        <path d={`M ${polar(c, from, 14).join(' ')} L ${polar(polar(c, from, 14), from + 90, 14).join(' ')} L ${polar(c, from + 90, 14).join(' ')}`}
          stroke={colour} strokeWidth={2} fill="none" />
      ) : (
        <path d={arcPath(c, from, sweep, r)} stroke={colour} strokeWidth={2.5} fill="none" />
      )}
      <text x={lp[0]} y={lp[1]} textAnchor="middle" dominantBaseline="central" fontSize={unknown ? 18 : 15} fontWeight={700}
        fill={unknown ? 'var(--warn)' : 'var(--text)'} style={{ paintOrder: 'stroke', stroke: 'var(--surface-solid)', strokeWidth: 4 }}>{label}</text>
    </g>
  );
}

/** Scale and centre a polygon so it fits the drawing area. */
function fit(points: Pt[], pad = 38): Pt[] {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min((W - pad * 2) / (maxX - minX || 1), (H - pad * 2) / (maxY - minY || 1));
  const ox = (W - (maxX - minX) * s) / 2, oy = (H - (maxY - minY) * s) / 2;
  return points.map(([x, y]) => [ox + (x - minX) * s, oy + (y - minY) * s]);
}

/** Interior angle mark at vertex v between neighbours a and b (smaller side). */
function vertexAngle(v: Pt, a: Pt, b: Pt): { from: number; sweep: number } {
  const ang = (p: Pt) => (Math.atan2(-(p[1] - v[1]), p[0] - v[0]) * 180) / Math.PI;
  const a1 = ang(a), a2 = ang(b);
  let d = a2 - a1;
  while (d <= -180) d += 360;
  while (d > 180) d -= 360;
  return d > 0 ? { from: a1, sweep: d } : { from: a2, sweep: -d };
}

function tick(p: Pt, q: Pt) {
  const m: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * 7, ny = (dx / len) * 7;
  return <line x1={m[0] - nx} y1={m[1] - ny} x2={m[0] + nx} y2={m[1] + ny} stroke="var(--text)" strokeWidth={2.5} />;
}

export function AngleDiagram({ spec, label }: { spec: AngleSpec; label?: string }) {
  const lbl = (i: number) => (i === spec.unknown ? 'x' : `${spec.angles[i]}°`);
  let body: React.ReactNode;

  if (spec.type === 'line' || spec.type === 'point') {
    const c: Pt = [W / 2, spec.type === 'line' ? H * 0.7 : H / 2];
    const L = spec.type === 'line' ? 140 : 95;
    const dirs: number[] = [0];
    spec.angles.forEach((a) => dirs.push(dirs[dirs.length - 1] + a));
    body = (
      <>
        {spec.type === 'line' && <line x1={c[0] - 150} y1={c[1]} x2={c[0] + 150} y2={c[1]} stroke="var(--text)" strokeWidth={3} />}
        {dirs.slice(0, spec.type === 'line' ? -1 : -1).map((d, i) => {
          if (spec.type === 'line' && i === 0) return null;
          const e = polar(c, d, spec.type === 'line' ? L * 0.85 : L);
          return <line key={i} x1={c[0]} y1={c[1]} x2={e[0]} y2={e[1]} stroke="var(--text)" strokeWidth={3} />;
        })}
        {spec.type === 'point' && <line x1={c[0]} y1={c[1]} x2={c[0] + L} y2={c[1]} stroke="var(--text)" strokeWidth={3} />}
        <circle cx={c[0]} cy={c[1]} r={4} fill="var(--text)" />
        {spec.angles.map((a, i) => <AngleMark key={i} c={c} from={dirs[i]} sweep={a} label={lbl(i)} unknown={i === spec.unknown} />)}
      </>
    );
  } else if (spec.type === 'triangle') {
    const [A, B] = spec.angles;
    const base = 200;
    const ac = (base * Math.sin(rad(B))) / Math.sin(rad(A + B));
    const raw: Pt[] = [[0, 0], [base, 0], [ac * Math.cos(rad(A)), -ac * Math.sin(rad(A))]];
    const pts = fit(raw);
    body = (
      <>
        <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="color-mix(in srgb, var(--accent) 10%, transparent)" stroke="var(--text)" strokeWidth={3} strokeLinejoin="round" />
        {spec.isosceles && (<>{tick(pts[0], pts[2])}{tick(pts[1], pts[2])}</>)}
        {pts.map((v, i) => {
          if (spec.hide?.includes(i) && i !== spec.unknown) return null;
          const { from, sweep } = vertexAngle(v, pts[(i + 1) % 3], pts[(i + 2) % 3]);
          return <AngleMark key={i} c={v} from={from} sweep={sweep} label={lbl(i)} unknown={i === spec.unknown} />;
        })}
      </>
    );
  } else {
    const pts = fit(quadPoints(spec.angles));
    body = (
      <>
        <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="color-mix(in srgb, var(--accent-2) 10%, transparent)" stroke="var(--text)" strokeWidth={3} strokeLinejoin="round" />
        {pts.map((v, i) => {
          const { from, sweep } = vertexAngle(v, pts[(i + 3) % 4], pts[(i + 1) % 4]);
          return <AngleMark key={i} c={v} from={from} sweep={sweep} label={lbl(i)} unknown={i === spec.unknown} />;
        })}
      </>
    );
  }

  return (
    <figure style={{ margin: '0 0 12px' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 480, display: 'block', margin: '0 auto', background: 'var(--surface-solid)', borderRadius: 14, border: '1px solid var(--border)' }}
        role="img" aria-label={label ?? describe(spec)}>
        {body}
      </svg>
      <figcaption className="small muted center">Drawn to scale. {spec.type !== 'line' && spec.type !== 'point' ? '' : ''}</figcaption>
    </figure>
  );
}

function describe(s: AngleSpec): string {
  const parts = s.angles.map((a, i) => (i === s.unknown ? 'x' : `${a} degrees`)).filter((_, i) => !(s.type === 'triangle' && s.hide?.includes(i) && i !== s.unknown));
  const name = { line: 'Angles on a straight line', point: 'Angles around a point', triangle: 'Triangle with angles', quad: 'Quadrilateral with angles' }[s.type];
  return `${name}: ${parts.join(', ')}${s.type === 'triangle' && s.isosceles ? '. Two sides are marked equal.' : ''}`;
}

/** Build a convex quadrilateral with the given interior angles (in order), anticlockwise. */
export function quadPoints(angles: number[]): Pt[] {
  // Walk the edges, turning left by (180 − interior angle) at each vertex.
  const [, a1, a2, a3] = angles;
  const d = [0, 180 - a1, 360 - a1 - a2, 540 - a1 - a2 - a3];
  const u = d.map((x) => [Math.cos(rad(x)), Math.sin(rad(x))] as Pt);
  // Choose the first two side lengths, then solve s2*u2 + s3*u3 = -(s0*u0 + s1*u1) so the shape closes.
  // Try a few choices and keep the most balanced one (all sides positive, so it's truly to scale).
  const det = u[2][0] * u[3][1] - u[3][0] * u[2][1];
  let lens = [1, 1, 1, 1];
  let best = Infinity;
  for (const s1 of [0.5, 0.65, 0.8, 1, 1.2, 1.4, 1.7, 2]) {
    const s0 = 1;
    const rx = -(s0 * u[0][0] + s1 * u[1][0]), ry = -(s0 * u[0][1] + s1 * u[1][1]);
    const s2 = (rx * u[3][1] - u[3][0] * ry) / det;
    const s3 = (u[2][0] * ry - rx * u[2][1]) / det;
    if (s2 <= 0.25 || s3 <= 0.25) continue;
    const all = [s0, s1, s2, s3];
    const spread = Math.max(...all) / Math.min(...all);
    if (spread < best) { best = spread; lens = all; }
  }
  const pts: Pt[] = [[0, 0]];
  for (let i = 0; i < 3; i++) {
    const [x, y] = pts[i];
    pts.push([x + lens[i] * u[i][0], y + lens[i] * u[i][1]]);
  }
  return pts.map(([x, y]) => [x, -y]);
}
