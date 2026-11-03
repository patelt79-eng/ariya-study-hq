import type { SubjectContent, SubjectId } from '../content/types';
import { DEFAULT_CLASS, PLAN_START, type ClassId, CLASSES } from '../content/timetable';
import type { MissionTask } from './planner';
import { addDays, diffDays } from '../lib/dates';

export type ThemeId = 'blossom' | 'mint' | 'peach';
export type Rag = 'R' | 'A' | 'G';

export interface CardState { box: number; due: string; seen: number }
export interface QStat { r: number; w: number; lastWrong?: string; subject: SubjectId; prompt: string }
/** Per-topic lesson progress: each lesson is Learn → Flashcards → Quiz. */
export interface LessonState { learn?: boolean; cards?: boolean; quiz?: number }
export interface SavedParagraph { id: string; subject: SubjectId; title: string; text: string; date: string }

export interface Progress {
  v: 1;
  onboarded: boolean;
  name: string;
  classId: ClassId;
  theme: ThemeId;
  calm: boolean;
  muted: boolean;
  parentPin: string | null;
  planStart: string | null;
  xp: number;
  badges: Record<string, string>;
  streak: { count: number; best: number; lastDay: string | null };
  minutesByDay: Record<string, number>;
  leitner: Record<string, CardState>;
  qstats: Record<string, QStat>;
  quizScores: Partial<Record<SubjectId, number[]>>;
  rag: Record<string, Rag>;
  missions: Record<string, MissionTask[]>;
  missionsDone: Record<string, string[]>;
  paragraphs: SavedParagraph[];
  counters: Record<string, number>;
  celebrated80: SubjectId[];
  lessons: Record<string, LessonState>;
  /** Listen mode: read lessons, flashcards and questions aloud automatically. */
  listen: boolean;
  /** Chosen reading voice; null = Automatic (best available). */
  voiceURI: string | null;
  /** 0.8 = Slow, 1 = Normal. */
  speechRate: 0.8 | 1;
}

export function defaultProgress(): Progress {
  return {
    v: 1, onboarded: false, name: 'Ariya', classId: DEFAULT_CLASS, theme: 'blossom', calm: false, muted: false,
    parentPin: null, planStart: null, xp: 0, badges: {}, streak: { count: 0, best: 0, lastDay: null },
    minutesByDay: {}, leitner: {}, qstats: {}, quizScores: {}, rag: {}, missions: {}, missionsDone: {},
    paragraphs: [], counters: {}, celebrated80: [], lessons: {},
    listen: false, voiceURI: null, speechRate: 1,
  };
}

/** Accept anything (old saves, imported files) and return a valid Progress. */
export function migrate(raw: unknown): Progress {
  const base = defaultProgress();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<Progress>;
  const merged = { ...base, ...r, streak: { ...base.streak, ...(r.streak ?? {}) } } as Progress;
  if (!CLASSES.includes(merged.classId)) merged.classId = DEFAULT_CLASS;
  // The old Space / Arcade / Map looks were replaced by pastel themes (Nov 2026).
  const OLD_THEMES: Record<string, ThemeId> = { space: 'blossom', arcade: 'mint', map: 'peach' };
  if (OLD_THEMES[merged.theme as string]) merged.theme = OLD_THEMES[merged.theme as string];
  if (!['blossom', 'mint', 'peach'].includes(merged.theme)) merged.theme = 'blossom';
  // Listen-mode settings were added later: repair anything missing or odd.
  if (typeof merged.listen !== 'boolean') merged.listen = false;
  if (typeof merged.voiceURI !== 'string' || !merged.voiceURI) merged.voiceURI = null;
  if (merged.speechRate !== 0.8 && merged.speechRate !== 1) merged.speechRate = 1;
  if (!merged.lessons || typeof merged.lessons !== 'object') merged.lessons = {};
  // The plan always starts on PLAN_START. If it was saved with another start (e.g. the day the app
  // was first opened), drop any planned days from PLAN_START onwards that have no finished tasks,
  // so they are re-planned from Day 1. Finished work is never removed.
  if (merged.planStart !== PLAN_START) {
    const missions = { ...(merged.missions ?? {}) };
    for (const d of Object.keys(missions)) if (d >= PLAN_START && !(merged.missionsDone?.[d]?.length)) delete missions[d];
    merged.missions = missions;
    merged.planStart = PLAN_START;
  }
  return merged;
}

// ---------- Leitner boxes ----------
/** Days until a card comes back, per box (box 1 = today). */
const BOX_GAP = [0, 0, 1, 2, 4, 7];

export function reviewCard(prev: CardState | undefined, gotIt: boolean, today: string): CardState {
  const box = gotIt ? Math.min(5, (prev?.box ?? 0) + 1) : 1;
  return { box, due: addDays(today, BOX_GAP[box]), seen: (prev?.seen ?? 0) + 1 };
}

