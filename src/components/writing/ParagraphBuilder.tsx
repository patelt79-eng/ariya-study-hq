// Guided paragraph writing: PEA (English) or PEE (RE, History), with a live checklist
// and a model answer revealed after she submits.
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { SubjectId } from '../../content/types';
import { useProgress, XP } from '../../state/progress';
import { celebrate } from '../../lib/confetti';
import { play } from '../../lib/sound';

export interface ParagraphTask {
  id: string;
  question: string;
  /** Optional source text shown above the builder. */
  source?: string;
  starters: { point: string[]; evidence: string[]; analysis: string[]; effect?: string[] };
  /** Word classes / devices / ideas she can pick from. */
  devices?: string[];
  model: string;
}

type Mode = 'PEA' | 'PEE';

const LABELS: Record<Mode, { key: 'point' | 'evidence' | 'analysis' | 'effect'; title: string; help: string }[]> = {
  PEA: [
    { key: 'point', title: 'Point', help: 'An opening point linked to the question.' },
    { key: 'evidence', title: 'Evidence', help: 'A short quotation from the extract, in “quotation marks”.' },
    { key: 'analysis', title: 'Analysis', help: 'Explain the meaning and effect of the quotation. Name the device or word class.' },
    { key: 'effect', title: 'Artemis Aim: effect on the reader', help: 'Stretch: how would the reader think or feel?' },
  ],
  PEE: [
    { key: 'point', title: 'Point', help: 'Make one clear point that answers the question.' },
    { key: 'evidence', title: 'Evidence', help: 'Support it: a Bible quote, Church teaching, a source or a fact.' },
    { key: 'analysis', title: 'Explain', help: 'Explain how the evidence supports your point (this shows that…, so…).' },
  ],
};

