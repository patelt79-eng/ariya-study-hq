// Boss Battle: 15 mixed questions against the clock. Correct answers hit the boss; wrong answers or time-outs cost a heart.
import { useEffect, useMemo, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { SubjectContent } from '../../content/types';
import { useProgress, XP } from '../../state/progress';
import { buildRound } from './Quiz';
import { QuestionView } from '../quiz/QuestionView';
import { celebrate } from '../../lib/confetti';
import { play } from '../../lib/sound';
import { go } from '../../lib/router';
import { masteryFor } from '../../state/model';

const ROUNDS = 15;
const HITS_TO_WIN = 10;
const HEARTS = 5;
const SECONDS = 40;

export function bossUnlocked(subject: SubjectContent, p: ReturnType<typeof useProgress>['p']): boolean {
  const m = masteryFor(subject, p);
  return m.rated === subject.topics.length && (p.quizScores[subject.id]?.length ?? 0) > 0;
}

const BOSSES: Record<string, string> = { maths: '🧮', science: '🧪', english: '📜', re: '🕯️', geography: '🌋', history: '🐉' };

export function Boss({ subject }: { subject: SubjectContent }) {
  const { p, answer, award, unlock } = useProgress();
  const [run, setRun] = useState(0);
  const qs = useMemo(() => buildRound(subject, p, ROUNDS), [subject, run]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [hits, setHits] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [left, setLeft] = useState(SECONDS);
  const [answered, setAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const boss = useAnimationControls();

  const won = hits >= HITS_TO_WIN;
  const lost = hearts <= 0 || (!won && i >= qs.length);
  const over = won || lost;

  useEffect(() => {
    if (!started || answered || over) return;
    if (left <= 0) { setAnswered(true); setHearts((h) => h - 1); play('wrong'); return; }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, started, answered, over]);

  useEffect(() => {
    if (won) { celebrate(true); award(XP.boss, 'Boss defeated'); unlock('boss-slayer'); }
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!bossUnlocked(subject, p)) {
    return (
      <section className="card center stack">
        <div style={{ fontSize: 56 }} aria-hidden>🔒</div>
        <h2>Boss Battle locked</h2>
        <p>Rate every topic on the “What’s on the test” tab and finish at least one quiz to unlock it.</p>
        <button className="btn" onClick={() => go(`subject/${subject.id}/test`)}>Go to topics</button>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="card center stack" style={{ alignItems: 'center' }}>
        <motion.div style={{ fontSize: 90 }} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} aria-hidden>{BOSSES[subject.id]}</motion.div>
        <h2>{subject.name} Boss Battle</h2>
        <p>Up to {ROUNDS} mixed questions, {SECONDS} seconds each. Land {HITS_TO_WIN} hits to win. You have {HEARTS} hearts.</p>
        <button className="btn" onClick={() => setStarted(true)}>Fight! ⚔️</button>
      </section>
    );
  }

  if (over) {
    return (
      <motion.section className="card center stack" style={{ alignItems: 'center' }} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
        <div style={{ fontSize: 80 }} aria-hidden>{won ? '🏆' : '🛡️'}</div>
        <h2>{won ? 'Boss defeated!' : 'The boss survived… this time'}</h2>
        <p>{won ? `${hits} hits. Legendary!` : `You landed ${hits} hits. Review your weakest cards and come back stronger.`}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={() => { setRun((r) => r + 1); setI(0); setHits(0); setHearts(HEARTS); setLeft(SECONDS); setAnswered(false); }}>Rematch</button>
          <button className="btn secondary" onClick={() => go(`subject/${subject.id}/cards?mode=weak`)}>Weakest cards</button>
        </div>
      </motion.section>
    );
  }

  const q = qs[i];
  return (
    <section className="stack">
      <div className="card flat">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <motion.span animate={boss} style={{ fontSize: 48 }} aria-hidden>{BOSSES[subject.id]}</motion.span>
          <div style={{ flex: 1 }}>
            <div className="small">Boss health</div>
            <div className="bar" style={{ height: 18 }} role="progressbar" aria-label="Boss health" aria-valuenow={HITS_TO_WIN - hits} aria-valuemax={HITS_TO_WIN}>
              <span style={{ width: `${((HITS_TO_WIN - hits) / HITS_TO_WIN) * 100}%`, background: 'linear-gradient(90deg, #ff4d6d, #ff9f1c)' }} />
            </div>
          </div>
          <div aria-label={`${hearts} hearts left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(HEARTS - Math.max(0, hearts))}</div>
        </div>
        <div className="row small" style={{ marginTop: 8, justifyContent: 'space-between' }}>
          <span>Question {i + 1} / {qs.length}</span>
          <span style={{ color: left <= 10 ? 'var(--bad)' : undefined, fontWeight: 700 }}>⏱ {left}s</span>
        </div>
      </div>
      <div className="card">
        <QuestionView key={q.id} q={q} disabled={answered && left <= 0}
          onAnswered={(a) => {
            setAnswered(true);
            answer(q, subject.id, a.correct);
            if (a.correct) { setHits((h) => h + 1); void boss.start({ x: [0, 12, -12, 0], rotate: [0, 10, -10, 0], transition: { duration: 0.4 } }); }
            else setHearts((h) => h - 1);
          }}
          onNext={() => { setI(i + 1); setLeft(SECONDS); setAnswered(false); }} />
        {answered && left <= 0 && (
          <div className="feedback bad">
            <strong>Time’s up!</strong> <div>{q.explain}</div>
            <button className="btn" style={{ marginTop: 10 }} onClick={() => { setI(i + 1); setLeft(SECONDS); setAnswered(false); }}>Next →</button>
          </div>
        )}
      </div>
    </section>
  );
}
