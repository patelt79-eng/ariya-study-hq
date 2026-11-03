import { describe, expect, it } from 'vitest';
import { boostDays, planUntil } from './planner';
import { CLASSES, examsFor } from '../content/timetable';
import type { SubjectId } from '../content/types';

const START = '2026-11-03';

describe('planner for 7A3', () => {
  const exams = examsFor('7A3');
  const plan = planUntil({ exams, start: START, weakness: {} }, '2026-11-26');
  const byDate = Object.fromEntries(plan.map((d) => [d.date, d]));

  it('puts Final Boosts on Sat 14 (Maths) and Sun 15 (Science)', () => {
    expect(byDate['2026-11-14'].boostFor).toBe('maths');
    expect(byDate['2026-11-15'].boostFor).toBe('science');
    expect(byDate['2026-11-18'].boostFor).toBe('english');
  });

  it('gives Maths + Science the largest share (about 40%) before 15 Nov', () => {
    const mins: Record<string, number> = {};
    let total = 0;
    for (const d of plan.filter((p) => p.date <= '2026-11-15')) {
      for (const t of d.tasks) {
        total += t.minutes;
        mins[t.subject] = (mins[t.subject] ?? 0) + t.minutes;
      }
    }
    const share = (mins.maths + mins.science) / total;
    expect(share).toBeGreaterThanOrEqual(0.35);
    expect(share).toBeLessThanOrEqual(0.45);
    const ranked = Object.entries(mins).sort((a, b) => b[1] - a[1]).map(([s]) => s);
    expect(ranked.slice(0, 2).sort()).toEqual(['maths', 'science']);
  });

  it('interleaves: 2–3 subjects a day and English/RE every few days', () => {
    let sinceEng = 0, sinceRe = 0;
    for (const d of plan.filter((p) => p.date <= '2026-11-15')) {
      const subs = new Set(d.tasks.map((t) => t.subject));
      expect(subs.size).toBeGreaterThanOrEqual(d.type === 'boost' ? 2 : 3);
      sinceEng = subs.has('english') ? 0 : sinceEng + 1;
      sinceRe = subs.has('re') ? 0 : sinceRe + 1;
      expect(sinceEng).toBeLessThanOrEqual(3);
      expect(sinceRe).toBeLessThanOrEqual(3);
    }
  });

  it('drops subjects after their exam and finishes after 25 Nov', () => {
    for (const d of plan.filter((p) => p.date > '2026-11-16')) {
      expect(d.tasks.some((t) => t.subject === 'maths')).toBe(false);
    }
    expect(byDate['2026-11-26'].type).toBe('done');
    expect(byDate['2026-11-16'].type).toBe('exam');
  });
});

describe('planner works for every class', () => {
  for (const c of CLASSES) {
    it(`${c}: no task for a subject on or after its exam`, () => {
      const exams = examsFor(c);
      const examDate = Object.fromEntries(exams.map((e) => [e.subject, e.date])) as Record<SubjectId, string>;
      const plan = planUntil({ exams, start: START, weakness: {} }, '2026-11-25');
      for (const d of plan) for (const t of d.tasks) {
        if (d.eveningBoost) continue;
        expect(d.date < examDate[t.subject]).toBe(true);
      }
      expect(Object.keys(boostDays(exams)).length).toBeGreaterThanOrEqual(exams.length - 1);
    });
  }
});
