import { Ar, E, INK, R, T, Tile, type Picture } from './kit';

export const ENGLISH_PICTURES: Record<string, Picture> = {
  comprehension: {
    alt: 'The picture shows a magnifying glass over lines of text, with one key line highlighted: scan the extract for the question’s key word, then copy the evidence.',
    draw: () => (
      <>
        <R x={20} y={20} w={170} h={140} f="#fff" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={34} y={38 + i * 16} width={i === 3 ? 140 : 120 - (i % 3) * 18} height={7} rx={3} fill={i === 3 ? '#ffd166' : '#ced4da'} />)}
        <circle cx={150} cy={96} r={32} fill="rgba(160,196,255,0.25)" stroke={INK} strokeWidth={4} />
        <line x1={172} y1={120} x2={200} y2={150} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <T x={260} y={60} s={13}>1. Key word</T>
        <T x={260} y={90} s={13}>2. Find it</T>
        <T x={260} y={120} s={13}>3. Use their</T>
        <T x={260} y={136} s={13}>words</T>
      </>
    ),
  },
  'key-terms-1': {
    alt: 'The picture shows four tiles: metaphor, my heart was frozen; short sentence, I won; listing, a list of words; and triadic listing, three things for impact.',
    draw: () => (
      <>
        <Tile x={8} y={14} w={148} h={74} f="#a0c4ff" icon="❄️" title="Metaphor" sub="“my heart was frozen”" />
        <Tile x={164} y={14} w={148} h={74} f="#ffadad" icon="⚡" title="Short sentence" sub="“I won.”" />
        <Tile x={8} y={94} w={148} h={74} f="#caffbf" icon="📝" title="Listing" sub="bats, balls, gloves, helmets" />
        <Tile x={164} y={94} w={148} h={74} f="#ffd6a5" icon="3️⃣" title="Triadic listing" sub="“brave, bold and brilliant”" />
      </>
    ),
  },
  'key-terms-2': {
    alt: 'The picture shows three tiles: anecdote, a short personal story; statistic, facts with numbers like 75 percent; and repetition, repeating a word or phrase.',
    draw: () => (
      <>
        <Tile x={8} y={20} w={98} h={140} f="#ffd6a5" icon="💬" title="Anecdote" sub="a personal story" />
        <Tile x={111} y={20} w={98} h={140} f="#a0c4ff" icon="📊" title="Statistic" sub="75% agreed" />
        <Tile x={214} y={20} w={98} h={140} f="#caffbf" icon="🔁" title="Repetition" sub="never, never, never" />
      </>
    ),
  },
  persuasive: {
    alt: 'The picture shows a speaker with speech bubbles for the bonus persuasive techniques: you for direct address, a question mark for a rhetorical question, an exclamation for imperatives, like a lion for a simile, the greatest for a superlative, and heartbreaking for emotive language.',
    draw: () => (
      <>
        <E x={50} y={110} s={54}>🧑‍🏫</E>
        {[['“You can…”', 'direct address', 108, 10], ['“Why wait?”', 'rhetorical question', 218, 10], ['“Start today!”', 'imperative', 108, 64], ['“like a lion”', 'simile', 218, 64], ['“the greatest”', 'superlative', 108, 118], ['“heartbreaking”', 'emotive', 218, 118]].map(([q, n, x, y]) => (
          <g key={n as string}>
            <rect x={x as number} y={y as number} width={98} height={46} rx={14} fill="#fff" stroke={INK} strokeWidth={1.5} />
            <T x={(x as number) + 49} y={(y as number) + 19} s={11}>{q}</T>
            <T x={(x as number) + 49} y={(y as number) + 35} s={9} w={500}>{n}</T>
          </g>
        ))}
      </>
    ),
  },
  pea: {
    alt: 'The picture shows a paragraph built from blocks: Point at the bottom, then Evidence, then Analysis, with the Artemis Aim star on top: the effect on the reader.',
    draw: () => (
      <>
        <R x={70} y={128} w={180} h={34} f="#a0c4ff" label="P · Point" ls={14} />
        <R x={80} y={90} w={160} h={34} f="#ffd6a5" label="E · Evidence “quote”" ls={13} />
        <R x={90} y={52} w={140} h={34} f="#caffbf" label="A · Analysis" ls={14} />
        <E x={160} y={28} s={26}>⭐</E>
        <T x={244} y={34} a="start" s={11}>Reader effect</T>
        <T x={30} y={30} a="start" s={11} w={500}>× 3–4</T>
      </>
    ),
  },
  'word-classes': {
    alt: 'The picture shows the sentence: The brave girl ran quickly. Brave is an adjective, girl is a noun, ran is a verb and quickly is an adverb.',
    draw: () => (
      <>
        {[['The', '', '#fff'], ['brave', 'adjective', '#ffd6a5'], ['girl', 'noun', '#a0c4ff'], ['ran', 'verb', '#ffadad'], ['quickly', 'adverb', '#caffbf']].map(([w, c, f], i) => {
          const x = [14, 66, 138, 200, 252][i], wd = [46, 66, 56, 46, 64][i];
          return (
            <g key={w}>
              <R x={x} y={50} w={wd} h={36} f={f} label={w} ls={14} />
              {c && <><Ar x1={x + wd / 2} y1={120} x2={x + wd / 2} y2={92} w={1.5} /><T x={x + wd / 2} y={136} s={11}>{c}</T></>}
            </g>
          );
        })}
        <T x={160} y={30} s={12} w={500}>Name the word class in your analysis</T>
        <T x={160} y={166} s={11} w={500}>pronouns replace nouns: I, you, she, we, they</T>
      </>
    ),
  },
  punctuation: {
    alt: 'The picture shows punctuation marks with their jobs: full stop, comma, apostrophe, question mark, exclamation mark, speech marks, colon and semicolon.',
    draw: () => (
      <>
        {[['.', 'full stop'], [',', 'comma'], ['’', 'apostrophe'], ['?', 'question'], ['!', 'exclamation'], ['“ ”', 'speech marks'], [':', 'colon'], [';', 'semicolon']].map(([m, n], i) => {
          const x = 14 + (i % 4) * 76, y = 14 + Math.floor(i / 4) * 82;
          return (
            <g key={n}>
              <R x={x} y={y} w={70} h={74} f={['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'][i]} />
              <T x={x + 35} y={y + 44} s={34}>{m}</T>
              <T x={x + 35} y={y + 66} s={10}>{n}</T>
            </g>
          );
        })}
      </>
    ),
  },
  'spelling-traps': {
    alt: 'The picture shows three signposts: there means a place, their means belonging to them, and they’re means they are.',
    draw: () => (
      <>
        <rect x={156} y={30} width={8} height={140} fill="#8d6e63" />
        <path d="M60 30 L210 30 L230 46 L210 62 L60 62 Z" fill="#a0c4ff" stroke={INK} strokeWidth={1.5} /><T x={140} y={51} s={13}>there → a place</T>
        <path d="M260 72 L110 72 L90 88 L110 104 L260 104 Z" fill="#ffd6a5" stroke={INK} strokeWidth={1.5} /><T x={176} y={93} s={13}>their → belongs to them</T>
        <path d="M60 114 L210 114 L230 130 L210 146 L60 146 Z" fill="#caffbf" stroke={INK} strokeWidth={1.5} /><T x={140} y={135} s={13}>they’re → they are</T>
        <T x={160} y={172} s={11} w={500}>Also: your / you’re · its / it’s · to / too / two</T>
      </>
    ),
  },
  article: {
    alt: 'The picture shows a newspaper article with a big headline, a strong opening line, paragraphs, and a checklist: headline, hook, paragraphs, check your spelling and punctuation.',
    draw: () => (
      <>
        <R x={20} y={14} w={170} h={152} f="#fff" />
        <rect x={32} y={26} width={146} height={16} rx={3} fill={INK} />
        <T x={105} y={38} s={10} c="#fff">EQUAL CHANCES FOR ALL</T>
        <rect x={32} y={50} width={146} height={8} rx={3} fill="#ffd166" />
        {[0, 1, 2].map((i) => <rect key={i} x={32} y={66 + i * 12} width={146 - i * 20} height={6} rx={3} fill="#ced4da" />)}
        {[0, 1, 2].map((i) => <rect key={i} x={32} y={112 + i * 12} width={140 - i * 30} height={6} rx={3} fill="#ced4da" />)}
        {['Headline', 'Hook first line', 'Paragraphs', 'Check SPaG'].map((t, i) => (
          <g key={t}><T x={206} y={44 + i * 32} a="start" s={13} c="#2a9d8f">✓</T><T x={222} y={44 + i * 32} a="start" s={12}>{t}</T></g>
        ))}
      </>
    ),
  },
};
