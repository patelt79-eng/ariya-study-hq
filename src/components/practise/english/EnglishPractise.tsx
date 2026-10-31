import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PractiseMenu } from '../PractiseMenu';
import { english } from '../../../content/english';
import { ALL_DEVICES, EXTRACTS, SPAG_DRILLS, type Device, type Extract } from '../../../content/english.extras';
import { ParagraphBuilder, type ParagraphTask } from '../../writing/ParagraphBuilder';
import { useProgress } from '../../../state/progress';
import { play } from '../../../lib/sound';
import { celebrate } from '../../../lib/confetti';
import { shuffle } from '../../../lib/random';

const extractText = (e: Extract) => e.paragraphs.map((p) => p.map((s) => s.t).join(' ')).join('\n\n');

const PEA_TASKS: ParagraphTask[] = EXTRACTS.map((e) => ({
  id: `pea-${e.id}`,
  question: `${e.title}: ${e.ao2.question}`,
  source: extractText(e),
  starters: {
    point: ['At the start of the extract, the writer inspires the reader through…', 'In the middle of the extract,', 'Finally, the writer…'],
    evidence: ['the line “', 'the phrase “', 'when they write “'],
    analysis: ['The metaphor suggests…', 'The repetition of … emphasises…', 'The verb “…” implies…', 'This shows that…'],
    effect: ['which would make the reader feel…', 'This inspires the reader to…', 'The reader might think…'],
  },
  devices: [...ALL_DEVICES, 'Verb', 'Adjective', 'Noun', 'Adverb', 'Pronoun'],
  model: e.ao2.model,
}));

export default function EnglishPractise({ tool }: { tool?: string }) {
  return (
    <PractiseMenu subject="english" tool={tool} boss="15 mixed questions: terminology, PEA, SPaG."
      note={<>📌 Also practise on the <strong>Rashford extract in your booklet</strong>.</>}
      tools={[
        ...EXTRACTS.map((e) => ({ id: `extract-${e.id}`, icon: '📰', name: `Extract: ${e.title}`, desc: `${e.author}. Comprehension, spot the technique, then a PEA answer.`, render: () => <ExtractTool extract={e} /> })),
        { id: 'pea', icon: '🧱', name: 'PEA Paragraph Builder', desc: 'Point → Evidence → Analysis → Reader effect, with model answers.', render: () => <ParagraphBuilder subject="english" mode="PEA" tasks={PEA_TASKS} /> },
        { id: 'spag', icon: '🔤', name: 'SPaG Lab', desc: 'Punctuation rules and “fix the sentence” drills.', render: () => <SpagLab /> },
        { id: 'writing', icon: '✍️', name: 'Writing task', desc: 'Write the opening to an article about gender equality.', render: () => <WritingTask /> },
      ]} />
  );
}

function ExtractTool({ extract }: { extract: Extract }) {
  const [step, setStep] = useState<'read' | 'ao1' | 'spot' | 'ao2'>('read');
  return (
    <section className="stack">
      <div className="tabs" role="tablist">
        {([['read', '1. Read'], ['ao1', '2. Comprehension'], ['spot', '3. Spot the technique'], ['ao2', '4. PEA answer']] as const).map(([k, l]) => (
          <button key={k} role="tab" className="tab" aria-selected={step === k} onClick={() => setStep(k)}>{l}</button>
        ))}
      </div>
      {step === 'read' && (
        <article className="card">
          <h2>{extract.title}</h2>
          <p className="muted small">by {extract.author} (a fictional practice text)</p>
          {extract.paragraphs.map((p, i) => <p key={i} style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>{p.map((s) => s.t).join(' ')}</p>)}
          <button className="btn" onClick={() => setStep('ao1')}>I’ve read it: test me →</button>
        </article>
      )}
      {step === 'ao1' && <Comprehension extract={extract} onDone={() => setStep('spot')} />}
      {step === 'spot' && <SpotTechnique extract={extract} />}
      {step === 'ao2' && <ParagraphBuilder subject="english" mode="PEA" tasks={PEA_TASKS.filter((t) => t.id === `pea-${extract.id}`)} />}
    </section>
  );
}

