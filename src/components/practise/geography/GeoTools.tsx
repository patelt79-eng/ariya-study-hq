// Water cycle drag-and-drop, plate boundary animations and the Pangaea drift slider.
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Draggable } from '../../dnd/Draggable';
import { CONTINENTS, MAP_H, MAP_W, toPath, type ContinentId } from './geoData';
import { useProgress } from '../../../state/progress';
import { play } from '../../../lib/sound';
import { celebrate } from '../../../lib/confetti';
import { shuffle } from '../../../lib/random';

// ---------- water cycle ----------
const WC_SPOTS: Record<string, [number, number]> = {
  Evaporation: [92, 150], Transpiration: [262, 150], Condensation: [175, 30], Precipitation: [330, 82],
  'Surface runoff': [355, 205], Percolation: [255, 252], 'Groundwater flow': [150, 285],
};
const WC_LABELS = Object.keys(WC_SPOTS);

export function WaterCycleScene({ animate = true }: { animate?: boolean }) {
  const still = useReducedMotion() || !animate;
  return (
    <svg viewBox="0 0 440 310" style={{ width: '100%', display: 'block', borderRadius: 14 }} role="img" aria-label="Water cycle diagram with sea, sun, clouds, mountain, trees, soil and rock">
      <rect width={440} height={310} fill="#bde0fe" />
      <circle cx={40} cy={40} r={24} fill="#ffd166" />
      <path d="M0 205 L150 205 L150 310 L0 310 Z" fill="#1d6fa3" />
      <path d="M150 205 L230 190 L300 120 L360 50 L420 120 L440 140 L440 310 L150 310 Z" fill="#7cb518" />
      <path d="M150 240 L440 240 L440 310 L150 310 Z" fill="#a47148" />
      <path d="M150 275 L440 275 L440 310 L150 310 Z" fill="#6c584c" />
      <text x={420} y={234} textAnchor="end" fontSize={10} fill="#fff">soil</text>
      <text x={420} y={298} textAnchor="end" fontSize={10} fill="#fff">rock</text>
      {[[240, 185], [270, 168], [215, 192]].map(([x, y], i) => <g key={i}><rect x={x - 3} y={y} width={6} height={14} fill="#6f4518" /><circle cx={x} cy={y - 6} r={12} fill="#2d6a4f" /></g>)}
      <ellipse cx={200} cy={45} rx={60} ry={22} fill="#fff" />
      <ellipse cx={330} cy={42} rx={55} ry={20} fill="#e9ecef" />
      {/* arrows */}
      {[['M80 195 C80 140 140 90 165 65', 'evap'], ['M262 165 C262 120 230 90 205 72', 'trans'], ['M375 210 C410 230 420 240 430 245', 'run'], ['M140 290 L60 290', 'gw']].map(([d, k]) => (
        <motion.path key={k} d={d} fill="none" stroke="#0b3954" strokeWidth={2.5} strokeDasharray="6 6" markerEnd="url(#wca)"
          animate={still ? undefined : { strokeDashoffset: [24, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
      ))}
      <path d="M255 245 L255 268" stroke="#0b3954" strokeWidth={2.5} markerEnd="url(#wca)" />
      {!still && Array.from({ length: 8 }, (_, i) => (
        <motion.line key={i} x1={300 + i * 8} x2={298 + i * 8} y1={60} y2={68} stroke="#1d6fa3" strokeWidth={2}
          animate={{ y: [0, 80], opacity: [1, 0] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.14, ease: 'easeIn' }} />
      ))}
      {still && Array.from({ length: 6 }, (_, i) => <line key={i} x1={300 + i * 10} x2={296 + i * 10} y1={70 + (i % 2) * 12} y2={80 + (i % 2) * 12} stroke="#1d6fa3" strokeWidth={2} />)}
      <defs><marker id="wca" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#0b3954" /></marker></defs>
    </svg>
  );
}

export function WaterCycle() {
  const { award } = useProgress();
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [labels] = useState(() => shuffle(WC_LABELS));
  const used = new Set(Object.values(placed));
  const place = (spot: string, label: string) => {
    setPlaced((p) => { const n = { ...p }; for (const k of Object.keys(n)) if (n[k] === label) delete n[k]; n[spot] = label; return n; });
    setSel(null); setChecked(false); play('click');
  };
  const score = Object.entries(placed).filter(([s, l]) => s === l).length;
  return (
    <section className="card stack">
      <h2>Water cycle</h2>
      <p className="small muted" style={{ margin: 0 }}>Drag each process onto the right dot (or tap a label, then tap a dot).</p>
      <div style={{ position: 'relative', maxWidth: 640, width: '100%', margin: '0 auto' }}>
        <WaterCycleScene />
        {WC_LABELS.map((spot) => {
          const [x, y] = WC_SPOTS[spot];
          const v = placed[spot];
          return (
            <button key={spot} data-drop={spot} className={`drop-target chip ${checked && v ? (v === spot ? 'placed-good' : 'placed-bad') : ''}`}
              onClick={() => sel && place(spot, sel)} aria-label={v ? `Spot labelled ${v}` : 'Empty label spot'}
              style={{ position: 'absolute', left: `${(x / 440) * 100}%`, top: `${(y / 310) * 100}%`, transform: 'translate(-50%, -50%)', fontSize: 12,
                minHeight: 30, minWidth: v ? 0 : 30, padding: v ? '3px 8px' : 0, borderRadius: v ? 10 : '50%', borderStyle: v ? 'solid' : 'dashed',
                background: v ? 'var(--surface-solid)' : 'rgba(255,255,255,0.9)', color: v ? 'var(--text)' : '#222', borderColor: '#0b3954' }}>
              {v ?? '?'}
            </button>
          );
        })}
      </div>
      <div className="row">
        {labels.filter((l) => !used.has(l)).map((l) => <Draggable key={l} selected={sel === l} onTap={() => setSel(sel === l ? null : l)} onDrop={(s) => place(s, l)}>{l}</Draggable>)}
      </div>
      <div className="row">
        <button className="btn" disabled={used.size < WC_LABELS.length} onClick={() => {
          setChecked(true);
          if (score === WC_LABELS.length) { celebrate(); play('levelup'); award(25, 'Water cycle'); } else play('wrong');
        }}>Check</button>
        <button className="btn secondary" onClick={() => { setPlaced({}); setChecked(false); }}>Reset</button>
        {checked && <strong role="status">{score} / {WC_LABELS.length}{score === WC_LABELS.length ? ' 🎉' : ''}</strong>}
      </div>
    </section>
  );
}

// ---------- plate boundaries ----------
type Boundary = 'convergent' | 'divergent' | 'conservative';
const BOUNDARY_INFO: Record<Boundary, { title: string; text: string[]; example: string }> = {
  convergent: { title: 'Convergent (destructive)', example: 'Example: the Andes, where the Nazca plate sinks under the South American plate.',
    text: ['Plates move towards each other.', 'The denser oceanic plate sinks (subducts) under the continental plate and melts.', 'Magma rises to form explosive volcanoes; strong earthquakes and tsunamis can happen.'] },
  divergent: { title: 'Divergent (constructive)', example: 'Example: the Mid-Atlantic Ridge and Iceland.',
    text: ['Plates move apart.', 'Magma rises to fill the gap and cools to make new crust.', 'Gentler volcanoes and small earthquakes.'] },
  conservative: { title: 'Conservative', example: 'Example: the San Andreas Fault, California.',
    text: ['Plates slide past each other (in the same or opposite directions).', 'They stick, pressure builds, then they jerk free.', 'Earthquakes, but no volcanoes (no magma rises).'] },
};

export function PlateBoundaries() {
  const [b, setB] = useState<Boundary>('convergent');
  const [run, setRun] = useState(0);
  const reduce = useReducedMotion();
  const info = BOUNDARY_INFO[b];
  const dur = reduce ? 0 : 3;
  return (
    <section className="card stack">
      <h2>Plate boundaries</h2>
      <div className="tabs" role="tablist">
        {(Object.keys(BOUNDARY_INFO) as Boundary[]).map((k) => <button key={k} role="tab" className="tab" aria-selected={b === k} onClick={() => { setB(k); setRun((r) => r + 1); }}>{BOUNDARY_INFO[k].title}</button>)}
      </div>
      <svg key={b + run} viewBox="0 0 400 220" style={{ width: '100%', maxWidth: 600, margin: '0 auto', display: 'block', background: '#bde0fe', borderRadius: 14 }} role="img" aria-label={`${info.title} boundary animation`}>
        {b !== 'conservative' && <rect y={150} width={400} height={70} fill="#e76f51" opacity={0.85} />}
        {b !== 'conservative' && <text x={10} y={210} fontSize={11} fill="#fff">mantle</text>}
        {b === 'convergent' && (
          <>
            <motion.g animate={{ x: [0, 40] }} transition={{ duration: dur, repeat: reduce ? 0 : Infinity, repeatType: 'reverse' }}>
              <rect x={0} y={120} width={200} height={30} fill="#264653" />
              <motion.path d="M200 120 L240 165 L240 195 L200 150 Z" fill="#264653" />
              <text x={50} y={140} fill="#fff" fontSize={12}>Oceanic plate →</text>
            </motion.g>
            <rect x={200} y={100} width={200} height={50} fill="#8d6e63" />
            <text x={250} y={130} fill="#fff" fontSize={12}>← Continental plate</text>
            <path d="M270 100 L300 50 L330 100 Z" fill="#6d4c41" />
            <motion.path d="M300 50 L300 30" stroke="#f94144" strokeWidth={8} strokeLinecap="round" animate={reduce ? undefined : { opacity: [0, 1, 0], y: [5, -10, -20] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.circle cx={300} cy={22} r={10} fill="#6c757d" animate={reduce ? undefined : { scale: [0.5, 1.6], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            <text x={180} y={190} fontSize={11} fill="#fff">subduction: plate melts</text>
          </>
        )}
        {b === 'divergent' && (
          <>
            <motion.rect x={0} y={120} width={195} height={30} fill="#264653" animate={{ x: [0, -30] }} transition={{ duration: dur, repeat: reduce ? 0 : Infinity, repeatType: 'reverse' }} />
            <motion.rect x={205} y={120} width={195} height={30} fill="#264653" animate={{ x: [0, 30] }} transition={{ duration: dur, repeat: reduce ? 0 : Infinity, repeatType: 'reverse' }} />
            <motion.rect x={185} y={110} width={30} height={60} fill="#f94144" animate={reduce ? undefined : { scaleY: [0.7, 1.1, 0.7] }} transition={{ duration: 1.6, repeat: Infinity }} />
            <text x={30} y={110} fontSize={12} fill="#264653">← plate</text>
            <text x={320} y={110} fontSize={12} fill="#264653">plate →</text>
            <text x={160} y={95} fontSize={11} fill="#264653">magma rises: new crust</text>
          </>
        )}
        {b === 'conservative' && (
          <>
            <text x={10} y={20} fontSize={11} fill="#264653">View from above</text>
            <motion.g animate={{ x: reduce ? 0 : [0, 60, 60, 0] }} transition={{ duration: 4, repeat: reduce ? 0 : Infinity, times: [0, 0.45, 0.5, 1] }}>
              <rect x={-60} y={30} width={520} height={80} fill="#8d6e63" /><text x={150} y={75} fill="#fff" fontSize={12}>plate → →</text>
            </motion.g>
            <motion.g animate={{ x: reduce ? 0 : [0, -60, -60, 0] }} transition={{ duration: 4, repeat: reduce ? 0 : Infinity, times: [0, 0.45, 0.5, 1] }}>
              <rect x={-60} y={112} width={520} height={80} fill="#6d4c41" /><text x={150} y={155} fill="#fff" fontSize={12}>← ← plate</text>
            </motion.g>
            <motion.text x={200} y={108} textAnchor="middle" fontSize={22} animate={reduce ? undefined : { opacity: [0, 0, 1, 0], scale: [1, 1, 1.4, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.44, 0.5, 0.6] }}>💥</motion.text>
            <text x={200} y={210} textAnchor="middle" fontSize={11} fill="#264653">fault line: plates stick, then jerk → earthquake</text>
          </>
        )}
      </svg>
      <div className="card flat">
        <strong>{info.title}</strong>
        <ul style={{ margin: '6px 0', paddingLeft: 20 }}>{info.text.map((t) => <li key={t}>{t}</li>)}</ul>
        <div className="small muted">{info.example}</div>
      </div>
    </section>
  );
}

// ---------- Pangaea drift ----------
// Offsets for each continent 200 million years ago (schematic): [dx, dy, rotation°, horizontal squash].
// Antarctica is drawn as a full-width strip on a flat map, so it is squeezed into a compact shape in the past.
const PANGAEA_OFFSET: Record<ContinentId, [number, number, number, number]> = {
  'North America': [135, 30, 5, 1],
  'South America': [95, -12, -12, 1],
  Europe: [0, 30, 0, 1],
  Africa: [0, 15, 0, 1],
  Asia: [-20, 30, 0, 1],
  Oceania: [-235, 35, 40, 1],
  Antarctica: [0, -72, 0, 0.32],
};

export function PangaeaSlider() {
  const [mya, setMya] = useState(200);
  const t = mya / 200;
  const ids = Object.keys(CONTINENTS) as ContinentId[];
  return (
    <section className="card stack">
      <h2>Pangaea drift</h2>
      <p className="small muted" style={{ margin: 0 }}>Slide from 200 million years ago to today and watch Pangaea break apart. (Simplified: the real movements were more complicated.)</p>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ width: '100%', display: 'block', background: '#6fb7d6', borderRadius: 14 }} role="img" aria-label={`World map ${mya} million years ago`}>
        {ids.map((c) => {
          const [dx, dy, rot, sq] = PANGAEA_OFFSET[c];
          const [lx, ly] = [(CONTINENTS[c].label[0] + 180) / 360 * MAP_W, (90 - CONTINENTS[c].label[1]) / 180 * MAP_H];
          const sx = 1 - (1 - sq) * t;
          return (
            <g key={c} transform={`translate(${dx * t} ${dy * t}) rotate(${rot * t} ${lx} ${ly})`}>
              <g transform={`translate(${lx} 0) scale(${sx} 1) translate(${-lx} 0)`}>
                {CONTINENTS[c].shapes.map((s, i) => <path key={i} d={toPath(s)} fill={CONTINENTS[c].colour} stroke="#3d2c1e" strokeWidth={1.2} />)}
              </g>
              <text x={lx} y={ly} textAnchor="middle" fontSize={14} fontWeight={700} fill="#222">{c}</text>
            </g>
          );
        })}
        <text x={20} y={34} fontSize={26} fontWeight={800} fill="#fff">{mya === 0 ? 'Today' : `${mya} million years ago`}</text>
        {mya > 150 && <text x={20} y={64} fontSize={16} fill="#fff">Pangaea: one supercontinent, one ocean (Panthalassa)</text>}
      </svg>
      <input type="range" min={0} max={200} step={5} value={200 - mya} onChange={(e) => setMya(200 - Number(e.target.value))} aria-label="Time from 200 million years ago to today" style={{ width: '100%', minHeight: 44 }} />
      <div className="row small muted" style={{ justifyContent: 'space-between' }}><span>200 million years ago</span><span>Today</span></div>
      <div className="card flat">Why did it split? <strong>Convection currents</strong> in the mantle: heat from the core makes hot rock rise, spread out, cool and sink, dragging the plates apart. The continents are still moving a few centimetres every year.</div>
    </section>
  );
}