function checks(mode: Mode, v: Record<string, string>, device: string) {
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const list = [
    { label: 'Point: a full sentence', ok: words(v.point ?? '') >= 6 },
    mode === 'PEA'
      ? { label: 'Evidence: a quotation in “quotation marks”', ok: /["“”‘’']{1}[^"“”]{2,}["“”‘’']/.test(v.evidence ?? '') }
      : { label: 'Evidence: a quote, teaching or fact', ok: words(v.evidence ?? '') >= 5 },
    mode === 'PEA'
      ? { label: 'Analysis: names a device or word class', ok: !!device || /metaphor|simile|repetition|list|anecdote|statistic|verb|adjective|noun|adverb|question|imperative|emotive|superlative|direct address/i.test(v.analysis ?? '') }
      : { label: 'Explain: links back to the point (this shows / so / because)', ok: /(this shows|this means|so |because|therefore|which means|suggests)/i.test(v.analysis ?? '') },
    mode === 'PEA'
      ? { label: 'Analysis: explains the meaning (suggests / shows / implies)', ok: /(suggest|show|impl|emphasi|highlight|create|make)/i.test(v.analysis ?? '') }
      : { label: 'Explain: at least two sentences', ok: (v.analysis ?? '').split(/[.!?]/).filter((s) => s.trim().length > 3).length >= 2 },
  ];
  if (mode === 'PEA') list.push({ label: 'Artemis Aim: effect on the reader', ok: /(reader|audience|feel|inspire|motivat|encourag)/i.test(v.effect ?? '') });
  return list;
}

export function ParagraphBuilder({ subject, mode, tasks }: { subject: SubjectId; mode: Mode; tasks: ParagraphTask[] }) {
  const { p, update, award, unlock, today } = useProgress();
  const [taskId, setTaskId] = useState(tasks[0].id);
  const task = tasks.find((t) => t.id === taskId) ?? tasks[0];
  const [vals, setVals] = useState<Record<string, string>>({});
  const [device, setDevice] = useState('');
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const steps = LABELS[mode];
  const list = useMemo(() => checks(mode, vals, device), [mode, vals, device]);
  const saved = p.paragraphs.filter((x) => x.subject === subject);

  const reset = (id = taskId) => { setTaskId(id); setVals({}); setDevice(''); setStep(0); setSubmitted(false); };
  const full = steps.map((s) => vals[s.key]?.trim()).filter(Boolean).join(' ');

  const submit = () => {
    setSubmitted(true);
    play('levelup');
    celebrate();
    award(XP.paragraph, 'Paragraph');
    update((x) => ({ ...x, paragraphs: [...x.paragraphs, { id: `${task.id}-${Date.now()}`, subject, title: task.question, text: full, date: today }] }));
    if (p.paragraphs.length + 1 >= 3) unlock('wordsmith');
  };

  const cur = steps[step];
  const starters = task.starters[cur.key] ?? [];

  return (
    <section className="stack">
      <div className="card flat">
        <label htmlFor="pb-q">Question</label>
        <select id="pb-q" value={taskId} onChange={(e) => reset(e.target.value)} style={{ marginTop: 6 }}>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.question}</option>)}
        </select>
      </div>
      {task.source && <blockquote className="card flat" style={{ margin: 0, fontStyle: 'italic', whiteSpace: 'pre-line' }}>{task.source}</blockquote>}

      <div className="card">
        <div className="row" style={{ gap: 6, marginBottom: 12 }} role="tablist" aria-label="Paragraph steps">
          {steps.map((s, i) => (
            <button key={s.key} role="tab" className="tab" aria-selected={step === i} onClick={() => setStep(i)}>
              {vals[s.key]?.trim() ? '✓ ' : ''}{s.title.split(':')[0]}
            </button>
          ))}
        </div>
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3>{cur.title}</h3>
          <p className="muted small">{cur.help}</p>
          {starters.length > 0 && (
            <div className="row" style={{ marginBottom: 10 }}>
              <span className="small muted">Sentence starters:</span>
              {starters.map((s) => (
                <button key={s} className="chip small" onClick={() => setVals((v) => ({ ...v, [cur.key]: (v[cur.key] ? v[cur.key] + ' ' : '') + s }))}>{s}</button>
              ))}
            </div>
          )}
          {cur.key === 'analysis' && task.devices && (
            <div style={{ marginBottom: 10 }}>
              <label htmlFor="pb-dev" className="small">{mode === 'PEA' ? 'Word class / device' : 'Key idea'}</label>
              <select id="pb-dev" value={device} onChange={(e) => setDevice(e.target.value)} style={{ marginTop: 4 }}>
                <option value="">Choose…</option>
                {task.devices.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {device && <button className="btn ghost small" onClick={() => setVals((v) => ({ ...v, analysis: (v.analysis ? v.analysis + ' ' : '') + (mode === 'PEA' ? `The ${device.toLowerCase()} suggests ` : `${device} `) }))}>Insert “{mode === 'PEA' ? `The ${device.toLowerCase()} suggests…` : device}”</button>}
            </div>
          )}
          <textarea aria-label={cur.title} value={vals[cur.key] ?? ''} onChange={(e) => setVals((v) => ({ ...v, [cur.key]: e.target.value }))} disabled={submitted} />
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
            <span className="spacer" />
            {step < steps.length - 1
              ? <button className="btn" onClick={() => setStep(step + 1)}>Next →</button>
              : <button className="btn good" disabled={submitted || !full} onClick={submit}>Submit and see the model ✓</button>}
          </div>
        </motion.div>
      </div>

      <div className="card flat" aria-live="polite">
        <strong>Checklist</strong>
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
          {list.map((c) => <li key={c.label} style={{ color: c.ok ? 'var(--good)' : 'var(--muted)' }}>{c.ok ? '✅' : '⬜'} {c.label}</li>)}
        </ul>
      </div>

      {submitted && (
        <motion.div className="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card"><h3>Your paragraph</h3><p style={{ whiteSpace: 'pre-wrap' }}>{full}</p></div>
          <div className="card" style={{ borderColor: 'var(--good)' }}><h3>Model answer</h3><p style={{ whiteSpace: 'pre-wrap' }}>{task.model}</p>
            <p className="small muted">Compare: what did the model include that you could add? Then try another question.</p></div>
          <button className="btn" onClick={() => reset()}>Write another</button>
        </motion.div>
      )}

      {saved.length > 0 && (
        <details className="card flat">
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Your saved paragraphs ({saved.length})</summary>
          {saved.slice().reverse().map((s) => (
            <div key={s.id} style={{ marginTop: 12 }}>
              <div className="small muted">{s.date} · {s.title}</div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{s.text}</p>
            </div>
          ))}
        </details>
      )}
    </section>
  );
}
