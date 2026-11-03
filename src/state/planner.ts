// The revision planner. Pure functions only, driven entirely by the timetable,
// so changing class changes the plan with no special cases.
import type { SubjectId } from '../content/types';
import type { Exam } from '../content/timetable';
import { addDays, diffDays } from '../lib/dates';

export type TaskKind = 'learn' | 'flashcards' | 'quiz' | 'practise' | 'boost-quiz' | 'weak-cards';

export interface MissionTask {
  id: string;
  subject: SubjectId;
  kind: TaskKind;
  minutes: number;
}

export interface DayPlan {
  date: string;
  type: 'normal' | 'boost' | 'exam' | 'done';
  examToday?: SubjectId;
  boostFor?: SubjectId;
  /** Boost squeezed in after an exam because there was no free day before it. */
  eveningBoost?: boolean;
  tasks: MissionTask[];
}

export interface PlanInput {
  exams: Exam[];
  /** First day of the plan (the day she started). Keeps the rotation stable. */
  start: string;
  /** 0 = fully mastered, 1 = brand new / weak. Missing subjects count as 1. */
  weakness: Partial<Record<SubjectId, number>>;
}

const KIND_CYCLE: TaskKind[] = ['learn', 'flashcards', 'quiz', 'practise', 'flashcards', 'quiz'];
const MINUTES: Record<TaskKind, number> = {
  learn: 20, flashcards: 15, quiz: 20, practise: 25, 'boost-quiz': 25, 'weak-cards': 20,
};
/** How many days before an exam a Final Boost may move to, if the day before is taken. */
const BOOST_WINDOW = 3;
/** Larger = flatter spread across subjects; smaller = more focus on the next exam. */
const URGENCY_SOFTENING = 12;

/**
 * Work out each subject's Final Boost day.
 * Rule: the latest free (non-exam) day within BOOST_WINDOW days before the exam.
 * Most-constrained exams choose first. If no free day exists, the boost happens
 * on the evening of the day before (an exam day), as a lighter "evening boost".
 */
export function boostDays(exams: Exam[]): Record<string, { subject: SubjectId; evening: boolean }> {
  const examDates = new Set(exams.map((e) => e.date));
  const candidates = exams.map((e) => {
    const c: string[] = [];
    for (let k = 1; k <= BOOST_WINDOW; k++) {
      const d = addDays(e.date, -k);
      if (!examDates.has(d)) c.push(d);
    }
    return { exam: e, c };
  });
  candidates.sort((a, b) => a.c.length - b.c.length || a.exam.date.localeCompare(b.exam.date));
  const out: Record<string, { subject: SubjectId; evening: boolean }> = {};
  for (const { exam, c } of candidates) {
    const free = c.find((d) => !out[d]);
    if (free) { out[free] = { subject: exam.subject, evening: false }; continue; }
    const dayBefore = addDays(exam.date, -1);
    if (!out[dayBefore]) out[dayBefore] = { subject: exam.subject, evening: true };
  }
  return out;
}

function weightFor(exam: Exam, date: string, weakness: number): number {
  const daysTo = diffDays(date, exam.date);
  const urgency = 1 / (daysTo + URGENCY_SOFTENING);
  return urgency * (0.6 + 0.8 * weakness);
}

/** Plan every day from `input.start` up to and including `to`. */
export function planUntil(input: PlanInput, to: string): DayPlan[] {
  const { exams, start, weakness } = input;
  const boosts = boostDays(exams);
  const credit: Partial<Record<SubjectId, number>> = {};
  const picks: Partial<Record<SubjectId, number>> = {};
  const lastExam = exams.length ? exams[exams.length - 1].date : start;
  const days: DayPlan[] = [];

  const nextKind = (s: SubjectId): TaskKind => {
    const n = picks[s] ?? 0;
    picks[s] = n + 1;
    return KIND_CYCLE[n % KIND_CYCLE.length];
  };
  const task = (date: string, s: SubjectId, kind: TaskKind, minutes = MINUTES[kind]): MissionTask => ({
    id: `${date}:${s}:${kind}`, subject: s, kind, minutes,
  });

  // Smooth weighted round robin: each pick, every subject earns credit equal to its
  // weight; the richest subject not yet chosen today is picked and pays back the total.
  // This spreads subjects in proportion to weight while still interleaving them.
  const chooseSubjects = (date: string, count: number, exclude: Set<SubjectId>): SubjectId[] => {
    const upcoming = exams.filter((e) => e.date > date && !exclude.has(e.subject));
    const chosen: SubjectId[] = [];
    for (let i = 0; i < count && chosen.length < upcoming.length; i++) {
      let total = 0;
      let best: SubjectId | null = null;
      for (const e of upcoming) {
        const w = weightFor(e, date, weakness[e.subject] ?? 1);
        total += w;
        credit[e.subject] = (credit[e.subject] ?? 0) + w;
        if (chosen.includes(e.subject)) continue;
        if (best === null || (credit[e.subject] ?? 0) > (credit[best] ?? 0)) best = e.subject;
      }
      if (!best) break;
      credit[best] = (credit[best] ?? 0) - total;
      chosen.push(best);
    }
    return chosen;
  };

  for (let date = start; date <= to; date = addDays(date, 1)) {
    if (date > lastExam) { days.push({ date, type: 'done', tasks: [] }); continue; }
    const examToday = exams.find((e) => e.date === date)?.subject;
    const boost = boosts[date];

    if (examToday) {
      if (boost) {
        days.push({
          date, type: 'exam', examToday, boostFor: boost.subject, eveningBoost: true,
          tasks: [task(date, boost.subject, 'weak-cards', 15), task(date, boost.subject, 'boost-quiz', 15)],
        });
      } else {
        // If another exam is tomorrow, it always gets a quick recap tonight.
        const tomorrow = exams.find((e) => e.date === addDays(date, 1))?.subject;
        const next = tomorrow
          ? [tomorrow, ...chooseSubjects(date, 1, new Set([tomorrow]))]
          : chooseSubjects(date, 2, new Set());
        days.push({ date, type: 'exam', examToday, tasks: next.map((s, i) => task(date, s, i === 0 ? 'flashcards' : 'quiz', 15)) });
      }
      continue;
    }

    if (boost) {
      // Keep the extra slot away from any subject with its own boost or exam in the next two days.
      const soon = new Set<SubjectId>([boost.subject]);
      for (const e of exams) if (diffDays(date, e.date) <= 2 && diffDays(date, e.date) > 0) soon.add(e.subject);
      for (const [d, b] of Object.entries(boosts)) if (d > date && diffDays(date, d) <= 2) soon.add(b.subject);
      const extra = chooseSubjects(date, 1, soon);
      days.push({
        date, type: 'boost', boostFor: boost.subject,
        tasks: [
          task(date, boost.subject, 'boost-quiz'),
          task(date, boost.subject, 'weak-cards', 15),
          ...extra.map((s) => task(date, s, nextKind(s), 20)),
        ],
      });
      continue;
    }

    const subjects = chooseSubjects(date, 3, new Set());
    days.push({ date, type: 'normal', tasks: subjects.map((s) => task(date, s, nextKind(s))) });
  }
  return days;
}

export function planFor(input: PlanInput, date: string): DayPlan {
  if (date < input.start) return planUntil({ ...input, start: date }, date)[0];
  const all = planUntil(input, date);
  return all[all.length - 1];
}
