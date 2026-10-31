// Interactive world map: explore, "find it" quiz, find the biome, and the UK's countries and capitals.
import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BIOMES, CONTINENTS, MAP_H, MAP_W, OCEANS, UK, proj, toPath, type BiomeId, type ContinentId, type LonLat, type OceanId } from './geoData';
import { pick, shuffle } from '../../../lib/random';
import { play } from '../../../lib/sound';
import { useProgress } from '../../../state/progress';

type Mode = 'explore' | 'find' | 'biome' | 'uk';
const CONT_IDS = Object.keys(CONTINENTS) as ContinentId[];
const OCEAN_IDS = Object.keys(OCEANS) as OceanId[];

/** Base map: sea, graticule, continents. */
export function BaseMap({ onContinent, highlight, children, svgRef, onSea, label = true }: {
  onContinent?: (c: ContinentId) => void; highlight?: Partial<Record<ContinentId, string>>; children?: React.ReactNode;
  svgRef?: React.Ref<SVGSVGElement>; onSea?: (e: React.MouseEvent<SVGRectElement>) => void; label?: boolean;
}) {
  return (
    <svg ref={svgRef} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ width: '100%', display: 'block', borderRadius: 14, border: '2px solid var(--border)' }} role="img" aria-label="World map">
      <rect width={MAP_W} height={MAP_H} fill="#6fb7d6" onClick={onSea} />
      {[-60, -30, 0, 30, 60].map((lat) => <line key={lat} x1={0} x2={MAP_W} y1={proj([0, lat])[1]} y2={proj([0, lat])[1]} stroke="#ffffff" strokeOpacity={lat === 0 ? 0.6 : 0.2} strokeDasharray={lat === 0 ? '6 4' : undefined} pointerEvents="none" />)}
      <text x={8} y={proj([0, 0])[1] - 4} fontSize={11} fill="#fff" opacity={0.8} pointerEvents="none">Equator</text>
      {CONT_IDS.map((c) => (
        <g key={c} onClick={() => onContinent?.(c)} style={{ cursor: onContinent ? 'pointer' : 'default' }} role={onContinent ? 'button' : undefined} aria-label={onContinent ? c : undefined}>
          {CONTINENTS[c].shapes.map((s, i) => <path key={i} d={toPath(s)} fill={highlight?.[c] ?? '#cbbf8f'} stroke="#5b4636" strokeWidth={1.2} />)}
          {label && <text x={proj(CONTINENTS[c].label)[0]} y={proj(CONTINENTS[c].label)[1]} textAnchor="middle" fontSize={15} fontWeight={700} fill="#222" pointerEvents="none">{c}</text>}
        </g>
      ))}
      {children}
    </svg>
  );
}

function svgPoint(svg: SVGSVGElement | null, e: React.MouseEvent): [number, number] {
  if (!svg) return [0, 0];
  const r = svg.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * MAP_W, ((e.clientY - r.top) / r.height) * MAP_H];
}
const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function WorldMap() {
  const [mode, setMode] = useState<Mode>('explore');
  return (
    <section className="card stack">
      <h2>Interactive world map</h2>
      <div className="tabs" role="tablist">
        {([['explore', 'Explore'], ['find', 'Find it!'], ['biome', 'Find the biome'], ['uk', 'UK countries and capitals']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} role="tab" className="tab" aria-selected={mode === m} onClick={() => setMode(m)}>{l}</button>
        ))}
      </div>
      {mode === 'explore' && <Explore />}
      {mode === 'find' && <FindIt />}
      {mode === 'biome' && <FindBiome />}
      {mode === 'uk' && <UKMap />}
      <p className="small muted" style={{ margin: 0 }}>The map is simplified, so coastlines are approximate.</p>
    </section>
  );
}

function Explore() {
  const [sel, setSel] = useState<{ kind: 'c'; id: ContinentId } | { kind: 'o'; id: OceanId } | null>(null);
  return (
    <>
      <p className="small muted" style={{ margin: 0 }}>Tap a continent or an ocean name to learn about it.</p>
      <BaseMap onContinent={(c) => { setSel({ kind: 'c', id: c }); play('click'); }} highlight={sel?.kind === 'c' ? { [sel.id]: CONTINENTS[sel.id].colour } : undefined}>
        {OCEAN_IDS.flatMap((o) => [OCEANS[o].label, OCEANS[o].extra].filter(Boolean).map((p, k) => {
          const [x, y] = proj(p as LonLat);
          return <text key={o + k} x={x} y={y} textAnchor="middle" fontSize={15} fontStyle="italic" fontWeight={700} fill={sel?.kind === 'o' && sel.id === o ? '#ffd166' : '#0b3954'}
            style={{ cursor: 'pointer' }} role="button" aria-label={`${o} Ocean`} onClick={() => { setSel({ kind: 'o', id: o }); play('click'); }}>{o} Ocean</text>;
        }))}
      </BaseMap>
      {sel && (
        <motion.div key={sel.id} className="card flat" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <strong>{sel.kind === 'c' ? sel.id : `${sel.id} Ocean`}</strong>
          <div>{sel.kind === 'c' ? `Countries include: ${CONTINENTS[sel.id].countries.join(', ')}.` : OCEANS[sel.id].borders}</div>
        </motion.div>
      )}
    </>
  );
}

