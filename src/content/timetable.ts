// Autumn Assessments timetable, copied from the school booklet.
// Week A: 16–20 November 2026. Week B: 23–25 November 2026.
import type { SubjectId } from './types';

export const CLASSES = ['7A1', '7A2', '7A3', '7A4', '7A5', '7B1', '7B2', '7B3', '7B4'] as const;
export type ClassId = (typeof CLASSES)[number];
export const DEFAULT_CLASS: ClassId = '7A3';

export const EXAM_DATES = [
  '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20',
  '2026-11-23', '2026-11-24', '2026-11-25',
] as const;

// One row per class, one column per date above. null = no exam that day.
const M = 'maths', S = 'science', E = 'english', R = 're', G = 'geography', H = 'history';
const _ = null;
const GRID: Record<ClassId, (SubjectId | null)[]> = {
  //      Mon16 Tue17 Wed18 Thu19 Fri20 Mon23 Tue24 Wed25
  '7A1': [M,    _,    G,    E,    R,    S,    _,    H],
  '7A2': [M,    _,    H,    E,    R,    S,    _,    G],
  '7A3': [M,    S,    _,    E,    R,    _,    G,    H],
  '7A4': [M,    _,    G,    E,    R,    S,    _,    H],
  '7A5': [M,    _,    _,    E,    R,    S,    G,    H],
  '7B1': [E,    _,    _,    R,    G,    H,    S,    M],
  '7B2': [E,    _,    G,    _,    R,    H,    S,    M],
  '7B3': [E,    G,    _,    R,    M,    H,    S,    _],
  '7B4': [E,    G,    R,    _,    _,    H,    S,    M],
};

export interface Exam { subject: SubjectId; date: string }

/** Exams for one class, in date order. */
export function examsFor(classId: ClassId): Exam[] {
  const row = GRID[classId] ?? GRID[DEFAULT_CLASS];
  const out: Exam[] = [];
  row.forEach((subject, i) => { if (subject) out.push({ subject, date: EXAM_DATES[i] }); });
  return out;
}

/** The booklet doesn't list a slot for every subject for every class. */
export function missingSubjects(classId: ClassId): SubjectId[] {
  const have = new Set(examsFor(classId).map((e) => e.subject));
  return (['english', 'maths', 'science', 're', 'geography', 'history'] as SubjectId[]).filter((s) => !have.has(s));
}
