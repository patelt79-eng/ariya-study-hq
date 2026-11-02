// The active mission task, the 20-minute focus timer and the brain-break screen.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MissionTask, TaskKind } from '../../state/planner';
import { useProgress } from '../../state/progress';
import { SUBJECTS } from '../../content';
import { go } from '../../lib/router';
import { play } from '../../lib/sound';
import type { SubjectId } from '../../content/types';

export const KIND_LABEL: Record<TaskKind, string> = {
  learn: 'Lesson (learn, flashcards, quiz)', flashcards: 'Flashcards', quiz: 'Quiz round', practise: 'Practise tools',
  'boost-quiz': 'Final Boost quiz', 'weak-cards': 'Weakest cards review',
};
export const KIND_ICON: Record<TaskKind, string> = {
  learn: '📘', flashcards: '🃏', quiz: '❓', practise: '🛠️', 'boost-quiz': '🚀', 'weak-cards': '🎯',
};

export function routeForTask(t: { subject: SubjectId; kind: TaskKind }): string {
  switch (t.kind) {
    case 'learn': return `subject/${t.subject}/learn`;
    case 'flashcards': return `subject/${t.subject}/cards`;
    case 'quiz': return `subject/${t.subject}/quiz`;
    case 'practise': return `subject/${t.subject}/practise`;
    case 'boost-quiz': return `subject/${t.subject}/quiz?mode=boost`;
    case 'weak-cards': return `subject/${t.subject}/cards?mode=weak`;
  }
}

const FOCUS_SECONDS = 20 * 60;
const BREAK_SECONDS = 5 * 60;

interface MissionCtx {
  active: MissionTask | null;
  start: (t: MissionTask) => void;
  /** Called by activities when they finish; completes the task if it matches. */
  finished: (subject: SubjectId, kinds: TaskKind[]) => void;
  startBreak: () => void;
}
const Ctx = createContext<MissionCtx>({ active: null, start: () => {}, finished: () => {}, startBreak: () => {} });
export const useMission = () => useContext(Ctx);

export function MissionProvider({ children }: { children: ReactNode }) {
  const { completeTask, p, today } = useProgress();
  const [active, setActive] = useState<MissionTask | null>(null);
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [paused, setPaused] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const start = useCallback((t: MissionTask) => {
    setActive(t);
    setSeconds(FOCUS_SECONDS);
    setPaused(false);
    setTimeUp(false);
    go(routeForTask(t));
  }, []);

  const finishActive = useCallback(() => {
    if (!active) return;
    completeTask(active.id);
    setActive(null);
  }, [active, completeTask]);

  const finished = useCallback((subject: SubjectId, kinds: TaskKind[]) => {
    if (active && active.subject === subject && kinds.includes(active.kind)) finishActive();
  }, [active, finishActive]);

  useEffect(() => {
    if (!active || paused || timeUp) return;
    const id = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [active, paused, timeUp]);

  useEffect(() => {
    if (active && seconds === 0 && !timeUp) { setTimeUp(true); play('levelup'); }
  }, [active, seconds, timeUp]);

  const startBreak = useCallback(() => { setTimeUp(false); setOnBreak(true); }, []);

  const value = useMemo(() => ({ active, start, finished, startBreak }), [active, start, finished, startBreak]);
  const done = active && (p.missionsDone[today] ?? []).includes(active.id);

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {active && !done && (
          <motion.div className="focusbar" role="region" aria-label="Focus timer"
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}>
            <span aria-hidden style={{ fontSize: 24 }}>{SUBJECTS[active.subject].emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {SUBJECTS[active.subject].name}: {KIND_LABEL[active.kind]}
              </div>
              <div className="bar" style={{ height: 8 }}><span style={{ width: `${(1 - seconds / FOCUS_SECONDS) * 100}%` }} /></div>
            </div>
            <span className="time" aria-live="off">{fmt(seconds)}</span>
            <button className="icon-btn" onClick={() => setPaused((x) => !x)} aria-label={paused ? 'Resume timer' : 'Pause timer'}>{paused ? '▶' : '⏸'}</button>
            <button className="btn good small" onClick={finishActive}>Done ✓</button>
            <button className="icon-btn" onClick={() => setActive(null)} aria-label="Stop this task">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
      {timeUp && active && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Focus time finished">
          <div className="card center stack">
            <h2>20 minutes of focus! 🎉</h2>
            <p>Brilliant effort. Your brain learns best with short breaks.</p>
            <button className="btn" onClick={() => { finishActive(); startBreak(); }}>Finish task and take a 5-minute break</button>
            <button className="btn secondary" onClick={() => { setTimeUp(false); setSeconds(5 * 60); }}>Keep going for 5 more minutes</button>
          </div>
        </div>
      )}
      {onBreak && <BrainBreak onDone={() => setOnBreak(false)} />}
    </Ctx.Provider>
  );
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function BrainBreak({ onDone }: { onDone: () => void }) {
  const [left, setLeft] = useState(BREAK_SECONDS);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    // 4 seconds in, 4 hold, 6 out.
    const t = window.setTimeout(() => setPhase(phase === 'in' ? 'hold' : phase === 'hold' ? 'out' : 'in'), phase === 'out' ? 6000 : 4000);
    return () => window.clearTimeout(t);
  }, [phase]);
  const scale = phase === 'in' ? 1 : phase === 'hold' ? 1 : 0.55;
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Brain break">
      <div className="card center stack" style={{ alignItems: 'center' }}>
        <h2>Brain break</h2>
        <p className="muted">Assessments can feel a bit stressful, and that’s normal. Breathe with the circle.</p>
        <motion.div
          animate={{ scale }}
          transition={{ duration: phase === 'out' ? 6 : 4, ease: 'easeInOut' }}
          style={{
            width: 200, height: 200, borderRadius: '50%', margin: '12px auto', display: 'grid', placeItems: 'center',
            background: 'radial-gradient(circle, var(--accent) 0%, var(--accent-2) 100%)', color: 'var(--accent-text)',
            fontWeight: 700, fontSize: 22, boxShadow: 'var(--glow)',
          }}
          initial={{ scale: 0.55 }}
        >
          {phase === 'in' ? 'Breathe in' : phase === 'hold' ? 'Hold' : 'Breathe out'}
        </motion.div>
        <p>Stretch, get some water, look out of a window. <strong>{fmt(left)}</strong> left.</p>
        <button className="btn" onClick={onDone}>{left === 0 ? "I'm ready!" : 'End break'}</button>
      </div>
    </div>
  );
}
