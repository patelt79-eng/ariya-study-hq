// Small built-in diagrams for Learn cards. Content files refer to them by name.
import type { ReactNode } from 'react';
import { AngleDiagram } from '../practise/maths/AngleDiagram';
import { SCIENCE_DIAGRAMS } from '../practise/science/ScienceDiagrams';
import { GEO_DIAGRAMS } from '../practise/geography/GeoDiagrams';

const box = { width: '100%', maxWidth: 420, display: 'block', margin: '8px auto', background: 'var(--surface-solid)', borderRadius: 12 } as const;

const DIAGRAMS: Record<string, () => ReactNode> = {
  'angles-line': () => <AngleDiagram spec={{ type: 'line', angles: [130, 50], unknown: 1 }} label="Straight line: 130 degrees and x, so x is 50 degrees" />,
  'angles-triangle': () => <AngleDiagram spec={{ type: 'triangle', angles: [60, 70, 50], unknown: 2 }} label="Triangle: 60 and 70 degrees, so x is 50 degrees" />,
  'angles-quad': () => <AngleDiagram spec={{ type: 'quad', angles: [80, 110, 95, 75], unknown: 3 }} label="Quadrilateral: 80, 110 and 95 degrees, so x is 75 degrees" />,
  'bar-model': () => (
    <svg viewBox="0 0 320 90" style={box} role="img" aria-label="Bar model: 40 pounds split into 8 boxes of 5 pounds, 3 for one person and 5 for the other">
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={10 + i * 37.5} y={20} width={35} height={36} rx={5} fill={i < 3 ? '#4cc9f0' : '#f72585'} />
          <text x={27.5 + i * 37.5} y={43} textAnchor="middle" fontSize={13} fontWeight={700} fill="#111">£5</text>
        </g>
      ))}
      <text x={60} y={14} textAnchor="middle" className="svg-text" fontSize={12}>3 parts = £15</text>
      <text x={220} y={14} textAnchor="middle" className="svg-text" fontSize={12}>5 parts = £25</text>
      <text x={160} y={78} textAnchor="middle" className="svg-text" fontSize={12}>Total £40 ÷ 8 parts = £5 each</text>
    </svg>
  ),
  ...SCIENCE_DIAGRAMS,
  ...GEO_DIAGRAMS,
  'number-line': () => (
    <svg viewBox="0 0 340 70" style={box} role="img" aria-label="Number line from minus 5 to 5">
      <line x1={10} y1={35} x2={330} y2={35} stroke="var(--text)" strokeWidth={2} />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <line x1={20 + i * 30} y1={28} x2={20 + i * 30} y2={42} stroke="var(--text)" strokeWidth={2} />
          <text x={20 + i * 30} y={60} textAnchor="middle" fontSize={13} className="svg-text" fontWeight={i === 5 ? 700 : 400}>{i - 5 < 0 ? `−${5 - i}` : i - 5}</text>
        </g>
      ))}
      <text x={60} y={18} fontSize={12} className="svg-text">← smaller</text>
      <text x={250} y={18} fontSize={12} className="svg-text">bigger →</text>
    </svg>
  ),
};

export function registerDiagrams(more: Record<string, () => ReactNode>) { Object.assign(DIAGRAMS, more); }

export function Diagram({ name }: { name: string }) {
  const d = DIAGRAMS[name];
  return d ? <>{d()}</> : null;
}

/** Short spoken descriptions of each diagram, read after the card's text in Listen mode. */
const DIAGRAM_TEXT: Record<string, string> = {
  'angles-line': 'The picture shows a straight line with a line coming out of it. One angle is 130 degrees and the other is x. They add up to 180, so x is 50 degrees.',
  'angles-triangle': 'The picture shows a triangle with angles of 60 degrees, 70 degrees and x. They add up to 180, so x is 50 degrees.',
  'angles-quad': 'The picture shows a four-sided shape with angles of 80, 110 and 95 degrees, and x. They add up to 360, so x is 75 degrees.',
  'bar-model': 'The picture shows a bar split into 8 equal boxes of 5 pounds each. 3 boxes, 15 pounds, are one colour, and 5 boxes, 25 pounds, are another. The whole bar is 40 pounds.',
  'number-line': 'The picture shows a number line from minus 5 to 5. Numbers on the left are smaller; numbers on the right are bigger.',
  'animal-cell': 'The picture shows an animal cell: a rounded shape with a cell membrane around the outside, cytoplasm inside, a nucleus in the middle, orange mitochondria and tiny dots for ribosomes.',
  'plant-cell': 'The picture shows a plant cell: a box shape with a thick cell wall, a cell membrane, a large vacuole in the middle, a nucleus, green chloroplasts, a mitochondrion and ribosomes.',
  particles: 'The picture shows three boxes of particles. In the solid, they are packed in neat rows. In the liquid, they are close together but jumbled. In the gas, they are far apart.',
  'food-chain': 'The picture shows a food chain: grass, then an arrow to a rabbit, then an arrow to a fox. Grass is the producer, the rabbit is the primary consumer and the fox is the secondary consumer.',
  atoms: 'The picture shows an element, where every atom is the same; a compound, where different atoms are joined in pairs; and a mixture, where different atoms are mixed but not joined.',
  microscope: 'The picture shows a light microscope: the eyepiece lens at the top, the objective lens below it, the stage where the slide goes, a light at the bottom, and focus knobs on the side.',
  'force-arrows': 'The picture shows a box with a 20 newton arrow pushing right and a 5 newton arrow pushing left. The resultant force is 15 newtons to the right.',
  'world-map': 'The picture is a world map showing the seven continents: North America, South America, Europe, Africa, Asia, Oceania and Antarctica, with the Equator across the middle.',
  'water-cycle': 'The picture shows the water cycle: the sun heats the sea, water evaporates and rises from the sea and the trees, clouds form, rain falls on a mountain, water runs off over the land, soaks into the soil and rock, and flows back to the sea.',
  convection: 'The picture shows convection currents: heat from the core makes rock in the mantle rise, spread out under the plates, cool down and sink again, pulling the plates apart.',
  boundaries: 'The picture shows three plate boundaries. Convergent: arrows pointing towards each other. Divergent: arrows pointing apart. Conservative: arrows sliding past each other.',
};

export function diagramText(name?: string): string {
  return name ? DIAGRAM_TEXT[name] ?? '' : '';
}
