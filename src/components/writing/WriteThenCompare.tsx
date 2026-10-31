// "Write it, then compare": type an answer, then self-mark against a model and mark scheme.
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SubjectId } from '../../content/types';
import { useProgress } from '../../state/progress';
import { play } from '../../lib/sound';

export interface ExamQuestion {
  id: string;
  question: string;
  marks: number;
  model: string;
  /** Each point is worth one mark when she ticks it. */
  markScheme: string[];
}

export function WriteThenCompare({ questions }: { subject?: SubjectId; questions: ExamQuestion[] }) {
  const { p, update, award } = useProgress();
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [shown, setShown] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>([]);
  const q = questions[i];
  const best = p.counters[`wtc-${q.id}`];
  const score = Math.min(q.marks, ticks.filter(Boolean).length);

  const go = (n: number) => { setI(n); setText(''); setShown(false); setTicks([]); };
  const save = () => {
    update((x) => ({ ...x, counters: { ...x.counters, [`wtc-${q.id}`]: Math.max(x.counters[`wtc-${q.id}`] ?? 0, score) } }));
    award(5 + score * 5, `${score}/${q.marks}`);
    play('coin');
    if (i + 1 < questions.length) go(i + 1);
  };
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <section className="stack">
      <div className="row">
        <label htmlFor="wtc" className="small">Question</label>
        <select id="wtc" value={i} onChange={(e) => go(Number(e.target.value))} style={{ flex: 1 }}>
          {questions.map((x, k) => <option key={x.id} value={k}>{k + 1}. {x.question} ({x.marks})</option>)}
        </select>
      </div>
      <div className="card">
        <div className="row small muted" style={{ justifyContent: 'space-between' }}>
          <span>Question {i + 1} of {questions.length}</span>
          <span>{best !== undefined ? `Best: ${best}/${q.marks}` : 'Not tried yet'}</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem' }}>{q.question} <span className="pill">{q.marks} marks</span></h2>
        <textarea aria-label="Your answer" value={text} onChange={(e) => setText(e.target.value)} disabled={shown}
          placeholder="Write your answer here, as you would in the exam." />
        <div className="row" style={{ marginTop: 8 }}>
          <span className="small muted">{words} words</span>
          <span className="spacer" />
          {!shown && <button className="btn" disabled={words < 3} onClick={() => { setShown(true); setTicks(q.markScheme.map(() => false)); }}>Compare with the model →</button>}
        </div>
      </div>
      {shown && (
        <motion.div className="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card" style={{ borderColor: 'var(--good)' }}>
            <h3>Model answer</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{q.model}</p>
          </div>
          <div className="card">
            <h3>Mark it yourself</h3>
            <p className="small muted">Tick each point your answer includes (be honest!).</p>
            <div className="stack" style={{ gap: 8 }}>
              {q.markScheme.map((m, k) => (
                <label key={k} className="row" style={{ fontWeight: 400, alignItems: 'flex-start', flexWrap: 'nowrap', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!ticks[k]} onChange={(e) => setTicks((t) => t.map((v, j) => (j === k ? e.target.checked : v)))}
                    style={{ width: 26, height: 26, minHeight: 26, flex: '0 0 26px' }} />
                  <span>{m}</span>
                </label>
              ))}
            </div>
            <p style={{ marginTop: 12 }}><strong>Your score: {score} / {q.marks}</strong></p>
            <button className="btn" onClick={save}>Save score{i + 1 < questions.length ? ' and next question' : ''}</button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
