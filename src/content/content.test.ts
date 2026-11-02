import { describe, expect, it } from 'vitest';
import { SUBJECT_LIST } from './index';
import { EXTRACTS } from './english.extras';
import { isAcceptable } from '../lib/fuzzy';
import { SKILLS } from '../components/practise/maths/generators';

describe.each(SUBJECT_LIST.map((s) => [s.id, s] as const))('%s content', (_, s) => {
  it('has at least 40 flashcards and 80 questions', () => {
    expect(s.flashcards.length).toBeGreaterThanOrEqual(40);
    expect(s.questions.length).toBeGreaterThanOrEqual(80);
    expect(s.learn.length).toBeGreaterThan(0);
  });
  it('has unique ids and valid topics', () => {
    expect(new Set(s.questions.map((q) => q.id)).size).toBe(s.questions.length);
    expect(new Set(s.flashcards.map((c) => c.id)).size).toBe(s.flashcards.length);
    const topics = new Set(s.topics.map((t) => t.id));
    for (const x of [...s.questions, ...s.flashcards, ...s.learn]) expect(topics.has(x.topicId), x.topicId).toBe(true);
  });
  it('has well-formed questions', () => {
    for (const q of s.questions) {
      expect(q.explain.length, q.prompt).toBeGreaterThan(2);
      if (q.kind === 'mcq') {
        expect(q.answer, q.prompt).toBeLessThan(q.options.length);
        expect(new Set(q.options).size, q.prompt).toBe(q.options.length);
      }
      if (q.kind === 'type') expect(isAcceptable(q.accept[0], q.accept, q.numeric), q.prompt).toBe(true);
      if (q.kind === 'match') expect(new Set(q.pairs.map((p) => p[1])).size, q.prompt).toBe(q.pairs.length);
    }
  });
});

describe('English extracts', () => {
  it('are 150–200 words with 5 comprehension questions each', () => {
    for (const e of EXTRACTS) {
      const words = e.paragraphs.flat().map((x) => x.t).join(' ').split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(150);
      expect(words).toBeLessThanOrEqual(200);
      expect(e.ao1).toHaveLength(5);
    }
  });
});

describe('maths generators', () => {
  it('produce answers their own checker accepts', () => {
    for (const s of SKILLS) for (let i = 0; i < 200; i++) {
      const g = s.make();
      expect(isAcceptable(g.answer, [g.answer, ...(g.accept ?? [])], g.numeric), `${s.id}: ${g.prompt}`).toBe(true);
      if (g.figure) expect((g.figure as { angles: number[] }).angles.every((a) => a > 0)).toBe(true);
    }
  });
});

describe('diagram descriptions for Listen mode', () => {
  it('every diagram used on a learn card has a spoken description', async () => {
    const { diagramText } = await import('../components/subject/Diagrams');
    for (const s of SUBJECT_LIST) for (const c of s.learn) if (c.diagram) expect(diagramText(c.diagram), c.diagram).not.toBe('');
  });
});
