// Drag organelle labels onto a cell, then a quick "which cell is it?" quiz.
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CellSvg, ORGANELLES, SPOTS, type CellKind, type Organelle } from './CellSvg';
import { Draggable } from '../../dnd/Draggable';
import { useProgress } from '../../../state/progress';
import { celebrate } from '../../../lib/confetti';
import { play } from '../../../lib/sound';
import { shuffle } from '../../../lib/random';

const STATEMENTS: [string, 'animal' | 'plant' | 'both'][] = [
  ['Has chloroplasts', 'plant'], ['Has a nucleus', 'both'], ['Has a cell wall made of cellulose', 'plant'],
  ['Has mitochondria', 'both'], ['Has a permanent vacuole full of cell sap', 'plant'], ['Has a cell membrane', 'both'],
  ['Usually an irregular, rounded shape', 'animal'], ['Can photosynthesise', 'plant'], ['Has ribosomes', 'both'],
  ['Has no cell wall', 'animal'],
];

export function BuildACell() {
  const { award, unlock } = useProgress();
  const [kind, setKind] = useState<CellKind>('animal');
  const [placed, setPlaced] = useState<Record<string, Organelle>>({});
  const [sel, setSel] = useState<Organelle | null>(null);
  const [checked, setChecked] = useState(false);
  const spots = SPOTS[kind];
  const labels = useMemo(() => shuffle(Object.keys(ORGANELLES) as Organelle[]), [kind]); // all 8: plant-only ones are distractors in the animal cell
  const used = new Set(Object.values(placed));

  const place = (zone: string, o: Organelle) => {
    setPlaced((p) => {
      const n = { ...p };
      for (const k of Object.keys(n)) if (n[k] === o) delete n[k];
      if (zone === 'none') n[`none-${o}`] = o; else n[zone] = o;
      return n;
    });
    setSel(null); setChecked(false); play('click');
  };
  const correct = (zone: string, o: Organelle) => (zone.startsWith('none') ? !(o in spots) : zone === o);
  const allPlaced = labels.every((o) => used.has(o));
  const score = Object.entries(placed).filter(([z, o]) => correct(z, o)).length;

  const check = () => {
    setChecked(true);
    if (score === labels.length) { play('levelup'); celebrate(true); award(30, 'Cell built'); unlock('cell-builder'); } else play('wrong');
  };

  return (
    <section className="stack">
      <div className="card stack">
        <h2>Build-a-Cell</h2>
        <div className="tabs" role="tablist">
          {(['animal', 'plant'] as CellKind[]).map((k) => (
            <button key={k} role="tab" className="tab" aria-selected={kind === k} onClick={() => { setKind(k); setPlaced({}); setChecked(false); }}>{k === 'animal' ? '🐾 Animal cell' : '🌿 Plant cell'}</button>
          ))}
        </div>
        <p className="small muted" style={{ margin: 0 }}>Drag each label onto the right part (or tap a label, then tap a dot). Labels that don’t belong in this cell go in the “Not in this cell” box.</p>
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', width: '100%' }}>
          <CellSvg kind={kind} />
          {(Object.entries(spots) as [Organelle, [number, number]][]).map(([o, [x, y]]) => {
            const v = placed[o];
            const state = checked && v ? (v === o ? 'placed-good' : 'placed-bad') : '';
            return (
              <button key={o} data-drop={o} className={`drop-target chip ${state}`} aria-label={v ? `Dot labelled ${ORGANELLES[v].name}` : 'Empty label spot'}
                onClick={() => sel && place(o, sel)}
                style={{ position: 'absolute', left: `${(x / 300) * 100}%`, top: `${(y / 220) * 100}%`, transform: 'translate(-50%, -50%)',
                  minHeight: 32, padding: v ? '4px 8px' : 0, minWidth: v ? 0 : 32, fontSize: 12, borderRadius: v ? 10 : '50%',
                  background: v ? 'var(--surface-solid)' : 'rgba(255,255,255,0.85)', borderStyle: v ? 'solid' : 'dashed', borderColor: '#333', color: v ? 'var(--text)' : '#333' }}>
                {v ? ORGANELLES[v].name : '?'}
              </button>
            );
          })}
        </div>
        <div data-drop="none" className="drop-target card flat" onClick={() => sel && place('none', sel)} style={{ minHeight: 56, borderStyle: 'dashed' }}>
          <span className="small muted">Not in this cell: </span>
          {Object.entries(placed).filter(([z]) => z.startsWith('none')).map(([z, o]) => (
            <span key={z} className={`chip ${checked ? (correct(z, o) ? 'placed-good' : 'placed-bad') : ''}`} style={{ margin: 4 }}>{ORGANELLES[o].name}</span>
          ))}
        </div>
        <div className="row">
          {labels.filter((o) => !used.has(o)).map((o) => (
            <Draggable key={o} selected={sel === o} onTap={() => setSel(sel === o ? null : o)} onDrop={(z) => place(z, o)}>{ORGANELLES[o].name}</Draggable>
          ))}
        </div>
        <div className="row">
          <button className="btn" disabled={!allPlaced} onClick={check}>Check my cell</button>
          <button className="btn secondary" onClick={() => { setPlaced({}); setChecked(false); }}>Reset</button>
          {checked && <strong aria-live="polite">{score} / {labels.length} correct{score === labels.length ? ' 🎉' : '. Red ones need moving.'}</strong>}
        </div>
      </div>
      <WhichCell />
    </section>
  );
}

function WhichCell() {
  const [order, setOrder] = useState(() => shuffle(STATEMENTS));
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  if (i >= order.length) {
    return (
      <div className="card center stack" style={{ alignItems: 'center' }}>
        <h3>Which cell is it? {right} / {order.length}</h3>
        <button className="btn" onClick={() => { setOrder(shuffle(STATEMENTS)); setI(0); setRight(0); setAns(null); }}>Play again</button>
      </div>
    );
  }
  const [text, truth] = order[i];
  return (
    <div className="card stack">
      <h3>Which cell is it?</h3>
      <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '1.2rem', fontWeight: 700 }}>“{text}”</motion.p>
      <div className="row">
        {(['animal', 'plant', 'both'] as const).map((c) => (
          <button key={c} className={`option ${ans ? (c === truth ? 'correct' : c === ans ? 'wrong' : '') : ''}`} style={{ flex: 1, justifyContent: 'center' }} disabled={!!ans}
            onClick={() => { setAns(c); if (c === truth) { setRight((r) => r + 1); play('correct'); } else play('wrong'); }}>
            {c === 'animal' ? 'Animal only' : c === 'plant' ? 'Plant only' : 'Both'}
          </button>
        ))}
      </div>
      {ans && <button className="btn" onClick={() => { setI(i + 1); setAns(null); }}>Next →</button>}
    </div>
  );
}
