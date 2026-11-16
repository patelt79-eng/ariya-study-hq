import { useState } from 'react';
import { useProgress } from '../../state/progress';
import { masteryFor } from '../../state/model';
import { SUBJECTS, SUBJECT_LIST } from '../../content';
import { addDays, shortDate } from '../../lib/dates';
import { Page, TopBar } from '../shell/Shell';
import { reportUrl, saveReportUrl, sendTestReport } from '../../lib/report';

export function Parent() {
  const { p, update } = useProgress();
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');

  if (!ok) {
    const setting = !p.parentPin;
    return (
      <>
        <TopBar title="Parent summary" back="settings" />
        <Page>
          <section className="card stack" style={{ maxWidth: 440, margin: '40px auto' }}>
            <h2>{setting ? 'Set a parent PIN' : 'Enter parent PIN'}</h2>
            <p className="muted small">{setting ? 'Choose 4 digits. This is a gentle lock, not real security.' : 'Ask a parent to unlock this page.'}</p>
            <input inputMode="numeric" type="password" maxLength={4} aria-label="PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
            {setting && <input inputMode="numeric" type="password" maxLength={4} aria-label="Repeat PIN" placeholder="Repeat PIN" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} />}
            {err && <p role="alert" style={{ color: 'var(--bad)' }}>{err}</p>}
            <button className="btn" onClick={() => {
              if (pin.length !== 4) return setErr('The PIN needs 4 digits.');
              if (setting) {
                if (pin !== pin2) return setErr('The two PINs don’t match.');
                update((x) => ({ ...x, parentPin: pin }));
                setOk(true);
              } else if (pin === p.parentPin) setOk(true);
              else setErr('That PIN isn’t right.');
            }}>{setting ? 'Save PIN and open' : 'Unlock'}</button>
          </section>
        </Page>
      </>
    );
  }
  return <Summary />;
}

