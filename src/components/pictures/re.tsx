import { Ar, E, INK, R, T, Tile, type Picture } from './kit';
import { KEY_WORDS, re } from '../../content/re';

/** Picture tiles for one "Key words" card: the same five (or fewer) words the card lists. */
function keyWordTiles(terms: string[]) {
  const w = 312 / terms.length;
  const longest = Math.max(...terms.flatMap((t) => t.split(' ').map((p) => p.length)));
  const ts = terms.length >= 5 && longest > 10 ? 8 : terms.length >= 5 && longest > 7 ? 9.5 : 11;
  return terms.map((term, i) => {
    const k = KEY_WORDS.find((x) => x.term === term);
    return <Tile key={term} x={4 + i * w} y={30} w={w - 4} h={120} f={['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#a0c4ff'][i % 5]}
      icon={k?.icon ?? '📖'} title={term.split(' ')[0]} sub={term.split(' ').slice(1).join(' ') || undefined} ts={ts} ss={ts} />;
  });
}

/** One picture per generated "Key words" card, named keywords-<topic>-<n> (see Lessons.tsx). */
function keyWordPictures(): Record<string, Picture> {
  const out: Record<string, Picture> = {};
  for (const topic of ['r-terms-creation', 'r-terms-prophecy']) {
    const terms = re.flashcards.filter((c) => c.topicId === topic).map((c) => c.front);
    for (let i = 0; i < terms.length; i += 5) {
      const chunk = terms.slice(i, i + 5);
      out[`keywords-${topic}-${i / 5}`] = { alt: `The picture shows the key words ${chunk.join(', ')} as picture tiles.`, draw: () => <>{keyWordTiles(chunk)}</> };
    }
  }
  return out;
}

