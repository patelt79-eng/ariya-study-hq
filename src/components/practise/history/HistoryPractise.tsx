import { useMemo, useState } from 'react';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import { PractiseMenu } from '../PractiseMenu';
import { CLAIMANTS, SHOWDOWN, SILK_STOPS, TIMELINE } from '../../../content/history.extras';
import { ParagraphBuilder, type ParagraphTask } from '../../writing/ParagraphBuilder';
import { Draggable } from '../../dnd/Draggable';
import { BaseMap } from '../geography/WorldMap';
import { proj, type LonLat } from '../geography/geoData';
import { useProgress } from '../../../state/progress';
import { play } from '../../../lib/sound';
import { celebrate } from '../../../lib/confetti';
import { shuffle } from '../../../lib/random';

const PEE_STARTERS = {
  point: ['In my judgement, … was more advanced because…', 'One way … was more advanced was…', 'Similarly…', 'In contrast…'],
  evidence: ['For example,', 'This is shown by…', 'In Baghdad…', 'In Anglo-Saxon England…'],
  analysis: ['This shows that…', 'This means that…', 'Therefore…', 'However, …'],
};
const HIST_TASKS: ParagraphTask[] = [
  { id: 'h-artemis', question: 'Artemis challenge: Who was more advanced, Baghdad or Saxon Britain, and why?', starters: PEE_STARTERS,
    devices: ['Education', 'Women', 'Society', 'Law', 'Medicine', 'Cities and trade'],
    model: 'In my judgement, Baghdad was more advanced than Saxon Britain, especially in education. In Baghdad, scholars at the House of Wisdom translated Greek, Persian and Indian books into Arabic, and al-Khwarizmi developed algebra. In contrast, in Saxon England most people could not read, and learning mainly happened in monasteries where monks copied books by hand. This shows that Baghdad was a centre of new ideas, while Saxon learning was limited to a small number of people.\n\nBaghdad was also more advanced in its cities and law. It was a huge planned “Round City” with busy markets selling goods from China and Africa, and trained judges called qadis ran courts using Sharia law. However, Saxon England used trial by ordeal, where people believed God would show who was guilty, rather than looking at evidence. This means that, although both had organised laws, Baghdad’s system relied more on learning and evidence, so overall it was more advanced.' },
  { id: 'h-women', question: 'How did women’s lives in Anglo-Saxon England differ from women’s lives in Baghdad?', starters: PEE_STARTERS,
    devices: ['Property and inheritance', 'Education', 'Power', 'Religion'],
    model: 'One similarity is that women in both places had some legal rights. In Baghdad, Islamic law allowed women to own property and inherit, and in Anglo-Saxon England women could own land and make wills. This shows that in both societies women were not completely without power, even though men held most of it.\n\nHowever, a difference is the kind of power some women held. In Anglo-Saxon England, a few women held great public power: Æthelflæd, “Lady of the Mercians”, led armies against the Vikings, and Hild ran the monastery at Whitby. In contrast, in Baghdad influential women like Zubaidah usually used their wealth to fund projects, such as wells for pilgrims, rather than leading armies. This means that Saxon women could sometimes hold open political and religious leadership, while Baghdad women’s influence was often through wealth and family.' },
];

export default function HistoryPractise({ tool }: { tool?: string }) {
  return (
    <PractiseMenu subject="history" tool={tool} boss="15 mixed questions on all four topics."
      note={<>📌 Use the school’s Anglo-Saxon, Medieval Baghdad and 1066 England revision materials (QR codes in your booklet).</>}
      tools={[
        { id: 'timeline', icon: '⏳', name: 'Timeline Builder', desc: 'Drag events into the right order, then see them on the timeline.', render: () => <TimelineBuilder /> },
        { id: 'showdown', icon: '⚖️', name: 'Baghdad vs Saxon Britain Showdown', desc: 'Sort the facts, then write your Artemis judgement.', render: () => <Showdown /> },
        { id: 'claimants', icon: '👑', name: '1066 Claimant Cards', desc: 'Collect the claimant cards, then take the quiz.', render: () => <ClaimantCards /> },
        { id: 'silk', icon: '🐫', name: 'Silk Road Journey', desc: 'Travel from China to Europe and discover what was traded.', render: () => <SilkRoad /> },
        { id: 'pee', icon: '🧱', name: 'PEE writing', desc: 'Artemis challenge and the women comparison, with model answers.', render: () => <ParagraphBuilder subject="history" mode="PEE" tasks={HIST_TASKS} /> },
      ]} />
  );
}

