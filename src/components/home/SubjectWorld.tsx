// The six subjects on the home screen: planets (Space), cabinets (Arcade) or lands (Map).
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

interface Item { id: SubjectId; mastery: number; done: boolean; date?: string }

function useItems(): Item[] {
  const { p, today } = useProgress();
  const exams = examsFor(p.classId);
  const order: SubjectId[] = [...exams.map((e) => e.subject)];
  (['maths', 'science', 'english', 're', 'geography', 'history'] as SubjectId[]).forEach((s) => { if (!order.includes(s)) order.push(s); });
  return order.map((id) => {
    const date = exams.find((e) => e.subject === id)?.date;
    return { id, mastery: masteryFor(SUBJECTS[id], p).overall, done: !!date && diffDays(today, date) < 0, date };
  });
}

function open(id: SubjectId) { play('click'); go(`subject/${id}`); }

export function SubjectWorld() {
  const { p } = useProgress();
  const items = useItems();
  const reduce = useReducedMotion() || p.calm;
  if (p.theme === 'arcade') return <Arcade items={items} still={reduce} />;
  if (p.theme === 'map') return <MapLands items={items} still={reduce} />;
  return <Orbit items={items} still={reduce} />;
}

function Label({ it }: { it: Item }) {
  const s = SUBJECTS[it.id];
  return (
    <span style={{ display: 'block', textAlign: 'center', lineHeight: 1.2 }}>
      <strong style={{ display: 'block' }}>{s.name} <span className="small">{it.mastery}%</span></strong>
      <span className="small muted">{it.done ? 'Complete 🏆' : it.date ? shortDate(it.date) : ''}</span>
    </span>
  );
}

