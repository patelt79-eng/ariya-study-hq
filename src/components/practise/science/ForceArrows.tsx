// Add force arrows to an object, see the resultant, then try challenge questions.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { pick, randInt } from '../../../lib/random';
import { useProgress } from '../../../state/progress';
import { play } from '../../../lib/sound';

interface F { id: number; size: number; dir: 1 | -1; name: string }

function Arrows({ forces, moving }: { forces: F[]; moving?: 1 | -1 | 0 }) {
  const right = forces.filter((f) => f.dir === 1), left = forces.filter((f) => f.dir === -1);
  const scale = (n: number) => Math.min(150, 20 + n * 0.25);
  return (
    <svg viewBox="0 0 400 150" style={{ width: '100%', maxWidth: 560, display: 'block', margin: '0 auto', background: 'var(--surface-solid)', borderRadius: 14 }} role="img"
      aria-label={`Forces: ${forces.map((f) => `${f.size} newtons ${f.dir === 1 ? 'right' : 'left'}`).join(', ') || 'none'}`}>
      <defs>
        <marker id="fr" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--good)" /></marker>
        <marker id="fl" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--bad)" /></marker>
      </defs>
      <line x1={0} y1={128} x2={400} y2={128} stroke="var(--muted)" strokeWidth={2} />
      <rect x={170} y={68} width={60} height={60} rx={8} fill="var(--accent-2)" />
      <text x={200} y={104} textAnchor="middle" fontSize={22}>📦</text>
      {moving ? <text x={200} y={60} textAnchor="middle" className="svg-muted" fontSize={11}>moving {moving === 1 ? '→' : '←'}</text> : null}
      {right.map((f, i) => {
        const y = 85 + i * 16;
        return <g key={f.id}><path d={`M230 ${y} L${230 + scale(f.size)} ${y}`} stroke="var(--good)" strokeWidth={5} markerEnd="url(#fr)" />
          <text x={236 + scale(f.size) / 2} y={y - 5} textAnchor="middle" className="svg-text" fontSize={11} fontWeight={700}>{f.size} N</text></g>;
      })}
      {left.map((f, i) => {
        const y = 85 + i * 16;
        return <g key={f.id}><path d={`M170 ${y} L${170 - scale(f.size)} ${y}`} stroke="var(--bad)" strokeWidth={5} markerEnd="url(#fl)" />
          <text x={164 - scale(f.size) / 2} y={y - 5} textAnchor="middle" className="svg-text" fontSize={11} fontWeight={700}>{f.size} N</text></g>;
      })}
    </svg>
  );
}

const resultantOf = (fs: F[]) => fs.reduce((s, f) => s + f.size * f.dir, 0);

export function ForceArrows() {
  const [tab, setTab] = useState<'play' | 'challenge'>('challenge');
  return (
    <section className="card stack">
      <h2>Force Arrows</h2>
      <div className="tabs" role="tablist">
        <button role="tab" className="tab" aria-selected={tab === 'challenge'} onClick={() => setTab('challenge')}>Challenge</button>
        <button role="tab" className="tab" aria-selected={tab === 'play'} onClick={() => setTab('play')}>Free play</button>
      </div>
      {tab === 'play' ? <FreePlay /> : <Challenge />}
    </section>
  );
}

function FreePlay() {
  const [forces, setForces] = useState<F[]>([{ id: 1, size: 40, dir: 1, name: 'push' }, { id: 2, size: 20, dir: -1, name: 'friction' }]);
  const [size, setSize] = useState(30);
  const r = resultantOf(forces);
  return (
    <>
      <motion.div animate={{ x: r === 0 ? 0 : Math.sign(r) * Math.min(30, Math.abs(r) / 3) }} transition={{ type: 'spring', stiffness: 60 }}>
        <Arrows forces={forces} />
      </motion.div>
      <div className="row">
        <label htmlFor="fsize">Size</label>
        <input id="fsize" type="range" min={5} max={300} step={5} value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ flex: 1, minHeight: 44 }} />
        <strong>{size} N</strong>
      </div>
      <div className="row">
        <button className="btn bad" onClick={() => setForces((f) => [...f, { id: Date.now(), size, dir: -1 as const, name: '' }].slice(-6))}>← Add force left</button>
        <button className="btn good" onClick={() => setForces((f) => [...f, { id: Date.now(), size, dir: 1 as const, name: '' }].slice(-6))}>Add force right →</button>
        <button className="btn secondary" onClick={() => setForces([])}>Clear</button>
      </div>
      <div className="card flat" aria-live="polite" style={{ background: 'var(--surface-2)' }}>
        Resultant: <strong>{Math.abs(r)} N {r > 0 ? 'to the right' : r < 0 ? 'to the left' : '(balanced)'}</strong>.{' '}
        {r === 0 ? 'Balanced forces: no change in motion. If it’s still, it stays still; if moving, it keeps the same speed.' : 'Unbalanced: the object accelerates in the direction of the resultant.'}
      </div>
    </>
  );
}