// ---------- timeline ----------
function TimelineBuilder() {
  const { award, unlock } = useProgress();
  const [round, setRound] = useState(0);
  const set = useMemo(() => shuffle(TIMELINE).slice(0, 7), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [items, setItems] = useState(set);
  const [checked, setChecked] = useState(false);
  const [lastRound, setLastRound] = useState(round);
  if (lastRound !== round) { setLastRound(round); setItems(set); setChecked(false); }
  const correctOrder = [...set].sort((a, b) => a.year - b.year);
  const score = items.filter((e, i) => e.id === correctOrder[i].id).length;
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; setItems(n); setChecked(false); play('click'); };

  return (
    <section className="card stack">
      <h2>Timeline Builder</h2>
      <p className="small muted" style={{ margin: 0 }}>Drag the cards (or use the arrows) so the earliest event is at the top.</p>
      <Reorder.Group axis="y" values={items} onReorder={(v) => { setItems(v); setChecked(false); }} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        {items.map((e, i) => {
          const ok = checked && e.id === correctOrder[i].id;
          return (
            <Reorder.Item key={e.id} value={e} className="card flat" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'grab', touchAction: 'none',
              borderColor: checked ? (ok ? 'var(--good)' : 'var(--bad)') : undefined }}>
              <span aria-hidden>☰</span>
              <span style={{ flex: 1 }}>{e.label}{checked && <strong className="small" style={{ marginLeft: 8, color: ok ? 'var(--good)' : 'var(--bad)' }}>{e.display}</strong>}</span>
              <button className="icon-btn" onClick={() => move(i, -1)} aria-label={`Move ${e.label} earlier`}>↑</button>
              <button className="icon-btn" onClick={() => move(i, 1)} aria-label={`Move ${e.label} later`}>↓</button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <div className="row">
        <button className="btn" onClick={() => {
          setChecked(true);
          award(score * 3, `${score}/7`);
          if (score === items.length) { celebrate(true); play('levelup'); unlock('time-traveller'); } else play('wrong');
        }}>Check order</button>
        <button className="btn secondary" onClick={() => setRound((r) => r + 1)}>New set</button>
        {checked && <strong role="status">{score} / {items.length} in the right place{score === items.length ? ' 🎉' : ''}</strong>}
      </div>
      {checked && <TimelineStrip events={correctOrder} />}
    </section>
  );
}

function TimelineStrip({ events }: { events: typeof TIMELINE }) {
  const min = -150, max = 1400;
  const x = (y: number) => 30 + ((y - min) / (max - min)) * 740;
  return (
    <svg viewBox="0 0 800 210" style={{ width: '100%', display: 'block', background: 'var(--surface-solid)', borderRadius: 12 }} role="img" aria-label="Timeline of the events in order">
      {[['Roman Britain', 43, 410, '#e76f51'], ['Anglo-Saxon England', 410, 1066, '#2a9d8f'], ['Abbasid Caliphate', 750, 1258, '#e9c46a']].map(([n, a, b, c], k) => (
        <g key={n as string}><rect x={x(a as number)} y={150 + k * 16} width={x(b as number) - x(a as number)} height={12} rx={4} fill={c as string} /><text x={x(a as number) + 4} y={160 + k * 16} fontSize={10} fill="#111">{n as string}</text></g>
      ))}
      <line x1={20} x2={780} y1={130} y2={130} stroke="var(--text)" strokeWidth={2} />
      {[-100, 0, 200, 400, 600, 800, 1000, 1200].map((y) => <g key={y}><line x1={x(y)} x2={x(y)} y1={125} y2={135} stroke="var(--text)" /><text x={x(y)} y={146} fontSize={10} textAnchor="middle" className="svg-muted">{y < 0 ? `${-y} BC` : y === 0 ? 'AD 1' : y}</text></g>)}
      {events.map((e, i) => (
        <motion.g key={e.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
          <circle cx={x(e.year)} cy={130} r={5} fill="var(--accent)" />
          <line x1={x(e.year)} x2={x(e.year)} y1={125} y2={20 + (i % 4) * 26} stroke="var(--accent)" strokeDasharray="2 2" />
          <text x={x(e.year)} y={16 + (i % 4) * 26} fontSize={10} textAnchor={x(e.year) > 640 ? 'end' : 'middle'} className="svg-text">{e.display}: {e.label}</text>
        </motion.g>
      ))}
    </svg>
  );
}

// ---------- showdown ----------
function Showdown() {
  const { award } = useProgress();
  const [deck, setDeck] = useState(() => shuffle(SHOWDOWN));
  const [placed, setPlaced] = useState<Record<string, 'Baghdad' | 'Saxon England'>>({});
  const [last, setLast] = useState<null | { ok: boolean; text: string }>(null);
  const remaining = deck.filter((d) => !placed[d.text]);
  const current = remaining[0];
  const score = Object.entries(placed).filter(([t, s]) => SHOWDOWN.find((x) => x.text === t)?.side === s).length;

  const sort = (side: 'Baghdad' | 'Saxon England') => {
    if (!current) return;
    const ok = current.side === side;
    setPlaced((p) => ({ ...p, [current.text]: side }));
    setLast({ ok, text: ok ? `Yes: ${current.theme.toLowerCase()} in ${side}.` : `Not quite: that was ${current.side}.` });
    if (ok) { play('correct'); award(2); } else play('wrong');
  };
  const col = (side: 'Baghdad' | 'Saxon England', icon: string) => (
    <div data-drop={side} className="drop-target card flat" style={{ flex: '1 1 260px', minHeight: 200 }} onClick={() => sort(side)}>
      <h3>{icon} {side}</h3>
      {(['Education', 'Women', 'Society', 'Law'] as const).map((th) => {
        const facts = Object.entries(placed).filter(([t, s]) => s === side && SHOWDOWN.find((x) => x.text === t)?.theme === th);
        return facts.length ? (
          <div key={th} style={{ marginBottom: 6 }}><div className="small muted">{th}</div>
            {facts.map(([t]) => { const ok = SHOWDOWN.find((x) => x.text === t)?.side === side; return <div key={t} className="small" style={{ color: ok ? 'var(--text)' : 'var(--bad)' }}>{ok ? '✓' : '✗'} {t}</div>; })}
          </div>
        ) : null;
      })}
    </div>
  );

  return (
    <section className="stack">
      <div className="card stack">
        <h2>Baghdad vs Saxon Britain Showdown</h2>
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div key={current.text} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="center">
              <div className="small muted">{current.theme} · card {SHOWDOWN.length - remaining.length + 1} of {SHOWDOWN.length}</div>
              <Draggable onDrop={(id) => sort(id as 'Baghdad' | 'Saxon England')} className="chip" style={{ fontSize: '1.1rem', padding: '14px 18px', margin: '8px auto' }}>{current.text}</Draggable>
              <div className="row" style={{ justifyContent: 'center' }}>
                <button className="btn" onClick={() => sort('Baghdad')}>🕌 Baghdad</button>
                <button className="btn" onClick={() => sort('Saxon England')}>🛡️ Saxon England</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="done" className="center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h3>{score} / {SHOWDOWN.length} sorted correctly</h3>
              <button className="btn secondary" onClick={() => { setDeck(shuffle(SHOWDOWN)); setPlaced({}); setLast(null); }}>Play again</button>
            </motion.div>
          )}
        </AnimatePresence>
        {last && <p role="status" style={{ margin: 0, color: last.ok ? 'var(--good)' : 'var(--bad)' }}>{last.text}</p>}
        <p className="small muted" style={{ margin: 0 }}>Drag the card into a column, or tap a button.</p>
        <div className="row" style={{ alignItems: 'stretch' }}>{col('Baghdad', '🕌')}{col('Saxon England', '🛡️')}</div>
      </div>
      <div className="card">
        <h2>Now write your judgement</h2>
        <ParagraphBuilder subject="history" mode="PEE" tasks={HIST_TASKS} />
      </div>
    </section>
  );
}

// ---------- claimants ----------
const CLAIMANT_QUIZ = [
  { q: 'Which claimant was chosen by the Witan and crowned in January 1066?', a: 'Harold Godwinson' },
  { q: 'Which claimant was King of Norway?', a: 'Harald Hardrada' },
  { q: 'Which claimant said Harold had sworn an oath to support him?', a: 'William of Normandy' },
  { q: 'Which claimant was the closest blood relative but only a teenager?', a: 'Edgar Ætheling' },
  { q: 'Which claimant was killed at Stamford Bridge?', a: 'Harald Hardrada' },
  { q: 'Which claimant had the Pope’s support?', a: 'William of Normandy' },
  { q: 'Which claimant was killed at Hastings?', a: 'Harold Godwinson' },
];

function ClaimantCards() {
  const { award } = useProgress();
  const [open, setOpen] = useState<string[]>([]);
  const [quiz, setQuiz] = useState(() => shuffle(CLAIMANT_QUIZ));
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const all = open.length === CLAIMANTS.length;
  return (
    <section className="stack">
      <div className="card">
        <h2>1066 Claimant Cards</h2>
        <p className="small muted">Tap each card to collect it. Ratings are our own judgement (out of 10), to help you compare.</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))' }}>
          {CLAIMANTS.map((c) => {
            const o = open.includes(c.name);
            return (
              <motion.button key={c.name} onClick={() => { if (!o) { setOpen((x) => [...x, c.name]); play('coin'); award(3); } }} whileTap={{ scale: 0.96 }}
                className="card" style={{ cursor: 'pointer', color: 'var(--text)', textAlign: 'left', borderWidth: 3, borderColor: c.colour, minHeight: 260, perspective: 800 }}
                aria-label={o ? c.name : `Hidden claimant card. Tap to collect`}>
                <motion.div animate={{ rotateY: o ? 0 : 180 }} initial={false} transition={{ duration: 0.5 }} style={{ backfaceVisibility: 'hidden' }}>
                  {o ? (
                    <>
                      <div className="row" style={{ flexWrap: 'nowrap' }}><span style={{ fontSize: 36 }}>{c.emoji}</span><div><strong style={{ fontSize: '1.1rem' }}>{c.name}</strong><div className="small muted">{c.from}</div></div></div>
                      {Object.entries(c.stats).map(([k, v]) => (
                        <div key={k} className="small" style={{ marginTop: 6 }}>{k}<div className="bar" style={{ height: 8 }}><span style={{ width: `${v * 10}%`, background: c.colour }} /></div></div>
                      ))}
                      <p className="small" style={{ marginTop: 8 }}><strong>Claim:</strong> {c.claim}</p>
                      <p className="small"><strong>Weakness:</strong> {c.weakness}</p>
                      <p className="small" style={{ margin: 0 }}><strong>What happened:</strong> {c.fate}</p>
                    </>
                  ) : <div className="center" style={{ fontSize: 60, paddingTop: 60 }}>❓</div>}
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
      {all && (
        <div className="card stack">
          <h3>Claimant quiz</h3>
          {qi < quiz.length ? (
            <>
              <p style={{ margin: 0, fontWeight: 700 }}>{quiz[qi].q}</p>
              <div className="row">
                {CLAIMANTS.map((c) => (
                  <button key={c.name} className={`option ${pick ? (c.name === quiz[qi].a ? 'correct' : c.name === pick ? 'wrong' : '') : ''}`} style={{ flex: '1 1 200px' }} disabled={!!pick}
                    onClick={() => { setPick(c.name); if (c.name === quiz[qi].a) { setRight((r) => r + 1); play('correct'); award(5); } else play('wrong'); }}>{c.emoji} {c.name}</button>
                ))}
              </div>
              {pick && <button className="btn" onClick={() => { setQi(qi + 1); setPick(null); if (qi + 1 >= quiz.length && right === quiz.length) celebrate(); }}>Next →</button>}
            </>
          ) : (
            <p><strong>{right} / {quiz.length}</strong> <button className="btn ghost small" onClick={() => { setQuiz(shuffle(CLAIMANT_QUIZ)); setQi(0); setRight(0); }}>Play again</button></p>
          )}
        </div>
      )}
    </section>
  );
}

// ---------- silk road ----------
function SilkRoad() {
  const { p, update, award, unlock } = useProgress();
  const [at, setAt] = useState(0);
  const visited = useMemo(() => new Set((p.counters.silkVisited ?? 1).toString(2).split('').reverse().map((b, i) => (b === '1' ? i : -1)).filter((i) => i >= 0)), [p.counters.silkVisited]);
  const pts = SILK_STOPS.map((s) => proj(s.at as LonLat));
  const d = 'M' + pts.map((q) => q.join(' ')).join(' L');
  const visit = (i: number) => {
    setAt(i);
    play('coin');
    if (!visited.has(i)) {
      const mask = (p.counters.silkVisited ?? 1) | (1 << i);
      update((x) => ({ ...x, counters: { ...x.counters, silkVisited: mask } }));
      award(3);
      if (mask === (1 << SILK_STOPS.length) - 1) { unlock('silk-road-trader'); celebrate(true); }
    }
  };
  const [cx, cy] = pts[at];
  return (
    <section className="card stack">
      <h2>Silk Road Journey</h2>
      <p className="small muted" style={{ margin: 0 }}>Tap each stop to travel there and find out what was traded. Visited {visited.size} of {SILK_STOPS.length}.</p>
      <div style={{ overflow: 'hidden', borderRadius: 14 }}>
        <div style={{ width: '100%', aspectRatio: '2.1 / 1', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '300%', left: '-151%', top: '-44%' }}>
            <BaseMap label={false}>
              <motion.path d={d} fill="none" stroke="#b5179e" strokeWidth={3} strokeDasharray="8 5" animate={{ strokeDashoffset: [26, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
              {pts.map(([x, y], i) => (
                <g key={i} onClick={() => visit(i)} style={{ cursor: 'pointer' }} role="button" aria-label={SILK_STOPS[i].name}>
                  <circle cx={x} cy={y} r={7} fill={visited.has(i) ? '#ffd166' : '#fff'} stroke="#7b2cbf" strokeWidth={2.5} />
                  <circle cx={x} cy={y} r={14} fill="transparent" />
                  <text x={x} y={y + (i % 2 ? 18 : -11)} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#1b1b1b" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 2.5 }}>{SILK_STOPS[i].name}</text>
                </g>
              ))}
              <motion.text animate={{ x: cx, y: cy - 4 }} transition={{ type: 'spring', stiffness: 60, damping: 14 }} x={0} y={0} fontSize={18} textAnchor="middle" style={{ pointerEvents: 'none' }}>🐫</motion.text>
            </BaseMap>
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={at} className="card flat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <strong>{at + 1}. {SILK_STOPS[at].name}</strong>
          <p style={{ margin: '4px 0 0' }}>{SILK_STOPS[at].text}</p>
        </motion.div>
      </AnimatePresence>
      <div className="row">
        <button className="btn secondary" disabled={at === 0} onClick={() => visit(at - 1)}>← Back east</button>
        <button className="btn" disabled={at === SILK_STOPS.length - 1} onClick={() => visit(at + 1)}>Travel west →</button>
      </div>
    </section>
  );
}
