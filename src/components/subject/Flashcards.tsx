// Leitner-box flashcards: due cards first, then new ones. "Not yet" sends a card back to box 1.
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import type { Flashcard, SubjectContent } from '../../content/types';
import { useProgress } from '../../state/progress';
import { shuffle } from '../../lib/random';
import { play } from '../../lib/sound';
import { useMission } from '../focus/Mission';
import { celebrate } from '../../lib/confetti';

const SESSION = 15;

export function Flashcards({ subject, mode }: { subject: SubjectContent; mode?: string }) {
  const { p, today, review } = useProgress();
  const { finished } = useMission();
  const weak = mode === 'weak';
  const [round, setRound] = useState(0);
  const [onlyBonus, setOnlyBonus] = useState(false);

  const deck = useMemo<Flashcard[]>(() => {
    const cards = subject.flashcards.filter((c) => !onlyBonus || c.bonus);
    if (weak) {
      const missedTopics = new Set(Object.entries(p.qstats).filter(([, s]) => s.subject === subject.id && s.lastWrong).map(([id]) =>
        subject.questions.find((q) => q.id === id)?.topicId));
      const redTopics = new Set(subject.topics.filter((t) => p.rag[t.id] === 'R').map((t) => t.id));
      return cards
        .map((c) => {
          const st = p.leitner[c.id];
          let s = st ? 6 - st.box : 3;
          if (missedTopics.has(c.topicId)) s += 2;
          if (redTopics.has(c.topicId)) s += 2;
          return { c, s: s + Math.random() };
        })
        .sort((a, b) => b.s - a.s).slice(0, SESSION).map((x) => x.c);
    }
    const due = cards.filter((c) => p.leitner[c.id] && p.leitner[c.id].due <= today).sort((a, b) => p.leitner[a.id].box - p.leitner[b.id].box);
    const fresh = shuffle(cards.filter((c) => !p.leitner[c.id]));
    const out = [...due, ...fresh].slice(0, SESSION);
    return out.length ? shuffle(out) : shuffle(cards).slice(0, SESSION);
  }, [subject, round, weak, onlyBonus]); // eslint-disable-line react-hooks/exhaustive-deps

  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [got, setGot] = useState(0);
  const [dir, setDir] = useState(0);

  const boxes = [1, 2, 3, 4, 5].map((b) => subject.flashcards.filter((c) => p.leitner[c.id]?.box === b).length);
  const unseen = subject.flashcards.filter((c) => !p.leitner[c.id]).length;

  if (!subject.flashcards.length) return <p className="muted">Flashcards for this subject are coming soon.</p>;

  const mark = (ok: boolean) => {
    const card = deck[i];
    review(card.id, ok);
    play(ok ? 'correct' : 'flip');
    if (ok) setGot((g) => g + 1);
    setDir(ok ? 1 : -1);
    setFlipped(false);
    setI(i + 1);
    if (i + 1 >= deck.length) { finished(subject.id, ['flashcards', 'weak-cards']); celebrate(); }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!flipped) return;
    if (info.offset.x > 100) mark(true);
    else if (info.offset.x < -100) mark(false);
  };

  return (
    <section className="stack">
      <div className="card flat row small" aria-label="Leitner boxes">
        <span className="muted">Boxes:</span>
        <span className="pill">New {unseen}</span>
        {boxes.map((n, b) => <span key={b} className="pill" title={`Box ${b + 1}`}>{['①', '②', '③', '④', '⑤'][b]} {n}</span>)}
        <span className="spacer" />
        {subject.flashcards.some((c) => c.bonus) && (
          <button className="btn ghost small" onClick={() => { setOnlyBonus((x) => !x); setI(0); setGot(0); }}>{onlyBonus ? 'All cards' : 'Bonus only'}</button>
        )}
      </div>
      {weak && <p className="pill">🎯 Your weakest cards: low boxes, red topics and questions you missed</p>}

      {i >= deck.length ? (
        <motion.div className="card center stack" style={{ alignItems: 'center' }} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <div style={{ fontSize: 56 }} aria-hidden>🃏</div>
          <h2>Deck done!</h2>
          <p>You knew {got} of {deck.length}. Cards you didn’t know will come back sooner.</p>
          <button className="btn" onClick={() => { setRound((r) => r + 1); setI(0); setGot(0); }}>Another deck</button>
        </motion.div>
      ) : (
        <>
          <div className="row small muted" style={{ justifyContent: 'space-between' }}>
            <span>Card {i + 1} of {deck.length}</span>
            <span>Box {p.leitner[deck[i].id]?.box ?? 'new'}</span>
          </div>
          <div style={{ perspective: 1200, minHeight: 280, position: 'relative' }}>
            <AnimatePresence mode="popLayout" custom={dir}>
              <motion.div key={deck[i].id + i}
                drag={flipped ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} onDragEnd={onDragEnd}
                initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: dir * 300, opacity: 0, rotate: dir * 10 }}
                style={{ position: 'relative' }}>
                <motion.button
                  onClick={() => { setFlipped((f) => !f); play('flip'); }}
                  animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.45 }}
                  aria-label={flipped ? 'Card back. Tap to see the front' : 'Card front. Tap to flip'}
                  style={{ width: '100%', minHeight: 280, transformStyle: 'preserve-3d', border: 0, background: 'none', padding: 0, cursor: 'pointer', position: 'relative' }}>
                  <Face>
                    <span className="small muted">{subject.topics.find((t) => t.id === deck[i].topicId)?.title}{deck[i].bonus ? ' · bonus' : ''}</span>
                    <strong style={{ fontSize: '1.5rem' }}>{deck[i].front}</strong>
                    <span className="small muted">Tap to flip</span>
                  </Face>
                  <Face back>
                    <span style={{ fontSize: '1.3rem' }}>{deck[i].back}</span>
                  </Face>
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
          {flipped ? (
            <div className="row">
              <button className="btn bad" style={{ flex: 1 }} onClick={() => mark(false)}>↺ Not yet</button>
              <button className="btn good" style={{ flex: 1 }} onClick={() => mark(true)}>✓ Got it</button>
            </div>
          ) : (
            <p className="center small muted">Say the answer in your head, then flip. After flipping you can also swipe: right = got it, left = not yet.</p>
          )}
        </>
      )}
    </section>
  );
}

function Face({ children, back }: { children: React.ReactNode; back?: boolean }) {
  return (
    <span className="card" style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: back ? 'rotateY(180deg)' : undefined, textAlign: 'center',
      color: 'var(--text)', background: back ? 'var(--surface-2)' : 'var(--surface)', borderWidth: 2, borderColor: back ? 'var(--accent-2)' : 'var(--accent)',
    }}>{children}</span>
  );
}
