// Subject-specific extras: practise tools (loaded on demand) and generated questions.
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { Question, SubjectId } from '../../content/types';
import { SKILLS, type GenQ } from '../practise/maths/generators';

type Practise = LazyExoticComponent<ComponentType<{ tool?: string }>>;

export const PRACTISE: Partial<Record<SubjectId, Practise>> = {
  maths: lazy(() => import('../practise/maths/MathsPractise')),
};

export function genToQuestion(g: GenQ): Question {
  return {
    kind: 'type', id: `mgen-${g.skill}`, topicId: g.topicId, prompt: g.prompt, accept: [g.answer, ...(g.accept ?? [])],
    numeric: g.numeric, explain: g.steps[g.steps.length - 1], steps: g.steps, figure: g.figure,
  };
}

/** Extra questions mixed into quizzes and Boss Battles. */
export function extraQuestionsFor(subject: SubjectId): Question[] {
  if (subject === 'maths') return SKILLS.map((s) => genToQuestion(s.make()));
  return [];
}
