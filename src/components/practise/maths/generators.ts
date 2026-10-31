// Infinite Maths question generators with worked solutions. Numbers are random each time.
import { gcd, pick, randInt, shuffle } from '../../../lib/random';
import type { AngleSpec } from './AngleDiagram';

export interface GenQ {
  skill: string;
  topicId: string;
  prompt: string;
  answer: string;
  /** Extra accepted forms, e.g. "x = 5" as well as "5". */
  accept?: string[];
  numeric: boolean;
  steps: string[];
  figure?: AngleSpec;
  worded?: boolean;
}

export interface Skill { id: string; label: string; group: string; topicId: string; make: () => GenQ }

const deg = (n: number) => `${n}°`;

function angleLine(): GenQ {
  const three = Math.random() < 0.4;
  let angles: number[];
  if (three) {
    do { angles = [randInt(25, 90), randInt(25, 90)]; } while (180 - angles[0] - angles[1] < 25);
    angles.push(180 - angles[0] - angles[1]);
  } else {
    const a = randInt(25, 155);
    angles = [a, 180 - a];
  }
  const unknown = randInt(0, angles.length - 1);
  const known = angles.filter((_, i) => i !== unknown);
  return {
    skill: 'angles-line', topicId: 'm-angle-rules', numeric: true,
    prompt: 'The angles lie on a straight line. Find x.',
    answer: String(angles[unknown]), figure: { type: 'line', angles, unknown },
    steps: [
      'Angles on a straight line add up to 180°.',
      `Add the angles you know: ${known.map(deg).join(' + ')} = ${deg(known.reduce((a, b) => a + b, 0))}.`,
      `x = 180° − ${deg(known.reduce((a, b) => a + b, 0))} = ${deg(angles[unknown])}.`,
    ],
  };
}

function anglePoint(): GenQ {
  const n = Math.random() < 0.5 ? 3 : 4;
  let angles: number[];
  for (;;) {
    angles = Array.from({ length: n - 1 }, () => randInt(n === 3 ? 70 : 50, n === 3 ? 150 : 110));
    const last = 360 - angles.reduce((a, b) => a + b, 0);
    if (last >= 40 && last <= 170) { angles.push(last); break; }
  }
  const unknown = randInt(0, n - 1);
  const known = angles.filter((_, i) => i !== unknown);
  const sum = known.reduce((a, b) => a + b, 0);
  return {
    skill: 'angles-point', topicId: 'm-angle-rules', numeric: true,
    prompt: 'The angles are around a point. Find x.',
    answer: String(angles[unknown]), figure: { type: 'point', angles, unknown },
    steps: ['Angles around a point add up to 360°.', `Known angles: ${known.map(deg).join(' + ')} = ${deg(sum)}.`, `x = 360° − ${deg(sum)} = ${deg(angles[unknown])}.`],
  };
}

function angleTriangle(): GenQ {
  const kind = pick(['any', 'any', 'isos-base', 'isos-top', 'right']);
  let A: number, B: number, C: number;
  if (kind === 'isos-base' || kind === 'isos-top') {
    C = randInt(2, 14) * 10; A = B = (180 - C) / 2;
  } else if (kind === 'right') {
    A = 90; B = randInt(20, 70); C = 90 - B;
  } else {
    A = randInt(30, 85); B = randInt(30, 85); C = 180 - A - B;
  }
  const angles = [A, B, C];
  if (kind === 'isos-base') {
    return {
      skill: 'angles-tri', topicId: 'm-angle-tri', numeric: true,
      prompt: 'This is an isosceles triangle (the marked sides are equal). Find x.',
      answer: String(A), figure: { type: 'triangle', angles, unknown: 0, hide: [1], isosceles: true },
      steps: ['Angles in a triangle add up to 180°.', `180° − ${deg(C)} = ${deg(180 - C)}.`, `The two base angles are equal, so x = ${deg(180 - C)} ÷ 2 = ${deg(A)}.`],
    };
  }
  if (kind === 'isos-top') {
    return {
      skill: 'angles-tri', topicId: 'm-angle-tri', numeric: true,
      prompt: 'This is an isosceles triangle (the marked sides are equal). Find x.',
      answer: String(C), figure: { type: 'triangle', angles, unknown: 2, hide: [1], isosceles: true },
      steps: ['Base angles in an isosceles triangle are equal, so both are ' + deg(A) + '.', `${deg(A)} + ${deg(B)} = ${deg(A + B)}.`, `x = 180° − ${deg(A + B)} = ${deg(C)}.`],
    };
  }
  const unknown = kind === 'right' ? randInt(1, 2) : randInt(0, 2);
  const known = angles.filter((_, i) => i !== unknown);
  const sum = known[0] + known[1];
  return {
    skill: 'angles-tri', topicId: 'm-angle-tri', numeric: true,
    prompt: 'Find the missing angle x in the triangle.',
    answer: String(angles[unknown]), figure: { type: 'triangle', angles, unknown },
    steps: ['Angles in a triangle add up to 180°.', `${deg(known[0])} + ${deg(known[1])} = ${deg(sum)}.`, `x = 180° − ${deg(sum)} = ${deg(angles[unknown])}.`],
  };
}