// ---------- Space Quest ----------
function Orbit({ items, still }: { items: Item[]; still: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 640, aspectRatio: '1 / 1', margin: '0 auto' }}>
      <div aria-hidden style={{ position: 'absolute', inset: '12%', borderRadius: '50%', border: '1px dashed var(--border)' }} />
      <motion.div aria-hidden className="center"
        animate={still ? undefined : { scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity }}
        style={{ position: 'absolute', left: '50%', top: '50%', width: '26%', aspectRatio: '1', translateX: '-50%', translateY: '-50%',
          borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff6c2, #ffb347 45%, #ff7b00 80%)',
          boxShadow: '0 0 60px rgba(255,170,60,0.6)', display: 'grid', placeItems: 'center', color: '#3b1d00', fontWeight: 800 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(10px, 2.4vw, 16px)' }}>HQ</span>
      </motion.div>
      <motion.div style={{ position: 'absolute', inset: 0 }}
        animate={still ? undefined : { rotate: 360 }} transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}>
        {items.map((it, i) => {
          const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + 38 * Math.cos(a), y = 50 + 38 * Math.sin(a);
          const s = SUBJECTS[it.id];
          return (
            <motion.div key={it.id} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, translateX: '-50%', translateY: '-50%' }}
              animate={still ? undefined : { rotate: -360 }} transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}>
              <motion.button onClick={() => open(it.id)} aria-label={`${s.name}, ${it.mastery}% mastered`} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.06 }}
                style={{ background: 'none', border: 0, cursor: 'pointer', display: 'grid', justifyItems: 'center', gap: 4, color: 'var(--text)', padding: 0 }}>
                <span style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 'clamp(72px, 15vw, 104px)', aspectRatio: '1' }}>
                  <span style={{ position: 'absolute', inset: 8, borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, #ffffffcc, ${s.colour} 40%, #00000088 100%)`, boxShadow: `0 0 24px ${s.colour}88` }} />
                  <span style={{ position: 'absolute', inset: 0 }}><MasteryRing value={it.mastery} size={104} colour={s.colour} fluid showText={false} /></span>
                  <span style={{ position: 'relative', fontSize: 'clamp(24px, 5vw, 34px)' }} aria-hidden>{it.done ? '🏆' : s.emoji}</span>
                </span>
                <Label it={it} />
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ---------- Neon Arcade ----------
function Arcade({ items, still }: { items: Item[]; still: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
      {items.map((it, i) => {
        const s = SUBJECTS[it.id];
        return (
          <motion.button key={it.id} onClick={() => open(it.id)} aria-label={`${s.name}, ${it.mastery}% mastered`}
            animate={still ? undefined : { y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
            whileTap={{ scale: 0.95 }}
            style={{ cursor: 'pointer', border: `3px solid ${s.colour}`, borderRadius: '18px 18px 6px 6px', padding: 0, overflow: 'hidden',
              background: 'linear-gradient(180deg, #2a0a45, #12021f)', boxShadow: `0 0 18px ${s.colour}99, inset 0 0 20px ${s.colour}33`, color: 'var(--text)' }}>
            <div style={{ background: s.colour, color: '#12021f', fontFamily: 'var(--font-display)', fontSize: 11, padding: '8px 4px' }}>{s.name.toUpperCase()}</div>
            <div style={{ margin: 12, borderRadius: 10, background: '#05010a', border: '2px solid #000', padding: '12px 0', display: 'grid', placeItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 34 }} aria-hidden>{it.done ? '🏆' : s.emoji}</span>
              <MasteryRing value={it.mastery} size={60} colour={s.colour} />
            </div>
            <div style={{ padding: '0 8px 12px' }}>
              <span className="small">{it.done ? 'GAME COMPLETE' : it.date ? shortDate(it.date) : 'PRESS START'}</span>
              <div aria-hidden style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ff3df0' }} />
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#19f0ff' }} />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ---------- Adventure Map ----------
const LAND_POS = [
  { x: 14, y: 22 }, { x: 46, y: 12 }, { x: 80, y: 24 }, { x: 78, y: 70 }, { x: 46, y: 84 }, { x: 16, y: 70 },
];
function MapLands({ items, still }: { items: Item[]; still: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 820, margin: '0 auto', aspectRatio: '4 / 3', borderRadius: 24,
      background: 'radial-gradient(ellipse at 50% 50%, #b9dcd4 0%, #8fc0c0 70%, #6aa3a8 100%)', border: '6px solid #7a4e24',
      boxShadow: 'inset 0 0 40px rgba(60,30,0,0.35), var(--shadow)', overflow: 'hidden' }}>
      <svg viewBox="0 0 100 75" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
        {items.slice(0, -1).map((it, i) => {
          const a = LAND_POS[i], b = LAND_POS[i + 1];
          const lit = it.done || it.mastery >= 50;
          const d = `M ${a.x} ${a.y * 0.75} Q ${(a.x + b.x) / 2 + 6} ${((a.y + b.y) / 2) * 0.75 - 6} ${b.x} ${b.y * 0.75}`;
          return (
            <g key={it.id}>
              <path d={d} stroke="#5b3a1a" strokeWidth={0.9} strokeDasharray="1.6 1.4" fill="none" opacity={0.6} />
              {lit && (
                <motion.path d={d} stroke="#ffd34d" strokeWidth={1.3} fill="none" strokeLinecap="round"
                  initial={{ pathLength: still ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: i * 0.3 }}
                  style={{ filter: 'drop-shadow(0 0 1px #fff3b0)' }} />
              )}
            </g>
          );
        })}
        <text x="50" y="40" textAnchor="middle" fontSize="3.4" fill="#2c4d4f" opacity="0.5" fontFamily="Pirata One">The Sea of Revision</text>
      </svg>
      {items.map((it, i) => {
        const s = SUBJECTS[it.id];
        const pos = LAND_POS[i];
        return (
          <motion.button key={it.id} onClick={() => open(it.id)} aria-label={`${s.name}, ${it.mastery}% mastered`}
            whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.05 }}
            animate={still ? undefined : { rotate: [-1.5, 1.5, -1.5] }} transition={{ duration: 5, repeat: Infinity, delay: i * 0.4 }}
            style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, translateX: '-50%', translateY: '-50%', cursor: 'pointer',
              width: 'clamp(96px, 20%, 150px)', padding: '10px 6px', border: '3px solid #7a4e24', color: '#2b1a0e',
              borderRadius: '46% 54% 50% 50% / 55% 45% 55% 45%', background: `radial-gradient(circle at 40% 35%, #f6e7c6 0%, ${s.colour} 140%)`,
              boxShadow: '0 4px 0 #7a4e24, 0 8px 18px rgba(0,0,0,0.25)', display: 'grid', justifyItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 28 }} aria-hidden>{it.done ? '🏆' : s.emoji}</span>
            <strong style={{ fontSize: 15 }}>{s.name}</strong>
            <span style={{ fontSize: 13, fontWeight: 700 }}>🪙 {it.mastery}%</span>
          </motion.button>
        );
      })}
    </div>
  );
}
