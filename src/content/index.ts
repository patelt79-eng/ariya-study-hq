import type { SubjectContent, SubjectId } from './types';
import { english } from './english';
import { maths } from './maths';
import { science } from './science';
import { re } from './re';
import { geography } from './geography';
import { history } from './history';
import { HINTS } from './hints';

// Each question gets its hint from content/hints, looked up by id.
const withHints = (s: SubjectContent): SubjectContent => ({
  ...s,
  questions: s.questions.map((q) => (HINTS[q.id] ? { ...q, hint: HINTS[q.id] } : q)),
});

const all = {
  english: withHints(english), maths: withHints(maths), science: withHints(science),
  re: withHints(re), geography: withHints(geography), history: withHints(history),
};

export const SUBJECTS: Record<SubjectId, SubjectContent> = all;
export const SUBJECT_LIST: SubjectContent[] = [all.maths, all.science, all.english, all.re, all.geography, all.history];
