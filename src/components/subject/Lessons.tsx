// Guided lessons: one topic at a time, always in the same three steps:
// 1) Learn (one card at a time)  2) Flashcards (just this topic)  3) Quiz (5 questions on this topic).
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LearnCard, SubjectContent, Topic } from '../../content/types';
import type { LessonState } from '../../state/model';
import { useProgress } from '../../state/progress';
import { go } from '../../lib/router';
import { play } from '../../lib/sound';
import { celebrate } from '../../lib/confetti';
import { useMission } from '../focus/Mission';
import { Diagram, diagramText } from './Diagrams';
import { ListenButton, ListenToggle, useAutoRead } from '../audio/Listen';
import { sentences } from '../../audio/speech';
import { Flashcards } from './Flashcards';
import { Quiz } from './Quiz';

const QUIZ_LENGTH = 5;
type Step = 'learn' | 'cards' | 'quiz' | 'done';

const isDone = (l?: LessonState) => l?.quiz !== undefined;


/** Learn cards for a topic. Topics with only key words get cards built from their flashcards. */
function cardsFor(subject: SubjectContent, topic: Topic): LearnCard[] {
  const own = subject.learn.filter((c) => c.topicId === topic.id);
  if (own.length) return own;
  const fcs = subject.flashcards.filter((c) => c.topicId === topic.id);
  const chunks: LearnCard[] = [];
  for (let i = 0; i < fcs.length; i += 5) {
    chunks.push({
      topicId: topic.id,
      title: fcs.length > 5 ? `Key words (${i / 5 + 1} of ${Math.ceil(fcs.length / 5)})` : 'Key words',
      points: fcs.slice(i, i + 5).map((c) => `${c.front}: ${c.back}`),
      tip: 'Read each one, then cover it and say it out loud.',
    });
  }
  return chunks;
}

export function Lessons({ subject, topicId }: { subject: SubjectContent; topicId?: string }) {
  const topic = subject.topics.find((t) => t.id === topicId);
  return topic ? <Lesson key={topic.id} subject={subject} topic={topic} /> : <Path subject={subject} />;
}