function angleQuad(): GenQ {
  let angles: number[];
  for (;;) {
    angles = [randInt(60, 130), randInt(60, 130), randInt(60, 130)];
    const last = 360 - angles.reduce((a, b) => a + b, 0);
    if (last >= 55 && last <= 150) { angles.push(last); break; }
  }
  angles = shuffle(angles);
  const unknown = randInt(0, 3);
  const known = angles.filter((_, i) => i !== unknown);
  const sum = known.reduce((a, b) => a + b, 0);
  return {
    skill: 'angles-quad', topicId: 'm-angle-quad', numeric: true,
    prompt: 'Find the missing angle x in the quadrilateral.',
    answer: String(angles[unknown]), figure: { type: 'quad', angles, unknown },
    steps: ['Angles in a quadrilateral add up to 360°.', `${known.map(deg).join(' + ')} = ${deg(sum)}.`, `x = 360° − ${deg(sum)} = ${deg(angles[unknown])}.`],
  };
}

function ratioSimplify(): GenQ {
  const a = randInt(1, 9), b = randInt(1, 9);
  const g = gcd(a, b); const sa = a / g, sb = b / g;
  const k = randInt(2, 9);
  const three = Math.random() < 0.25;
  if (three) {
    const c = randInt(1, 9); const g3 = gcd(gcd(a, b), c);
    return {
      skill: 'ratio-simplify', topicId: 'm-r-simplify', numeric: true,
      prompt: `Simplify ${a * k} : ${b * k} : ${c * k}`, answer: `${a / g3}:${b / g3}:${c / g3}`,
      steps: [`Find the highest common factor of ${a * k}, ${b * k} and ${c * k}: it is ${k * g3}.`, `Divide every part by ${k * g3}: ${a / g3} : ${b / g3} : ${c / g3}.`],
    };
  }
  return {
    skill: 'ratio-simplify', topicId: 'm-r-simplify', numeric: true,
    prompt: `Simplify ${a * k} : ${b * k}`, answer: `${sa}:${sb}`,
    steps: [`The highest common factor of ${a * k} and ${b * k} is ${k * g}.`, `${a * k} ÷ ${k * g} = ${sa} and ${b * k} ÷ ${k * g} = ${sb}.`, `Answer: ${sa} : ${sb}.`],
  };
}

function ratioFraction(): GenQ {
  let a: number, b: number;
  do { a = randInt(1, 9); b = randInt(1, 9); } while (gcd(a, b) !== 1 || a === b);
  const [x, y] = pick([['red', 'blue'], ['cats', 'dogs'], ['boys', 'girls'], ['apples', 'pears']]);
  const second = Math.random() < 0.5;
  return {
    skill: 'ratio-fraction', topicId: 'm-r-fraction', numeric: true, worded: true,
    prompt: `${x[0].toUpperCase() + x.slice(1)} : ${y} = ${a} : ${b}. What fraction are ${second ? y : x}? (write it like 3/8)`,
    answer: `${second ? b : a}/${a + b}`,
    steps: [`Total parts: ${a} + ${b} = ${a + b}.`, `${second ? y : x} are ${second ? b : a} of those parts.`, `Fraction = ${second ? b : a}/${a + b}.`],
  };
}

