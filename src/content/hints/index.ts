// Quiz hints. Each question's hint is looked up by its id, so the subject files stay as they are.
// A hint points to the method or a fact to remember. It must never give the answer
// (content.test.ts checks this).
import { MATHS_HINTS } from './maths';
import { SCIENCE_HINTS } from './science';
import { ENGLISH_HINTS } from './english';
import { RE_HINTS } from './re';
import { GEOGRAPHY_HINTS } from './geography';
import { HISTORY_HINTS } from './history';

export const HINTS: Record<string, string> = {
  ...MATHS_HINTS, ...SCIENCE_HINTS, ...ENGLISH_HINTS, ...RE_HINTS, ...GEOGRAPHY_HINTS, ...HISTORY_HINTS,
};

/** Hints for generated Maths questions, by skill. The numbers change, so these describe the method. */
export const SKILL_HINTS: Record<string, string> = {
  'angles-line': 'Angles on a straight line add up to 180°.',
  'angles-point': 'Angles around a point add up to 360°.',
  'angles-tri': 'Angles in a triangle add up to 180°.',
  'angles-quad': 'Angles in a quadrilateral add up to 360°.',
  'ratio-simplify': 'Divide every part by the biggest number that goes into all of them.',
  'ratio-fraction': 'Add the parts to get the bottom of the fraction.',
  'ratio-divide': 'Add the parts, find one part, then multiply.',
  'ratio-part': 'Use the part you know to find what 1 part is worth.',
  'ratio-diff': 'The difference in parts matches the difference in the amounts. Find 1 part.',
  recipe: 'Work out the amount for 1 person first.',
  currency: 'Pounds to another currency: multiply by the rate. Back to pounds: divide.',
  'place-value': 'Think about the columns: ones, tens, hundreds, thousands.',
  ops: 'Use a written method and line up the columns.',
  tables: 'Use your times tables. Division is the opposite of multiplying.',
  negatives: 'Use a number line. Taking away a negative is the same as adding.',
  bidmas: 'Brackets, Indices, Division and Multiplication, then Addition and Subtraction.',
  fdp: 'Percent means out of 100. To get a decimal, divide the top by the bottom.',
  'frac-amount': 'Divide by the bottom number, then multiply by the top number.',
  'pct-amount': 'Find 10% first by dividing by 10, then build up.',
  equations: 'Do the opposite operation to both sides.',
};
