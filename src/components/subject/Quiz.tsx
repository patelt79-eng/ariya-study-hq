import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Question, SubjectContent } from '../../content/types';
import { useProgress } from '../../state/progress';
import { shuffle } from '../../lib/random';
import { QuestionView } from '../quiz/QuestionView';
import { celebrate } from '../../lib/confetti';
import { useMission } from '../focus/Mission';
import { extraQuestionsFor } from './registry';
import type { Progress } from '../../state/model';

/** Pick questions: unseen and often-missed ones first, but always shuffled and mixed. */
export function buildRound(subject: SubjectContent, p: Progress, n: number, opts: { topicId?: string; weakFirst?: boolean } = {}): Question[] {
  let pool = [...subject.questions, ...extraQuestionsFor(subject.id)];
  if (opts.topicId) pool = pool.filter((q) => q.topicId === opts.topicId);
  const score = (q: Question) => {
    const s = p.qstats[q.id];
    if (!s) return 1 + Math.random();
    const weak = s.w / (s.r + s.w);
    return (opts.weakFirst ? weak * 2 : weak) + Math.random() * 0.8;
  };
  const ranked = pool.map((q) => ({ q, s: score(q) })).sort((a, b) => b.s - a.s).map((x) => x.q);
  // Keep topics mixed: take the top candidates then shuffle them.
  return shuffle(ranked.slice(0, Math.max(n, Math.min(pool.length, n * 2)))).slice(0, n);
}

export function Quiz({ subject, mode }: { subject: SubjectContent; mode?: string }) {
  const { p, answer, quizFinished } = useProgress();
  const { finished } = useMission();
  const boost = mode === 'boost';
  const [topic, setTopic] = useState<string>('');
  const [round, setRound] = useState(0);
  const questions = useMemo(
    () => buildRound(subject, p, boost ? 15 : 10, { topicId: topic || undefined, weakFirst: boost }),
    [subject, round, topic, boost], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [done, setDone] = useState(false);

  const restart = () => { setRound((r) => r + 1); setI(0); setRight(0); setDone(false); };

  if (!questions.length) return <p className="muted">Questions for this subject are coming soon.</p>;

  if (done) {
    const pct = Math.round((right / questions.length) * 100);
    return (
      <motion.section className="card center stack" initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ alignItems: 'center' }}>
        <div style={{ fontSize: 60 }} aria-hidden>{pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 50 ? '💪' : '🌱'}</div>
        <h2>{right} / {questions.length}</h2>
        <p>{pct === 100 ? 'Perfect round!' : pct >= 80 ? 'Superb work!' : pct >= 50 ? 'Good effort. The ones you missed will come back so you can nail them.' : 'Every mistake is your brain learning. Try the Learn cards, then have another go.'}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={restart}>Another round</button>
        </div>
      </motion.section>
    );
  }

  const q = questions[i];
  return (
    <section className="card" data-testid="quiz">
      {!boost && (
        <div className="row" style={{ marginBottom: 12 }}>
          <label htmlFor="topic" className="small">Topic</label>
          <select id="topic" value={topic} onChange={(e) => { setTopic(e.target.value); setI(0); setRight(0); }} style={{ flex: '1 1 200px', width: 'auto' }}>
            <option value="">All topics (mixed)</option>
            {subject.topics.map((t) => <option key={t.id} value={t.id}>{t.group ? `${t.group}: ` : ''}{t.title}</option>)}
          </select>
        </div>
      )}
      {boost && <p className="pill" style={{ marginBottom: 12 }}>🚀 Final Boost: mixed questions from the whole subject, your weakest first</p>}
      <div className="row small muted" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
        <span>Question {i + 1} of {questions.length}</span><span>✓ {right}</span>
      </div>
      <div className="bar" style={{ marginBottom: 16 }}><span style={{ width: `${(i / questions.length) * 100}%` }} /></div>
      <QuestionView key={q.id + i} q={q}
        onAnswered={(a) => { answer(q, subject.id, a.correct); if (a.correct) setRight((r) => r + 1); }}
        onNext={() => {
          if (i + 1 < questions.length) setI(i + 1);
          else {
            const pct = Math.round((right / questions.length) * 100);
            setDone(true);
            quizFinished(subject.id, pct);
            if (pct >= 80) celebrate(pct === 100);
            finished(subject.id, ['quiz', 'boost-quiz']);
          }
        }} />
    </section>
  );
}