// ---------- the list of topics ----------
function Path({ subject }: { subject: SubjectContent }) {
  const { p } = useProgress();
  const done = subject.topics.filter((t) => isDone(p.lessons[t.id])).length;
  const next = subject.topics.find((t) => !isDone(p.lessons[t.id]));
  const groups = [...new Set(subject.topics.map((t) => t.group ?? ''))];
  const open = (t: Topic) => { play('click'); go(`subject/${subject.id}/learn/${t.id}`); };

  return (
    <div className="stack">
      <section className="card stack" style={{ borderColor: subject.colour }}>
        <h2 style={{ margin: 0 }}>One topic at a time</h2>
        <p style={{ margin: 0 }}>Each lesson has three short steps:</p>
        <div className="row" style={{ gap: 8 }}>
          <span className="pill">📘 Learn</span><span aria-hidden>→</span>
          <span className="pill">🃏 Flashcards</span><span aria-hidden>→</span>
          <span className="pill">❓ Quiz</span>
        </div>
        <p className="small muted" style={{ margin: 0 }}>About 10 minutes each. Do one or two, then take a break.</p>
        <div>
          <div className="row small" style={{ justifyContent: 'space-between' }}><span>{done} of {subject.topics.length} topics done</span></div>
          <div className="bar" style={{ marginTop: 6 }}><span style={{ width: `${(done / subject.topics.length) * 100}%` }} /></div>
        </div>
        {next
          ? <button className="btn" onClick={() => open(next)}>{done ? 'Continue' : 'Start'}: {next.title} →</button>
          : <p style={{ margin: 0, fontWeight: 700 }}>Every topic done! 🎉 Redo any topic below to refresh it.</p>}
      </section>

      {groups.map((g) => (
        <section key={g} className="stack" style={{ gap: 8 }}>
          {g && <h3 style={{ margin: '8px 0 0' }}>{g}</h3>}
          {subject.topics.filter((t) => (t.group ?? '') === g).map((t) => {
            const l = p.lessons[t.id];
            const n = subject.topics.indexOf(t) + 1;
            const isNext = t.id === next?.id;
            return (
              <button key={t.id} onClick={() => open(t)} className="card flat row"
                style={{ cursor: 'pointer', color: 'var(--text)', textAlign: 'left', padding: '10px 14px', flexWrap: 'nowrap',
                  borderColor: isNext ? 'var(--accent)' : undefined, borderWidth: isNext ? 2 : 1 }}>
                <span aria-hidden style={{ flex: '0 0 34px', height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700,
                  background: isDone(l) ? 'var(--good)' : 'var(--surface-2)', color: isDone(l) ? '#062014' : 'var(--text)' }}>{isDone(l) ? '✓' : n}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600 }}>{t.title}</span>
                  <span className="small muted" aria-label={`Learn ${l?.learn ? 'done' : 'not done'}, flashcards ${l?.cards ? 'done' : 'not done'}, quiz ${isDone(l) ? 'done' : 'not done'}`}>
                    <span style={{ opacity: l?.learn ? 1 : 0.35 }}>📘</span> <span style={{ opacity: l?.cards ? 1 : 0.35 }}>🃏</span> <span style={{ opacity: isDone(l) ? 1 : 0.35 }}>❓</span>
                    {isDone(l) && <> · quiz {Math.round(((l!.quiz ?? 0) / 100) * QUIZ_LENGTH)}/{QUIZ_LENGTH}</>}
                  </span>
                </span>
                <span className="small" style={{ fontWeight: 700, color: isNext ? 'var(--accent)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {isNext ? 'Next →' : isDone(l) ? 'Redo' : l?.learn ? 'Continue' : 'Start'}
                </span>
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}

// ---------- one lesson ----------
function Lesson({ subject, topic }: { subject: SubjectContent; topic: Topic }) {
  const { p, update, award } = useProgress();
  const { finished } = useMission();
  const cards = useMemo(() => cardsFor(subject, topic), [subject, topic]);
  const hasCards = subject.flashcards.some((c) => c.topicId === topic.id);
  const prev = p.lessons[topic.id];
  // Pick up where she left off, unless the topic is finished (then start again from Learn).
  const [step, setStep] = useState<Step>(() => (!prev || isDone(prev) ? 'learn' : prev.cards || !hasCards ? 'quiz' : prev.learn ? 'cards' : 'learn'));
  const [k, setK] = useState(0);
  const [score, setScore] = useState(0);
  const index = subject.topics.indexOf(topic);
  const nextTopic = subject.topics.slice(index + 1).find((t) => !isDone(p.lessons[t.id])) ?? subject.topics.find((t) => t.id !== topic.id && !isDone(p.lessons[t.id]));

  const mark = (patch: Partial<LessonState>) => update((x) => ({ ...x, lessons: { ...x.lessons, [topic.id]: { ...x.lessons[topic.id], ...patch } } }));
  const toStep = (s: Step) => { setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const readDone = () => {
    if (!prev?.learn) award(5, 'Read');
    mark({ learn: true });
    toStep(hasCards ? 'cards' : 'quiz');
  };
  const quizDone = (pct: number) => {
    const first = !isDone(prev);
    mark({ quiz: pct });
    setScore(pct);
    award(first ? 20 : 5, 'Topic done');
    play('levelup');
    celebrate(pct >= 80);
    finished(subject.id, ['learn']);
    toStep('done');
  };

  const steps: { id: Step; label: string; icon: string; done: boolean }[] = [
    { id: 'learn', label: 'Learn', icon: '📘', done: !!p.lessons[topic.id]?.learn },
    ...(hasCards ? [{ id: 'cards' as Step, label: 'Flashcards', icon: '🃏', done: !!p.lessons[topic.id]?.cards }] : []),
    { id: 'quiz', label: 'Quiz', icon: '❓', done: isDone(p.lessons[topic.id]) },
  ];
  const card = cards[k];
  const learnText = card ? sentences([card.title, ...card.points, card.tip && `Tip: ${card.tip}`, diagramText(card.diagram)]) : '';
  const doneText = sentences(['Topic complete!', score >= 80 ? 'Brilliant: you really know this one' : score >= 50 ? 'Good work. Redo it another day to make it stick' : 'Well done for finishing. Come back to this topic tomorrow: it gets easier every time']);
  useAutoRead(`lesson:${topic.id}:learn:${k}`, learnText, step === 'learn' && !!card);
  useAutoRead(`lesson:${topic.id}:done`, doneText, step === 'done');

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="btn ghost small" onClick={() => go(`subject/${subject.id}/learn`)}>← All topics</button>
        <span className="row" style={{ gap: 8 }}>
          <ListenToggle />
          <span className="small muted">Topic {index + 1} of {subject.topics.length}</span>
        </span>
      </div>
      <h2 style={{ margin: 0 }}>{topic.title}</h2>

      {step !== 'done' && (
        <ol className="row" aria-label="Lesson steps" style={{ listStyle: 'none', padding: 0, margin: 0, gap: 6, flexWrap: 'nowrap' }}>
          {steps.map((s, i) => {
            const current = s.id === step;
            return (
              <li key={s.id} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => toStep(s.id)} aria-current={current ? 'step' : undefined}
                  style={{ flex: 1, minHeight: 44, borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', padding: '6px 8px',
                    border: `2px solid ${current ? 'var(--accent)' : 'var(--border)'}`,
                    background: current ? 'var(--accent)' : s.done ? 'color-mix(in srgb, var(--good) 22%, var(--surface))' : 'var(--surface)',
                    color: current ? 'var(--accent-text)' : 'var(--text)' }}>
                  {s.done && !current ? '✓' : `${i + 1}.`} {s.icon} <span className="hide-phone">{s.label}</span>
                </button>
                {i < steps.length - 1 && <span aria-hidden className="muted">›</span>}
              </li>
            );
          })}
        </ol>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step + k} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
          {step === 'learn' && card && (
            <article className="card stack" style={{ borderLeft: `6px solid ${subject.colour}` }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                {cards.length > 1 ? <span className="small muted">Card {k + 1} of {cards.length}</span> : <span />}
                <ListenButton id={`lesson:${topic.id}:learn:${k}`} text={learnText} />
              </div>
              <h3 style={{ margin: 0, fontSize: 'calc(1.4rem * var(--display-size))' }}>{card.title}</h3>
              {card.diagram && <Diagram name={card.diagram} />}
              <ul style={{ margin: 0, paddingLeft: 22, fontSize: '1.1rem', lineHeight: 1.6 }}>
                {card.points.map((pt, i) => <li key={i} style={{ marginBottom: 8 }}>{pt}</li>)}
              </ul>
              {card.tip && <p style={{ margin: 0, padding: '10px 14px', borderRadius: 12, background: 'var(--surface-2)' }}>💡 <strong>{card.tip}</strong></p>}
              <p className="small muted" style={{ margin: 0 }}>Read it, then look away and try to say the main points out loud.</p>
              <div className="row">
                {k > 0 && <button className="btn secondary" onClick={() => setK(k - 1)}>← Back</button>}
                <span className="spacer" />
                {k < cards.length - 1
                  ? <button className="btn" onClick={() => { setK(k + 1); play('flip'); }}>Next card →</button>
                  : <button className="btn" onClick={readDone}>{hasCards ? 'Next: flashcards →' : 'Next: quick quiz →'}</button>}
              </div>
            </article>
          )}

          {step === 'cards' && (
            <div className="stack">
              <p className="small muted" style={{ margin: 0 }}>Just the flashcards for this topic. Say the answer before you flip.</p>
              <Flashcards subject={subject} topicId={topic.id} onDone={() => { mark({ cards: true }); toStep('quiz'); }} />
            </div>
          )}

          {step === 'quiz' && (
            <div className="stack">
              <p className="small muted" style={{ margin: 0 }}>{QUIZ_LENGTH} quick questions on this topic only.</p>
              <Quiz subject={subject} topicId={topic.id} count={QUIZ_LENGTH} onDone={quizDone} />
            </div>
          )}

          {step === 'done' && (
            <section className="card center stack" style={{ alignItems: 'center' }}>
              <motion.div style={{ fontSize: 64 }} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }} aria-hidden>⭐</motion.div>
              <h2 style={{ margin: 0 }}>Topic complete!</h2>
              <ListenButton id={`lesson:${topic.id}:done`} text={doneText} />
              <p style={{ margin: 0 }}>{score >= 80 ? 'Brilliant: you really know this one.' : score >= 50 ? 'Good work. Redo it another day to make it stick.' : 'Well done for finishing. Come back to this topic tomorrow: it gets easier every time.'}</p>
              <p className="small muted" style={{ margin: 0 }}>Tip: on the “What’s on the test” tab, update your Red/Amber/Green rating for this topic.</p>
              <div className="row" style={{ justifyContent: 'center' }}>
                {nextTopic && <button className="btn" onClick={() => go(`subject/${subject.id}/learn/${nextTopic.id}`)}>Next topic: {nextTopic.title} →</button>}
                <button className="btn secondary" onClick={() => go(`subject/${subject.id}/learn`)}>Back to all topics</button>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