function FindIt() {
  const { award } = useProgress();
  const ref = useRef<SVGSVGElement>(null);
  const targets = useMemo(() => [...CONT_IDS.map((c) => ({ kind: 'c' as const, id: c })), ...OCEAN_IDS.map((o) => ({ kind: 'o' as const, id: o }))], []);
  const [order, setOrder] = useState(() => shuffle(targets));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [res, setRes] = useState<null | { ok: boolean; said: string }>(null);
  const t = order[i % order.length];

  const answer = (said: string, ok: boolean) => {
    if (res) return;
    setRes({ ok, said });
    if (ok) { setScore((s) => s + 1); play('correct'); award(3); } else play('wrong');
  };
  const onSea = (e: React.MouseEvent) => {
    const p = svgPoint(ref.current, e);
    let best: OceanId = 'Pacific', bd = Infinity;
    for (const o of OCEAN_IDS) for (const l of [OCEANS[o].label, OCEANS[o].extra].filter(Boolean) as LonLat[]) { const d = dist(p, proj(l)); if (d < bd) { bd = d; best = o; } }
    answer(`the ${best} Ocean`, t.kind === 'o' && best === t.id);
  };
  const next = () => { setRes(null); if (i + 1 >= order.length) { setOrder(shuffle(targets)); setI(0); } else setI(i + 1); };

  return (
    <>
      <div className="row"><strong style={{ fontSize: '1.2rem' }}>Tap {t.kind === 'c' ? t.id : `the ${t.id} Ocean`}</strong><span className="spacer" /><span className="pill">✓ {score}</span></div>
      <BaseMap svgRef={ref} label={false} onSea={onSea} onContinent={(c) => answer(c, t.kind === 'c' && c === t.id)}
        highlight={res && t.kind === 'c' ? { [t.id]: res.ok ? '#52b788' : '#ffd166' } : undefined}>
        {res && t.kind === 'o' && [OCEANS[t.id].label, OCEANS[t.id].extra].filter(Boolean).map((p, k) => {
          const [x, y] = proj(p as LonLat);
          return <text key={k} x={x} y={y} textAnchor="middle" fontSize={16} fontWeight={800} fill="#ffd166" stroke="#0b3954" strokeWidth={0.5}>{t.id} Ocean</text>;
        })}
      </BaseMap>
      {res && (
        <div className={`feedback ${res.ok ? 'good' : 'bad'}`} role="status">
          <strong>{res.ok ? 'Correct!' : `Not quite: you tapped ${res.said}.`}</strong> {t.kind === 'c' ? `${t.id} is highlighted. It includes ${CONTINENTS[t.id].countries.slice(0, 3).join(', ')}.` : OCEANS[t.id].borders}
          <div><button className="btn" style={{ marginTop: 8 }} onClick={next}>Next →</button></div>
        </div>
      )}
    </>
  );
}

