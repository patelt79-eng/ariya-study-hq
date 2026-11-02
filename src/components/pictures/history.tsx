import { Ar, E, INK, R, T, Tile, type Picture } from './kit';

export const HISTORY_PICTURES: Record<string, Picture> = {
  'silk-road': {
    alt: 'The picture shows the Silk Road: a network of routes running about 6,400 kilometres from China in the east to Europe in the west, with camel caravans and a caravanserai inn to rest at.',
    bg: '#fff3d6',
    draw: () => (
      <>
        <path d="M290 100 C 250 80, 230 120, 190 100 S 130 70, 100 96 S 50 110, 26 86" fill="none" stroke="#b5179e" strokeWidth={4} strokeDasharray="8 5" />
        <path d="M230 106 C 210 130, 170 130, 150 110" fill="none" stroke="#b5179e" strokeWidth={2.5} strokeDasharray="6 5" />
        <T x={290} y={124} s={12}>China</T><T x={26} y={110} s={12}>Europe</T>
        <T x={150} y={60} s={11}>Baghdad</T><circle cx={150} cy={78} r={4} fill={INK} />
        <E x={206} y={86} s={26}>🐫</E><E x={228} y={86} s={22}>🐫</E>
        <rect x={84} y={118} width={40} height={26} fill="#e9c46a" stroke={INK} /><path d="M82 118 L104 106 L126 118 Z" fill="#c9a66b" stroke={INK} />
        <T x={104} y={160} s={10}>caravanserai</T>
        <T x={160} y={26} s={12}>A web of routes, about 6,400 km</T>
      </>
    ),
  },
  'silk-trade': {
    alt: 'The picture shows what travelled along the Silk Road. Silk, paper, porcelain and tea went west. Glass, silver, wool and horses went east. Religions, ideas and inventions spread, and so did the Black Death.',
    draw: () => (
      <>
        <Ar x1={300} y1={44} x2={20} y2={44} c="#2a9d8f" w={3} />
        <T x={160} y={32} s={11}>West ← silk, paper, porcelain, tea</T>
        <Ar x1={20} y1={76} x2={300} y2={76} c="#457b9d" w={3} />
        <T x={160} y={68} s={11}>glass, silver, wool, horses → East</T>
        <Tile x={8} y={96} w={98} h={76} f="#ffd6a5" icon="☸️" title="Religions" sub="Buddhism, Islam" ts={10} />
        <Tile x={111} y={96} w={98} h={76} f="#a0c4ff" icon="🧭" title="Inventions" sub="paper, compass" ts={10} />
        <Tile x={214} y={96} w={98} h={76} f="#ffadad" icon="🦠" title="Disease" sub="Black Death 1340s" ts={10} />
      </>
    ),
  },
  'round-city': {
    alt: 'The picture shows the Round City of Baghdad, founded in 762: circular walls with four gates, the caliph’s palace and the great mosque in the centre, beside the River Tigris.',
    bg: '#fff3d6',
    draw: () => (
      <>
        <path d="M260 0 C 240 60, 280 120, 250 180" fill="none" stroke="#4ea8de" strokeWidth={14} />
        <T x={292} y={100} s={11}>Tigris</T>
        <circle cx={130} cy={92} r={74} fill="#f4d58d" stroke="#8d6e63" strokeWidth={6} />
        <circle cx={130} cy={92} r={52} fill="none" stroke="#c9a66b" strokeWidth={3} />
        {[0, 90, 180, 270].map((a) => <rect key={a} x={124} y={14} width={12} height={14} fill="#6f4518" transform={`rotate(${a + 45} 130 92)`} />)}
        <circle cx={130} cy={92} r={22} fill="#e76f51" stroke={INK} />
        <E x={130} y={92} s={22}>🕌</E>
        <T x={130} y={128} s={10}>palace + mosque</T>
        <T x={224} y={20} s={12}>762</T>
        <T x={44} y={176} s={10}>4 gates</T>
      </>
    ),
  },
  'house-of-wisdom': {
    alt: 'The picture shows the House of Wisdom in Baghdad: a library where scholars translated Greek, Persian and Indian books into Arabic, and where ideas like algebra grew.',
    draw: () => (
      <>
        <rect x={20} y={60} width={120} height={100} fill="#f4d58d" stroke={INK} strokeWidth={2} />
        <path d="M14 60 L80 20 L146 60 Z" fill="#e76f51" stroke={INK} strokeWidth={2} />
        {[0, 1, 2].map((i) => <rect key={i} x={34} y={76 + i * 26} width={92} height={18} fill="#fff" stroke={INK} />)}
        {[0, 1, 2].map((r) => Array.from({ length: 9 }, (_, c) => <rect key={`${r}${c}`} x={38 + c * 10} y={79 + r * 26} width={7} height={12} fill={['#457b9d', '#e63946', '#2a9d8f'][(c + r) % 3]} />))}
        <T x={80} y={176} s={11}>House of Wisdom</T>
        <R x={170} y={30} w={60} h={34} f="#a0c4ff" label="Greek" ls={12} />
        <Ar x1={232} y1={47} x2={256} y2={47} />
        <R x={258} y={30} w={56} h={34} f="#caffbf" label="Arabic" ls={12} />
        <T x={242} y={90} s={12}>translation</T>
        <T x={242} y={126} s={16}>x + 3 = 7</T>
        <T x={242} y={146} s={11}>algebra (al-Khwarizmi)</T>
        <T x={242} y={166} s={10} w={500}>hospitals · maths · medicine</T>
      </>
    ),
  },
  'baghdad-society': {
    alt: 'The picture shows Baghdad’s society as a pyramid: the caliph at the top, then officials, then merchants and scholars, then craftspeople and farmers, then enslaved people at the bottom. Judges called qadis ran the courts using Sharia law.',
    draw: () => (
      <>
        {[['Caliph', '#e76f51'], ['Officials, viziers', '#f4a261'], ['Merchants, scholars', '#e9c46a'], ['Craftspeople, farmers', '#a8dadc'], ['Enslaved people', '#ced4da']].map(([n, f], i) => (
          <g key={n}>
            <rect x={92 - i * 22} y={14 + i * 30} width={84 + i * 44} height={28} fill={f} stroke={INK} strokeWidth={1.5} />
            <T x={134} y={33 + i * 30} s={11}>{n}</T>
          </g>
        ))}
        <E x={292} y={58} s={30}>⚖️</E>
        <T x={292} y={90} s={11}>Qadi</T>
        <T x={292} y={104} s={10}>(judge)</T>
        <T x={292} y={120} s={9} w={500}>Sharia law</T>
      </>
    ),
  },
  'saxon-hierarchy': {
    alt: 'The picture shows Anglo-Saxon society as a pyramid: the king at the top, then thegns, the nobles, then ceorls, free peasant farmers, then slaves. Most people lived in small villages of wooden thatched houses.',
    draw: () => (
      <>
        {[['King', '#e76f51'], ['Thegns (nobles)', '#f4a261'], ['Ceorls (free farmers)', '#e9c46a'], ['Slaves (thralls)', '#ced4da']].map(([n, f], i) => (
          <g key={n}>
            <rect x={80 - i * 24} y={20 + i * 36} width={100 + i * 48} height={32} fill={f} stroke={INK} strokeWidth={1.5} />
            <T x={130} y={41 + i * 36} s={12}>{n}</T>
          </g>
        ))}
        <path d="M262 120 L292 96 L322 120 Z" fill="#c9a66b" stroke={INK} />
        <rect x={268} y={120} width={48} height={30} fill="#8d6e63" stroke={INK} />
        <T x={290} y={168} s={10}>village hut</T>
      </>
    ),
  },
  'saxon-law': {
    alt: 'The picture shows Anglo-Saxon law: wergild, money paid to a victim’s family; trial by ordeal with hot iron or cold water; and tithings, groups of ten men responsible for each other.',
    draw: () => (
      <>
        <Tile x={8} y={14} w={98} h={150} f="#fdffb6" icon="🪙" title="Wergild" sub="pay the family" />
        <Tile x={111} y={14} w={98} h={150} f="#ffadad" icon="🔥" title="Trial by ordeal" sub="hot iron · cold water" ts={10} />
        <Tile x={214} y={14} w={98} h={150} f="#a0c4ff" icon="👥" title="Tithing" sub="groups of 10 men" />
      </>
    ),
  },
  monastery: {
    alt: 'The picture shows a monastery, where monks copied books by hand, and two powerful Saxon women: Abbess Hild of Whitby and Æthelflæd, Lady of the Mercians, who led armies.',
    draw: () => (
      <>
        <rect x={20} y={70} width={110} height={90} fill="#d6ccc2" stroke={INK} strokeWidth={2} />
        <path d="M14 70 L75 34 L136 70 Z" fill="#8d6e63" stroke={INK} strokeWidth={2} />
        <rect x={64} y={110} width={22} height={50} rx={10} fill="#6f4518" />
        <E x={75} y={54} s={18}>✝️</E>
        <T x={75} y={176} s={10}>monastery</T>
        <E x={172} y={70} s={30}>📜</E><T x={172} y={106} s={10}>monks copy</T><T x={172} y={118} s={10}>books by hand</T>
        <E x={232} y={70} s={30}>👩‍🦳</E><T x={232} y={106} s={10}>Abbess</T><T x={232} y={118} s={10}>Hild</T>
        <E x={290} y={70} s={30}>🛡️</E><T x={290} y={106} s={10}>Æthelflæd</T><T x={290} y={118} s={9} w={500}>led armies</T>
        <T x={240} y={150} s={10} w={500}>Women could own land</T><T x={240} y={164} s={10} w={500}>and make wills</T>
      </>
    ),
  },
  migration: {
    alt: 'The picture shows people crossing the North Sea to England after the Romans left: Angles from Angeln, Saxons from northern Germany, Jutes from Jutland in Denmark, and Frisians from the Netherlands.',
    bg: '#dff1fb',
    draw: () => (
      <>
        <path d="M40 30 C 60 20, 80 40, 76 70 C 90 100, 80 140, 60 160 L 20 160 C 30 120, 20 80, 40 30 Z" fill="#b7e4c7" stroke={INK} strokeWidth={1.5} />
        <T x={52} y={110} s={11}>England</T>
        <path d="M200 20 L250 20 L250 80 L230 100 L210 80 Z" fill="#ffd6a5" stroke={INK} strokeWidth={1.5} />
        <path d="M200 100 L310 100 L310 170 L190 170 Z" fill="#ffd6a5" stroke={INK} strokeWidth={1.5} />
        <T x={226} y={50} s={10}>Jutes</T><T x={226} y={64} s={9} w={500}>Jutland</T>
        <T x={236} y={92} s={10}>Angles</T>
        <T x={256} y={130} s={10}>Saxons</T><T x={256} y={144} s={9} w={500}>N. Germany</T>
        <T x={206} y={162} s={9}>Frisians</T>
        <Ar x1={206} y1={56} x2={92} y2={70} c="#e76f51" w={3} />
        <Ar x1={210} y1={96} x2={90} y2={100} c="#e76f51" w={3} />
        <Ar x1={200} y1={136} x2={86} y2={130} c="#e76f51" w={3} />
        <T x={144} y={40} s={11} c="#1d3557">North Sea</T>
        <T x={140} y={172} s={10} w={500}>from about AD 450</T>
      </>
    ),
  },
  'roman-britain': {
    alt: 'The picture shows Roman Britain: straight roads linking towns like Londinium, London, Eboracum, York, Deva, Chester, and Aquae Sulis, Bath; and Hadrian’s Wall in the north. The Romans invaded in AD 43 and left around 410.',
    bg: '#eef6ee',
    draw: () => (
      <>
        <path d="M70 10 C 100 10, 110 40, 100 60 C 120 90, 130 130, 110 170 L 40 170 C 50 140, 30 110, 50 80 C 40 50, 50 20, 70 10 Z" fill="#b7e4c7" stroke={INK} strokeWidth={1.5} />
        <line x1={52} y1={48} x2={104} y2={48} stroke="#6f4518" strokeWidth={5} />
        <T x={160} y={52} a="start" s={11}>Hadrian’s Wall (AD 122)</T>
        <Ar x1={156} y1={48} x2={110} y2={48} w={1.5} />
        {[['Eboracum', 98, 78], ['Deva', 62, 104], ['Londinium', 104, 146], ['Aquae Sulis', 62, 150]].map(([r, x, y]) => (
          <g key={r as string}><circle cx={x as number} cy={y as number} r={4} fill="#d62828" /></g>
        ))}
        <path d="M98 78 L104 146 M62 104 L104 146 M62 150 L104 146 M62 104 L98 78" stroke="#6f4518" strokeWidth={2} strokeDasharray="4 2" />
        <T x={160} y={84} a="start" s={11}>Eboracum = York</T>
        <T x={160} y={104} a="start" s={11}>Deva = Chester</T>
        <T x={160} y={124} a="start" s={11}>Aquae Sulis = Bath</T>
        <T x={160} y={144} a="start" s={11}>Londinium = London</T>
        <T x={160} y={20} a="start" s={12}>AD 43 → c. 410</T>
        <T x={160} y={168} a="start" s={10} w={500}>straight roads, baths, Latin</T>
      </>
    ),
  },
  '1066-claimants': {
    alt: 'The picture shows the empty English throne in 1066 and three claimants: Harold Godwinson from England, Harald Hardrada, King of Norway, and William, Duke of Normandy.',
    draw: () => (
      <>
        <E x={160} y={56} s={46}>🪑</E><E x={160} y={22} s={22}>👑</E>
        <T x={160} y={96} s={11}>Edward dies, Jan 1066</T>
        <Tile x={8} y={108} w={98} h={64} f="#ffadad" icon="🛡️" title="Harold" sub="England" ts={11} />
        <Tile x={111} y={108} w={98} h={64} f="#a0c4ff" icon="⚔️" title="Harald" sub="Norway" ts={11} />
        <Tile x={214} y={108} w={98} h={64} f="#caffbf" icon="🐎" title="William" sub="Normandy" ts={11} />
        <Ar x1={57} y1={106} x2={130} y2={70} w={1.5} /><Ar x1={263} y1={106} x2={190} y2={70} w={1.5} />
      </>
    ),
  },
  '1066-battles': {
    alt: 'The picture shows a map of England in 1066. Harold beat Harald Hardrada at Stamford Bridge near York on 25 September. William landed at Pevensey, won the Battle of Hastings on 14 October, and was crowned in London on Christmas Day.',
    bg: '#eef6ee',
    draw: () => (
      <>
        <path d="M70 10 C 100 10, 110 40, 100 60 C 120 90, 130 130, 110 170 L 40 170 C 50 140, 30 110, 50 80 C 40 50, 50 20, 70 10 Z" fill="#b7e4c7" stroke={INK} strokeWidth={1.5} />
        <circle cx={98} cy={74} r={5} fill="#457b9d" /><circle cx={104} cy={140} r={5} fill="#e9c46a" /><circle cx={112} cy={162} r={5} fill="#d62828" />
        <Ar x1={104} y1={136} x2={98} y2={80} c="#457b9d" dash />
        <T x={136} y={70} a="start" s={11}>Stamford Bridge, 25 Sept</T>
        <T x={136} y={84} a="start" s={9} w={500}>Harold beats Hardrada</T>
        <T x={136} y={124} a="start" s={11}>London, 25 Dec</T>
        <T x={136} y={138} a="start" s={9} w={500}>William crowned</T>
        <T x={136} y={162} a="start" s={11}>Hastings, 14 Oct</T>
        <T x={136} y={176} a="start" s={9} w={500}>William beats Harold</T>
        <T x={136} y={24} a="start" s={12}>England, 1066</T>
      </>
    ),
  },
  'key-dates': {
    alt: 'The picture shows a timeline: the Romans arrive in AD 43 and leave around 410; Anglo-Saxon England follows; Baghdad is founded in 762; and 1066 brings the Norman Conquest.',
    draw: () => {
      const x = (y: number) => 20 + ((y + 100) / 1400) * 280;
      return (
        <>
          <line x1={14} y1={110} x2={306} y2={110} stroke={INK} strokeWidth={3} />
          <rect x={x(43)} y={118} width={x(410) - x(43)} height={14} fill="#e76f51" /><T x={(x(43) + x(410)) / 2} y={148} s={10}>Roman Britain</T>
          <rect x={x(410)} y={118} width={x(1066) - x(410)} height={14} fill="#2a9d8f" /><T x={(x(410) + x(1066)) / 2} y={148} s={10}>Anglo-Saxon England</T>
          <rect x={x(750)} y={84} width={x(1258) - x(750)} height={12} fill="#e9c46a" /><T x={(x(750) + x(1258)) / 2} y={78} s={10}>Abbasid Baghdad</T>
          {[[43, 'AD 43'], [410, '410'], [762, '762'], [1066, '1066']].map(([y, l]) => (
            <g key={l as string}><line x1={x(y as number)} y1={104} x2={x(y as number)} y2={116} stroke={INK} strokeWidth={2} /><T x={x(y as number)} y={172} s={11}>{l as string}</T></g>
          ))}
          <T x={160} y={30} s={12}>BC counts down to 0, AD counts up</T>
        </>
      );
    },
  },
  'artemis-compare': {
    alt: 'The picture shows a weighing scale comparing Baghdad and Saxon Britain. Baghdad has the House of Wisdom, hospitals and a huge planned city. Saxon Britain has monasteries, local laws and beautiful art. Make a judgement and support it with evidence.',
    draw: () => (
      <>
        <line x1={160} y1={30} x2={160} y2={150} stroke={INK} strokeWidth={4} />
        <polygon points="160,150 140,172 180,172" fill={INK} />
        <line x1={50} y1={52} x2={270} y2={38} stroke={INK} strokeWidth={4} />
        <path d="M50 52 L24 100 L76 100 Z" fill="none" stroke={INK} />
        <path d="M270 38 L244 86 L296 86 Z" fill="none" stroke={INK} />
        <T x={50} y={120} s={12}>Baghdad</T><T x={50} y={136} s={9} w={500}>House of Wisdom</T><T x={50} y={148} s={9} w={500}>hospitals, big city</T>
        <E x={50} y={88} s={20}>📚</E>
        <T x={270} y={106} s={12}>Saxon Britain</T><T x={270} y={122} s={9} w={500}>monasteries</T><T x={270} y={134} s={9} w={500}>local laws, art</T>
        <E x={270} y={74} s={20}>⛪</E>
        <T x={160} y={20} s={12}>Judgement + evidence</T>
      </>
    ),
  },
  'women-compare': {
    alt: 'The picture shows two overlapping circles comparing women’s lives. In both places women could own property and inherit. In Baghdad, rights came from Islamic law and some women, like Zubaidah, were wealthy and influential. In Saxon England, some women held power as abbesses or rulers, like Hild and Æthelflæd.',
    draw: () => (
      <>
        <circle cx={115} cy={96} r={70} fill="#ffd6a5" fillOpacity={0.7} stroke={INK} strokeWidth={1.5} />
        <circle cx={205} cy={96} r={70} fill="#a0c4ff" fillOpacity={0.7} stroke={INK} strokeWidth={1.5} />
        <T x={80} y={20} s={12}>Baghdad</T><T x={240} y={20} s={12}>Saxon England</T>
        <T x={78} y={86} s={9}>Islamic law</T><T x={78} y={100} s={9}>Zubaidah</T><T x={78} y={114} s={9}>funds projects</T>
        <T x={160} y={90} s={9}>own</T><T x={160} y={102} s={9}>property,</T><T x={160} y={114} s={9}>inherit</T>
        <T x={242} y={86} s={9}>abbess Hild</T><T x={242} y={100} s={9}>Æthelflæd</T><T x={242} y={114} s={9}>leads armies</T>
        <T x={160} y={176} s={10} w={500}>Similarly… However… In contrast…</T>
      </>
    ),
  },
};