function Summary() {
  const { p, today } = useProgress();
  const [copied, setCopied] = useState(false);
  const last14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const maxMin = Math.max(30, ...last14.map((d) => p.minutesByDay[d] ?? 0));
  const missed = Object.entries(p.qstats).filter(([, q]) => q.w > 0).sort((a, b) => b[1].w - a[1].w || a[1].r - b[1].r).slice(0, 10);
  const totalMin = Object.values(p.minutesByDay).reduce((a, b) => a + b, 0);

  const text = [
    `${p.name}'s Study HQ summary (${shortDate(today)})`,
    `Streak: ${p.streak.count} days (best ${p.streak.best}). Total revision: ${totalMin} minutes. XP: ${p.xp}.`,
    '',
    'Mastery:',
    ...SUBJECT_LIST.map((s) => { const m = masteryFor(s, p); return `- ${s.name}: ${m.overall}% (cards ${m.cards}%, quiz avg ${m.quiz}%), topics rated ${m.rated}/${s.topics.length}, red ${m.red}`; }),
    '',
    'Most-missed questions:',
    ...missed.map(([, q], i) => `${i + 1}. [${SUBJECTS[q.subject].name}] ${q.prompt} (wrong ${q.w}, right ${q.r})`),
    '',
    'Red-rated topics:',
    ...SUBJECT_LIST.flatMap((s) => s.topics.filter((t) => p.rag[t.id] === 'R').map((t) => `- ${s.name}: ${t.title}`)),
  ].join('\n');

  return (
    <>
      <TopBar title="Parent summary" back="settings" />
      <Page>
        <div className="row" style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>Summary</h1>
          <span className="spacer" />
          <button className="btn" onClick={async () => {
            try { await navigator.clipboard.writeText(text); setCopied(true); } catch { window.prompt('Copy this summary:', text); }
          }}>{copied ? 'Copied ✓' : '📋 Copy summary'}</button>
        </div>

        <section className="grid" style={{ marginBottom: 16 }}>
          <Stat label="Streak" value={`🔥 ${p.streak.count} days`} sub={`Best: ${p.streak.best}`} />
          <Stat label="Total revision" value={`${totalMin} min`} sub={`Today: ${p.minutesByDay[today] ?? 0} min`} />
          <Stat label="XP" value={String(p.xp)} sub={`${Object.keys(p.badges).length} badges`} />
        </section>

        <section className="card" style={{ marginBottom: 16 }}>
          <h2>Minutes revised per day</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160 }} role="img" aria-label="Bar chart of minutes revised in the last 14 days">
            {last14.map((d) => {
              const m = p.minutesByDay[d] ?? 0;
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <span className="small">{m || ''}</span>
                  <div style={{ width: '100%', height: `${(m / maxMin) * 110}px`, minHeight: 2, background: 'var(--accent)', borderRadius: 4 }} />
                  <span className="small muted" style={{ fontSize: 11 }}>{shortDate(d).split(' ')[1]}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card" style={{ marginBottom: 16, overflowX: 'auto' }}>
          <h2>Mastery and RAG ratings</h2>
          <table>
            <thead><tr><th>Subject</th><th>Mastery</th><th>Cards</th><th>Quiz avg</th><th>R / A / G</th></tr></thead>
            <tbody>
              {SUBJECT_LIST.map((s) => {
                const m = masteryFor(s, p);
                const c = (v: string) => s.topics.filter((t) => p.rag[t.id] === v).length;
                return <tr key={s.id}><td>{s.emoji} {s.name}</td><td><strong>{m.overall}%</strong></td><td>{m.cards}%</td><td>{m.quiz}%</td><td>{c('R')} / {c('A')} / {c('G')} <span className="muted small">of {s.topics.length}</span></td></tr>;
              })}
            </tbody>
          </table>
        </section>

        <section className="card" style={{ marginBottom: 16 }}>
          <h2>10 most-missed questions</h2>
          {missed.length === 0 ? <p className="muted">Nothing missed yet.</p> : (
            <ol style={{ paddingLeft: 22 }}>
              {missed.map(([id, q]) => <li key={id}><span className="pill small">{SUBJECTS[q.subject].name}</span> {q.prompt} <span className="muted small">(wrong {q.w}, right {q.r})</span></li>)}
            </ol>
          )}
        </section>

        <section className="card" style={{ marginBottom: 16 }}>
          <h2>Red-rated topics</h2>
          <ul style={{ paddingLeft: 22 }}>
            {SUBJECT_LIST.flatMap((s) => s.topics.filter((t) => p.rag[t.id] === 'R').map((t) => <li key={t.id}>{s.name}: {t.title}</li>))}
          </ul>
        </section>

        <ReportSettings student={p.name} />
      </Page>
    </>
  );
}

/** Lets a parent turn on an email after each quiz, sent through their own Google Apps Script. */
function ReportSettings({ student }: { student: string }) {
  const [url, setUrl] = useState(reportUrl());
  const [on, setOn] = useState(!!reportUrl());
  const [msg, setMsg] = useState('');
  const save = (value: string): boolean => {
    const ok = saveReportUrl(value);
    setOn(!!reportUrl());
    setMsg(ok
      ? (reportUrl() ? 'Saved. A result will be emailed after each quiz.' : 'Saved. Quiz emails are off.')
      : 'That address does not look right. It should start with https://script.google.com/macros/s/ and end with /exec.');
    return ok;
  };
  return (
    <section className="card stack">
      <h2>Quiz result emails {on && <span className="pill small">On</span>}</h2>
      <p className="small muted" style={{ margin: 0 }}>
        After each quiz, this device can email you the result: student, subject, topic, score, percentage and how much of the subject is mastered.
        Paste the address of your own Google Apps Script below. It is saved on this device only.
      </p>
      <label htmlFor="report-url" className="small">Google Apps Script address (ends in /exec)</label>
      <input id="report-url" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" autoComplete="off" autoCapitalize="off" spellCheck={false}
        placeholder="https://script.google.com/macros/s/…/exec" />
      <div className="row">
        <button className="btn" onClick={() => save(url)}>Save</button>
        <button className="btn secondary" onClick={async () => {
          if (!save(url) || !reportUrl()) return;
          setMsg('Sending a test email…');
          const sent = await sendTestReport(student);
          setMsg(sent
            ? 'Test sent. Check your inbox in a minute. If nothing arrives, check the address and that the script is deployed for "Anyone".'
            : 'The test could not be sent. Check the internet connection and try again.');
        }}>Send a test email</button>
        <button className="btn ghost" onClick={() => { setUrl(''); save(''); }}>Turn off</button>
      </div>
      {msg && <p role="status" className="small" style={{ margin: 0 }}>{msg}</p>}
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="card"><div className="muted small">{label}</div><div className="display" style={{ fontSize: 'calc(1.6rem * var(--display-size))' }}>{value}</div><div className="small muted">{sub}</div></div>;
}
