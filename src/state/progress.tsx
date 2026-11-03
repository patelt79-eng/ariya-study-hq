import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadRaw, saveRaw } from './storage';
import {
  BADGES, defaultProgress, levelFor, masteryFor, migrate, reviewCard, streakAfterActivity, weaknessFor, type Progress,
} from './model';
import { todayISO } from '../lib/dates';
import type { Question, SubjectId } from '../content/types';
import { SUBJECTS, SUBJECT_LIST } from '../content';
import { examsFor, PLAN_START } from '../content/timetable';
import { planFor, type DayPlan } from './planner';
import { play, setMuted } from '../lib/sound';
import { setCalmConfetti } from '../lib/confetti';

// ---------- reward events (XP fly-ups, level ups, badges) ----------
export type RewardEvent =
  | { type: 'xp'; amount: number; label?: string }
  | { type: 'level'; level: number }
  | { type: 'badge'; id: string }
  | { type: 'mastery'; subject: SubjectId };
type Listener = (e: RewardEvent) => void;
const listeners = new Set<Listener>();
export function onReward(l: Listener) { listeners.add(l); return () => { listeners.delete(l); }; }
function emit(e: RewardEvent) { listeners.forEach((l) => l(e)); }

export const XP = { card: 2, correct: 10, task: 30, paragraph: 25, quizDone: 15, boss: 100 } as const;

