import { useProgress } from '../../state/progress';
import { planUntil } from '../../state/planner';
import { examsFor } from '../../content/timetable';
import { SUBJECTS, SUBJECT_LIST } from '../../content';
import { weaknessFor } from '../../state/model';
import { addDays, longDay } from '../../lib/dates';
import { KIND_ICON, KIND_LABEL } from '../focus/Mission';
import { Page, TopBar } from '../shell/Shell';

export function PlanPage() {
  const { p, today } = useProgress();
  const exams = examsFor(p.classId);
  const last = exams[exams.length - 1]?.date ?? today;
  const weakness = Object.fromEntries(SUBJECT_LIST.map((s) => [s.id, weaknessFor(s, p, today)]));
  const days = planUntil({ exams, start: p.planStart ?? today, weakness }, last).filter((d) => d.date >= addDays(today, -1));
  return (
    <>
      <TopBar title="Revision plan" back="" />
      <Page>
        <h1>Your plan to {longDay(last)}</h1>
        <p className="muted">Future days adjust automatically: subjects you find harder, or rate Red, get more time.</p>
        <div className="stack">
          {days.map((d) => {
            const frozen = p.missions[d.date];
            const tasks = frozen ?? d.tasks;
            const done = p.missionsDone[d.date] ?? [];
            return (
              <section key={d.date} className="card flat" style={{ borderColor: d.date === today ? 'var(--accent)' : undefined }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>{d.date === today ? 'Today · ' : ''}{longDay(d.date)}</h3>
                  {d.examToday && <span className="pill" style={{ borderColor: 'var(--warn)' }}>📝 {SUBJECTS[d.examToday].name} exam</span>}
                  {d.type === 'boost' && d.boostFor && <span className="pill">🚀 Final Boost: {SUBJECTS[d.boostFor].name}</span>}
                </div>
                {tasks.length === 0 ? <p className="muted small" style={{ margin: '8px 0 0' }}>{d.type === 'done' ? 'All done!' : 'Rest and good luck!'}</p> : (
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                    {tasks.map((t) => (
                      <li key={t.id}>
                        {done.includes(t.id) ? '✅ ' : ''}{SUBJECTS[t.subject].emoji} {SUBJECTS[t.subject].name}: {KIND_ICON[t.kind]} {KIND_LABEL[t.kind]} <span className="muted small">({t.minutes} min)</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </Page>
    </>
  );
}
