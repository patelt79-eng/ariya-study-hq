// The six subjects on the home screen: soft pastel cards that gently bob.
import { motion, useReducedMotion } from 'framer-motion';
import { SUBJECTS } from '../../content';
import type { SubjectId } from '../../content/types';
import { useProgress } from '../../state/progress';
import { masteryFor } from '../../state/model';
import { examsFor } from '../../content/timetable';
import { go } from '../../lib/router';
import { MasteryRing } from '../shell/Shell';
import { diffDays, shortDate } from '../../lib/dates';
import { play } from '../../lib/sound';

interface Item { id: SubjectId; mastery: number; done: boolean; date?: string; days?: number }

function useItems(): Item[] {
  const { p, today } = useProgress();
  const exams = examsFor(p.classId);
  const order: SubjectId[] = exams.map((e) => e.subject);
  (['maths', 'science', 'english', 're', 'geography', 'history'] as SubjectId[]).forEach((s) => { if (!order.includes(s)) order.push(s); });
  return order.map((id) => {
    const date = exams.find((e) => e.subject === id)?.date;
    const days = date ? diffDays(today, date) : undefined;
    return { id, mastery: masteryFor(SUBJECTS[id], p).overall, done: days !== undefined && days < 0, date, days };
  });
}

export function SubjectWorld() {
  const { p } = useProgress();
  const items = useItems();
  const still = useReducedMotion() || p.calm;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: 14 }}>
      {items.map((it, i) => {
        const s = SUBJECTS[it.id];
        return (
          <motion.button key={it.id} onClick={() => { play('click'); go(`subject/${it.id}`); }} aria-label={`${s.name}, ${it.mastery}% mastered`}
            animate={still ? undefined : { y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.45, ease: 'easeInOut' }}
            whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}
            style={{
              cursor: 'pointer', textAlign: 'center', color: 'var(--text)', padding: '16px 10px 14px', borderRadius: 24,
              border: `2px solid color-mix(in srgb, ${s.colour} 45%, white)`,
              background: `linear-gradient(170deg, color-mix(in srgb, ${s.colour} 22%, white), white 75%)`,
              boxShadow: 'var(--shadow)', display: 'grid', justifyItems: 'center', gap: 6,
            }}>
            <span style={{ position: 'relative', width: 84, height: 84, display: 'grid', placeItems: 'center' }}>
              <span style={{ position: 'absolute', inset: 0 }}><MasteryRing value={it.mastery} size={84} colour={s.colour} fluid showText={false} /></span>
              <span style={{ fontSize: 34 }} aria-hidden>{it.done ? '🏆' : s.emoji}</span>
            </span>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>{s.name}</strong>
            <span className="small" style={{ fontWeight: 700 }}>{it.mastery}% mastered</span>
            <span className="small muted">{it.done ? 'Complete 🏆' : it.date ? `${shortDate(it.date)} · ${it.days === 0 ? 'today' : `${it.days} days`}` : ''}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