// ---------- levels and ranks ----------
export function levelFor(xp: number): { level: number; floor: number; next: number } {
  let level = 1;
  while (60 * level * (level + 1) <= xp) level++;
  return { level, floor: 60 * (level - 1) * level, next: 60 * level * (level + 1) };
}

const RANKS = ['Starter', 'Starter', 'Explorer', 'Explorer', 'Achiever', 'Achiever', 'Achiever', 'Champion'];
export function rankFor(level: number): string {
  return RANKS[Math.min(level, RANKS.length) - 1];
}

// ---------- mastery ----------
export interface Mastery { cards: number; quiz: number; overall: number; rated: number; red: number }

export function masteryFor(subject: SubjectContent, p: Progress): Mastery {
  const total = subject.flashcards.length || 1;
  const known = subject.flashcards.filter((c) => (p.leitner[c.id]?.box ?? 0) >= 4).length;
  const cards = Math.round((known / total) * 100);
  const scores = (p.quizScores[subject.id] ?? []).slice(-5);
  const quiz = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const rated = subject.topics.filter((t) => p.rag[t.id]).length;
  const red = subject.topics.filter((t) => p.rag[t.id] === 'R').length;
  return { cards, quiz, overall: Math.round((cards + quiz) / 2), rated, red };
}

/** 0 (strong) to 1 (weak), used by the planner. */
export function weaknessFor(subject: SubjectContent, p: Progress, today: string): number {
  const m = masteryFor(subject, p);
  const topics = subject.topics.length || 1;
  const redShare = m.red / topics;
  const amberShare = subject.topics.filter((t) => p.rag[t.id] === 'A').length / topics;
  const recentWrong = Object.values(p.qstats).filter(
    (q) => q.subject === subject.id && q.lastWrong && diffDays(q.lastWrong, today) <= 3,
  ).length;
  const w = 0.55 * (1 - m.overall / 100) + 0.25 * (redShare + amberShare * 0.4) + 0.2 * Math.min(1, recentWrong / 8);
  return Math.max(0, Math.min(1, w));
}

// ---------- badges ----------
export interface Badge { id: string; name: string; icon: string; desc: string }
export const BADGES: Badge[] = [
  { id: 'first-quiz', name: 'First Quiz', icon: '🎯', desc: 'Finished your first quiz' },
  { id: 'first-perfect', name: 'First Perfect Quiz', icon: '💯', desc: 'Scored 10 out of 10' },
  { id: 'streak-3', name: 'On Fire', icon: '🔥', desc: '3-day streak' },
  { id: 'streak-7', name: '7-Day Streak', icon: '🌟', desc: 'Revised 7 days in a row' },
  { id: 'cards-100', name: 'Card Shark', icon: '🃏', desc: 'Reviewed 100 flashcards' },
  { id: 'mission-1', name: 'Mission Started', icon: '🚀', desc: 'Completed your first mission task' },
  { id: 'mission-day', name: 'Full Mission', icon: '🏁', desc: "Finished a whole day's mission" },
  { id: 'angle-ace', name: 'Angle Ace', icon: '📐', desc: '20 angle questions right' },
  { id: 'ratio-ranger', name: 'Ratio Ranger', icon: '⚖️', desc: '20 ratio questions right' },
  { id: 'blitz-30', name: 'Tables Blitzer', icon: '⚡', desc: '30+ in Times-tables Blitz' },
  { id: 'cell-builder', name: 'Cell Builder', icon: '🦠', desc: 'Built a perfect cell' },
  { id: 'wordsmith', name: 'Wordsmith', icon: '✍️', desc: 'Wrote 3 paragraphs' },
  { id: 'hazard-hunter', name: 'Hazard Hunter', icon: '🌋', desc: 'Finished every case study quiz' },
  { id: 'silk-road-trader', name: 'Silk Road Trader', icon: '🐫', desc: 'Visited every stop on the Silk Road' },
  { id: 'time-traveller', name: 'Time Traveller', icon: '⏳', desc: 'Perfect timeline' },
  { id: 'boss-slayer', name: 'Boss Slayer', icon: '🐉', desc: 'Beat a Boss Battle' },
  { id: 'master-80', name: 'Subject Master', icon: '🏆', desc: 'Reached 80% mastery in a subject' },
];

export function streakAfterActivity(s: Progress['streak'], today: string): Progress['streak'] {
  if (s.lastDay === today) return s;
  const count = s.lastDay && diffDays(s.lastDay, today) === 1 ? s.count + 1 : 1;
  return { count, best: Math.max(s.best, count), lastDay: today };
}
