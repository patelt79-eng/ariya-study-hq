import { useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { PractiseMenu } from '../PractiseMenu';
import { WorldMap } from './WorldMap';
import { PangaeaSlider, PlateBoundaries, WaterCycle } from './GeoTools';
import { WriteThenCompare } from '../../writing/WriteThenCompare';
import { CASE_STUDIES, GEOG_EXAM, type CaseStudy } from '../../../content/geography.extras';
import { useProgress } from '../../../state/progress';
import { play } from '../../../lib/sound';
import { celebrate } from '../../../lib/confetti';

export default function GeographyPractise({ tool }: { tool?: string }) {
  return (
    <PractiseMenu subject="geography" tool={tool} boss="15 mixed questions from every theme."
      note={<>Complete <strong>Educake</strong> quizzes to test knowledge. The hazard videos are on the Links tab.</>}
      tools={[
        { id: 'exam', icon: '📝', name: 'Exam questions', desc: 'The 10 booklet questions: write it, then compare with a model answer.', render: () => <WriteThenCompare subject="geography" questions={GEOG_EXAM} /> },
        { id: 'map', icon: '🗺️', name: 'Interactive world map', desc: 'Continents, oceans, biomes, and the UK’s countries and capitals.', render: () => <WorldMap /> },
        { id: 'water', icon: '💧', name: 'Water cycle', desc: 'Drag the processes onto the diagram.', render: () => <WaterCycle /> },
        { id: 'plates', icon: '🌋', name: 'Plate boundaries', desc: 'Watch convergent, divergent and conservative movement.', render: () => <PlateBoundaries /> },
        { id: 'pangaea', icon: '🧩', name: 'Pangaea drift', desc: 'Slide through 200 million years.', render: () => <PangaeaSlider /> },
        { id: 'cases', icon: '🗂️', name: 'Case study fact files', desc: 'Katrina, Vesuvius, the Yellow River and the Dust Bowl, with a mini quiz each.', render: () => <CaseStudies /> },
      ]} />
  );
}

function CaseStudies() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (n: number) => { setDir(n > i ? 1 : -1); setI((n + CASE_STUDIES.length) % CASE_STUDIES.length); play('flip'); };
  const onDragEnd = (_: unknown, info: PanInfo) => { if (info.offset.x < -80) go(i + 1); else if (info.offset.x > 80) go(i - 1); };
  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: 'center' }}>
        {CASE_STUDIES.map((c, k) => <button key={c.id} className={`chip ${k === i ? 'selected' : ''}`} onClick={() => go(k)}>{c.icon} {c.title}</button>)}
      </div>
      <p className="small muted center" style={{ margin: 0 }}>Swipe left or right to move between fact files.</p>
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key={CASE_STUDIES[i].id} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.4} onDragEnd={onDragEnd}
          initial={{ x: dir * 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -dir * 80, opacity: 0 }}>
          <FactFile c={CASE_STUDIES[i]} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function FactFile({ c }: { c: CaseStudy }) {
  const { p, update, award, unlock } = useProgress();
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const done = qi >= c.quiz.length;
  const finish = (score: number) => {
    const key = `case-${c.id}`;
    update((x) => ({ ...x, counters: { ...x.counters, [key]: Math.max(x.counters[key] ?? 0, score) } }));
    award(10 + score * 5, 'Case study');
    const allDone = CASE_STUDIES.every((cs) => cs.id === c.id || (p.counters[`case-${cs.id}`] ?? -1) >= 0);
    if (allDone) unlock('hazard-hunter');
    if (score === c.quiz.length) celebrate();
  };
  const section = (title: string, items: string[]) => (
    <div className="card flat"><strong>{title}</strong><ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>{items.map((t) => <li key={t}>{t}</li>)}</ul></div>
  );
  return (
    <article className="card stack">
      <div className="row"><span style={{ fontSize: 44 }} aria-hidden>{c.icon}</span><div><h2 style={{ margin: 0 }}>{c.title}</h2><div className="muted">{c.type} · {c.when}</div></div></div>
      <div className="card flat"><strong>📍 Location</strong><div>{c.location}</div></div>
      <div className="grid">
        {section('💥 Impacts', c.impacts)}
        {section('🛡️ Preparation', c.preparation)}
        {section('🚑 Response', c.response)}
      </div>
      <div className="card flat" style={{ borderColor: 'var(--accent)' }}>
        <strong>Mini quiz</strong>
        {!done ? (
          <>
            <p style={{ margin: '6px 0' }}>{c.quiz[qi].q}</p>
            <div className="stack" style={{ gap: 8 }}>
              {c.quiz[qi].options.map((o, k) => (
                <button key={o} className={`option ${pick !== null ? (k === c.quiz[qi].answer ? 'correct' : k === pick ? 'wrong' : '') : ''}`} disabled={pick !== null}
                  onClick={() => { setPick(k); if (k === c.quiz[qi].answer) { setRight((r) => r + 1); play('correct'); } else play('wrong'); }}>{o}</button>
              ))}
            </div>
            {pick !== null && <button className="btn" style={{ marginTop: 10 }} onClick={() => {
              const n = qi + 1; setQi(n); setPick(null);
              if (n >= c.quiz.length) finish(right);
            }}>{qi + 1 < c.quiz.length ? 'Next →' : 'Finish'}</button>}
          </>
        ) : (
          <p style={{ margin: '6px 0' }}><strong>{right} / {c.quiz.length}</strong> {right === c.quiz.length ? 'Perfect! 🎉' : 'Re-read the fact file and try again.'} <button className="btn ghost small" onClick={() => { setQi(0); setRight(0); setPick(null); }}>Retry</button></p>
        )}
      </div>
    </article>
  );
}
