import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '../../state/progress';
import { CLASSES, examsFor, type ClassId } from '../../content/timetable';
import { SUBJECTS } from '../../content';
import { shortDate } from '../../lib/dates';
import { THEMES } from '../../themes/themes';
import type { ThemeId } from '../../state/model';
import { celebrate } from '../../lib/confetti';
import { play, unlockAudio } from '../../lib/sound';

export function Onboarding() {
  const { p, update, today } = useProgress();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(p.name);
  const [cls, setCls] = useState<ClassId>(p.classId);

  const finish = () => {
    update((x) => ({ ...x, onboarded: true, name: name.trim() || 'Ariya', classId: cls, planStart: x.planStart ?? today }));
    celebrate(true);
    play('levelup');
  };

  return (
    <main className="page" style={{ maxWidth: 720, display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.section key="w" className="card center stack" style={{ alignItems: 'center', width: '100%' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            <motion.div style={{ fontSize: 80 }} initial={{ y: 80, rotate: -20 }} animate={{ y: [80, -10, 0], rotate: 0 }} transition={{ duration: 1.2 }} aria-hidden>🚀</motion.div>
            <h1>Welcome to Study HQ</h1>
            <p className="muted">Short missions, flashcards and quizzes to smash your Autumn Assessments.</p>
            <label htmlFor="name" style={{ alignSelf: 'stretch', textAlign: 'left' }}>What’s your name?</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoComplete="off" />
            <button className="btn block" onClick={() => { unlockAudio(); play('click'); setStep(1); }}>Next</button>
          </motion.section>
        )}
        {step === 1 && (
          <motion.section key="c" className="card stack" style={{ width: '100%' }}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <h2>Which class are you in?</h2>
            <p className="muted small">This sets your exam dates. You can change it later in Settings.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8 }} role="radiogroup" aria-label="Class">
              {CLASSES.map((c) => (
                <button key={c} role="radio" aria-checked={cls === c} className={`btn ${cls === c ? '' : 'secondary'}`} onClick={() => { setCls(c); play('click'); }}>{c}</button>
              ))}
            </div>
            <div className="card flat" style={{ background: 'var(--surface-2)' }}>
              <strong>{cls} exams</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                {examsFor(cls).map((e) => <li key={e.subject}>{SUBJECTS[e.subject].emoji} {SUBJECTS[e.subject].name}: {shortDate(e.date)}</li>)}
              </ul>
            </div>
            <div className="row">
              <button className="btn secondary" onClick={() => setStep(0)}>Back</button>
              <span className="spacer" />
              <button className="btn" onClick={() => { play('click'); setStep(2); }}>Next</button>
            </div>
          </motion.section>
        )}
        {step === 2 && (
          <motion.section key="t" className="card stack" style={{ width: '100%' }}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <h2>Pick your theme</h2>
            <ThemePicker />
            <div className="row">
              <button className="btn secondary" onClick={() => setStep(1)}>Back</button>
              <span className="spacer" />
              <button className="btn" onClick={finish}>Launch! 🚀</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

export function ThemePicker() {
  const { p, update } = useProgress();
  return (
    <div className="grid" role="radiogroup" aria-label="Theme">
      {(Object.keys(THEMES) as ThemeId[]).map((id) => {
        const t = THEMES[id];
        const on = p.theme === id;
        return (
          <motion.button key={id} role="radio" aria-checked={on} whileTap={{ scale: 0.96 }}
            onClick={() => { update((x) => ({ ...x, theme: id })); play('click'); }}
            className="card flat" style={{ cursor: 'pointer', textAlign: 'left', borderWidth: 3, borderColor: on ? 'var(--accent)' : 'var(--border)', padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 80, background: t.preview, display: 'grid', placeItems: 'center', fontSize: 34 }} aria-hidden>
              {id === 'space' ? '🪐' : id === 'arcade' ? '🕹️' : '🗺️'}
            </div>
            <div style={{ padding: 12 }}>
              <strong>{t.name} {on && '✓'}</strong>
              <div className="small muted">{t.blurb}</div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
