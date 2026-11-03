import { motion } from 'framer-motion';
import { useProgress } from '../../state/progress';
import { BADGES, levelFor, masteryFor, rankFor } from '../../state/model';
import { THEMES } from '../../themes/themes';
import { examsFor, missingSubjects, PLAN_START } from '../../content/timetable';
import { SUBJECTS } from '../../content';
import { daysToGoLabel, diffDays, longDay, shortDate } from '../../lib/dates';
import { SubjectWorld } from './SubjectWorld';
import { KIND_ICON, KIND_LABEL, useMission } from '../focus/Mission';
import { go } from '../../lib/router';
import { Page, TopBar } from '../shell/Shell';
import { ListenButton } from '../audio/Listen';
import { sentences } from '../../audio/speech';

export function Home() {
  const { p } = useProgress();
  return (
    <>
      <TopBar title={`${p.name}'s Study HQ`} />
      <Page>
        <Hero />
        <Countdown />
        <ExamStrip />
        <TodaysMission />
        <section style={{ margin: '28px 0' }} aria-labelledby="subjects-h">
          <h2 id="subjects-h">Your subjects</h2>
          <p className="muted small">Tap a subject to revise. The ring shows flashcards mastered plus your quiz average.</p>
          <SubjectWorld />
        </section>
        <BadgeShelf />
      </Page>
    </>
  );
}

function Hero() {
  const { p } = useProgress();
  const t = THEMES[p.theme];
  const lvl = levelFor(p.xp);
  const pct = Math.round(((p.xp - lvl.floor) / (lvl.next - lvl.floor)) * 100);
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 260px' }}>
          <h1 style={{ marginBottom: 4 }}>Hi {p.name}!</h1>
          <p className="muted" style={{ margin: 0 }}>{t.hqName} · {p.classId} · Level {lvl.level} {rankFor(lvl.level)}</p>
        </div>
        <div className="row">
          <motion.div className="pill" style={{ fontSize: '1.05rem', padding: '8px 14px' }} animate={p.streak.count ? { scale: [1, 1.08, 1] } : undefined} transition={{ repeat: Infinity, duration: 2.4 }}>
            <span aria-hidden>🔥</span><span><strong>{p.streak.count}</strong>-day streak</span>
          </motion.div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="row small" style={{ justifyContent: 'space-between' }}>
          <span>{t.xpIcon} {t.meterLabel}</span>
          <span className="muted">{p.xp - lvl.floor} / {lvl.next - lvl.floor} {t.xpName} to level {lvl.level + 1}</span>
        </div>
        <div className="bar" style={{ height: 18, marginTop: 6 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t.meterLabel}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
}

function Countdown() {
  const { p, today } = useProgress();
  const exams = examsFor(p.classId);
  const todayExam = exams.find((e) => e.date === today);
  const next = exams.find((e) => e.date > today);
  if (todayExam) {
    const s = SUBJECTS[todayExam.subject];
    return (
      <motion.section className="card center" style={{ marginBottom: 16, borderColor: 'var(--warn)' }}
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <motion.div style={{ fontSize: 56 }} animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -10, 0] }} transition={{ duration: 1.4, repeat: 2 }} aria-hidden>🍀</motion.div>
        <h2>Good luck in {s.name} today!</h2>
        <p className="muted">You’ve prepared for this. Read each question carefully, show your working, and breathe.</p>
      </motion.section>
    );
  }
  if (!next) {
    return (
      <section className="card center" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 56 }} aria-hidden>🏆</div>
        <h2>All assessments complete!</h2>
        <p className="muted">Amazing effort, {p.name}. Be proud of how hard you worked.</p>
      </section>
    );
  }
  const days = diffDays(today, next.date);
  const s = SUBJECTS[next.subject];
  return (
    <section className="card" style={{ marginBottom: 16 }} aria-label="Next exam countdown">
      <div className="row">
        <span style={{ fontSize: 48 }} aria-hidden>{s.emoji}</span>
        <div style={{ flex: 1 }}>
          <div className="muted small">Next assessment</div>
          <h2 style={{ margin: 0 }}>{s.name}</h2>
          <div className="muted">{longDay(next.date)}</div>
        </div>
        <motion.div className="center" key={days} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
          <div className="display" style={{ fontSize: 'calc(2.6rem * var(--display-size))', color: 'var(--accent)' }}>{days}</div>
          <div className="small">{days === 1 ? 'day to go' : 'days to go'}</div>
        </motion.div>
      </div>
    </section>
  );
}

function ExamStrip() {
  const { p, today } = useProgress();
  const exams = examsFor(p.classId);
  const missing = missingSubjects(p.classId);
  return (
    <section style={{ marginBottom: 20 }} aria-label="All exams">
      <div className="tabs" style={{ gap: 10, paddingBottom: 8 }}>
        {exams.map((e) => {
          const s = SUBJECTS[e.subject];
          const d = diffDays(today, e.date);
          return (
            <button key={e.subject} className="card flat" onClick={() => go(`subject/${e.subject}`)}
              style={{ flex: '0 0 auto', minWidth: 140, padding: 12, cursor: 'pointer', textAlign: 'left', opacity: d < 0 ? 0.7 : 1, borderColor: d === 0 ? 'var(--warn)' : undefined }}>
              <div style={{ fontSize: 26 }} aria-hidden>{d < 0 ? '🏆' : s.emoji}</div>
              <strong>{s.name}</strong>
              <div className="small">{shortDate(e.date)}</div>
              <div className="small" style={{ color: d < 0 ? 'var(--good)' : d <= 2 ? 'var(--warn)' : 'var(--muted)' }}>{d < 0 ? 'Complete' : daysToGoLabel(d)}</div>
            </button>
          );
        })}
      </div>
      {missing.length > 0 && (
        <p className="small muted">The booklet doesn’t list a date for {missing.map((m) => SUBJECTS[m].name).join(', ')} for {p.classId}. Check with school.</p>
      )}
    </section>
  );
}

