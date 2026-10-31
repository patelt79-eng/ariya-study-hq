import { Suspense, lazy, useEffect, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ProgressProvider, useProgress } from './state/progress';
import { useRoute } from './lib/router';
import { Backdrop } from './components/shell/Shell';
import { RewardLayer } from './components/reward/RewardLayer';
import { MissionProvider } from './components/focus/Mission';
import { Home } from './components/home/Home';
import { Onboarding } from './components/onboarding/Onboarding';
import { SUBJECTS } from './content';
import type { SubjectId } from './content/types';
import { unlockAudio } from './lib/sound';

// Screens other than Home load on demand, so the first screen appears faster.
const SubjectPage = lazy(() => import('./components/subject/SubjectPage').then((m) => ({ default: m.SubjectPage })));
const Settings = lazy(() => import('./components/settings/Settings').then((m) => ({ default: m.Settings })));
const Parent = lazy(() => import('./components/parent/Parent').then((m) => ({ default: m.Parent })));
const PlanPage = lazy(() => import('./components/home/PlanPage').then((m) => ({ default: m.PlanPage })));

export default function App() {
  return (
    <ProgressProvider>
      <Shell />
    </ProgressProvider>
  );
}

function Shell() {
  const { p, update, today } = useProgress();
  const route = useRoute();
  const lastActive = useRef(Date.now());

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = p.theme;
    el.dataset.calm = String(p.calm);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', getComputedStyle(el).getPropertyValue('--bg').trim() || '#0b1026');
  }, [p.theme, p.calm]);

  // iOS needs a tap before audio can play.
  useEffect(() => {
    const on = () => { unlockAudio(); lastActive.current = Date.now(); };
    window.addEventListener('pointerdown', on, { passive: true });
    window.addEventListener('keydown', on);
    return () => { window.removeEventListener('pointerdown', on); window.removeEventListener('keydown', on); };
  }, []);

  // Count a revision minute when the app is visible and she has touched it in the last 2 minutes.
  const onRevisionScreen = route.parts[0] === 'subject';
  useEffect(() => {
    if (!onRevisionScreen) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || Date.now() - lastActive.current > 120_000) return;
      update((x) => ({ ...x, minutesByDay: { ...x.minutesByDay, [today]: (x.minutesByDay[today] ?? 0) + 1 } }));
    }, 60_000);
    return () => window.clearInterval(id);
  }, [onRevisionScreen, today, update]);

  const key = route.parts.slice(0, 2).join('/') || 'home';
  let screen: React.ReactNode;
  if (!p.onboarded) screen = <Onboarding />;
  else {
    const [a, b, c, d] = route.parts;
    if (a === 'subject' && b && b in SUBJECTS) screen = <SubjectPage id={b as SubjectId} tab={c} tool={d} mode={route.query.get('mode') ?? undefined} />;
    else if (a === 'settings') screen = <Settings />;
    else if (a === 'parent') screen = <Parent />;
    else if (a === 'plan') screen = <PlanPage />;
    else screen = <Home />;
  }

  return (
    <MotionConfig reducedMotion={p.calm ? 'always' : 'user'}>
      <Backdrop />
      {p.theme === 'arcade' && !p.calm && <div className="scanlines" aria-hidden />}
      <MissionProvider>
        <div className="app">
          <AnimatePresence mode="wait">
            <motion.div key={p.onboarded ? key : 'onboarding'} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <Suspense fallback={<p className="center muted" style={{ padding: 40 }}>Loading…</p>}>{screen}</Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </MissionProvider>
      <RewardLayer />
    </MotionConfig>
  );
}
