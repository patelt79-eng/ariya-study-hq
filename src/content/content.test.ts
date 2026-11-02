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
  it('every learn card has a picture with a spoken description', async () => {
    const { diagramText } = await import('../components/subject/Diagrams');
    for (const s of SUBJECT_LIST) for (const c of s.learn) {
      expect(c.diagram, `${s.id}: ${c.title}`).toBeTruthy();
      expect(diagramText(c.diagram), c.diagram).not.toBe('');
    }
    // Generated RE "Key words" cards (5 words per card).
    const re = SUBJECT_LIST.find((x) => x.id === 're')!;
    for (const topic of ['r-terms-creation', 'r-terms-prophecy']) {
      const n = Math.ceil(re.flashcards.filter((c) => c.topicId === topic).length / 5);
      for (let i = 0; i < n; i++) expect(diagramText(`keywords-${topic}-${i}`), `${topic} ${i}`).not.toBe('');
    }
  });
});