function TodaysMission() {
  const { p, today, todayPlan } = useProgress();
  const { start, active } = useMission();
  const t = THEMES[p.theme];
  const done = p.missionsDone[today] ?? [];
  const finished = todayPlan.tasks.length > 0 && todayPlan.tasks.every((x) => done.includes(x.id));
  // "Day 3 of 23": counts from the plan's Day 1 to the last assessment.
  const exams = examsFor(p.classId);
  const totalDays = exams.length ? diffDays(PLAN_START, exams[exams.length - 1].date) + 1 : 0;
  const dayNum = diffDays(PLAN_START, today) + 1;
  const showDay = dayNum >= 1 && dayNum <= totalDays;
  const missionText = sentences([
    `${t.missionName}`,
    showDay ? `Day ${dayNum} of ${totalDays}` : undefined,
    todayPlan.type === 'done' ? 'No missions: every assessment is done. Enjoy the break!' : undefined,
    todayPlan.type === 'boost' && todayPlan.boostFor ? `Final Boost day for ${SUBJECTS[todayPlan.boostFor].name}` : undefined,
    todayPlan.type === 'exam' && todayPlan.examToday ? `Exam day: good luck in ${SUBJECTS[todayPlan.examToday].name}! It’s a lighter mission today` : undefined,
    ...todayPlan.tasks.map((task, i) => `Task ${i + 1}: ${SUBJECTS[task.subject].name}, ${KIND_LABEL[task.kind]}, ${task.minutes} minutes${done.includes(task.id) ? ', done' : ''}`),
  ]);
  return (
    <section className="card" style={{ marginBottom: 16 }} aria-labelledby="mission-h">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 id="mission-h" style={{ margin: 0 }}>{t.missionName} {showDay && <span className="pill" style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', verticalAlign: 'middle' }}>Day {dayNum} of {totalDays}</span>}</h2>
        <span className="row" style={{ gap: 6 }}>
          <ListenButton id="home:mission" text={missionText} />
          <button className="btn ghost small" onClick={() => go('plan')}>Full plan →</button>
        </span>
      </div>
      {todayPlan.type === 'boost' && todayPlan.boostFor && (
        <p className="pill" style={{ marginTop: 10, borderColor: 'var(--warn)' }}>🚀 Final Boost day: {SUBJECTS[todayPlan.boostFor].name} is next!</p>
      )}
      {todayPlan.eveningBoost && todayPlan.boostFor && (
        <p className="small" style={{ marginTop: 10 }}>After today’s exam: a short evening boost for {SUBJECTS[todayPlan.boostFor].name}, which is tomorrow.</p>
      )}
      {todayPlan.type === 'exam' && !todayPlan.eveningBoost && (
        <p className="small muted" style={{ marginTop: 10 }}>Exam day, so it’s a lighter mission. Rest is revision too.</p>
      )}
      {todayPlan.type === 'done' && <p>No missions: every assessment is done. Enjoy the break! 🎉</p>}
      <div className="stack" style={{ marginTop: 12 }}>
        {todayPlan.tasks.map((task, i) => {
          const s = SUBJECTS[task.subject];
          const isDone = done.includes(task.id);
          return (
            <motion.div key={task.id} className="row card flat" style={{ padding: 12, background: 'var(--surface-2)', opacity: isDone ? 0.75 : 1 }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: isDone ? 0.75 : 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <span style={{ fontSize: 28 }} aria-hidden>{isDone ? '✅' : s.emoji}</span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <strong>{s.name}</strong> · {KIND_ICON[task.kind]} {KIND_LABEL[task.kind]}
                <div className="small muted">{task.minutes} minutes</div>
              </div>
              {isDone ? <span className="pill" style={{ color: 'var(--good)' }}>Done</span> : (
                <button className="btn small" onClick={() => start(task)} disabled={active?.id === task.id}>
                  {active?.id === task.id ? 'In progress' : 'Start'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      {finished && (
        <motion.p className="center" initial={{ scale: 0.6 }} animate={{ scale: 1 }} style={{ marginTop: 14, fontWeight: 700 }}>
          Mission complete! 🎉 Anything extra today is a bonus.
        </motion.p>
      )}
      <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
        Each task runs with a 20-minute focus timer, then a 5-minute brain break.
        {Object.values(SUBJECTS).some((s) => masteryFor(s, p).rated === 0) && ' Tip: rate your topics Red/Amber/Green on each subject’s “What’s on the test” tab, so the plan can focus on what you find hardest.'}
      </p>
    </section>
  );
}

function BadgeShelf() {
  const { p } = useProgress();
  return (
    <section className="card" aria-labelledby="badges-h">
      <h2 id="badges-h">Badges</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 10 }}>
        {BADGES.map((b) => {
          const got = !!p.badges[b.id];
          return (
            <div key={b.id} className="center" title={b.desc} style={{ padding: 8, borderRadius: 12, background: 'var(--surface-2)', opacity: got ? 1 : 0.8 }}>
              <div style={{ fontSize: 30, filter: got ? 'none' : 'grayscale(1)' }} aria-hidden>{got ? b.icon : '🔒'}</div>
              <div className="small" style={{ fontWeight: 700, lineHeight: 1.2 }}>{b.name}</div>
              <div className="sr-only">{got ? 'Unlocked' : 'Locked'}: {b.desc}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