function ratioDivide(): GenQ {
  const a = randInt(1, 7), b = randInt(1, 7);
  const part = randInt(2, 12);
  const total = (a + b) * part;
  const larger = Math.random() < 0.5;
  const ans = larger ? Math.max(a, b) * part : Math.min(a, b) * part;
  return {
    skill: 'ratio-divide', topicId: 'm-r-divide', numeric: true, worded: true,
    prompt: `Share £${total} in the ratio ${a} : ${b}. How much is the ${larger ? 'larger' : 'smaller'} share? (in £)`,
    answer: String(ans),
    steps: [`Total parts: ${a} + ${b} = ${a + b}.`, `One part: £${total} ÷ ${a + b} = £${part}.`, `Shares: ${a} × £${part} = £${a * part} and ${b} × £${part} = £${b * part}.`, `The ${larger ? 'larger' : 'smaller'} share is £${ans}.`],
  };
}

function ratioPart(): GenQ {
  const a = randInt(1, 6), b = randInt(2, 7);
  const part = randInt(2, 9);
  const [x, y] = pick([['boys', 'girls'], ['juice', 'water'], ['red beads', 'blue beads'], ['cats', 'dogs']]);
  const askTotal = Math.random() < 0.4;
  return {
    skill: 'ratio-part', topicId: 'm-r-part', numeric: true, worded: true,
    prompt: `${x[0].toUpperCase() + x.slice(1)} : ${y} = ${a} : ${b}. There are ${a * part} ${x}. ${askTotal ? 'How many altogether?' : `How many ${y}?`}`,
    answer: String(askTotal ? (a + b) * part : b * part),
    steps: [`${a} part${a > 1 ? 's' : ''} = ${a * part}, so 1 part = ${a * part} ÷ ${a} = ${part}.`,
      askTotal ? `Total parts = ${a + b}, so total = ${a + b} × ${part} = ${(a + b) * part}.` : `${y}: ${b} × ${part} = ${b * part}.`],
  };
}

function ratioDiff(): GenQ {
  let a: number, b: number;
  do { a = randInt(3, 9); b = randInt(1, 8); } while (b >= a);
  const part = randInt(2, 9);
  const d = (a - b) * part;
  const askSmall = Math.random() < 0.5;
  return {
    skill: 'ratio-diff', topicId: 'm-r-diff', numeric: true, worded: true,
    prompt: `Amy and Ben share sweets in the ratio ${a} : ${b}. Amy gets ${d} more than Ben. How many does ${askSmall ? 'Ben' : 'Amy'} get?`,
    answer: String((askSmall ? b : a) * part),
    steps: [`Difference in parts: ${a} − ${b} = ${a - b}.`, `${a - b} part${a - b > 1 ? 's' : ''} = ${d}, so 1 part = ${part}.`, `${askSmall ? 'Ben' : 'Amy'}: ${askSmall ? b : a} × ${part} = ${(askSmall ? b : a) * part}.`],
  };
}

function recipe(): GenQ {
  const from = pick([2, 3, 4, 5, 6]);
  let to = pick([2, 3, 4, 6, 8, 9, 10, 12, 15]);
  if (to === from) to = from * 2;
  const per = pick([10, 15, 20, 25, 30, 40, 50, 60]);
  const [item, unit] = pick([['flour', 'g'], ['sugar', 'g'], ['milk', 'ml'], ['butter', 'g'], ['rice', 'g']]);
  return {
    skill: 'recipe', topicId: 'm-r-recipe', numeric: true, worded: true,
    prompt: `A recipe for ${from} people uses ${per * from} ${unit} of ${item}. How much ${item} is needed for ${to} people? (in ${unit})`,
    answer: String(per * to),
    steps: [`Find the amount for 1 person: ${per * from} ÷ ${from} = ${per} ${unit}.`, `Multiply by ${to}: ${per} × ${to} = ${per * to} ${unit}.`],
  };
}

