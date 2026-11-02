// A tiny drawing kit for learn-card pictures. Every picture is a light "picture book" panel
// with dark outlines, so it reads the same in all three themes.
import type { ReactNode } from 'react';

export const INK = '#22223b';
export const W = 320, H = 180;

/** A picture: `alt` is shown to screen readers and read aloud in Listen mode. */
export interface Picture { alt: string; bg?: string; draw: () => ReactNode }

export function Pic({ alt, bg = '#eef6ff', children }: { alt: string; bg?: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={alt}
      style={{ width: '100%', maxWidth: 460, display: 'block', margin: '8px auto', borderRadius: 14, background: bg, border: '2px solid var(--border)' }}>
      {children}
    </svg>
  );
}

/** Text label. */
export function T({ x, y, s = 12, a = 'middle', w = 700, c = INK, children }: { x: number; y: number; s?: number; a?: 'start' | 'middle' | 'end'; w?: number; c?: string; children: ReactNode }) {
  return <text x={x} y={y} fontSize={s} textAnchor={a} fontWeight={w} fill={c} fontFamily="system-ui, -apple-system, sans-serif">{children}</text>;
}

/** An emoji used as a picture element (people, animals, objects). */
export function E({ x, y, s = 28, children }: { x: number; y: number; s?: number; children: ReactNode }) {
  return <text x={x} y={y} fontSize={s} textAnchor="middle" dominantBaseline="central">{children}</text>;
}

/** Arrow from (x1,y1) to (x2,y2). */
export function Ar({ x1, y1, x2, y2, c = INK, w = 2.5, dash }: { x1: number; y1: number; x2: number; y2: number; c?: string; w?: number; dash?: boolean }) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
  const p = (d: number) => `${x2 - h * Math.cos(a + d)},${y2 - h * Math.sin(a + d)}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - 4 * Math.cos(a)} y2={y2 - 4 * Math.sin(a)} stroke={c} strokeWidth={w} strokeDasharray={dash ? '5 4' : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${p(0.45)} ${p(-0.45)}`} fill={c} />
    </g>
  );
}

/** Rectangle with optional centred label. */
export function R({ x, y, w, h, f = '#fff', r = 6, s = INK, sw = 1.5, label, ls = 12, lc = INK }: {
  x: number; y: number; w: number; h: number; f?: string; r?: number; s?: string; sw?: number; label?: ReactNode; ls?: number; lc?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={f} stroke={s} strokeWidth={sw} />
      {label !== undefined && <T x={x + w / 2} y={y + h / 2 + ls * 0.36} s={ls} c={lc}>{label}</T>}
    </g>
  );
}

/** A small tile: emoji icon, title and optional subtitle. */
export function Tile({ x, y, w, h, f = '#fff', icon, title, sub, ts = 11, ss }: { x: number; y: number; w: number; h: number; f?: string; icon?: string; title: string; sub?: string; ts?: number; ss?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={f} stroke={INK} strokeWidth={1.5} />
      {icon && <E x={x + w / 2} y={y + h * (sub ? 0.3 : 0.36)} s={Math.min(26, h * 0.34)}>{icon}</E>}
      <T x={x + w / 2} y={y + h * (icon ? (sub ? 0.66 : 0.78) : 0.45)} s={ts}>{title}</T>
      {sub && <T x={x + w / 2} y={y + h * (icon ? 0.86 : 0.7)} s={ss ?? ts - 2} w={500}>{sub}</T>}
    </g>
  );
}

/** A label on a white backing, for text drawn over busy scenery. */
export function Lbl({ x, y, s = 11, a = 'middle', children }: { x: number; y: number; s?: number; a?: 'start' | 'middle' | 'end'; children: string }) {
  const w = children.length * s * 0.58 + 8;
  const left = a === 'start' ? x - 4 : a === 'end' ? x - w + 4 : x - w / 2;
  return <g><rect x={left} y={y - s} width={w} height={s + 6} rx={4} fill="#ffffff" opacity={0.88} /><T x={x} y={y} s={s} a={a}>{children}</T></g>;
}

/** Row of equal boxes (bar model). */
export function Bar({ x, y, n, size = 26, h = 26, f, labels }: { x: number; y: number; n: number; size?: number; h?: number; f: string | ((i: number) => string); labels?: (i: number) => ReactNode }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <R key={i} x={x + i * (size + 3)} y={y} w={size} h={h} r={4} f={typeof f === 'string' ? f : f(i)} label={labels?.(i)} ls={11} />
      ))}
    </g>
  );
}

/** Rough cloud. */
export function Cloud({ x, y, s = 1, f = '#fff' }: { x: number; y: number; s?: number; f?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={f} stroke={INK} strokeWidth={1.2}>
      <ellipse cx={0} cy={0} rx={26} ry={12} />
      <ellipse cx={-14} cy={-6} rx={12} ry={10} />
      <ellipse cx={10} cy={-9} rx={14} ry={12} />
    </g>
  );
}
