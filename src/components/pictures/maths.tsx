import { Ar, Bar, E, INK, R, T, type Picture } from './kit';

const RED = '#ff9aa2', BLUE = '#a0c4ff', YEL = '#ffe08a', GRN = '#b9fbc0';

export const MATHS_PICTURES: Record<string, Picture> = {
  'ratio-simplify': {
    alt: 'The picture shows 6 red counters and 9 blue counters split into 3 equal groups. Each group has 2 red and 3 blue, so 6 to 9 simplifies to 2 to 3.',
    draw: () => (
      <>
        {[0, 1, 2].map((g) => (
          <g key={g}>
            <rect x={14 + g * 100} y={22} width={92} height={74} rx={10} fill="#fff" stroke={INK} strokeDasharray="4 3" />
            {[0, 1].map((i) => <circle key={i} cx={36 + g * 100 + i * 24} cy={44} r={9} fill={RED} stroke={INK} />)}
            {[0, 1, 2].map((i) => <circle key={i} cx={30 + g * 100 + i * 24} cy={74} r={9} fill={BLUE} stroke={INK} />)}
          </g>
        ))}
        <T x={160} y={128} s={18}>6 : 9</T>
        <T x={160} y={150} s={12} w={500}>÷ 3 groups</T>
        <T x={160} y={172} s={18}>= 2 : 3</T>
      </>
    ),
  },
  'ratio-fraction': {
    alt: 'The picture shows a bar of 5 equal boxes: 2 red and 3 blue. Red is 2 fifths of the whole and blue is 3 fifths.',
    draw: () => (
      <>
        <T x={160} y={30} s={14}>red : blue = 2 : 3</T>
        <Bar x={58} y={52} n={5} size={38} h={38} f={(i) => (i < 2 ? RED : BLUE)} />
        <T x={160} y={116} s={12} w={500}>2 + 3 = 5 parts altogether</T>
        <T x={100} y={150} s={16}>red = 2/5</T>
        <T x={220} y={150} s={16}>blue = 3/5</T>
      </>
    ),
  },
  'ratio-part': {
    alt: 'The picture shows a bar model: boys have 2 boxes and girls have 3 boxes. The 2 boys boxes make 12, so each box is 6 and the girls have 18.',
    draw: () => (
      <>
        <T x={20} y={52} a="start" s={13}>Boys</T>
        <Bar x={70} y={34} n={2} size={40} h={28} f={BLUE} labels={() => 6} />
        <T x={170} y={53} a="start" s={12} w={500}>= 12 (we know this)</T>
        <T x={20} y={102} a="start" s={13}>Girls</T>
        <Bar x={70} y={84} n={3} size={40} h={28} f={RED} labels={() => 6} />
        <T x={213} y={103} a="start" s={12} w={500}>= ?</T>
        <T x={160} y={150} s={14}>1 box = 12 ÷ 2 = 6, so girls = 3 × 6 = 18</T>
      </>
    ),
  },
  'ratio-diff': {
    alt: 'The picture shows two bars lined up. A has 5 boxes and B has 2 boxes. The 3 extra boxes are the difference of 15, so one box is 5.',
    draw: () => (
      <>
        <T x={20} y={52} a="start" s={13}>A</T>
        <Bar x={44} y={34} n={5} size={40} h={28} f={(i) => (i >= 2 ? YEL : BLUE)} />
        <T x={20} y={100} a="start" s={13}>B</T>
        <Bar x={44} y={82} n={2} size={40} h={28} f={BLUE} />
        <path d="M130 120 Q 196 140 262 120" fill="none" stroke={INK} strokeWidth={2} />
        <T x={196} y={150} s={13}>difference: 3 boxes = 15</T>
        <T x={196} y={170} s={13}>so 1 box = 5</T>
      </>
    ),
  },
  recipe: {
    alt: 'The picture shows a pancake recipe for 4 people using 200 grams of flour. For 6 people, multiply by 1.5 to get 300 grams.',
    draw: () => (
      <>
        <E x={60} y={56} s={44}>🥞</E>
        <T x={60} y={104} s={13}>4 people</T>
        <T x={60} y={124} s={13} w={500}>200 g flour</T>
        <Ar x1={110} y1={80} x2={208} y2={80} w={3} />
        <T x={159} y={70} s={14}>× 1.5</T>
        <T x={159} y={100} s={11} w={500}>(÷ 4, then × 6)</T>
        <E x={260} y={56} s={44}>🥞</E>
        <T x={260} y={104} s={13}>6 people</T>
        <T x={260} y={124} s={13} w={500}>300 g flour</T>
        <T x={160} y={164} s={12} w={500}>Find the amount for 1 person, then multiply.</T>
      </>
    ),
  },
  currency: {
    alt: 'The picture shows pounds and euros with an exchange rate of 1 pound to 1 euro 20. Going from pounds to euros you multiply by 1.2; going back you divide by 1.2.',
    draw: () => (
      <>
        <circle cx={70} cy={80} r={42} fill={YEL} stroke={INK} strokeWidth={2} />
        <T x={70} y={92} s={34}>£</T>
        <circle cx={250} cy={80} r={42} fill={BLUE} stroke={INK} strokeWidth={2} />
        <T x={250} y={92} s={34}>€</T>
        <Ar x1={118} y1={62} x2={204} y2={62} w={3} />
        <T x={160} y={52} s={13}>× 1.2</T>
        <Ar x1={204} y1={100} x2={118} y2={100} w={3} />
        <T x={160} y={120} s={13}>÷ 1.2</T>
        <T x={160} y={160} s={13}>£1 = €1.20 · £50 = €60</T>
      </>
    ),
  },
  'place-value': {
    alt: 'The picture shows a place value chart with columns for thousands, hundreds, tens, ones, tenths and hundredths, holding the number 4,382 point 1 5.',
    draw: () => {
      const cols = ['Th', 'H', 'T', 'O', '•', 't', 'h'];
      const digits = ['4', '3', '8', '2', '.', '1', '5'];
      return (
        <>
          {cols.map((c, i) => (
            <g key={c}>
              {c !== '•' && <R x={20 + i * 41} y={40} w={38} h={30} f={i > 4 ? GRN : BLUE} label={c} ls={13} />}
              {c !== '•' && <R x={20 + i * 41} y={74} w={38} h={42} f="#fff" label={digits[i]} ls={22} />}
              {c === '•' && <circle cx={39 + i * 41} cy={100} r={5} fill={INK} />}
            </g>
          ))}
          <T x={160} y={142} s={12} w={500}>Each column is 10 times bigger than the one to its right.</T>
          <T x={160} y={164} s={12} w={500}>× 10 moves the digits one place left.</T>
        </>
      );
    },
  },
  'written-methods': {
    alt: 'The picture shows a column addition: 347 plus 285 equals 632, with the carried ones written small above the columns.',
    draw: () => (
      <>
        <T x={110} y={38} s={11} c="#d62828">1 1</T>
        <T x={140} y={64} a="end" s={26}>347</T>
        <T x={140} y={96} a="end" s={26}>+ 285</T>
        <line x1={60} y1={106} x2={146} y2={106} stroke={INK} strokeWidth={2.5} />
        <T x={140} y={136} a="end" s={26}>632</T>
        <line x1={60} y1={146} x2={146} y2={146} stroke={INK} strokeWidth={2.5} />
        <T x={240} y={60} s={12} w={500}>Line up the columns.</T>
        <T x={240} y={84} s={12} w={500}>Add ones, tens,</T>
        <T x={240} y={100} s={12} w={500}>then hundreds.</T>
        <T x={240} y={124} s={12} w={500}>Carry when a column</T>
        <T x={240} y={140} s={12} w={500}>makes 10 or more.</T>
      </>
    ),
  },
  'times-tables': {
    alt: 'The picture shows a 12 by 12 times table grid with the row for 7 and the column for 8 highlighted, meeting at 56.',
    draw: () => (
      <>
        {Array.from({ length: 12 }, (_, r) => Array.from({ length: 12 }, (_, c) => {
          const hit = r === 6 || c === 7;
          return <rect key={`${r}-${c}`} x={20 + c * 12} y={20 + r * 12} width={11} height={11} fill={r === 6 && c === 7 ? '#d62828' : hit ? YEL : '#fff'} stroke="#c9c9d6" strokeWidth={0.5} />;
        }))}
        <T x={240} y={70} s={30}>7 × 8</T>
        <T x={240} y={110} s={36} c="#d62828">56</T>
        <T x={240} y={146} s={12} w={500}>5, 6, 7, 8:</T>
        <T x={240} y={162} s={12} w={500}>56 = 7 × 8</T>
      </>
    ),
  },
  bidmas: {
    alt: 'The picture shows BIDMAS as steps going down: Brackets first, then Indices, then Division and Multiplication, then Addition and Subtraction.',
    draw: () => (
      <>
        {[['B', 'Brackets', '#ffadad'], ['I', 'Indices (powers)', '#ffd6a5'], ['D M', 'Divide and Multiply', '#caffbf'], ['A S', 'Add and Subtract', '#9bf6ff']].map(([k, t, f], i) => (
          <g key={k}>
            <R x={12 + i * 22} y={18 + i * 38} w={160} h={32} f={f} />
            <T x={32 + i * 22} y={40 + i * 38} s={15}>{k}</T>
            <T x={56 + i * 22} y={39 + i * 38} a="start" s={11} w={500}>{t}</T>
          </g>
        ))}
        <T x={276} y={70} s={14}>3 + 4 × 2</T>
        <T x={276} y={96} s={14}>= 3 + 8</T>
        <T x={276} y={122} s={14}>= 11</T>
      </>
    ),
  },
  fdp: {
    alt: 'The picture shows a circle with three quarters shaded. Three quarters is the same as 0.75 and 75 percent.',
    draw: () => (
      <>
        <circle cx={80} cy={90} r={56} fill="#fff" stroke={INK} strokeWidth={2} />
        <path d="M80 90 L80 34 A56 56 0 1 1 24 90 Z" fill={BLUE} stroke={INK} strokeWidth={2} />
        <T x={210} y={60} s={26}>3/4</T>
        <T x={210} y={100} s={26}>= 0.75</T>
        <T x={210} y={140} s={26}>= 75%</T>
      </>
    ),
  },
  'fraction-amount': {
    alt: 'The picture shows 40 sweets split into 5 equal bags of 8. Three of the bags are highlighted: 3 fifths of 40 is 24.',
    draw: () => (
      <>
        <T x={160} y={26} s={14}>3/5 of 40</T>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <R x={18 + i * 58} y={44} w={52} h={60} r={10} f={i < 3 ? YEL : '#fff'} />
            <E x={44 + i * 58} y={66} s={20}>🍬</E>
            <T x={44 + i * 58} y={96} s={14}>8</T>
          </g>
        ))}
        <T x={160} y={134} s={13} w={500}>÷ 5 (bottom): 40 ÷ 5 = 8 in each bag</T>
        <T x={160} y={158} s={13} w={500}>× 3 (top): 3 × 8 = 24</T>
      </>
    ),
  },
  'percent-amount': {
    alt: 'The picture shows a bar worth 60 split into 10 equal pieces of 6. Each piece is 10 percent. 35 percent is three and a half pieces: 21.',
    draw: () => (
      <>
        <T x={160} y={26} s={14}>35% of 60</T>
        <Bar x={14} y={42} n={10} size={26} h={34} f={(i) => (i < 3 ? GRN : i === 3 ? YEL : '#fff')} labels={() => 6} />
        <T x={160} y={96} s={11} w={500}>each piece = 10% = 60 ÷ 10 = 6</T>
        <T x={160} y={124} s={13}>30% = 3 × 6 = 18</T>
        <T x={160} y={146} s={13}>5% = half of 6 = 3</T>
        <T x={160} y={170} s={14}>35% = 18 + 3 = 21</T>
      </>
    ),
  },
  equations: {
    alt: 'The picture shows a balance scale. On one side is 2x plus 3, on the other is 11. Take 3 from both sides, then halve: x equals 4.',
    draw: () => (
      <>
        <polygon points="160,150 145,170 175,170" fill={INK} />
        <line x1={160} y1={150} x2={160} y2={70} stroke={INK} strokeWidth={3} />
        <line x1={60} y1={70} x2={260} y2={70} stroke={INK} strokeWidth={4} />
        <path d="M60 70 L40 110 L80 110 Z" fill="none" stroke={INK} />
        <path d="M260 70 L240 110 L280 110 Z" fill="none" stroke={INK} />
        <R x={22} y={112} w={76} h={26} f={BLUE} label="2x + 3" ls={14} />
        <R x={222} y={112} w={76} h={26} f={RED} label="11" ls={14} />
        <T x={160} y={30} s={13} w={500}>Do the same to both sides</T>
        <T x={160} y={50} s={14}>− 3 → 2x = 8 → ÷ 2 → x = 4</T>
      </>
    ),
  },
};
