// Shared shapes for all subject content.
// Parents: you only need to edit the subject files (maths.ts, science.ts …), not this one.

export type SubjectId = 'english' | 'maths' | 'science' | 're' | 'geography' | 'history';

export interface Topic {
  id: string;
  title: string;
  /** Optional heading the topic sits under in the checklist, e.g. "Angles". */
  group?: string;
  /** MathsWatch clip numbers or similar. */
  clip?: string;
  note?: string;
}

export interface LearnCard {
  topicId: string;
  title: string;
  points: string[];
  /** A short memory hook shown at the bottom of the card. */
  tip?: string;
  /** Name of a built-in diagram (see components/subject/Diagrams.tsx). */
  diagram?: string;
}

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  /** Marks "bonus" terms (not on the official list but useful). */
  bonus?: boolean;
}

interface QBase {
  id: string;
  topicId: string;
  prompt: string;
  /** One-line explanation shown after every answer. */
  explain: string;
  /** Optional diagram (used by generated Maths questions). */
  figure?: unknown;
  /** Optional worked solution steps. */
  steps?: string[];
}
export interface MCQ extends QBase { kind: 'mcq'; options: string[]; answer: number }
export interface TrueFalse extends QBase { kind: 'tf'; answer: boolean }
export interface TypeAnswer extends QBase { kind: 'type'; accept: string[]; numeric?: boolean }
export interface MatchUp extends QBase { kind: 'match'; pairs: [string, string][] }
export type Question = MCQ | TrueFalse | TypeAnswer | MatchUp;

export interface ResourceLink {
  label: string;
  url?: string;
  note?: string;
}

export interface SubjectContent {
  id: SubjectId;
  name: string;
  emoji: string;
  /** Accent colour used for this subject's planet / cabinet / land. */
  colour: string;
  /** What the assessment looks like, shown on the "What's on the test" tab. */
  format: string[];
  topics: Topic[];
  learn: LearnCard[];
  flashcards: Flashcard[];
  questions: Question[];
  links: ResourceLink[];
  tips?: string[];
}

// ---------- tiny helpers so the content files stay short ----------

/** Stable id from the text, so progress survives re-ordering questions. */
export function hashId(prefix: string, text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${prefix}-${(h >>> 0).toString(36)}`;
}

export function makeBuilders(prefix: string) {
  return {
    fc: (topicId: string, front: string, back: string, bonus = false): Flashcard => ({
      id: hashId(prefix + 'f', front), topicId, front, back, bonus,
    }),
    mcq: (topicId: string, prompt: string, options: string[], answer: number, explain: string): MCQ => ({
      kind: 'mcq', id: hashId(prefix + 'q', prompt + options.join()), topicId, prompt, options, answer, explain,
    }),
    tf: (topicId: string, prompt: string, answer: boolean, explain: string): TrueFalse => ({
      kind: 'tf', id: hashId(prefix + 'q', prompt), topicId, prompt, answer, explain,
    }),
    typed: (topicId: string, prompt: string, accept: string | string[], explain: string, numeric = false): TypeAnswer => ({
      kind: 'type', id: hashId(prefix + 'q', prompt), topicId, prompt,
      accept: Array.isArray(accept) ? accept : [accept], explain, numeric,
    }),
    num: (topicId: string, prompt: string, answer: number | string, explain: string): TypeAnswer => ({
      kind: 'type', id: hashId(prefix + 'q', prompt), topicId, prompt, accept: [String(answer)], explain, numeric: true,
    }),
    match: (topicId: string, prompt: string, pairs: [string, string][], explain: string): MatchUp => ({
      kind: 'match', id: hashId(prefix + 'q', prompt + pairs.flat().join()), topicId, prompt, pairs, explain,
    }),
  };
}
