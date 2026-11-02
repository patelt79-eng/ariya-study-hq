import type { ReactElement } from 'react';
import { Ar, E, INK, R, T, Tile, type Picture } from './kit';

export const SCIENCE_PICTURES: Record<string, Picture> = {
  'specialised-cells': {
    alt: 'The picture shows four specialised cells: a red blood cell, a dented red disc with no nucleus; a sperm cell with a head and long tail; a long nerve cell with branches; and a root hair cell with a long hair.',
    draw: () => (
      <>
        <ellipse cx={42} cy={70} rx={30} ry={20} fill="#e63946" stroke={INK} strokeWidth={1.5} />
        <ellipse cx={42} cy={70} rx={13} ry={7} fill="#b5172f" />
        <T x={42} y={118} s={10}>Red blood</T><T x={42} y={130} s={10}>cell</T><T x={42} y={144} s={9} w={500}>carries oxygen</T>
        <ellipse cx={108} cy={70} rx={12} ry={9} fill="#ffd6a5" stroke={INK} strokeWidth={1.5} />
        <path d="M120 70 C 135 60, 140 82, 155 70 S 170 62, 178 72" fill="none" stroke={INK} strokeWidth={2} />
        <T x={130} y={118} s={10}>Sperm</T><T x={130} y={130} s={10}>cell</T><T x={130} y={144} s={9} w={500}>tail to swim</T>
        <circle cx={205} cy={70} r={11} fill="#cdb4db" stroke={INK} strokeWidth={1.5} />
        <path d="M216 70 L 236 70 M197 62 l -8 -8 M197 78 l -8 8 M236 70 l 8 -8 M236 70 l 8 8" stroke={INK} strokeWidth={2} />
        <T x={218} y={118} s={10}>Nerve</T><T x={218} y={130} s={10}>cell</T><T x={214} y={144} s={9} w={500}>impulses</T>
        <rect x={262} y={50} width={30} height={40} rx={4} fill="#d8f3dc" stroke={INK} strokeWidth={1.5} />
        <path d="M277 90 L 277 98 L 312 100" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <T x={280} y={118} s={10}>Root hair</T><T x={280} y={130} s={10}>cell</T><T x={280} y={144} s={9} w={500}>absorbs water</T>
        <T x={160} y={170} s={12} w={500}>Special shape → special job</T>
      </>
    ),
  },
  unicellular: {
    alt: 'The picture shows two single-celled organisms. An amoeba is a blob that moves with false feet called pseudopods. A euglena is an oval cell with a whip-like flagellum, green chloroplasts and a red eyespot.',
    draw: () => (
      <>
        <path d="M30 80 C 30 45, 70 40, 85 55 C 105 40, 135 60, 120 85 C 140 105, 105 130, 80 115 C 55 135, 25 115, 30 80 Z" fill="#bde0fe" stroke={INK} strokeWidth={2} />
        <circle cx={78} cy={84} r={10} fill="#9b5de5" />
        <T x={80} y={150} s={13}>Amoeba</T><T x={80} y={166} s={10} w={500}>moves with pseudopods</T>
        <ellipse cx={230} cy={84} rx={46} ry={24} fill="#d8f3dc" stroke={INK} strokeWidth={2} />
        <path d="M184 80 C 165 60, 160 100, 140 78" fill="none" stroke={INK} strokeWidth={2} />
        {[[220, 76], [240, 92], [252, 74]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={8} ry={5} fill="#2b9348" />)}
        <circle cx={196} cy={78} r={4} fill="#e63946" />
        <T x={230} y={150} s={13}>Euglena</T><T x={230} y={166} s={10} w={500}>flagellum, chloroplasts, eyespot</T>
      </>
    ),
  },
  interdependence: {
    alt: 'The picture shows grass, rabbits and a fox linked by arrows. If the foxes disappear, rabbits increase, and then the grass decreases.',
    draw: () => (
      <>
        <E x={50} y={60} s={40}>🌱</E><E x={160} y={60} s={40}>🐇</E><E x={270} y={60} s={40}>🦊</E>
        <Ar x1={78} y1={60} x2={130} y2={60} c="#2a9d8f" /><Ar x1={188} y1={60} x2={240} y2={60} c="#2a9d8f" />
        <T x={160} y={104} s={12} w={500}>arrows show energy going to the eater</T>
        <T x={270} y={140} s={14}>Fox ↓</T><T x={160} y={140} s={14}>Rabbits ↑</T><T x={50} y={140} s={14}>Grass ↓</T>
        <Ar x1={240} y1={136} x2={196} y2={136} c="#d62828" /><Ar x1={124} y1={136} x2={80} y2={136} c="#d62828" />
        <T x={160} y={168} s={12} w={500}>Change one link and the whole web changes</T>
      </>
    ),
  },
  adaptation: {
    alt: 'The picture shows three adapted living things: a polar bear with thick white fur, a camel that stores fat in its hump, and a cactus with spines instead of leaves.',
    draw: () => (
      <>
        <Tile x={10} y={14} w={96} h={152} f="#e0fbfc" icon="🐻‍❄️" title="Polar bear" sub="thick white fur" />
        <Tile x={112} y={14} w={96} h={152} f="#ffe8b6" icon="🐫" title="Camel" sub="fat stored in hump" />
        <Tile x={214} y={14} w={96} h={152} f="#d8f3dc" icon="🌵" title="Cactus" sub="spines, stores water" />
      </>
    ),
  },
  'periodic-table': {
    alt: 'The picture shows a simplified periodic table. Metals are on the left and in the middle, non-metals are on the right. Columns are called groups and rows are called periods.',
    draw: () => {
      const cells: ReactElement[] = [];
      const has = (r: number, c: number) => r === 0 ? c === 0 || c === 17 : r < 3 ? c < 2 || c > 11 : true;
      for (let r = 0; r < 6; r++) for (let c = 0; c < 18; c++) {
        if (!has(r, c)) continue;
        // Simplified staircase: hydrogen plus the top-right corner are non-metals.
        const nonMetal = (r === 0 && c === 0) || (c >= 12 + r && c < 17);
        cells.push(<rect key={`${r}-${c}`} x={14 + c * 16} y={26 + r * 16} width={15} height={15} rx={2} fill={c === 17 ? '#cdb4db' : nonMetal ? '#ffe08a' : '#a0c4ff'} stroke={INK} strokeWidth={0.6} />);
      }
      return (
        <>
          {cells}
          <Ar x1={22} y1={128} x2={22} y2={150} /><T x={30} y={146} a="start" s={11}>Group = column</T>
          <Ar x1={150} y1={150} x2={196} y2={150} /><T x={204} y={154} a="start" s={11}>Period = row</T>
          <rect x={14} y={162} width={10} height={10} fill="#a0c4ff" stroke={INK} strokeWidth={0.6} /><T x={28} y={171} a="start" s={10}>metals</T>
          <rect x={82} y={162} width={10} height={10} fill="#ffe08a" stroke={INK} strokeWidth={0.6} /><T x={96} y={171} a="start" s={10}>non-metals</T>
          <rect x={170} y={162} width={10} height={10} fill="#cdb4db" stroke={INK} strokeWidth={0.6} /><T x={184} y={171} a="start" s={10}>noble gases</T>
        </>
      );
    },
  },
  'changes-of-state': {
    alt: 'The picture shows solid, liquid and gas in a triangle with arrows. Melting turns solid to liquid and freezing turns it back. Evaporating turns liquid to gas and condensing turns it back. Sublimation goes straight from solid to gas.',
    draw: () => (
      <>
        <R x={20} y={110} w={80} h={40} f="#a0c4ff" label="Solid" ls={14} />
        <R x={220} y={110} w={80} h={40} f="#9bf6ff" label="Liquid" ls={14} />
        <R x={120} y={14} w={80} h={40} f="#ffc6ff" label="Gas" ls={14} />
        <Ar x1={102} y1={122} x2={218} y2={122} /><T x={160} y={116} s={11}>melting</T>
        <Ar x1={218} y1={140} x2={102} y2={140} /><T x={160} y={158} s={11}>freezing</T>
        <Ar x1={244} y1={108} x2={194} y2={56} /><T x={244} y={74} a="start" s={11}>evaporating</T>
        <Ar x1={184} y1={58} x2={232} y2={108} c="#457b9d" /><T x={196} y={88} a="end" s={10} c="#457b9d">condensing</T>
        <Ar x1={64} y1={108} x2={122} y2={50} c="#9d4edd" /><T x={14} y={72} a="start" s={11} c="#9d4edd">sublimation</T>
      </>
    ),
  },
  diffusion: {
    alt: 'The picture shows diffusion: particles bunched up on one side spread out until they are evenly mixed, moving from high to low concentration. A second box shows gas particles hitting the walls, which causes gas pressure.',
    draw: () => {
      const dots = (pts: number[][], f: string) => pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4.5} fill={f} />);
      return (
        <>
          <R x={10} y={30} w={80} h={70} f="#fff" />
          {dots([[22, 44], [30, 56], [20, 70], [34, 84], [26, 92], [40, 46], [38, 66], [48, 76]], '#e63946')}
          <Ar x1={96} y1={65} x2={126} y2={65} />
          <R x={132} y={30} w={80} h={70} f="#fff" />
          {dots([[144, 42], [170, 50], [196, 40], [150, 72], [182, 68], [204, 86], [160, 92], [138, 88]], '#e63946')}
          <T x={110} y={122} s={12}>high → low concentration</T>
          <T x={110} y={140} s={11} w={500}>faster when hotter</T>
          <R x={232} y={30} w={78} h={70} f="#fff" />
          {[[250, 50, 236, 42], [290, 70, 306, 64], [262, 84, 254, 98]].map(([x, y, x2, y2], i) => <g key={i}><circle cx={x} cy={y} r={4.5} fill="#457b9d" /><Ar x1={x} y1={y} x2={x2} y2={y2} w={1.5} /></g>)}
          <T x={271} y={122} s={12}>Gas pressure</T>
          <T x={271} y={140} s={10} w={500}>particles hit</T>
          <T x={271} y={154} s={10} w={500}>the walls</T>
        </>
      );
    },
  },
  'balanced-forces': {
    alt: 'The picture shows two boxes. The first has 10 newtons pushing each way: balanced, so its motion does not change. The second has 20 newtons right and 5 newtons left: an unbalanced resultant of 15 newtons right, so it speeds up.',
    draw: () => (
      <>
        <R x={130} y={30} w={60} h={40} f="#cdb4db" />
        <Ar x1={190} y1={50} x2={250} y2={50} c="#2a9d8f" w={4} /><T x={222} y={42} s={11}>10 N</T>
        <Ar x1={130} y1={50} x2={70} y2={50} c="#d62828" w={4} /><T x={98} y={42} s={11}>10 N</T>
        <T x={160} y={88} s={12}>Balanced: no change in motion</T>
        <R x={130} y={104} w={60} h={40} f="#cdb4db" />
        <Ar x1={190} y1={124} x2={290} y2={124} c="#2a9d8f" w={4} /><T x={242} y={116} s={11}>20 N</T>
        <Ar x1={130} y1={124} x2={100} y2={124} c="#d62828" w={4} /><T x={108} y={116} s={11}>5 N</T>
        <T x={160} y={164} s={12}>Unbalanced: 15 N right → speeds up</T>
      </>
    ),
  },
  'mass-weight': {
    alt: 'The picture shows an astronaut with a mass of 50 kilograms. On Earth, where g is 10 newtons per kilogram, the weight is 500 newtons. On the Moon, where g is about 1.6, the weight is about 80 newtons. The mass stays the same.',
    draw: () => (
      <>
        <circle cx={80} cy={150} r={70} fill="#90be6d" stroke={INK} />
        <E x={80} y={56} s={40}>🧑‍🚀</E>
        <T x={80} y={18} s={13}>Earth</T>
        <T x={80} y={100} s={12}>mass 50 kg</T>
        <T x={80} y={116} s={12}>weight 500 N</T>
        <circle cx={240} cy={150} r={70} fill="#d9d9d9" stroke={INK} />
        <E x={240} y={56} s={40}>🧑‍🚀</E>
        <T x={240} y={18} s={13}>Moon</T>
        <T x={240} y={100} s={12}>mass 50 kg</T>
        <T x={240} y={116} s={12}>weight 80 N</T>
        <T x={160} y={36} s={13}>W = m × g</T>
        <T x={160} y={52} s={9} w={500}>mass stays the same</T>
      </>
    ),
  },
  'friction-drag': {
    alt: 'The picture shows a cyclist moving right with air resistance pushing back, and a box sliding on rough ground with friction pushing back against the movement.',
    draw: () => (
      <>
        <E x={90} y={50} s={42}>🚴</E>
        <Ar x1={60} y1={50} x2={140} y2={50} c="#2a9d8f" w={3} />
        <T x={230} y={40} s={12}>Air resistance (drag)</T>
        <Ar x1={210} y1={54} x2={150} y2={54} c="#d62828" w={3} />
        <T x={230} y={72} s={10} w={500}>gets bigger as you go faster</T>
        <line x1={20} y1={150} x2={300} y2={150} stroke={INK} strokeWidth={2} />
        <path d="M20 150 l6 6 M40 150 l6 6 M60 150 l6 6 M80 150 l6 6 M100 150 l6 6 M120 150 l6 6 M140 150 l6 6" stroke={INK} />
        <R x={130} y={112} w={60} h={38} f="#ffd6a5" />
        <Ar x1={190} y1={130} x2={250} y2={130} c="#2a9d8f" w={3} /><T x={252} y={122} a="start" s={11}>push</T>
        <Ar x1={128} y1={146} x2={78} y2={146} c="#d62828" w={3} /><T x={30} y={136} a="start" s={11}>friction</T>
      </>
    ),
  },
  spring: {
    alt: 'The picture shows a spring 10 centimetres long. With a weight hanging on it, it stretches to 14 centimetres. The extension is 14 minus 10, which is 4 centimetres.',
    draw: () => {
      const coil = (x: number, top: number, len: number) => {
        let d = `M${x} ${top}`;
        const n = 8, step = len / n;
        for (let i = 0; i < n; i++) d += ` L${x + (i % 2 ? -10 : 10)} ${top + step * (i + 0.5)}`;
        return d + ` L${x} ${top + len}`;
      };
      return (
        <>
          <line x1={40} y1={18} x2={260} y2={18} stroke={INK} strokeWidth={4} />
          <path d={coil(90, 18, 70)} fill="none" stroke={INK} strokeWidth={2} />
          <T x={90} y={110} s={12}>10 cm</T>
          <path d={coil(210, 18, 98)} fill="none" stroke={INK} strokeWidth={2} />
          <R x={192} y={116} w={36} h={26} f="#ffd166" label="2 N" ls={11} />
          <line x1={150} y1={88} x2={250} y2={88} stroke="#d62828" strokeDasharray="4 3" />
          <line x1={150} y1={116} x2={250} y2={116} stroke="#d62828" strokeDasharray="4 3" />
          <T x={262} y={106} a="start" s={11} c="#d62828">4 cm</T>
          <T x={160} y={166} s={12}>extension = stretched length − original</T>
        </>
      );
    },
  },
  speed: {
    alt: 'The picture shows a runner covering 100 metres in 20 seconds. Speed equals distance divided by time, so the speed is 5 metres per second.',
    draw: () => (
      <>
        <line x1={20} y1={90} x2={300} y2={90} stroke={INK} strokeWidth={3} />
        <line x1={20} y1={80} x2={20} y2={100} stroke={INK} strokeWidth={3} /><line x1={300} y1={80} x2={300} y2={100} stroke={INK} strokeWidth={3} />
        <E x={60} y={64} s={36}>🏃</E>
        <T x={160} y={112} s={13}>100 m in 20 s</T>
        <T x={160} y={142} s={16}>speed = distance ÷ time</T>
        <T x={160} y={166} s={14}>100 ÷ 20 = 5 m/s</T>
        <E x={276} y={64} s={28}>⏱️</E>
      </>
    ),
  },
};
