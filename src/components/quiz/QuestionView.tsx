// Renders one question of any kind and reports whether it was answered correctly.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { Question } from '../../content/types';
import { isAcceptable } from '../../lib/fuzzy';
import { shuffle } from '../../lib/random';
import { play } from '../../lib/sound';
import { Draggable } from '../dnd/Draggable';
import { AngleDiagram, describe, type AngleSpec } from '../practise/maths/AngleDiagram';
import { ListenButton, useAutoRead } from '../audio/Listen';
import { sentences, stop as stopSpeech } from '../../audio/speech';

export interface Answered { correct: boolean; given: string }

export function QuestionView({ q, onAnswered, onNext, disabled }: {
  q: Question;
  onAnswered: (a: Answered) => void;
  onNext: () => void;
  disabled?: boolean;
}) {
  const [result, setResult] = useState<Answered | null>(null);
  const controls = useAnimationControls();
  useEffect(() => { setResult(null); }, [q.id]);
  // MCQ option order is decided here so the read-aloud letters match the screen.
  const order = useMemo(() => (q.kind === 'mcq' ? shuffle(q.options.map((_, i) => i)) : []), [q.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const praise = useMemo(() => pickPraise(), [q.id, result?.correct]); // eslint-disable-line react-hooks/exhaustive-deps

  const questionText = sentences([
    q.prompt,
    q.figure ? describe(q.figure as AngleSpec) : undefined,
    q.kind === 'mcq' ? order.map((i, k) => `${'ABCD'[k]}: ${q.options[i]}`).join('. ') : undefined,
    q.kind === 'tf' ? 'True or false?' : undefined,
    q.kind === 'type' ? 'Type your answer.' : undefined,
    q.kind === 'match' ? `Match each one: ${q.pairs.map((p) => p[0]).join(', ')}. The choices are: ${q.pairs.map((p) => p[1]).join(', ')}` : undefined,
  ]);
  const answerText = q.kind === 'type' ? q.accept[0] : q.kind === 'mcq' ? q.options[q.answer] : q.kind === 'tf' ? (q.answer ? 'True' : 'False') : undefined;
  const feedbackText = result ? sentences([
    result.correct ? praise : 'Not quite. Here’s why',
    !result.correct && answerText ? `The answer is ${answerText}` : undefined,
    q.explain,
    ...(!result.correct && q.steps ? q.steps : []),
  ]) : '';
  useAutoRead(`q:${q.id}:question`, questionText, !result);
  useAutoRead(`q:${q.id}:feedback:${result ? 'shown' : ''}`, feedbackText, !!result);
  const next = () => { stopSpeech(); onNext(); };

  const submit = (a: Answered) => {
    if (result) return;
    setResult(a);
    onAnswered(a);
    if (a.correct) { play('correct'); void controls.start({ scale: [1, 1.04, 1], transition: { duration: 0.3 } }); }
    else { play('wrong'); void controls.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } }); }
  };
  const locked = !!result || !!disabled;

  return (
    <motion.div animate={controls}>
      <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem', fontWeight: 700, flex: 1 }}>{q.prompt}</h2>
        <ListenButton id={`q:${q.id}:question`} text={questionText} />
      </div>
      {q.figure ? <AngleDiagram spec={q.figure as AngleSpec} /> : null}
      {q.kind === 'mcq' && <MCQView q={q} order={order} locked={locked} result={result} onPick={(i) => submit({ correct: i === q.answer, given: q.options[i] })} />}
      {q.kind === 'tf' && <TFView answer={q.answer} locked={locked} result={result} onPick={(v) => submit({ correct: v === q.answer, given: v ? 'True' : 'False' })} />}
      {q.kind === 'type' && <TypeView key={q.id} q={q} locked={locked} onSubmit={(s) => submit({ correct: isAcceptable(s, q.accept, q.numeric), given: s })} />}
      {q.kind === 'match' && <MatchView key={q.id} pairs={q.pairs} locked={locked} onSubmit={(ok, given) => submit({ correct: ok, given })} />}
      {result && (
        <motion.div className={`feedback ${result.correct ? 'good' : 'bad'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <strong>{result.correct ? praise : 'Not quite. Here’s why…'}</strong>
            <ListenButton id={`q:${q.id}:feedback:shown`} text={feedbackText} />
          </div>
          {!result.correct && q.kind === 'type' && <div>Answer: <strong>{q.accept[0]}</strong></div>}
          {!result.correct && q.kind === 'mcq' && <div>Answer: <strong>{q.options[q.answer]}</strong></div>}
          {!result.correct && q.kind === 'tf' && <div>Answer: <strong>{q.answer ? 'True' : 'False'}</strong></div>}
          <div>{q.explain}</div>
          {q.steps && !result.correct && <ol style={{ margin: '8px 0 0', paddingLeft: 22 }}>{q.steps.map((st, k) => <li key={k}>{st}</li>)}</ol>}
          <button className="btn" style={{ marginTop: 12 }} onClick={next} autoFocus>Next →</button>
        </motion.div>
      )}
    </motion.div>
  );
}

const PRAISE = ['Correct!', 'Nailed it!', 'Yes! Spot on.', 'Brilliant!', 'Great thinking!', 'Correct, nice work!'];
function pickPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

function MCQView({ q, order, locked, result, onPick }: { q: Extract<Question, { kind: 'mcq' }>; order: number[]; locked: boolean; result: Answered | null; onPick: (i: number) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="stack">
      {order.map((i, k) => {
        const cls = result ? (i === q.answer ? 'correct' : i === picked ? 'wrong' : '') : '';
        return (
          <button key={i} className={`option ${cls}`} disabled={locked} onClick={() => { setPicked(i); onPick(i); }}>
            <span className="key">{'ABCD'[k]}</span>{q.options[i]}
          </button>
        );
      })}
    </div>
  );
}

function TFView({ answer, locked, result, onPick }: { answer: boolean; locked: boolean; result: Answered | null; onPick: (v: boolean) => void }) {
  const [picked, setPicked] = useState<boolean | null>(null);
  return (
    <div className="row">
      {[true, false].map((v) => {
        const cls = result ? (v === answer ? 'correct' : v === picked ? 'wrong' : '') : '';
        return <button key={String(v)} className={`option ${cls}`} style={{ flex: 1, justifyContent: 'center' }} disabled={locked} onClick={() => { setPicked(v); onPick(v); }}>{v ? '✓ True' : '✗ False'}</button>;
      })}
    </div>
  );
}

function TypeView({ q, locked, onSubmit }: { q: Extract<Question, { kind: 'type' }>; locked: boolean; onSubmit: (s: string) => void }) {
  const [val, setVal] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return (
    <form className="row" onSubmit={(e) => { e.preventDefault(); if (val.trim()) onSubmit(val); }}>
      <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)} disabled={locked} aria-label="Your answer"
        placeholder={q.numeric ? 'Type a number' : 'Type your answer'} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        style={{ flex: '1 1 200px' }} />
      <button className="btn" disabled={locked || !val.trim()}>Check</button>
    </form>
  );
}

function MatchView({ pairs, locked, onSubmit }: { pairs: [string, string][]; locked: boolean; onSubmit: (ok: boolean, given: string) => void }) {
  const rights = useMemo(() => shuffle(pairs.map((p) => p[1])), [pairs]);
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const used = new Set(Object.values(placed));
  const place = (slot: number, value: string) => {
    setPlaced((p) => {
      const next = { ...p };
      for (const k of Object.keys(next)) if (next[+k] === value) delete next[+k];
      next[slot] = value;
      return next;
    });
    setSel(null);
    play('click');
  };
  const all = Object.keys(placed).length === pairs.length;
  return (
    <div className="stack">
      <p className="small muted" style={{ margin: 0 }}>Drag each answer onto its match, or tap an answer then tap a slot.</p>
      {pairs.map(([left, right], i) => {
        const v = placed[i];
        const state = checked ? (v === right ? 'placed-good' : 'placed-bad') : '';
        return (
          <div key={i} className="row" style={{ flexWrap: 'nowrap' }}>
            <div className="card flat" style={{ flex: 1, padding: 10, fontWeight: 700 }}>{left}</div>
            <span aria-hidden>→</span>
            <button data-drop={String(i)} className={`drop-target chip ${state}`} disabled={locked}
              style={{ flex: 1, justifyContent: 'center', borderStyle: v ? 'solid' : 'dashed', minHeight: 52 }}
              onClick={() => { if (sel) place(i, sel); else if (v) setPlaced((p) => { const n = { ...p }; delete n[i]; return n; }); }}>
              {v ?? (sel ? 'Tap to place' : 'Drop here')}
            </button>
          </div>
        );
      })}
      <div className="row">
        {rights.filter((r) => !used.has(r)).map((r) => (
          <Draggable key={r} selected={sel === r} disabled={locked} onTap={() => setSel(sel === r ? null : r)}
            onDrop={(id) => place(Number(id), r)}>{r}</Draggable>
        ))}
      </div>
      <button className="btn" disabled={!all || locked} onClick={() => {
        setChecked(true);
        onSubmit(pairs.every(([, r], i) => placed[i] === r), pairs.map((_, i) => placed[i]).join(', '));
      }}>Check matches</button>
    </div>
  );
}