function Comprehension({ extract, onDone }: { extract: Extract; onDone: () => void }) {
  const { award } = useProgress();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  if (i >= extract.ao1.length) {
    return (
      <div className="card center stack" style={{ alignItems: 'center' }}>
        <h3>Comprehension: {right} / {extract.ao1.length}</h3>
        <button className="btn" onClick={onDone}>Next: spot the technique →</button>
      </div>
    );
  }
  const q = extract.ao1[i];
  return (
    <div className="card stack">
      <details><summary className="small" style={{ cursor: 'pointer' }}>Show the extract</summary>
        {extract.paragraphs.map((p, k) => <p key={k}>{p.map((s) => s.t).join(' ')}</p>)}</details>
      <div className="small muted">AO1 question {i + 1} of {extract.ao1.length}</div>
      <h3 style={{ fontFamily: 'var(--font-body)' }}>{q.q}</h3>
      {q.options.map((o, k) => (
        <button key={k} className={`option ${pick !== null ? (k === q.answer ? 'correct' : k === pick ? 'wrong' : '') : ''}`} disabled={pick !== null}
          onClick={() => { setPick(k); if (k === q.answer) { setRight((r) => r + 1); award(5); play('correct'); } else play('wrong'); }}>{o}</button>
      ))}
      {pick !== null && (
        <div className={`feedback ${pick === q.answer ? 'good' : 'bad'}`}>
          <strong>{pick === q.answer ? 'Correct!' : 'Not quite. Here’s why…'}</strong> {q.explain}
          <div><button className="btn" style={{ marginTop: 10 }} onClick={() => { setI(i + 1); setPick(null); }}>Next →</button></div>
        </div>
      )}
    </div>
  );
}

function SpotTechnique({ extract }: { extract: Extract }) {
  const { award } = useProgress();
  const segs = useMemo(() => extract.paragraphs.flatMap((p, pi) => p.map((s, si) => ({ ...s, key: `${pi}-${si}`, para: pi }))), [extract]);
  const targets = segs.filter((s) => s.d?.length);
  const [found, setFound] = useState<Record<string, Device>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const seg = segs.find((s) => s.key === sel);

  const label = (d: Device) => {
    if (!seg) return;
    if (seg.d?.includes(d)) {
      setFound((f) => ({ ...f, [seg.key]: d }));
      setMsg(`Yes! That’s ${/^[AEIOU]/.test(d) ? 'an' : 'a'} ${d.toLowerCase()}.`);
      play('correct'); award(5);
      if (Object.keys(found).length + 1 === targets.length) { celebrate(); setMsg('You found a technique in every highlighted phrase!'); }
    } else if (!seg.d?.length) {
      setMsg('No key technique in that phrase. Keep looking!');
      play('wrong');
    } else {
      setMsg(`Not quite. Look again: ${seg.d.length > 1 ? 'there are a few possible answers here' : 'what is the writer doing?'}`);
      play('wrong');
    }
    setSel(null);
  };

  return (
    <div className="stack">
      <div className="card">
        <p className="small muted">Tap a phrase, then choose the technique. Found {Object.keys(found).length} of {targets.length}.</p>
        {extract.paragraphs.map((_, pi) => (
          <p key={pi} style={{ lineHeight: 2, fontSize: '1.08rem' }}>
            {segs.filter((s) => s.para === pi).map((s) => (
              <button key={s.key} onClick={() => setSel(s.key)} aria-pressed={sel === s.key}
                style={{ font: 'inherit', color: 'var(--text)', padding: '2px 4px', margin: '0 1px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', display: 'inline',
                  border: sel === s.key ? '2px solid var(--accent)' : '2px solid transparent',
                  background: found[s.key] ? 'color-mix(in srgb, var(--good) 25%, transparent)' : 'transparent' }}>
                {s.t}{found[s.key] && <span className="pill small" style={{ marginLeft: 4 }}>{found[s.key]}</span>}
              </button>
            ))}
          </p>
        ))}
      </div>
      {sel && (
        <motion.div className="card flat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <strong>Which technique is in: “{seg?.t}”</strong>
          <div className="row" style={{ marginTop: 8 }}>
            {ALL_DEVICES.map((d) => <button key={d} className="chip" onClick={() => label(d)}>{d}</button>)}
          </div>
        </motion.div>
      )}
      {msg && <p role="status" className="card flat" style={{ margin: 0 }}>{msg}</p>}
    </div>
  );
}

