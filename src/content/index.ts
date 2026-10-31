import type { SubjectContent, SubjectId } from './types';
import { english } from './english';
import { maths } from './maths';
import { science } from './science';
import { re } from './re';
import { geography } from './geography';
import { history } from './history';

export const SUBJECTS: Record<SubjectId, SubjectContent> = { english, maths, science, re, geography, history };
export const SUBJECT_LIST: SubjectContent[] = [maths, science, english, re, geography, history];