function currency(): GenQ {
  const [rate, sym, name] = pick([[1.2, '€', 'euros'], [1.25, '$', 'dollars'], [1.1, '€', 'euros'], [1.5, '$', 'dollars'], [2, 'CHF ', 'francs']] as [number, string, string][]);
  const toForeign = Math.random() < 0.55;
  if (toForeign) {
    const pounds = pick([10, 20, 30, 40, 50, 60, 80, 100, 120, 200]);
    const ans = +(pounds * rate).toFixed(2);
    return {
      skill: 'currency', topicId: 'm-r-currency', numeric: true, worded: true,
      prompt: `£1 = ${sym}${rate}. How many ${name} do you get for £${pounds}?`, answer: String(ans),
      steps: ['Pounds → other currency: multiply by the rate.', `${pounds} × ${rate} = ${ans}.`, `Answer: ${sym}${ans}.`],
    };
  }
  const pounds = pick([10, 20, 30, 40, 50, 60, 80, 100]);
  const foreign = +(pounds * rate).toFixed(2);
  return {
    skill: 'currency', topicId: 'm-r-currency', numeric: true, worded: true,
    prompt: `£1 = ${sym}${rate}. How many pounds is ${sym}${foreign}?`, answer: String(pounds),
    steps: ['Other currency → pounds: divide by the rate.', `${foreign} ÷ ${rate} = ${pounds}.`, `Answer: £${pounds}.`],
  };
}

function placeValue(): GenQ {
  const t = randInt(0, 2);
  if (t === 0) {
    const n = randInt(10000, 99999); const s = String(n); const k = randInt(0, 4);
    const names = ['ten thousands', 'thousands', 'hundreds', 'tens', 'ones'];
    const val = Number(s[k]) * 10 ** (4 - k);
    return { skill: 'place-value', topicId: 'm-place', numeric: true, prompt: `What is the value of the digit ${s[k]} in ${n.toLocaleString('en-GB')}? (write the number)`, answer: String(val),
      steps: [`The ${s[k]} is in the ${names[k]} column.`, `So its value is ${s[k]} × ${(10 ** (4 - k)).toLocaleString('en-GB')} = ${val.toLocaleString('en-GB')}.`] };
  }
  const x = randInt(11, 999) / pick([10, 100]);
  const p10 = pick([10, 100, 1000]);
  const mult = Math.random() < 0.5;
  const ans = mult ? +(x * p10).toFixed(4) : +(x / p10).toFixed(6);
  return { skill: 'place-value', topicId: 'm-place', numeric: true, prompt: `${x} ${mult ? '×' : '÷'} ${p10}`, answer: String(ans),
    steps: [`${mult ? '×' : '÷'} ${p10} moves every digit ${Math.log10(p10)} place${p10 > 10 ? 's' : ''} to the ${mult ? 'left' : 'right'}.`, `${x} → ${ans}.`] };
}

function ops(): GenQ {
  const t = randInt(0, 3);
  if (t === 0) { const a = randInt(120, 899), b = randInt(120, 899); return { skill: 'ops', topicId: 'm-ops', numeric: true, prompt: `${a} + ${b}`, answer: String(a + b), steps: [`Line up the columns and add ones, then tens, then hundreds, carrying when a column reaches 10 or more.`, `${a} + ${b} = ${a + b}.`] }; }
  if (t === 1) { const a = randInt(400, 999), b = randInt(110, a - 50); return { skill: 'ops', topicId: 'm-ops', numeric: true, prompt: `${a} − ${b}`, answer: String(a - b), steps: [`Column subtraction: take away ones, then tens, then hundreds, exchanging when the top digit is smaller.`, `Check by adding: ${a - b} + ${b} = ${a}.`] }; }
  if (t === 2) { const a = randInt(12, 49), b = randInt(11, 29); const tens = Math.floor(b / 10) * 10, ones = b % 10;
    return { skill: 'ops', topicId: 'm-ops', numeric: true, prompt: `${a} × ${b}`, answer: String(a * b), steps: [`Split ${b} into ${tens} + ${ones}.`, `${a} × ${tens} = ${a * tens}.`, `${a} × ${ones} = ${a * ones}.`, `${a * tens} + ${a * ones} = ${a * b}.`] }; }
  const d = randInt(3, 9), q = randInt(21, 140); return { skill: 'ops', topicId: 'm-ops', numeric: true, prompt: `${d * q} ÷ ${d}`, answer: String(q), steps: [`Short division (bus stop): divide each digit by ${d} from the left, carrying remainders.`, `${d * q} ÷ ${d} = ${q}. Check: ${q} × ${d} = ${d * q}.`] };
}

