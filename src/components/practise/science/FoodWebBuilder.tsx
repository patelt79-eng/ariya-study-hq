// Tap the food, then tap the animal that eats it, to draw an energy arrow.
import { useState } from 'react';
import { useProgress } from '../../../state/progress';
import { play } from '../../../lib/sound';
import { celebrate } from '../../../lib/confetti';

const NODES: Record<string, { emoji: string; x: number; y: number }> = {
  Grass: { emoji: '🌱', x: 70, y: 250 },
  'Oak leaves': { emoji: '🍃', x: 290, y: 250 },
  Rabbit: { emoji: '🐇', x: 40, y: 150 },
  Mouse: { emoji: '🐁', x: 150, y: 150 },
  Caterpillar: { emoji: '🐛', x: 300, y: 150 },
  'Blue tit': { emoji: '🐦', x: 290, y: 55 },
  Fox: { emoji: '🦊', x: 60, y: 45 },
  Owl: { emoji: '🦉', x: 175, y: 45 },
};
const CORRECT = ['Grass>Rabbit', 'Grass>Mouse', 'Oak leaves>Caterpillar', 'Caterpillar>Blue tit', 'Rabbit>Fox', 'Mouse>Fox', 'Mouse>Owl', 'Blue tit>Owl'];
const CLUES = [
  'Rabbits and mice eat grass.', 'Caterpillars eat oak leaves.', 'Blue tits eat caterpillars.',
  'Foxes eat rabbits and mice.', 'Owls eat mice and blue tits.',
];

export function FoodWebBuilder() {
  const { award } = useProgress();
  const [edges, setEdges] = useState<string[]>([]);
  const [from, setFrom] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [msg, setMsg] = useState('');

  const tap = (n: string) => {
    play('click');
    setChecked(false);
    if (!from) { setFrom(n); setMsg(`${n} selected. Now tap what eats it.`); return; }
    if (from === n) { setFrom(null); setMsg(''); return; }
    const e = `${from}>${n}`;
    setEdges((es) => (es.includes(e) ? es.filter((x) => x !== e) : [...es, e]));
    setFrom(null);
    setMsg(CORRECT.includes(`${n}>${from}`) ? 'Check the direction: arrows point from the food TO the eater.' : '');
  };
  const right = edges.filter((e) => CORRECT.includes(e)).length;
  const wrong = edges.length - right;

  return (
    <section className="card stack">
      <h2>Food Web Builder</h2>
      <p className="small muted" style={{ margin: 0 }}>Tap the food first, then the animal that eats it. The arrow shows energy flowing from the food to the eater. Tap the same pair again to remove an arrow.</p>
      <ul className="small" style={{ margin: 0, paddingLeft: 20 }}>{CLUES.map((c) => <li key={c}>{c}</li>)}</ul>
      <svg viewBox="0 0 360 300" style={{ width: '100%', maxWidth: 560, margin: '0 auto', display: 'block', background: 'var(--surface-solid)', borderRadius: 14 }} role="group" aria-label="Food web">
        <defs><marker id="fw" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="var(--accent)" /></marker>
          <marker id="fwg" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="var(--good)" /></marker>
          <marker id="fwb" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="var(--bad)" /></marker></defs>
        {edges.map((e) => {
          const [a, b] = e.split('>');
          const A = NODES[a], B = NODES[b];
          const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
          const ok = CORRECT.includes(e);
          const col = checked ? (ok ? 'var(--good)' : 'var(--bad)') : 'var(--accent)';
          return <line key={e} x1={A.x + (dx / d) * 28} y1={A.y + (dy / d) * 28} x2={B.x - (dx / d) * 30} y2={B.y - (dy / d) * 30} stroke={col} strokeWidth={3}
            markerEnd={`url(#${checked ? (ok ? 'fwg' : 'fwb') : 'fw'})`} />;
        })}
        {Object.entries(NODES).map(([n, v]) => (
          <g key={n} role="button" tabIndex={0} aria-label={n} onClick={() => tap(n)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') tap(n); }} style={{ cursor: 'pointer' }}>
            <circle cx={v.x} cy={v.y} r={26} fill={from === n ? 'var(--accent)' : 'var(--surface-2)'} stroke="var(--border)" strokeWidth={2} />
            <text x={v.x} y={v.y + 8} textAnchor="middle" fontSize={24}>{v.emoji}</text>
            <text x={v.x} y={v.y + 42} textAnchor="middle" className="svg-text" fontSize={11} fontWeight={700}>{n}</text>
          </g>
        ))}
      </svg>
      {msg && <p role="status" style={{ margin: 0 }}>{msg}</p>}
      <div className="row">
        <button className="btn" disabled={!edges.length} onClick={() => {
          setChecked(true);
          if (right === CORRECT.length && wrong === 0) { play('levelup'); celebrate(); award(25, 'Food web'); setMsg('Perfect food web! Now: if the mice all died, the owls and foxes would have less food, so their numbers would probably fall.'); }
          else setMsg(`${right} of ${CORRECT.length} arrows correct${wrong ? `, ${wrong} wrong (red)` : ''}.`);
        }}>Check my web</button>
        <button className="btn secondary" onClick={() => { setEdges([]); setChecked(false); setMsg(''); setFrom(null); }}>Clear</button>
      </div>
    </section>
  );
}
