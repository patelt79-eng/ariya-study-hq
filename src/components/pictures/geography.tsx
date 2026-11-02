import { Ar, Cloud, E, INK, Lbl, R, T, Tile, type Picture } from './kit';
import { UK, type LonLat } from '../practise/geography/geoData';

const ukP = ([lon, lat]: LonLat): [number, number] => [100 + ((lon + 8.6) / 10.6) * 120, 6 + ((59 - lat) / 9.4) * 168];

export const GEOGRAPHY_PICTURES: Record<string, Picture> = {
  biomes: {
    alt: 'The picture shows four biomes side by side: a hot, wet tropical rainforest; a dry hot desert; a frozen, treeless tundra; and a grassy savanna with scattered trees.',
    draw: () => (
      <>
        <Tile x={6} y={14} w={74} h={150} f="#b7e4c7" icon="🌴" title="Rainforest" sub="hot + wet" ts={10} />
        <Tile x={84} y={14} w={74} h={150} f="#ffe8b6" icon="🏜️" title="Desert" sub="very dry" ts={10} />
        <Tile x={162} y={14} w={74} h={150} f="#e0fbfc" icon="❄️" title="Tundra" sub="frozen" ts={10} />
        <Tile x={240} y={14} w={74} h={150} f="#f6d6a8" icon="🦒" title="Savanna" sub="wet/dry" ts={10} />
      </>
    ),
  },
  rainforest: {
    alt: 'The picture shows the layers of a tropical rainforest: tall emergent trees, the thick canopy, the shady understorey and the dark forest floor, with heavy rain and a monkey in the canopy.',
    bg: '#e3f6e9',
    draw: () => (
      <>
        <Cloud x={60} y={22} s={0.9} f="#dee2e6" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={44 + i * 10} y1={36} x2={40 + i * 10} y2={48} stroke="#4ea8de" strokeWidth={2} />)}
        <rect x={0} y={160} width={320} height={20} fill="#6f4518" />
        {[40, 120, 200, 280].map((x, i) => <rect key={x} x={x - 4} y={i === 1 ? 30 : 64} width={8} height={i === 1 ? 130 : 96} fill="#6f4518" />)}
        <ellipse cx={120} cy={34} rx={28} ry={14} fill="#2d6a4f" />
        {[40, 200, 280].map((x) => <ellipse key={x} cx={x} cy={70} rx={46} ry={18} fill="#40916c" />)}
        <ellipse cx={120} cy={74} rx={40} ry={16} fill="#40916c" />
        {[80, 160, 240].map((x) => <ellipse key={x} cx={x} cy={124} rx={22} ry={10} fill="#74c69d" />)}
        <E x={226} y={86} s={22}>🐒</E>
        <Lbl x={158} y={36} a="start">Emergent</Lbl>
        <Lbl x={312} y={58} a="end">Canopy</Lbl>
        <Lbl x={312} y={112} a="end">Understorey</Lbl>
        <T x={10} y={174} a="start" s={11} c="#fff">Forest floor</T>
        <Lbl x={312} y={16} a="end" s={10}>about 27 °C, over 2,000 mm rain a year</Lbl>
      </>
    ),
  },
  desert: {
    alt: 'The picture shows a hot desert with sand dunes, a cactus that stores water and a camel. Days are very hot and nights are cold, with under 250 millimetres of rain a year.',
    bg: '#fff3d6',
    draw: () => (
      <>
        <circle cx={270} cy={36} r={20} fill="#ffb703" />
        <path d="M0 130 C 60 100, 110 110, 160 130 S 260 105, 320 125 L320 180 L0 180 Z" fill="#f4c27a" />
        <E x={70} y={110} s={44}>🌵</E><E x={210} y={112} s={44}>🐫</E>
        <T x={20} y={30} a="start" s={12}>☀️ Day: very hot</T>
        <T x={20} y={50} a="start" s={12}>🌙 Night: cold</T>
        <T x={160} y={168} s={11}>Under 250 mm of rain a year · e.g. the Sahara</T>
      </>
    ),
  },
  tundra: {
    alt: 'The picture shows the tundra: flat, snowy land with small low plants, an Arctic fox, and a layer of permafrost, ground that stays frozen all year.',
    bg: '#eaf4fb',
    draw: () => (
      <>
        <rect x={0} y={100} width={320} height={22} fill="#f8f9fa" stroke="#ced4da" />
        <rect x={0} y={122} width={320} height={58} fill="#a8dadc" />
        <T x={160} y={154} s={13}>Permafrost: frozen all year</T>
        {[30, 70, 110, 250, 290].map((x) => <ellipse key={x} cx={x} cy={100} rx={10} ry={5} fill="#52b788" />)}
        <E x={190} y={84} s={34}>🦊</E>
        <T x={20} y={30} a="start" s={12}>Very cold, little rain</T>
        <T x={20} y={50} a="start" s={11} w={500}>Low plants with shallow roots</T>
        <E x={270} y={40} s={26}>❄️</E>
      </>
    ),
  },
  savanna: {
    alt: 'The picture shows the savanna: grassland with scattered acacia and baobab trees, a giraffe and zebra, a hot sun, and a wet season and a long dry season.',
    bg: '#fff1d6',
    draw: () => (
      <>
        <circle cx={280} cy={34} r={18} fill="#ffb703" />
        <rect x={0} y={120} width={320} height={60} fill="#e9c46a" />
        <path d="M60 120 L60 80 M40 74 C 50 60, 70 60, 82 74 Z" stroke="#6f4518" strokeWidth={5} fill="#588157" />
        <rect x={210} y={70} width={22} height={52} rx={8} fill="#8d6e63" />
        <ellipse cx={221} cy={66} rx={26} ry={10} fill="#588157" />
        <E x={130} y={100} s={40}>🦒</E><E x={280} y={110} s={28}>🦓</E>
        <T x={160} y={156} s={12}>Grassland · scattered trees · wet and dry seasons</T>
        <T x={20} y={30} a="start" s={10} w={500}>Baobab stores water</T>
      </>
    ),
  },
  oceans: {
    alt: 'The picture shows the five oceans from largest to smallest: Pacific, Atlantic, Indian, Southern and Arctic.',
    bg: '#dff1fb',
    draw: () => (
      <>
        {[['Pacific', 70, '#4361ee'], ['Atlantic', 58, '#4895ef'], ['Indian', 50, '#4cc9f0'], ['Southern', 40, '#90e0ef'], ['Arctic', 30, '#caf0f8']].map(([n, r, f], i) => (
          <g key={n as string}>
            <circle cx={40 + [30, 110, 170, 220, 262][i]} cy={92} r={(r as number) * 0.62} fill={f as string} stroke={INK} strokeWidth={1.5} />
            <T x={40 + [30, 110, 170, 220, 262][i]} y={i % 2 ? 160 : 146} s={11}>{n as string}</T>
          </g>
        ))}
        <T x={160} y={26} s={12}>5 oceans, biggest to smallest</T>
        <T x={160} y={44} s={10} w={500}>The UK is on the edge of the Atlantic</T>
      </>
    ),
  },
  'uk-map': {
    alt: 'The picture shows a map of the United Kingdom with its four countries and capitals: England and London, Scotland and Edinburgh, Wales and Cardiff, and Northern Ireland and Belfast.',
    bg: '#dff1fb',
    draw: () => (
      <>
        {Object.entries(UK).map(([n, v]) => (
          <path key={n} d={'M' + v.shape.map((p) => ukP(p).join(' ')).join(' L') + ' Z'} fill={v.colour} stroke={INK} strokeWidth={1.2} opacity={0.85} />
        ))}
        {Object.entries(UK).map(([n, v]) => {
          const [x, y] = ukP(v.at);
          return <g key={n}><circle cx={x} cy={y} r={4} fill={INK} stroke="#fff" strokeWidth={1.5} /></g>;
        })}
        <T x={10} y={40} a="start" s={11}>Scotland: Edinburgh</T>
        <T x={10} y={174} a="start" s={9} w={500}>● = capital city</T>
        <T x={10} y={60} a="start" s={11}>N. Ireland: Belfast</T>
        <T x={10} y={150} a="start" s={11}>Wales: Cardiff</T>
        <T x={236} y={150} a="start" s={11}>England:</T>
        <T x={236} y={164} a="start" s={11}>London</T>
      </>
    ),
  },
  pangaea: {
    alt: 'The picture shows Pangaea 200 million years ago, one supercontinent in one ocean, and an arrow to today, when the continents have drifted apart.',
    bg: '#dff1fb',
    draw: () => (
      <>
        <path d="M30 60 C 40 30, 100 24, 120 40 C 140 60, 130 100, 110 120 C 90 140, 50 140, 40 120 C 20 100, 22 80, 30 60 Z" fill="#c9a66b" stroke={INK} strokeWidth={2} />
        <T x={76} y={84} s={12}>Pangaea</T>
        <T x={76} y={160} s={11}>200 million years ago</T>
        <Ar x1={140} y1={84} x2={176} y2={84} w={3} />
        {[[200, 50, 22, 16], [218, 104, 14, 22], [252, 60, 14, 12], [262, 96, 18, 22], [292, 52, 22, 16], [298, 116, 12, 9], [252, 148, 36, 8]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#c9a66b" stroke={INK} strokeWidth={1.5} />
        ))}
        <T x={250} y={176} s={11}>Today</T>
        <T x={160} y={20} s={11} w={500}>Convection currents in the mantle pull the plates apart</T>
      </>
    ),
  },
  glacier: {
    alt: 'The picture shows a glacier flowing down a mountain valley. It carves a U-shaped valley and features like a corrie and an arête, and leaves moraine, rocky debris, where it melts.',
    bg: '#eaf4fb',
    draw: () => (
      <>
        <path d="M0 60 L60 18 L110 54 L160 16 L210 54 L260 20 L320 60 L320 180 L0 180 Z" fill="#adb5bd" />
        <path d="M110 54 C 120 100, 120 140, 100 180 L220 180 C 200 140, 200 100, 210 54 Z" fill="#e0fbfc" stroke="#8ecae6" strokeWidth={2} />
        <path d="M118 150 L 202 150" stroke="#6c757d" strokeWidth={6} strokeDasharray="3 4" />
        <T x={160} y={100} s={12}>Glacier ice</T>
        <T x={160} y={70} s={10} w={500}>moves slowly downhill</T>
        <T x={160} y={170} s={10}>moraine</T>
        <T x={40} y={100} s={11}>U-shaped</T><T x={40} y={114} s={11}>valley</T>
        <T x={282} y={100} s={11}>arête</T>
        <T x={160} y={12} s={10}>pyramidal peak</T>
      </>
    ),
  },
  'glacial-melt': {
    alt: 'The picture shows melting glacier ice making the sea level rise, which floods low-lying coasts and homes.',
    bg: '#eaf4fb',
    draw: () => (
      <>
        <path d="M10 40 L90 40 L110 120 L10 120 Z" fill="#e0fbfc" stroke="#8ecae6" strokeWidth={2} />
        {[30, 55, 80].map((x) => <path key={x} d={`M${x} 120 q 3 8 0 14`} stroke="#4ea8de" strokeWidth={3} fill="none" />)}
        <E x={40} y={24} s={22}>🌡️</E>
        <rect x={0} y={134} width={320} height={46} fill="#4ea8de" />
        <rect x={0} y={122} width={320} height={12} fill="#4ea8de" opacity={0.5} />
        <Ar x1={160} y1={150} x2={160} y2={122} c="#fff" w={3} />
        <T x={168} y={150} a="start" s={11} c="#fff">sea level rises</T>
        <E x={270} y={118} s={32}>🏠</E>
        <T x={270} y={70} s={11}>coasts flood</T>
        <T x={60} y={168} s={10} c="#fff">less fresh water too</T>
      </>
    ),
  },
  coventry: {
    alt: 'The picture shows Coventry in the West Midlands: the ruins of the old cathedral and the new cathedral, the ring road, car-making history, the River Sherbourne and its universities.',
    draw: () => (
      <>
        <circle cx={160} cy={96} r={66} fill="none" stroke="#6c757d" strokeWidth={8} />
        <T x={160} y={176} s={10}>ring road</T>
        <path d="M120 120 L120 70 L126 40 L132 70 L132 120 Z" fill="#b5838d" stroke={INK} />
        <rect x={140} y={86} width={36} height={34} fill="#b5838d" stroke={INK} strokeDasharray="3 2" />
        <Lbl x={126} y={30} s={9}>cathedral</Lbl>
        <path d="M100 130 C 140 140, 180 120, 220 134" stroke="#4ea8de" strokeWidth={4} fill="none" />
        <T x={226} y={150} a="start" s={9}>River Sherbourne</T>
        <E x={206} y={86} s={26}>🚗</E>
        <E x={46} y={50} s={26}>🎓</E><T x={46} y={78} s={9}>universities</T>
        <T x={270} y={30} s={11}>West Midlands</T>
        <T x={270} y={46} s={9} w={500}>about 345,000 people</T>
      </>
    ),
  },
  'push-pull': {
    alt: 'The picture shows people moving between the countryside and the city. Pull factors draw people into the city, like jobs, universities and shops. Push factors make people leave, like traffic, pollution and high house prices.',
    draw: () => (
      <>
        <E x={60} y={70} s={44}>🏡</E><T x={60} y={112} s={12}>Countryside</T>
        <E x={260} y={70} s={44}>🏙️</E><T x={260} y={112} s={12}>City</T>
        <Ar x1={100} y1={56} x2={218} y2={56} c="#2a9d8f" w={3} /><T x={160} y={46} s={11} c="#2a9d8f">PULL: jobs, uni, shops</T>
        <Ar x1={218} y1={86} x2={100} y2={86} c="#d62828" w={3} /><T x={160} y={104} s={11} c="#d62828">PUSH: traffic, pollution</T>
        <T x={160} y={146} s={12}>Urbanisation: more people living in towns and cities</T>
      </>
    ),
  },
  'earthquake-tsunami': {
    alt: 'The picture shows a cross-section under the sea. Where two plates meet, the focus of an earthquake is underground and the epicentre is on the surface above it. The seabed jerks up, pushing water into a tsunami wave that grows taller near the coast.',
    bg: '#dff1fb',
    draw: () => (
      <>
        <rect x={0} y={40} width={250} height={60} fill="#4ea8de" />
        <path d="M250 40 L320 30 L320 100 L250 100 Z" fill="#c9a66b" />
        <path d="M150 40 C 170 40, 180 10, 200 18 C 220 26, 230 40, 250 40" fill="#4ea8de" stroke="#1d3557" strokeWidth={2} />
        <Ar x1={180} y1={56} x2={238} y2={56} c="#fff" />
        <rect x={0} y={100} width={320} height={80} fill="#8d6e63" />
        <path d="M60 100 L120 180" stroke={INK} strokeWidth={3} />
        <circle cx={92} cy={142} r={6} fill="#d62828" /><T x={104} y={146} a="start" s={11} c="#fff">focus</T>
        <line x1={78} y1={38} x2={78} y2={98} stroke="#d62828" strokeWidth={1.5} strokeDasharray="3 3" /><circle cx={78} cy={100} r={4} fill="#d62828" /><Lbl x={78} y={32}>epicentre</Lbl>
        <Ar x1={60} y1={124} x2={60} y2={106} c="#ffd166" />
        <T x={286} y={24} s={11}>coast floods</T>
        <T x={160} y={172} s={10} c="#fff">plates jerk → seabed moves → tsunami</T>
      </>
    ),
  },
  'tropical-storm': {
    alt: 'The picture shows a tropical storm seen from above: a huge spiral of cloud around a calm eye, forming over warm ocean water of at least 26.5 degrees.',
    bg: '#dff1fb',
    draw: () => (
      <>
        <rect x={0} y={0} width={320} height={180} fill="#4ea8de" />
        <g transform="translate(140 88)">
          {[60, 46, 32, 18].map((r, i) => <path key={r} d={`M ${r} 0 A ${r} ${r} 0 1 1 ${-r * 0.6} ${-r * 0.8}`} fill="none" stroke="#fff" strokeWidth={10 - i * 2} opacity={0.9} />)}
          <circle cx={0} cy={0} r={8} fill="#4ea8de" stroke="#fff" />
        </g>
        <T x={140} y={92} s={9} c="#fff">eye</T>
        <T x={268} y={40} s={12} c="#fff">Warm ocean</T>
        <T x={268} y={56} s={12} c="#fff">26.5 °C +</T>
        <T x={268} y={120} s={11} c="#fff">strong winds,</T>
        <T x={268} y={134} s={11} c="#fff">heavy rain,</T>
        <T x={268} y={148} s={11} c="#fff">storm surge</T>
      </>
    ),
  },
  'drought-flood': {
    alt: 'The picture shows two climatic hazards: a drought, with cracked dry ground and a failed crop, and a flood, with water covering houses.',
    draw: () => (
      <>
        <rect x={0} y={0} width={160} height={180} fill="#ffe8b6" />
        <circle cx={130} cy={30} r={16} fill="#ffb703" />
        <rect x={0} y={110} width={160} height={70} fill="#d4a373" />
        <path d="M20 130 l 20 10 l 10 -12 l 20 18 M90 124 l 14 16 l 22 -8 M40 160 l 30 4 l 10 10" stroke="#6f4518" strokeWidth={2} fill="none" />
        <E x={70} y={92} s={28}>🥀</E>
        <T x={80} y={30} s={13}>Drought</T>
        <rect x={160} y={0} width={160} height={180} fill="#dff1fb" />
        <Cloud x={240} y={30} f="#adb5bd" />
        <E x={210} y={110} s={30}>🏠</E><E x={270} y={112} s={30}>🏠</E>
        <rect x={160} y={120} width={160} height={60} fill="#4ea8de" opacity={0.85} />
        <T x={240} y={160} s={13} c="#fff">Flood</T>
      </>
    ),
  },
  development: {
    alt: 'The picture shows three kinds of country: a developed country with a big city, an emerging country with cranes and new factories, and a developing country with a small village. Development is measured by things like income, life expectancy and literacy.',
    draw: () => (
      <>
        <Tile x={8} y={14} w={96} h={120} f="#a0c4ff" icon="🏙️" title="Developed" sub="e.g. UK" />
        <Tile x={112} y={14} w={96} h={120} f="#ffd6a5" icon="🏗️" title="Emerging" sub="e.g. Brazil, India" />
        <Tile x={216} y={14} w={96} h={120} f="#caffbf" icon="🛖" title="Developing" sub="e.g. Malawi" />
        <T x={160} y={156} s={11}>Measured by: income, life expectancy, literacy</T>
      </>
    ),
  },
  brics: {
    alt: 'The picture shows the five original BRICS countries: Brazil, Russia, India, China and South Africa, major emerging economies.',
    draw: () => (
      <>
        {['Brazil', 'Russia', 'India', 'China', 'South Africa'].map((n, i) => (
          <g key={n}>
            <R x={8 + i * 62} y={34} w={58} h={70} f={['#2a9d8f', '#457b9d', '#f4a261', '#e63946', '#e9c46a'][i]} />
            <T x={37 + i * 62} y={80} s={30} c="#fff">{'BRICS'[i]}</T>
            <T x={37 + i * 62} y={124} s={10}>{n}</T>
          </g>
        ))}
        <T x={160} y={22} s={12}>The original BRICS: big emerging economies</T>
        <T x={160} y={160} s={10} w={500}>More countries have joined since 2024</T>
      </>
    ),
  },
  energy: {
    alt: 'The picture compares energy sources. Renewable sources that will not run out: wind, solar and hydroelectric. Non-renewable sources that will run out: coal, oil, gas and nuclear power, which release carbon dioxide or waste.',
    draw: () => (
      <>
        <rect x={0} y={0} width={160} height={180} fill="#e3f6e9" />
        <rect x={160} y={0} width={160} height={180} fill="#f1e3e4" />
        <T x={80} y={22} s={13}>Renewable</T><T x={80} y={38} s={10} w={500}>won’t run out</T>
        <g><line x1={40} y1={80} x2={40} y2={112} stroke={INK} strokeWidth={3} />{[0, 120, 240].map((a) => <line key={a} x1={40} y1={80} x2={40 + 20 * Math.cos(((a - 90) * Math.PI) / 180)} y2={80 + 20 * Math.sin(((a - 90) * Math.PI) / 180)} stroke={INK} strokeWidth={4} strokeLinecap="round" />)}<circle cx={40} cy={80} r={3} fill={INK} /></g><E x={120} y={80} s={34}>☀️</E><E x={80} y={128} s={34}>💧</E>
        <T x={80} y={168} s={10}>wind · solar · hydro</T>
        <T x={240} y={22} s={13}>Non-renewable</T><T x={240} y={38} s={10} w={500}>will run out</T>
        <E x={200} y={80} s={34}>🏭</E><E x={280} y={80} s={34}>🛢️</E><E x={240} y={128} s={34}>⚛️</E>
        <T x={240} y={168} s={10}>coal · oil · gas · nuclear</T>
      </>
    ),
  },
};
