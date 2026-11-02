import { useRef, useState } from 'react';
import { useProgress } from '../../state/progress';
import { CLASSES, type ClassId } from '../../content/timetable';
import { ThemePicker } from '../onboarding/Onboarding';
import { downloadJSON, readJSONFile } from '../../state/storage';
import { defaultProgress, migrate } from '../../state/model';
import { go } from '../../lib/router';
import { Page, TopBar } from '../shell/Shell';
import { ListenButton, useSpeech, useVoices } from '../audio/Listen';
import { stop as stopSpeech, type RankedVoice } from '../../audio/speech';

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

        <ListenSettings />

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

const ACCENTS: Record<string, string> = { GB: 'UK English', US: 'US English', AU: 'Australian English', IE: 'Irish English', IN: 'Indian English', ZA: 'South African English', NZ: 'New Zealand English', CA: 'Canadian English' };
const accent = (lang: string) => ACCENTS[lang.split(/[-_]/)[1]?.toUpperCase() ?? ''] ?? 'English';

const SAMPLE = 'Hi! This is how I sound. Let’s revise together, one topic at a time.';

function ListenSettings() {
  const { p, update } = useProgress();
  const { available } = useSpeech();
  const { main, more } = useVoices();
  if (!available) return null;
  const choose = (uri: string | null) => update((x) => ({ ...x, voiceURI: uri }));
  const auto = main[0];
  const chosenMissing = p.voiceURI && ![...main, ...more].some((v) => v.voiceURI === p.voiceURI);
  const row = (v: RankedVoice) => (
    <div key={v.voiceURI} className="row" style={{ flexWrap: 'nowrap', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <label className="row" style={{ flex: 1, minWidth: 0, fontWeight: 400, cursor: 'pointer', flexWrap: 'nowrap', minHeight: 44 }}>
        <input type="radio" name="voice" checked={p.voiceURI === v.voiceURI} onChange={() => choose(v.voiceURI)} style={{ width: 24, height: 24, minHeight: 24, flex: '0 0 24px' }} />
        <span style={{ minWidth: 0 }}>
          <strong>{v.name.replace(/\s*\((Premium|Enhanced)\)$/i, '')}</strong>{' '}
          {v.quality !== 'standard' && <span className="pill small">{v.quality === 'premium' ? 'Premium' : 'Enhanced'}</span>}{' '}
          <span className="small muted">{accent(v.lang)}</span>
        </span>
      </label>
      <ListenButton id={`preview:${v.voiceURI}`} text={SAMPLE} voiceURI={v.voiceURI} label="Listen" />
    </div>
  );

  return (
    <section className="card stack" style={{ marginBottom: 16 }} aria-labelledby="listen-h">
      <h2 id="listen-h">Listen mode</h2>
      <Toggle label="Listen mode" desc="Reads lessons, flashcards and quiz questions aloud. You still tap Next yourself."
        on={p.listen} set={(v) => { if (!v) stopSpeech(); update((x) => ({ ...x, listen: v })); }} />

      <div className="row" role="radiogroup" aria-label="Reading speed">
        <strong style={{ flex: 1 }}>Speed</strong>
        {([[0.8, 'Slow'], [1, 'Normal']] as const).map(([r, l]) => (
          <button key={r} type="button" role="radio" aria-checked={p.speechRate === r} className={`btn small ${p.speechRate === r ? '' : 'secondary'}`}
            onClick={() => update((x) => ({ ...x, speechRate: r }))}>{p.speechRate === r ? '✓ ' : ''}{l}</button>
        ))}
      </div>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 700, marginBottom: 6 }}>Reading voice</legend>
        <div className="row" style={{ flexWrap: 'nowrap', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <label className="row" style={{ flex: 1, fontWeight: 400, cursor: 'pointer', flexWrap: 'nowrap', minHeight: 44 }}>
            <input type="radio" name="voice" checked={!p.voiceURI || !!chosenMissing} onChange={() => choose(null)} style={{ width: 24, height: 24, minHeight: 24, flex: '0 0 24px' }} />
            <span><strong>Automatic</strong> <span className="small muted">(best available{auto ? `: ${auto.name}` : ''})</span></span>
          </label>
          <ListenButton id="preview:auto" text={SAMPLE} voiceURI={null} label="Listen" />
        </div>
        {main.length === 0 && <p className="small muted">Voices are still loading…</p>}
        {main.map(row)}
        {more.length > 0 && (
          <details style={{ marginTop: 8 }}>
            <summary className="disclosure">More voices ({more.length}): these sound more robotic</summary>
            {more.map(row)}
          </details>
        )}
        {chosenMissing && <p className="small muted">Your chosen voice isn’t on this device, so Automatic is being used.</p>}
      </fieldset>

      <details>
        <summary className="disclosure" style={{ fontWeight: 700 }}>Get a better voice on iPad</summary>
        <ol style={{ paddingLeft: 22, margin: '6px 0 0' }}>
          <li>Open the iPad <strong>Settings</strong> app.</li>
          <li>Tap <strong>Accessibility</strong>, then <strong>Spoken Content</strong>, then <strong>Voices</strong>.</li>
          <li>Tap <strong>English</strong>, then <strong>English (UK)</strong>.</li>
          <li>Pick a voice marked <strong>Premium</strong> or <strong>Enhanced</strong> and tap the download button.</li>
          <li>When it has downloaded, close Study HQ completely and open it again. The new voice appears in this list.</li>
        </ol>
      </details>
    </section>
  );
}