function SpagLab() {
  const { award } = useProgress();
  const rules = english.flashcards.filter((c) => c.topicId === 'e-spag');
  const [drills, setDrills] = useState(() => shuffle(SPAG_DRILLS));
  const [i, setI] = useState(0);
  const [val, setVal] = useState(drills[0].wrong);
  const [res, setRes] = useState<null | boolean>(null);
  const [flip, setFlip] = useState<Record<string, boolean>>({});
  const norm = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  const d = drills[i % drills.length];

  return (
    <section className="stack">
      <div className="card">
        <h2>Fix the sentence</h2>
        <p className="small muted">Edit the sentence so the spelling, punctuation and grammar are correct.</p>
        <p style={{ fontSize: '1.15rem' }}><s style={{ color: 'var(--bad)' }}>{d.wrong}</s></p>
        <form className="stack" onSubmit={(e) => {
          e.preventDefault();
          const ok = d.fixes.some((f) => norm(f) === norm(val));
          setRes(ok);
          if (ok) { play('correct'); award(8); } else play('wrong');
        }}>
          <input aria-label="Corrected sentence" value={val} onChange={(e) => setVal(e.target.value)} disabled={res !== null} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          {res === null && <button className="btn">Check</button>}
        </form>
        {res !== null && (
          <div className={`feedback ${res ? 'good' : 'bad'}`} role="status">
            <strong>{res ? 'Fixed it!' : 'Not quite. Here’s why…'}</strong>
            <div>{d.rule}</div>
            {!res && <div>Answer: <strong>{d.fixes[0]}</strong></div>}
            <button className="btn" style={{ marginTop: 10 }} onClick={() => {
              const n = i + 1;
              if (n >= drills.length) { setDrills(shuffle(SPAG_DRILLS)); setI(0); setVal(SPAG_DRILLS[0].wrong); }
              else { setI(n); setVal(drills[n].wrong); }
              setRes(null);
            }}>Next sentence →</button>
          </div>
        )}
      </div>
      <div className="card">
        <h2>Punctuation and spelling rules</h2>
        <p className="small muted">Tap a card to flip it.</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))' }}>
          {rules.map((r) => (
            <button key={r.id} className="card flat" style={{ minHeight: 110, cursor: 'pointer', color: 'var(--text)', background: flip[r.id] ? 'var(--surface-2)' : 'var(--surface)' }}
              onClick={() => { setFlip((f) => ({ ...f, [r.id]: !f[r.id] })); play('flip'); }} aria-label={flip[r.id] ? r.back : `${r.front}. Tap to flip`}>
              <motion.div key={String(!!flip[r.id])} initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}>
                {flip[r.id] ? r.back : <strong>{r.front}</strong>}
              </motion.div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

const SPAG_CHECKS = [
  'A headline at the top',
  'Capital letters for sentences, names and "I"',
  'Full stops at the end of every sentence',
  'Commas in lists',
  'At least one question mark or exclamation mark',
  'Apostrophes used correctly (don’t, it’s, girls’)',
  'Paragraphs for each new idea',
  'Checked their / there / they’re and your / you’re',
  'Used at least two techniques (statistic, rhetorical question, triadic listing…)',
];

function WritingTask() {
  const { p, update, award, unlock, today } = useProgress();
  const existing = p.paragraphs.filter((x) => x.subject === 'english' && x.title === 'Article: gender equality');
  const [text, setText] = useState(existing[existing.length - 1]?.text ?? '');
  const [ticks, setTicks] = useState<boolean[]>(SPAG_CHECKS.map(() => false));
  const [saved, setSaved] = useState(false);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <section className="stack">
      <div className="card">
        <h2>Writing task</h2>
        <p><strong>Write the opening to an article about gender equality using accurate SPaG.</strong></p>
        <details className="small"><summary style={{ cursor: 'pointer' }}>Planning ideas</summary>
          <ul>
            <li>Headline idea: “Equal Chances for Everyone: Why It Still Matters”.</li>
            <li>Open with a rhetorical question or a striking (true) fact, then an anecdote from your own life.</li>
            <li>Ideas: equal pay, girls’ and boys’ sport, jobs anyone can do, sharing chores at home, role models.</li>
            <li>Use triadic listing and direct address to persuade.</li>
          </ul>
        </details>
        <textarea aria-label="Your article" style={{ minHeight: 260 }} value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} placeholder="Headline…" />
        <div className="row" style={{ marginTop: 8 }}>
          <span className="small muted">{words} words</span>
          <span className="spacer" />
          <button className="btn" disabled={words < 20} onClick={() => {
            update((x) => ({ ...x, paragraphs: [...x.paragraphs, { id: `article-${Date.now()}`, subject: 'english', title: 'Article: gender equality', text, date: today }] }));
            award(25, 'Writing'); setSaved(true); play('levelup');
            if (p.paragraphs.length + 1 >= 3) unlock('wordsmith');
          }}>{saved ? 'Saved ✓' : 'Save my writing'}</button>
        </div>
      </div>
      <div className="card">
        <h3>SPaG self-check</h3>
        {SPAG_CHECKS.map((c, k) => (
          <label key={c} className="row" style={{ fontWeight: 400, flexWrap: 'nowrap', cursor: 'pointer', marginBottom: 6 }}>
            <input type="checkbox" checked={ticks[k]} onChange={(e) => setTicks((t) => t.map((v, j) => (j === k ? e.target.checked : v)))} style={{ width: 26, height: 26, minHeight: 26, flex: '0 0 26px' }} />
            <span>{c}</span>
          </label>
        ))}
        {ticks.every(Boolean) && <p style={{ color: 'var(--good)', fontWeight: 700 }}>Every box ticked. That’s careful writing! 🌟</p>}
      </div>
    </section>
  );
}