interface Ctx {
  p: Progress;
  today: string;
  update: (fn: (p: Progress) => Progress) => void;
  award: (amount: number, label?: string) => void;
  unlock: (id: string) => void;
  bump: (counter: string, by?: number) => number;
  answer: (q: Question, subject: SubjectId, correct: boolean) => void;
  review: (cardId: string, gotIt: boolean) => void;
  quizFinished: (subject: SubjectId, pct: number) => void;
  completeTask: (taskId: string) => void;
  replace: (p: Progress) => void;
  todayPlan: DayPlan;
}

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Progress>(() => migrate(loadRaw()));
  const today = todayISO();
  const ref = useRef(p);

  useEffect(() => { saveRaw(p); }, [p]);
  useEffect(() => { setMuted(p.muted); }, [p.muted]);
  useEffect(() => { setCalmConfetti(p.calm); }, [p.calm]);

  // Every write goes through ref.current so back-to-back updates in one tap never overwrite each other.
  const update = useCallback((fn: (p: Progress) => Progress) => {
    const next = fn(ref.current);
    ref.current = next;
    setP(next);
  }, []);

  const award = useCallback((amount: number, label?: string) => {
    const before = levelFor(ref.current.xp).level;
    const xp = ref.current.xp + amount;
    const after = levelFor(xp).level;
    const next = { ...ref.current, xp, streak: streakAfterActivity(ref.current.streak, today) };
    ref.current = next;
    setP(next);
    emit({ type: 'xp', amount, label });
    if (after > before) { play('levelup'); emit({ type: 'level', level: after }); }
    const s = next.streak.count;
    if (s >= 3) unlockRef.current('streak-3');
    if (s >= 7) unlockRef.current('streak-7');
  }, [today]);

  const unlock = useCallback((id: string) => {
    if (ref.current.badges[id] || !BADGES.some((b) => b.id === id)) return;
    const next = { ...ref.current, badges: { ...ref.current.badges, [id]: today } };
    ref.current = next;
    setP(next);
    emit({ type: 'badge', id });
  }, [today]);
  const unlockRef = useRef(unlock);
  unlockRef.current = unlock;

  const bump = useCallback((counter: string, by = 1) => {
    const n = (ref.current.counters[counter] ?? 0) + by;
    const next = { ...ref.current, counters: { ...ref.current.counters, [counter]: n } };
    ref.current = next;
    setP(next);
    return n;
  }, []);

  const checkMastery = useCallback((subject: SubjectId) => {
    const cur = ref.current;
    if (cur.celebrated80.includes(subject)) return;
    if (masteryFor(SUBJECTS[subject], cur).overall >= 80) {
      const next = { ...cur, celebrated80: [...cur.celebrated80, subject] };
      ref.current = next;
      setP(next);
      emit({ type: 'mastery', subject });
      unlock('master-80');
    }
  }, [unlock]);

  const answer = useCallback((q: Question, subject: SubjectId, correct: boolean) => {
    const cur = ref.current;
    const prev = cur.qstats[q.id] ?? { r: 0, w: 0, subject, prompt: q.prompt };
    const stat = correct ? { ...prev, r: prev.r + 1 } : { ...prev, w: prev.w + 1, lastWrong: today };
    const next = { ...cur, qstats: { ...cur.qstats, [q.id]: stat } };
    ref.current = next;
    setP(next);
    if (correct) award(XP.correct);
  }, [award, today]);

  const review = useCallback((cardId: string, gotIt: boolean) => {
    const cur = ref.current;
    const next = { ...cur, leitner: { ...cur.leitner, [cardId]: reviewCard(cur.leitner[cardId], gotIt, today) } };
    ref.current = next;
    setP(next);
    award(XP.card);
    if (bump('cardsReviewed') >= 100) unlock('cards-100');
  }, [award, bump, today, unlock]);

  const quizFinished = useCallback((subject: SubjectId, pct: number) => {
    const cur = ref.current;
    const scores = [...(cur.quizScores[subject] ?? []), pct].slice(-20);
    const next = { ...cur, quizScores: { ...cur.quizScores, [subject]: scores } };
    ref.current = next;
    setP(next);
    award(XP.quizDone, 'Quiz done');
    unlock('first-quiz');
    if (pct === 100) unlock('first-perfect');
    checkMastery(subject);
  }, [award, checkMastery, unlock]);

  // Today's mission is frozen the first time it is shown, so it doesn't shift during the day.
  const todayPlan = useMemo<DayPlan>(() => {
    const weakness = Object.fromEntries(SUBJECT_LIST.map((s) => [s.id, weaknessFor(s, p, today)]));
    const plan = planFor({ exams: examsFor(p.classId), start: PLAN_START, weakness }, today);
    const frozen = p.missions[today];
    return frozen ? { ...plan, tasks: frozen } : plan;
    // Recompute only when the inputs that matter change, not on every XP tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.classId, p.missions[today], today]);

  useEffect(() => {
    if (!p.onboarded || p.missions[today]) return;
    update((cur) => ({ ...cur, planStart: PLAN_START, missions: { ...cur.missions, [today]: todayPlan.tasks } }));
  }, [p.onboarded, p.missions, today, todayPlan.tasks, update]);

  const completeTask = useCallback((taskId: string) => {
    const cur = ref.current;
    const done = cur.missionsDone[today] ?? [];
    if (done.includes(taskId)) return;
    const nextDone = [...done, taskId];
    const next = { ...cur, missionsDone: { ...cur.missionsDone, [today]: nextDone } };
    ref.current = next;
    setP(next);
    play('coin');
    award(XP.task, 'Mission task');
    unlock('mission-1');
    const tasks = cur.missions[today] ?? [];
    if (tasks.length && tasks.every((t) => nextDone.includes(t.id))) unlock('mission-day');
  }, [award, today, unlock]);

  const replace = useCallback((np: Progress) => { ref.current = np; setP(np); }, []);

  const value = useMemo<Ctx>(() => ({
    p, today, update, award, unlock, bump, answer, review, quizFinished, completeTask, replace, todayPlan,
  }), [p, today, update, award, unlock, bump, answer, review, quizFinished, completeTask, replace, todayPlan]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const c = useContext(ProgressContext);
  if (!c) throw new Error('useProgress outside provider');
  return c;
}

export function resetProgress(): Progress { return defaultProgress(); }