function tables(): GenQ {
  const a = randInt(2, 12), b = randInt(2, 12);
  if (Math.random() < 0.3) return { skill: 'tables', topicId: 'm-tables', numeric: true, prompt: `${a * b} ÷ ${a}`, answer: String(b), steps: [`Think: ${a} × ? = ${a * b}.`, `${a} × ${b} = ${a * b}, so the answer is ${b}.`] };
  return { skill: 'tables', topicId: 'm-tables', numeric: true, prompt: `${a} × ${b}`, answer: String(a * b), steps: [`${a} × ${b} = ${a * b}.`] };
}

function negatives(): GenQ {
  const a = randInt(-12, 12), b = randInt(1, 12);
  const t = randInt(0, 3);
  const f = (n: number) => (n < 0 ? `(−${-n})` : String(n));
  const show = (n: number) => (n < 0 ? `−${-n}` : String(n));
  if (t === 0) return { skill: 'negatives', topicId: 'm-neg', numeric: true, prompt: `${show(a)} − ${b}`, answer: String(a - b), steps: [`Start at ${show(a)} and move ${b} to the left on the number line.`, `Answer: ${show(a - b)}.`] };
  if (t === 1) return { skill: 'negatives', topicId: 'm-neg', numeric: true, prompt: `${show(a)} + ${b}`, answer: String(a + b), steps: [`Start at ${show(a)} and move ${b} to the right.`, `Answer: ${show(a + b)}.`] };
  if (t === 2) return { skill: 'negatives', topicId: 'm-neg', numeric: true, prompt: `${show(a)} − ${f(-b)}`, answer: String(a + b), steps: ['Subtracting a negative is the same as adding.', `${show(a)} + ${b} = ${show(a + b)}.`] };
  const c = randInt(-9, -2), d = randInt(-9, 9) || 3;
  return { skill: 'negatives', topicId: 'm-neg', numeric: true, prompt: `${show(c)} × ${f(d)}`, answer: String(c * d), steps: [`${-c} × ${Math.abs(d)} = ${Math.abs(c * d)}.`, d < 0 ? 'Same signs → positive.' : 'Different signs → negative.', `Answer: ${show(c * d)}.`] };
}

function bidmas(): GenQ {
  const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
  const t = randInt(0, 3);
  if (t === 0) return { skill: 'bidmas', topicId: 'm-bidmas', numeric: true, prompt: `${a} + ${b} × ${c}`, answer: String(a + b * c), steps: [`Multiply first: ${b} × ${c} = ${b * c}.`, `Then add: ${a} + ${b * c} = ${a + b * c}.`] };
  if (t === 1) return { skill: 'bidmas', topicId: 'm-bidmas', numeric: true, prompt: `(${a} + ${b}) × ${c}`, answer: String((a + b) * c), steps: [`Brackets first: ${a} + ${b} = ${a + b}.`, `Then ${a + b} × ${c} = ${(a + b) * c}.`] };
  if (t === 2) { const big = b * c + randInt(1, 20); return { skill: 'bidmas', topicId: 'm-bidmas', numeric: true, prompt: `${big} − ${b * c} ÷ ${c}`, answer: String(big - b), steps: [`Divide first: ${b * c} ÷ ${c} = ${b}.`, `Then ${big} − ${b} = ${big - b}.`] }; }
  return { skill: 'bidmas', topicId: 'm-bidmas', numeric: true, prompt: `${a}² + ${b} × ${c}`, answer: String(a * a + b * c), steps: [`Indices first: ${a}² = ${a * a}.`, `Then multiply: ${b} × ${c} = ${b * c}.`, `Then add: ${a * a} + ${b * c} = ${a * a + b * c}.`] };
}

