import type { ReactNode } from 'react';
import { useProgress } from '../../state/progress';
import { go } from '../../lib/router';
import { levelFor } from '../../state/model';
import { THEMES } from '../../themes/themes';
import { play } from '../../lib/sound';

export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden>
      <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
    </div>
  );
}

export function TopBar({ title, back }: { title: string; back?: string }) {
  const { p, update } = useProgress();
  const lvl = levelFor(p.xp);
  const t = THEMES[p.theme];
  return (
    <header className="topbar">
      {back !== undefined ? (
        <button className="icon-btn" onClick={() => go(back)} aria-label="Back">←</button>
      ) : (
        <span aria-hidden style={{ fontSize: 26 }}>{t.icon}</span>
      )}
      <span className="title">{title}</span>
      <span className="spacer" />
      <span className="pill hide-phone" title="Level">Lv {lvl.level}</span>
      <span className="pill" title={`${t.xpName}`}>{t.xpIcon} {p.xp}</span>
      <span className="pill" title="Daily streak">🔥 {p.streak.count}</span>
      <button className="icon-btn" aria-label={p.muted ? 'Turn sound on' : 'Mute sound'} aria-pressed={p.muted}
        onClick={() => { update((x) => ({ ...x, muted: !x.muted })); play('click'); }}>
        {p.muted ? '🔇' : '🔊'}
      </button>
      <button className="icon-btn" aria-label="Settings" onClick={() => go('settings')}>⚙️</button>
    </header>
  );
}

export function Page({ children, calm = false }: { children: ReactNode; calm?: boolean }) {
  return <main className="page" data-calm-page={calm || undefined}>{children}</main>;
}

export function MasteryRing({ value, size = 64, colour, label, fluid = false, showText = true }: { value: number; size?: number; colour: string; label?: string; fluid?: boolean; showText?: boolean }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <svg width={fluid ? '100%' : size} height={fluid ? '100%' : size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${value}% mastered`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      {showText && <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="svg-text" fontSize={size * 0.26} fontWeight={700}>{value}%</text>}
    </svg>
  );
}
