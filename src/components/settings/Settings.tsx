import { useRef, useState } from 'react';
import { useProgress } from '../../state/progress';
import { CLASSES, type ClassId } from '../../content/timetable';
import { ThemePicker } from '../onboarding/Onboarding';
import { downloadJSON, readJSONFile } from '../../state/storage';
import { defaultProgress, migrate } from '../../state/model';
import { go } from '../../lib/router';
import { Page, TopBar } from '../shell/Shell';

export function Settings() {
  const { p, update, replace, today } = useProgress();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const doImport = async (f: File) => {
    try {
      const data = await readJSONFile(f);
      replace(migrate(data));
      setMsg('Progress imported ✓');
    } catch {
      setMsg('That file could not be read. Is it a Study HQ backup?');
    }
  };

  return (
    <>
      <TopBar title="Settings" back="" />
      <Page>
        <section className="card stack" style={{ marginBottom: 16 }}>
          <h2>Theme</h2>
          <ThemePicker />
        </section>

        <section className="card stack" style={{ marginBottom: 16 }}>
          <h2>You</h2>
          <label htmlFor="s-name">Name</label>
          <input id="s-name" value={p.name} maxLength={20} onChange={(e) => update((x) => ({ ...x, name: e.target.value }))} />
          <label htmlFor="s-class">Class (sets your exam dates)</label>
          <select id="s-class" value={p.classId} onChange={(e) => update((x) => ({ ...x, classId: e.target.value as ClassId, missions: Object.fromEntries(Object.entries(x.missions).filter(([d]) => d < today)) }))}>
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        <section className="card stack" style={{ marginBottom: 16 }}>
          <h2>Comfort</h2>
          <Toggle label="Calm mode" desc="Turns off background motion and big animations." on={p.calm} set={(v) => update((x) => ({ ...x, calm: v }))} />
          <Toggle label="Sound effects" desc="Short sounds for right answers, flips and level ups." on={!p.muted} set={(v) => update((x) => ({ ...x, muted: !v }))} />
        </section>

        <section className="card stack" style={{ marginBottom: 16 }}>
          <h2>Backup</h2>
          <p className="muted small">Progress is saved on this device. Export a backup file now and then, especially before clearing Safari data.</p>
          <div className="row">
            <button className="btn" onClick={() => downloadJSON(p, `study-hq-backup-${today}.json`)}>⬇️ Export progress</button>
            <button className="btn secondary" onClick={() => file.current?.click()}>⬆️ Import progress</button>
            <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ''; }} />
          </div>
          {msg && <p role="status">{msg}</p>}
        </section>

        <section className="card stack" style={{ marginBottom: 16 }}>
          <h2>Parent summary</h2>
          <p className="muted small">Streak, minutes, mastery and the most-missed questions. Protected by a 4-digit PIN.</p>
          <button className="btn secondary" onClick={() => go('parent')}>👪 Open parent summary</button>
        </section>

        <section className="card stack">
          <h2>Start again</h2>
          <button className="btn bad" onClick={() => {
            if (window.confirm('Reset ALL progress? Export a backup first if you might want it.')) replace({ ...defaultProgress(), onboarded: false });
          }}>Reset all progress</button>
        </section>
      </Page>
    </>
  );
}

function Toggle({ label, desc, on, set }: { label: string; desc: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}><strong>{label}</strong><div className="small muted">{desc}</div></div>
      <button role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)}
        style={{ width: 64, height: 36, borderRadius: 999, border: '2px solid var(--border)', background: on ? 'var(--good)' : 'var(--surface-2)', position: 'relative', cursor: 'pointer' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 31 : 3, width: 26, height: 26, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    </div>
  );
}