const FDP: [string, string, string][] = [
  ['1/2', '0.5', '50%'], ['1/4', '0.25', '25%'], ['3/4', '0.75', '75%'], ['1/5', '0.2', '20%'], ['2/5', '0.4', '40%'],
  ['3/5', '0.6', '60%'], ['4/5', '0.8', '80%'], ['1/10', '0.1', '10%'], ['3/10', '0.3', '30%'], ['7/10', '0.7', '70%'],
  ['1/8', '0.125', '12.5%'], ['1/20', '0.05', '5%'], ['9/10', '0.9', '90%'], ['1/100', '0.01', '1%'],
];
function fdp(): GenQ {
  const [f, d, pc] = pick(FDP);
  const t = randInt(0, 3);
  if (t === 0) return { skill: 'fdp', topicId: 'm-fdp', numeric: true, prompt: `Write ${f} as a decimal.`, answer: d, steps: [`Divide the top by the bottom: ${f.replace('/', ' ÷ ')} = ${d}.`] };
  if (t === 1) return { skill: 'fdp', topicId: 'm-fdp', numeric: false, prompt: `Write ${d} as a percentage.`, answer: pc, accept: [pc.replace('%', '')], steps: [`Multiply by 100: ${d} × 100 = ${pc}.`] };
  if (t === 2) return { skill: 'fdp', topicId: 'm-fdp', numeric: false, prompt: `Write ${f} as a percentage.`, answer: pc, accept: [pc.replace('%', '')], steps: [`${f} = ${d} as a decimal.`, `× 100 → ${pc}.`] };
  return { skill: 'fdp', topicId: 'm-fdp', numeric: true, prompt: `Write ${pc} as a decimal.`, answer: d, steps: [`Divide by 100: ${pc.replace('%', '')} ÷ 100 = ${d}.`] };
}

function fracAmount(): GenQ {
  const den = pick([2, 3, 4, 5, 6, 8, 10]);
  let num = randInt(1, den - 1);
  while (gcd(num, den) !== 1) num = randInt(1, den - 1);
  const unit = randInt(2, 15);
  const total = den * unit;
  return { skill: 'frac-amount', topicId: 'm-frac-amount', numeric: true, prompt: `Find ${num}/${den} of ${total}.`, answer: String(num * unit),
    steps: [`Divide by the bottom: ${total} ÷ ${den} = ${unit}.`, `Multiply by the top: ${unit} × ${num} = ${num * unit}.`] };
}

function pctAmount(): GenQ {
  const pc = pick([10, 20, 25, 30, 5, 15, 50, 75, 1, 40, 35]);
  const amount = pick([20, 40, 60, 80, 120, 200, 240, 300, 360, 400, 500]);
  const ans = (pc * amount) / 100;
  const tenth = amount / 10;
  const steps = pc === 50 ? [`50% is half: ${amount} ÷ 2 = ${ans}.`]
    : pc === 25 ? [`25% is a quarter: ${amount} ÷ 4 = ${ans}.`]
      : pc === 75 ? [`25% = ${amount} ÷ 4 = ${amount / 4}.`, `75% = 3 × ${amount / 4} = ${ans}.`]
        : pc === 1 ? [`1% = ${amount} ÷ 100 = ${ans}.`]
          : pc % 10 === 0 ? [`10% = ${amount} ÷ 10 = ${tenth}.`, `${pc}% = ${pc / 10} × ${tenth} = ${ans}.`]
            : pc === 5 ? [`10% = ${amount} ÷ 10 = ${tenth}.`, `5% is half of 10%: ${tenth} ÷ 2 = ${ans}.`]
              : [`10% = ${tenth}, so 5% = ${tenth / 2}.`, `${pc}% = ${pc - 5}% + 5% = ${((pc - 5) / 10) * tenth} + ${tenth / 2} = ${ans}.`];
  return { skill: 'pct-amount', topicId: 'm-pct-amount', numeric: true, prompt: `Find ${pc}% of ${amount}.`, answer: String(ans), steps };
}

