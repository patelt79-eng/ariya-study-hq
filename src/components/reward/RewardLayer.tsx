import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onReward, useProgress } from '../../state/progress';
import { BADGES, rankFor } from '../../state/model';
import { THEMES } from '../../themes/themes';
import { celebrate } from '../../lib/confetti';
import { SUBJECTS } from '../../content';
import type { SubjectId } from '../../content/types';

interface Fly { id: number; amount: number; label?: string }

export function RewardLayer() {
  const { p } = useProgress();
  const theme = THEMES[p.theme];
  const [flies, setFlies] = useState<Fly[]>([]);
  const [level, setLevel] = useState<number | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [mastery, setMastery] = useState<SubjectId | null>(null);

  useEffect(() => onReward((e) => {
    if (e.type === 'xp') {
      const id = Date.now() + Math.random();
      setFlies((f) => [...f.slice(-3), { id, amount: e.amount, label: e.label }]);
      window.setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), 1100);
    } else if (e.type === 'level') {
      setLevel(e.level);
      celebrate(true);
    } else if (e.type === 'badge') {
      setBadges((b) => [...b, e.id]);
      celebrate();
      window.setTimeout(() => setBadges((b) => b.filter((x) => x !== e.id)), 3500);
    } else if (e.type === 'mastery') {
      setMastery(e.subject);
      celebrate(true);
    }
  }), []);

  return (
    <>
      <AnimatePresence>
        {flies.map((f) => (
          <motion.div key={f.id} className="xp-fly" aria-hidden
            initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: -30, scale: 1 }} exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.6 }}>
            +{f.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {badges.slice(0, 1).map((id) => {
          const b = BADGES.find((x) => x.id === id);
          if (!b) return null;
          return (
            <motion.div key={id} className="toast" role="status"
              initial={{ y: -40, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} exit={{ y: -40, opacity: 0, x: '-50%' }}>
              <motion.span style={{ fontSize: 36 }} initial={{ rotate: -30, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.15 }}>{b.icon}</motion.span>
              <div><strong>Badge unlocked: {b.name}</strong><div className="small muted">{b.desc}</div></div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {level !== null && (
          <motion.div className="overlay" role="dialog" aria-modal="true" aria-label="Level up" onClick={() => setLevel(null)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="card center stack" initial={{ scale: 0.4, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
              <motion.h1 animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: 2, duration: 0.6 }} style={{ color: 'var(--warn)' }}>{theme.levelUp}</motion.h1>
              <div style={{ fontSize: 64 }} aria-hidden>{theme.icon}</div>
              <h2>Level {level}: {rankFor(level)}</h2>
              <p className="muted">Every card and question made you stronger. Keep going!</p>
              <button className="btn" onClick={() => setLevel(null)}>Awesome!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {mastery && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Subject mastered" onClick={() => setMastery(null)}>
          <motion.div className="card center stack" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
            <div style={{ fontSize: 64 }}>🏆</div>
            <h2>{SUBJECTS[mastery].name}: 80% mastery!</h2>
            <p>That’s serious knowledge. Keep reviewing to stay sharp.</p>
            <button className="btn" onClick={() => setMastery(null)}>Yes!</button>
          </motion.div>
        </div>
      )}
    </>
  );
}