function makeChallenge() {
  const scene = pick([
    { thing: 'A car', fwd: 'driving force', back: 'air resistance and friction' },
    { thing: 'A cyclist', fwd: 'pedalling force', back: 'air resistance' },
    { thing: 'A boat', fwd: 'engine thrust', back: 'water resistance' },
    { thing: 'A skydiver (sideways view)', fwd: 'wind push', back: 'drag' },
  ]);
  const f = randInt(2, 12) * 50;
  const b = pick([f, randInt(1, 12) * 50]);
  return { scene, forces: [{ id: 1, size: f, dir: 1 as const, name: scene.fwd }, { id: 2, size: b, dir: -1 as const, name: scene.back }] };
}

function Challenge() {
  const { award } = useProgress();
  const [c, setC] = useState(makeChallenge);
  const [val, setVal] = useState('');
  const [dir, setDir] = useState<'' | 'right' | 'left' | 'none'>('');
  const [effect, setEffect] = useState('');
  const [done, setDone] = useState(false);
  const r = resultantOf(c.forces);
  const rightDir = r > 0 ? 'right' : r < 0 ? 'left' : 'none';
  const rightEffect = r > 0 ? 'speeds up' : r < 0 ? 'slows down' : 'same speed';
  const ok = [Number(val) === Math.abs(r), dir === rightDir, effect === rightEffect];

  return (
    <>
      <p><strong>{c.scene.thing}</strong> is moving to the right. Forward: {c.forces[0].name} {c.forces[0].size} N. Backward: {c.forces[1].name} {c.forces[1].size} N.</p>
      <Arrows forces={c.forces} moving={1} />
      <div className="row">
        <label htmlFor="res">Resultant force (N)</label>
        <input id="res" inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d]/g, ''))} style={{ width: 120 }} disabled={done} />
      </div>
      <div className="row" role="group" aria-label="Direction of resultant">
        <span>Direction:</span>
        {(['left', 'none', 'right'] as const).map((d) => <button key={d} className={`chip ${dir === d ? 'selected' : ''}`} disabled={done} onClick={() => setDir(d)}>{d === 'none' ? 'no resultant' : d}</button>)}
      </div>
      <div className="row" role="group" aria-label="What happens">
        <span>It…</span>
        {['speeds up', 'slows down', 'same speed'].map((e) => <button key={e} className={`chip ${effect === e ? 'selected' : ''}`} disabled={done} onClick={() => setEffect(e)}>{e === 'same speed' ? 'keeps the same speed' : e}</button>)}
      </div>
      {!done ? (
        <button className="btn" disabled={!val || !dir || !effect} onClick={() => {
          setDone(true);
          const n = ok.filter(Boolean).length;
          if (n === 3) { play('correct'); award(15, 'Forces'); } else play('wrong');
        }}>Check</button>
      ) : (
        <div className={`feedback ${ok.every(Boolean) ? 'good' : 'bad'}`} role="status">
          <strong>{ok.every(Boolean) ? 'All correct!' : 'Not quite. Here’s why…'}</strong>
          <div>Opposite directions, so subtract: {c.forces[0].size} − {c.forces[1].size} = {r} N. {r === 0 ? 'The forces are balanced, so it keeps moving at the same speed.' : r > 0 ? 'Resultant is forwards, so it speeds up.' : 'Resultant is backwards, so it slows down.'}</div>
          <button className="btn" style={{ marginTop: 10 }} onClick={() => { setC(makeChallenge()); setVal(''); setDir(''); setEffect(''); setDone(false); }}>Next →</button>
        </div>
      )}
    </>
  );
}