function equation(): GenQ {
  const x = randInt(2, 12), a = randInt(2, 9), b = randInt(1, 20);
  const t = randInt(0, 3);
  const acc = (v: number) => [`x=${v}`, `x = ${v}`];
  if (t === 0) return { skill: 'equations', topicId: 'm-equations', numeric: true, prompt: `Solve x + ${b} = ${x + b}`, answer: String(x), accept: acc(x), steps: [`Subtract ${b} from both sides.`, `x = ${x + b} − ${b} = ${x}.`] };
  if (t === 1) return { skill: 'equations', topicId: 'm-equations', numeric: true, prompt: `Solve ${a}x = ${a * x}`, answer: String(x), accept: acc(x), steps: [`Divide both sides by ${a}.`, `x = ${a * x} ÷ ${a} = ${x}.`] };
  if (t === 2) return { skill: 'equations', topicId: 'm-equations', numeric: true, prompt: `Solve ${a}x + ${b} = ${a * x + b}`, answer: String(x), accept: acc(x), steps: [`Subtract ${b}: ${a}x = ${a * x}.`, `Divide by ${a}: x = ${x}.`] };
  return { skill: 'equations', topicId: 'm-equations', numeric: true, prompt: `Solve ${a}x − ${b} = ${a * x - b}`, answer: String(x), accept: acc(x), steps: [`Add ${b}: ${a}x = ${a * x}.`, `Divide by ${a}: x = ${x}.`] };
}

export const SKILLS: Skill[] = [
  { id: 'angles-line', label: 'Angles on a straight line', group: 'Angles', topicId: 'm-angle-rules', make: angleLine },
  { id: 'angles-point', label: 'Angles around a point', group: 'Angles', topicId: 'm-angle-rules', make: anglePoint },
  { id: 'angles-tri', label: 'Angles in a triangle', group: 'Angles', topicId: 'm-angle-tri', make: angleTriangle },
  { id: 'angles-quad', label: 'Angles in quadrilaterals', group: 'Angles', topicId: 'm-angle-quad', make: angleQuad },
  { id: 'ratio-simplify', label: 'Simplify a ratio', group: 'Ratio', topicId: 'm-r-simplify', make: ratioSimplify },
  { id: 'ratio-fraction', label: 'Ratio to fraction', group: 'Ratio', topicId: 'm-r-fraction', make: ratioFraction },
  { id: 'ratio-divide', label: 'Divide in a ratio', group: 'Ratio', topicId: 'm-r-divide', make: ratioDivide },
  { id: 'ratio-part', label: 'Ratio given a part', group: 'Ratio', topicId: 'm-r-part', make: ratioPart },
  { id: 'ratio-diff', label: 'Ratio given the difference', group: 'Ratio', topicId: 'm-r-diff', make: ratioDiff },
  { id: 'recipe', label: 'Recipes', group: 'Ratio', topicId: 'm-r-recipe', make: recipe },
  { id: 'currency', label: 'Currency conversion', group: 'Ratio', topicId: 'm-r-currency', make: currency },
  { id: 'place-value', label: 'Place value', group: 'Numeracy', topicId: 'm-place', make: placeValue },
  { id: 'ops', label: 'Written methods (+ − × ÷)', group: 'Numeracy', topicId: 'm-ops', make: ops },
  { id: 'tables', label: 'Times tables', group: 'Numeracy', topicId: 'm-tables', make: tables },
  { id: 'negatives', label: 'Negative numbers', group: 'Numeracy', topicId: 'm-neg', make: negatives },
  { id: 'bidmas', label: 'BIDMAS', group: 'Numeracy', topicId: 'm-bidmas', make: bidmas },
  { id: 'fdp', label: 'Fractions, decimals, percentages', group: 'Numeracy', topicId: 'm-fdp', make: fdp },
  { id: 'frac-amount', label: 'Fraction of an amount', group: 'Numeracy', topicId: 'm-frac-amount', make: fracAmount },
  { id: 'pct-amount', label: 'Percentage of an amount', group: 'Numeracy', topicId: 'm-pct-amount', make: pctAmount },
  { id: 'equations', label: 'Simple equations', group: 'Numeracy', topicId: 'm-equations', make: equation },
];
