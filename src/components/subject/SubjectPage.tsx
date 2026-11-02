import { Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Rag } from '../../state/model';
import { masteryFor } from '../../state/model';
import { useProgress } from '../../state/progress';
import { SUBJECTS } from '../../content';
import type { SubjectContent, SubjectId } from '../../content/types';
import { examsFor } from '../../content/timetable';
import { daysToGoLabel, diffDays, longDay } from '../../lib/dates';
import { go } from '../../lib/router';
import { Page, TopBar, MasteryRing } from '../shell/Shell';
import { Flashcards } from './Flashcards';
import { Quiz } from './Quiz';
import { Boss, bossUnlocked } from './Boss';
import { Lessons } from './Lessons';
import { PRACTISE } from './registry';
import { play } from '../../lib/sound';

const TABS = [
  { id: 'test', label: '📋 What’s on the test' },
  { id: 'learn', label: '📘 Lessons' },
  { id: 'cards', label: '🃏 Flashcards' },
  { id: 'quiz', label: '❓ Quiz' },
  { id: 'practise', label: '🛠️ Practise' },
  { id: 'links', label: '🔗 Links' },
];
/** Tabs where she reads and thinks: the background stays still. */
const CALM_TABS = new Set(['learn', 'cards', 'quiz', 'practise', 'boss']);

export function SubjectPage({ id, tab = 'test', tool, mode }: { id: SubjectId; tab?: string; tool?: string; mode?: string }) {
  const subject = SUBJECTS[id];
  const { p, today } = useProgress();
  const exam = examsFor(p.classId).find((e) => e.subject === id);
  const m = masteryFor(subject, p);
  const days = exam ? diffDays(today, exam.date) : null;

  useEffect(() => {
    document.documentElement.dataset.calmScreen = CALM_TABS.has(tab) ? 'true' : 'false';
    return () => { document.documentElement.dataset.calmScreen = 'false'; };
  }, [tab]);

  if (!subject) { go(''); return null; }
  return (
    <>
      <TopBar title={subject.name} back="" />
      <Page>
        <header className="row" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 46 }} aria-hidden>{subject.emoji}</span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h1 style={{ margin: 0 }}>{subject.name}</h1>
            {exam && <div className="muted">{longDay(exam.date)} · {days !== null && days < 0 ? 'Complete 🏆' : daysToGoLabel(days ?? 0)}</div>}
          </div>
          <MasteryRing value={m.overall} size={72} colour={subject.colour} label={`${m.overall}% mastery`} />
          <button className="btn secondary" onClick={() => go(`subject/${id}/boss`)} aria-label={`Boss Battle${bossUnlocked(subject, p) ? '' : ' (locked)'}`}>
            {bossUnlocked(subject, p) ? '⚔️' : '🔒'} Boss
          </button>
        </header>
        <nav className="tabs" role="tablist" aria-label={`${subject.name} sections`}>
          {TABS.map((t) => (
            <button key={t.id} role="tab" className="tab" aria-selected={tab === t.id} onClick={() => { play('click'); go(`subject/${id}/${t.id}`); }}>{t.label}</button>
          ))}
        </nav>
        <AnimatePresence mode="wait">
          <motion.div key={tab + (tool ?? '') + (mode ?? '')} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            {tab === 'test' && <TestTab subject={subject} />}
            {tab === 'learn' && <Lessons subject={subject} topicId={tool} />}
            {tab === 'cards' && <Flashcards subject={subject} mode={mode} />}
            {tab === 'quiz' && <Quiz subject={subject} mode={mode} />}
            {tab === 'practise' && <PractiseTab subject={subject} tool={tool} />}
            {tab === 'links' && <LinksTab subject={subject} />}
            {tab === 'boss' && <Boss subject={subject} />}
          </motion.div>
        </AnimatePresence>
      </Page>
    </>
  );
}

function TestTab({ subject }: { subject: SubjectContent }) {
  const { p, update } = useProgress();
  const groups = [...new Set(subject.topics.map((t) => t.group ?? ''))];
  const setRag = (topicId: string, v: Rag) => { update((x) => ({ ...x, rag: { ...x.rag, [topicId]: v } })); play('click'); };
  const m = masteryFor(subject, p);
  return (
    <div className="stack">
      <section className="card">
        <h2>The assessment</h2>
        <ul style={{ margin: 0, paddingLeft: 22 }}>{subject.format.map((f, i) => <li key={i}>{f}</li>)}</ul>
      </section>
      <section className="card">
        <h2>Topic checklist</h2>
        <p className="muted small">Rate each topic: <strong style={{ color: 'var(--rag-r)' }}>R</strong> = not confident, <strong style={{ color: 'var(--rag-a)' }}>A</strong> = getting there, <strong style={{ color: 'var(--rag-g)' }}>G</strong> = confident. Red topics get more time in your missions. Rated {m.rated} of {subject.topics.length}.</p>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <tbody>
              {groups.map((g) => (
                <FragmentRows key={g} group={g}>
                  {subject.topics.filter((t) => (t.group ?? '') === g).map((t) => (
                    <tr key={t.id}>
                      <td>
                        {t.title}
                        {t.note && <span className="pill small" style={{ marginLeft: 6 }}>{t.note}</span>}
                        {t.clip && <div className="small muted">MathsWatch clip: {t.clip}</div>}
                      </td>
                      <td style={{ width: 160 }}>
                        <div className="rag" role="group" aria-label={`Rate ${t.title}`}>
                          {(['R', 'A', 'G'] as Rag[]).map((v) => (
                            <button key={v} data-v={v} aria-pressed={p.rag[t.id] === v} onClick={() => setRag(t.id, v)} aria-label={`${{ R: 'Red', A: 'Amber', G: 'Green' }[v]}`}>{v}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </FragmentRows>
              ))}
            </tbody>
          </table>
        </div>
        {subject.id === 'maths' && <p className="small muted" style={{ marginTop: 10 }}>Some clip numbers in the booklet were a little unclear. Search them on MathsWatch (see the Links tab) and ask your teacher if one doesn’t match.</p>}
      </section>
      {subject.tips && (
        <section className="card">
          <h2>Top tips</h2>
          <ul style={{ margin: 0, paddingLeft: 22 }}>{subject.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}
    </div>
  );
}

function FragmentRows({ group, children }: { group: string; children: React.ReactNode }) {
  return (
    <>
      {group && <tr><th colSpan={2} style={{ paddingTop: 18, fontSize: '1rem', color: 'var(--accent)' }}>{group}</th></tr>}
      {children}
    </>
  );
}

function PractiseTab({ subject, tool }: { subject: SubjectContent; tool?: string }) {
  const Comp = PRACTISE[subject.id];
  if (!Comp) return <p className="muted">Practise tools for this subject are coming soon.</p>;
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <Comp tool={tool} />
    </Suspense>
  );
}

function LinksTab({ subject }: { subject: SubjectContent }) {
  return (
    <div className="stack">
      {subject.links.map((l, i) => (
        <div key={i} className="card row">
          <span style={{ fontSize: 28 }} aria-hidden>🔗</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <strong>{l.label}</strong>
            {l.note && <div className="small muted">{l.note}</div>}
          </div>
          {l.url && <a className="btn small" href={l.url} target="_blank" rel="noopener noreferrer">Open ↗</a>}
        </div>
      ))}
    </div>
  );
}
