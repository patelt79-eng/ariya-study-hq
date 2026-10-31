import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { randInt } from '../../../lib/random';
import { useProgress } from '../../../state/progress';
import { play } from '../../../lib/sound';
import { celebrate } from '../../../lib/confetti';

const GAME_SECONDS = 60;

export function TablesBlitz() {
  const { p, bump, unlock, award, update } = useProgress();
  const [state, setState] = useState<'ready' | 'playing' | 'over'>('ready');
  const [left, setLeft] = useState(GAME_SECONDS);
  const [q, setQ] = useState<[number, number]>([7, 8]);
  const [val, setVal] = useState('');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const best = p.counters.blitzBest ?? 0;

  const newQ = () => setQ([randInt(2, 12), randInt(2, 12)]);

  useEffect(() => {
    if (state !== 'playing') return;
    if (left <= 0) {
      setState('over');
      if (score > best) update((x) => ({ ...x, counters: { ...x.counters, blitzBest: score } }));
      if (score >= 30) unlock('blitz-30');
      if (score > 0) award(Math.min(60, score * 2), 'Blitz');
      if (score > best) celebrate(true);
      return;
    }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, state]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { setScore(0); setCombo(0); setLeft(GAME_SECONDS); newQ(); setVal(''); setState('playing'); window.setTimeout(() => input.current?.focus(), 50); };

  const submit = () => {
    if (!val) return;
    if (Number(val) === q[0] * q[1]) {
      setScore((s) => s + 1 + (combo >= 4 ? 1 : 0));
      setCombo((c) => c + 1);
      setFlash('good');
      play('coin');
      bump('blitzCorrect');
    } else {
      setCombo(0);
      setFlash('bad');
      play('wrong');
    }
    window.setTimeout(() => setFlash(null), 250);
    setVal('');
    newQ();
  };

  return (
    <section className="card stack center" style={{ alignItems: 'center', background: 'linear-gradient(180deg, var(--surface), var(--surface-2))' }}>
      <h2>⚡ Times-tables Blitz</h2>
      {state === 'ready' && (
        <>
          <p>Answer as many as you can in 60 seconds. Get 5 in a row for double points!</p>
          <p className="muted">Personal best: <strong>{best}</strong></p>
          <button className="btn" onClick={start}>Start!</button>
        </>
      )}
      {state === 'playing' && (
        <>
          <div className="row" style={{ justifyContent: 'center', gap: 24 }}>
            <span className="display" style={{ color: left <= 10 ? 'var(--bad)' : 'var(--accent)' }}>⏱ {left}</span>
            <span className="display">★ {score}</span>
            {combo >= 4 && <motion.span className="pill" initial={{ scale: 0 }} animate={{ scale: 1 }}>🔥 x2</motion.span>}
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div key={`${q[0]}x${q[1]}${score}${combo}`} className="display" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
              style={{ fontSize: 'calc(3rem * var(--display-size))', color: flash === 'good' ? 'var(--good)' : flash === 'bad' ? 'var(--bad)' : 'var(--text)' }}>
              {q[0]} × {q[1]}
            </motion.div>
          </AnimatePresence>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="row" style={{ justifyContent: 'center' }}>
            <input ref={input} inputMode="numeric" pattern="[0-9]*" value={val} onChange={(e) => setVal(e.target.value.replace(/\D/g, ''))}
              aria-label="Answer" style={{ width: 140, fontSize: '1.6rem', textAlign: 'center' }} autoComplete="off" />
            <button className="btn">Go</button>
          </form>
        </>
      )}
      {state === 'over' && (
        <motion.div className="stack" initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ alignItems: 'center' }}>
          <div className="display" style={{ fontSize: 'calc(2.4rem * var(--display-size))' }}>{score}</div>
          <p>{score > best ? 'NEW HIGH SCORE! 🏆' : score >= 20 ? 'Lightning fast!' : 'Good warm-up! Practise makes faster.'}</p>
          <p className="small muted">+{Math.min(60, score * 2)} XP · Best: {Math.max(best, score)}</p>
          <button className="btn" onClick={start}>Play again</button>
        </motion.div>
      )}
    </section>
  );
}