function FindBiome() {
  const { award } = useProgress();
  const ref = useRef<SVGSVGElement>(null);
  const ids = Object.keys(BIOMES) as BiomeId[];
  const [target, setTarget] = useState<BiomeId>(() => pick(ids));
  const [res, setRes] = useState<null | { ok: boolean; at: [number, number]; msg: string }>(null);
  const [score, setScore] = useState(0);
  const scale = MAP_W / 360;

  const tap = (e: React.MouseEvent) => {
    if (res) return;
    const p = svgPoint(ref.current, e);
    let hit: { biome: BiomeId; name: string } | null = null;
    for (const b of ids) for (const a of BIOMES[b].areas) if (dist(p, proj(a.at)) <= a.r * scale * 1.15) hit = hit ?? { biome: b, name: a.name };
    const inTarget = BIOMES[target].areas.find((a) => dist(p, proj(a.at)) <= a.r * scale * 1.15);
    const ok = !!inTarget;
    setRes({ ok, at: p, msg: ok ? `Yes! That’s the ${inTarget!.name} ${target.toLowerCase()}.` : hit ? `That’s ${hit.name}: a ${hit.biome.toLowerCase()}.` : 'No major biome of that type there.' });
    if (ok) { setScore((s) => s + 1); play('correct'); award(3); } else play('wrong');
  };

  return (
    <>
      <div className="row"><strong style={{ fontSize: '1.2rem' }}>Tap a {target.toLowerCase()}</strong><span className="spacer" /><span className="pill">✓ {score}</span></div>
      <div onClick={tap}>
        <BaseMap svgRef={ref} label={false}>
          {res && ids.map((b) => BIOMES[b].areas.map((a) => {
            const [x, y] = proj(a.at);
            return <circle key={b + a.name} cx={x} cy={y} r={a.r * scale} fill={BIOMES[b].colour} fillOpacity={b === target ? 0.85 : 0.35} stroke="#fff" strokeWidth={b === target ? 2 : 0.5} pointerEvents="none" />;
          }))}
          {res && <circle cx={res.at[0]} cy={res.at[1]} r={7} fill={res.ok ? '#52b788' : '#e63946'} stroke="#fff" strokeWidth={2} pointerEvents="none" />}
        </BaseMap>
      </div>
      {res && (
        <div className={`feedback ${res.ok ? 'good' : 'bad'}`} role="status">
          <strong>{res.ok ? 'Correct!' : 'Not quite.'}</strong> {res.msg} {target}s are shown in bold: {BIOMES[target].areas.map((a) => a.name).join(', ')}.
          <div className="row small" style={{ marginTop: 6 }}>{ids.map((b) => <span key={b} className="pill"><span style={{ width: 12, height: 12, borderRadius: 3, background: BIOMES[b].colour, display: 'inline-block' }} /> {b}</span>)}</div>
          <div><button className="btn" style={{ marginTop: 8 }} onClick={() => { setRes(null); setTarget(pick(ids.filter((b) => b !== target))); }}>Next →</button></div>
        </div>
      )}
    </>
  );
}

function UKMap() {
  const { award } = useProgress();
  const names = Object.keys(UK);
  const [mode, setMode] = useState<'country' | 'capital'>('country');
  const [target, setTarget] = useState(() => pick(names));
  const [res, setRes] = useState<null | boolean>(null);
  const [capPick, setCapPick] = useState<string | null>(null);
  // Local projection for the UK box (lon -8.5…2, lat 49.8…59).
  const P = ([lon, lat]: LonLat): [number, number] => [((lon + 8.6) / 10.6) * 300, ((59 - lat) / 9.4) * 400];
  const path = (pts: LonLat[]) => 'M' + pts.map((p) => P(p).join(' ')).join(' L') + ' Z';
  const caps = useMemo(() => shuffle(names.map((n) => UK[n].capital)), [target]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => { setRes(null); setCapPick(null); setTarget(pick(names.filter((n) => n !== target))); };
  return (
    <>
      <div className="tabs" role="tablist">
        <button role="tab" className="tab" aria-selected={mode === 'country'} onClick={() => { setMode('country'); setRes(null); }}>Tap the country</button>
        <button role="tab" className="tab" aria-selected={mode === 'capital'} onClick={() => { setMode('capital'); setRes(null); }}>Name the capital</button>
      </div>
      <strong style={{ fontSize: '1.2rem' }}>{mode === 'country' ? `Tap ${target}` : `What is the capital of ${target}?`}</strong>
      <svg viewBox="0 0 300 400" style={{ width: '100%', maxWidth: 360, margin: '0 auto', display: 'block', background: '#6fb7d6', borderRadius: 14 }} role="img" aria-label="Map of the UK">
        {names.map((n) => (
          <path key={n} d={path(UK[n].shape)} fill={(res !== null || mode === 'capital') && n === target ? UK[n].colour : '#cbbf8f'} stroke="#5b4636" strokeWidth={1.5}
            role="button" aria-label={n} style={{ cursor: 'pointer' }}
            onClick={() => { if (mode !== 'country' || res !== null) return; const ok = n === target; setRes(ok); if (ok) { play('correct'); award(3); } else play('wrong'); }} />
        ))}
        {(res !== null || mode === 'capital') && names.map((n) => {
          const [x, y] = P(UK[n].at);
          const show = res !== null;
          return <g key={n} pointerEvents="none"><circle cx={x} cy={y} r={4} fill="#111" />{show && <text x={x + 6} y={y + 4} fontSize={12} fontWeight={700} fill="#111">{UK[n].capital}</text>}</g>;
        })}
      </svg>
      {mode === 'capital' && res === null && (
        <div className="row">{caps.map((c) => <button key={c} className="chip" onClick={() => { setCapPick(c); const ok = c === UK[target].capital; setRes(ok); if (ok) { play('correct'); award(3); } else play('wrong'); }}>{c}</button>)}</div>
      )}
      {res !== null && (
        <div className={`feedback ${res ? 'good' : 'bad'}`} role="status">
          <strong>{res ? 'Correct!' : `Not quite${capPick ? `: ${capPick} isn’t right` : ''}.`}</strong> {target}’s capital is {UK[target].capital}.
          <div><button className="btn" style={{ marginTop: 8 }} onClick={next}>Next →</button></div>
        </div>
      )}
    </>
  );
}