export const RE_PICTURES: Record<string, Picture> = {
  'seven-days': {
    alt: 'The picture shows the seven days of creation in Genesis 1: day 1 light, day 2 sky, day 3 land, seas and plants, day 4 sun, moon and stars, day 5 birds and fish, day 6 animals and people, and day 7 rest.',
    draw: () => (
      <>
        {[['☀️', 'Light'], ['☁️', 'Sky'], ['🌿', 'Land|and plants'], ['🌙', 'Sun, moon|and stars'], ['🐟', 'Birds|and fish'], ['🦁', 'Animals|and people'], ['🕯️', 'Rest']].map(([ic, t], i) => {
          const x = 8 + (i % 4) * 77, y = i < 4 ? 12 : 94;
          const dx = i >= 4 ? 38 : 0;
          return (
            <g key={t}>
              <rect x={x + dx} y={y} width={72} height={76} rx={8} fill={i === 6 ? '#fdffb6' : '#fff'} stroke={INK} strokeWidth={1.5} />
              <T x={x + dx + 12} y={y + 16} s={11}>{i + 1}</T>
              <E x={x + dx + 36} y={y + 32} s={22}>{ic}</E>
              {t.split('|').map((line, j, all) => <T key={line} x={x + dx + 36} y={y + 66 - (all.length - 1 - j) * 10} s={9}>{line}</T>)}
            </g>
          );
        })}
      </>
    ),
  },
  'garden-eden': {
    alt: 'The picture shows the Garden of Eden from Genesis 2, with trees, a river, animals, and Adam and Eve, who were put there to till it and keep it.',
    bg: '#e8f8e8',
    draw: () => (
      <>
        <path d="M0 130 C 80 120, 120 150, 200 135 S 300 120, 320 128 L320 180 L0 180 Z" fill="#9bd18b" />
        <path d="M0 150 C 90 140, 160 170, 320 150" fill="none" stroke="#4ea8de" strokeWidth={8} />
        <E x={40} y={90} s={48}>🌳</E><E x={160} y={70} s={58}>🌳</E><E x={280} y={92} s={44}>🌴</E>
        <E x={110} y={120} s={30}>🧍‍♂️</E><E x={210} y={120} s={30}>🧍‍♀️</E><E x={250} y={140} s={22}>🦌</E><E x={70} y={140} s={20}>🐑</E>
        <T x={160} y={22} s={13}>“to till it and keep it” (Genesis 2:15)</T>
      </>
    ),
  },
  'literary-forms': {
    alt: 'The picture shows a bookshelf of different literary forms in the Bible: poetry, history, story, law, letters and prophecy. Knowing the type of writing helps you understand what the author meant.',
    draw: () => (
      <>
        <rect x={14} y={140} width={292} height={10} fill="#8d6e63" />
        {[['Poetry', '#ffadad'], ['History', '#ffd6a5'], ['Story', '#fdffb6'], ['Law', '#caffbf'], ['Letters', '#a0c4ff'], ['Prophecy', '#bdb2ff']].map(([n, f], i) => (
          <g key={n}>
            <rect x={24 + i * 47} y={40 + (i % 2) * 10} width={40} height={100 - (i % 2) * 10} rx={4} fill={f} stroke={INK} strokeWidth={1.5} />
            <text x={44 + i * 47} y={92} fontSize={12} fontWeight={700} fill={INK} textAnchor="middle" transform={`rotate(-90 ${44 + i * 47} 92)`} fontFamily="system-ui, sans-serif">{n}</text>
          </g>
        ))}
        <T x={160} y={24} s={12}>Type of writing → what the author meant</T>
        <T x={160} y={170} s={11} w={500}>Genesis teaches truth about God through a poetic story</T>
      </>
    ),
  },
  'big-bang': {
    alt: 'The picture shows the Big Bang about 13.8 billion years ago, then galaxies, then the Earth, then life. Science explains how; faith explains who and why.',
    bg: '#1b1f3b',
    draw: () => (
      <>
        <circle cx={40} cy={80} r={16} fill="#ffd166" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1={40} y1={80} x2={40 + 28 * Math.cos(i * 0.785)} y2={80 + 28 * Math.sin(i * 0.785)} stroke="#ffd166" strokeWidth={2} />)}
        <T x={40} y={128} s={10} c="#fff">Big Bang</T><T x={40} y={142} s={9} c="#fff" w={500}>13.8 bn years ago</T>
        <Ar x1={78} y1={80} x2={110} y2={80} c="#fff" />
        <E x={140} y={80} s={30}>🌌</E><T x={140} y={128} s={10} c="#fff">galaxies</T>
        <Ar x1={164} y1={80} x2={190} y2={80} c="#fff" />
        <E x={216} y={80} s={30}>🌍</E><T x={216} y={128} s={10} c="#fff">Earth</T>
        <Ar x1={240} y1={80} x2={262} y2={80} c="#fff" />
        <E x={288} y={80} s={30}>🌱</E><T x={288} y={128} s={10} c="#fff">life</T>
        <T x={160} y={26} s={13} c="#fff">Science: how? · Faith: who and why?</T>
        <T x={160} y={166} s={10} c="#fff" w={500}>First proposed by Georges Lemaître, a Catholic priest</T>
      </>
    ),
  },
  'faith-reason': {
    alt: 'The picture shows three views. Creationism says only a literal reading of Genesis counts. Scientism says only science counts. The Catholic view, in the middle, uses both faith and science.',
    draw: () => (
      <>
        <Tile x={8} y={30} w={96} h={110} f="#ffadad" icon="📜" title="Creationism" sub="Genesis only" />
        <Tile x={112} y={20} w={96} h={130} f="#caffbf" icon="✝️" title="Catholic view" sub="faith AND science" />
        <Tile x={216} y={30} w={96} h={110} f="#a0c4ff" icon="🧪" title="Scientism" sub="science only" />
        <T x={56} y={160} s={18} c="#d62828">✗</T><T x={160} y={170} s={18} c="#2a9d8f">✓</T><T x={264} y={160} s={18} c="#d62828">✗</T>
      </>
    ),
  },
  stewardship: {
    alt: 'The picture shows hands caring for the Earth, with recycling, planting trees and saving energy: looking after God’s creation as caretakers, not owners.',
    draw: () => (
      <>
        <E x={160} y={70} s={60}>🌍</E>
        <E x={160} y={128} s={40}>🤲</E>
        <Tile x={10} y={36} w={84} h={70} f="#caffbf" icon="♻️" title="Recycle" />
        <Tile x={226} y={36} w={84} h={70} f="#fdffb6" icon="💡" title="Save energy" />
        <Tile x={10} y={112} w={84} h={60} f="#d8f3dc" icon="🌳" title="Plant trees" />
        <Tile x={226} y={112} w={84} h={60} f="#a0c4ff" icon="🐝" title="Protect wildlife" ts={10} />
        <T x={160} y={20} s={12}>Caretakers, not owners</T>
      </>
    ),
  },
  'laudato-si': {
    alt: 'The picture shows the Earth as a house: our common home, from Pope Francis’s 2015 letter Laudato Si’, which links the cry of the earth with the cry of the poor.',
    draw: () => (
      <>
        <path d="M70 80 L160 20 L250 80 Z" fill="#e76f51" stroke={INK} strokeWidth={2} />
        <rect x={86} y={80} width={148} height={84} fill="#fff" stroke={INK} strokeWidth={2} />
        <E x={160} y={120} s={50}>🌍</E>
        <T x={160} y={64} s={12} c="#fff">Laudato Si’ 2015</T>
        <T x={44} y={110} s={11}>“Our</T><T x={44} y={124} s={11}>common</T><T x={44} y={138} s={11}>home”</T>
        <E x={278} y={104} s={28}>🕊️</E>
        <T x={278} y={136} s={9} w={500}>St Francis</T>
      </>
    ),
  },
  prayer: {
    alt: 'The picture shows four types of prayer, ACTS: Adoration, praising God; Contrition, saying sorry; Thanksgiving, saying thank you; and Supplication, asking for help.',
    draw: () => (
      <>
        <Tile x={8} y={20} w={74} h={140} f="#ffd6a5" icon="🙌" title="A" sub="Adoration" ts={16} ss={10} />
        <Tile x={86} y={20} w={74} h={140} f="#a0c4ff" icon="😔" title="C" sub="Contrition" ts={16} ss={10} />
        <Tile x={164} y={20} w={74} h={140} f="#caffbf" icon="🙏" title="T" sub="Thanksgiving" ts={16} ss={9} />
        <Tile x={242} y={20} w={74} h={140} f="#ffc6ff" icon="🤲" title="S" sub="Supplication" ts={16} ss={9} />
      </>
    ),
  },
  'bible-library': {
    alt: 'The picture shows the Bible as a library of books: 46 books in the Old Testament and 27 in the New Testament, 73 books altogether.',
    draw: () => (
      <>
        <rect x={10} y={110} width={300} height={8} fill="#8d6e63" />
        {Array.from({ length: 46 }, (_, i) => <rect key={i} x={12 + i * 4.4} y={40 + (i % 5) * 3} width={4} height={70 - (i % 5) * 3} fill={['#e76f51', '#f4a261', '#e9c46a', '#2a9d8f'][i % 4]} />)}
        {Array.from({ length: 27 }, (_, i) => <rect key={i} x={222 + i * 3.2} y={46 + (i % 4) * 3} width={2.9} height={64 - (i % 4) * 3} fill={['#457b9d', '#1d3557', '#a8dadc'][i % 3]} />)}
        <T x={113} y={138} s={13}>Old Testament: 46</T>
        <T x={264} y={138} s={13}>New: 27</T>
        <T x={160} y={166} s={15}>46 + 27 = 73 books</T>
        <T x={160} y={26} s={12} w={500}>A library written over many centuries</T>
      </>
    ),
  },
  'three-legged-stool': {
    alt: 'The picture shows a three-legged stool. The legs are Scripture, Tradition and the Magisterium: Catholics need all three to stand firm.',
    draw: () => (
      <>
        <ellipse cx={160} cy={46} rx={100} ry={18} fill="#e9c46a" stroke={INK} strokeWidth={2} />
        <line x1={92} y1={56} x2={60} y2={150} stroke="#8d6e63" strokeWidth={10} strokeLinecap="round" />
        <line x1={160} y1={64} x2={160} y2={160} stroke="#8d6e63" strokeWidth={10} strokeLinecap="round" />
        <line x1={228} y1={56} x2={260} y2={150} stroke="#8d6e63" strokeWidth={10} strokeLinecap="round" />
        <T x={52} y={170} s={12}>Scripture</T><T x={160} y={176} s={12}>Tradition</T><T x={268} y={170} s={12}>Magisterium</T>
        <T x={160} y={50} s={12}>Catholic teaching</T>
      </>
    ),
  },
  'bible-languages': {
    alt: 'The picture shows three scrolls for the languages of the Bible: Hebrew for most of the Old Testament, Aramaic, which Jesus spoke, and Greek for the New Testament.',
    draw: () => (
      <>
        {[['אבג', 'Hebrew', 'most of the|Old Testament', '#ffd6a5'], ['ܐܒܓ', 'Aramaic', 'Jesus|spoke it', '#caffbf'], ['ΑΒΓ', 'Greek', 'the New|Testament', '#a0c4ff']].map(([g, n, d, f], i) => (
          <g key={n}>
            <rect x={14 + i * 102} y={24} width={88} height={110} rx={6} fill={f} stroke={INK} strokeWidth={1.5} />
            <rect x={10 + i * 102} y={18} width={96} height={12} rx={6} fill="#c9a66b" stroke={INK} />
            <rect x={10 + i * 102} y={128} width={96} height={12} rx={6} fill="#c9a66b" stroke={INK} />
            <T x={58 + i * 102} y={74} s={24}>{g}</T>
            <T x={58 + i * 102} y={104} s={13}>{n}</T>
            {d.split('|').map((line, j) => <T key={line} x={58 + i * 102} y={156 + j * 13} s={10} w={500}>{line}</T>)}
          </g>
        ))}
      </>
    ),
  },
  'liturgy-word': {
    alt: 'The picture shows the Liturgy of the Word at Mass in order: the first reading, the psalm, the second reading, the Gospel, when everyone stands, and the homily.',
    draw: () => (
      <>
        <E x={30} y={90} s={40}>📖</E>
        {['First reading', 'Psalm', 'Second reading', 'Gospel (stand)', 'Homily'].map((t, i) => (
          <g key={t}>
            <R x={64 + i * 51} y={60 - (i === 3 ? 10 : 0)} w={46} h={60 + (i === 3 ? 20 : 0)} f={i === 3 ? '#ffd166' : '#fff'} label={i + 1} ls={16} />
            <T x={87 + i * 51} y={142} s={9}>{t.split(' ')[0]}</T>
            <T x={87 + i * 51} y={154} s={9}>{t.split(' ').slice(1).join(' ')}</T>
            {i < 4 && <Ar x1={110 + i * 51} y1={90} x2={114 + i * 51} y2={90} w={1.5} />}
          </g>
        ))}
        <T x={180} y={30} s={12}>Mass: the Bible read aloud</T>
      </>
    ),
  },
  'pee-re': {
    alt: 'The picture shows a paragraph built from three blocks: Point, then Evidence such as a Bible quote, then Explain.',
    draw: () => (
      <>
        <R x={70} y={128} w={180} h={34} f="#a0c4ff" label="P · Point" ls={14} />
        <R x={60} y={88} w={200} h={36} f="#ffd6a5" label="E · Evidence (Bible / Church)" ls={12} />
        <R x={90} y={48} w={140} h={36} f="#caffbf" label="E · Explain" ls={14} />
        <T x={160} y={30} s={12}>2 × PEE for each challenge question</T>
      </>
    ),
  },
  ...keyWordPictures(),
};
