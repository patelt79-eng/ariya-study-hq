// An animated bar model for sharing in a ratio, given a part, or given the difference.
import { useState } from 'react';
import { motion } from 'framer-motion';

type Mode = 'total' | 'part' | 'diff';
const COLOURS = ['#4cc9f0', '#f72585', '#ffd166'];
const NAMES = ['A', 'B', 'C'];

export function RatioBarModel() {
  const [mode, setMode] = useState<Mode>('total');
  const [ratio, setRatio] = useState<number[]>([2, 3]);
  const [amount, setAmount] = useState(40);
  const [step, setStep] = useState(0);

  const parts = ratio.reduce((a, b) => a + b, 0);
  const diffParts = Math.max(...ratio) - Math.min(...ratio);
  const unit = mode === 'total' ? amount / parts : mode === 'part' ? amount / ratio[0] : diffParts ? amount / diffParts : 0;
  const nice = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

  const explain: string[] = mode === 'total'
    ? [`Draw ${ratio.join(' + ')} = ${parts} equal boxes.`, `The whole bar is ${amount}, so one box = ${amount} ÷ ${parts} = ${nice(unit)}.`, `Shares: ${ratio.map((r, i) => `${NAMES[i]} = ${r} × ${nice(unit)} = ${nice(r * unit)}`).join(', ')}.`]
    : mode === 'part'
      ? [`Draw the bars: ${ratio.map((r, i) => `${NAMES[i]} has ${r} box${r > 1 ? 'es' : ''}`).join(', ')}.`, `A’s ${ratio[0]} box${ratio[0] > 1 ? 'es' : ''} = ${amount}, so one box = ${amount} ÷ ${ratio[0]} = ${nice(unit)}.`, `${ratio.slice(1).map((r, i) => `${NAMES[i + 1]} = ${r} × ${nice(unit)} = ${nice(r * unit)}`).join(', ')}. Total = ${nice(parts * unit)}.`]
      : [`Line the bars up. The difference is ${Math.max(...ratio)} − ${Math.min(...ratio)} = ${diffParts} box${diffParts === 1 ? '' : 'es'}.`, diffParts ? `Those ${diffParts} box${diffParts === 1 ? '' : 'es'} = ${amount}, so one box = ${nice(unit)}.` : 'The parts are equal, so there is no difference to use!', diffParts ? `${ratio.map((r, i) => `${NAMES[i]} = ${nice(r * unit)}`).join(', ')}.` : ''];

  const setR = (i: number, v: number) => { setRatio((r) => r.map((x, k) => (k === i ? Math.max(1, Math.min(9, v)) : x))); setStep(0); };

  return (
    <section className="card stack">
      <h2>Ratio Bar Model</h2>
      <div className="tabs" role="tablist">
        {([['total', 'Share a total'], ['part', 'Given a part'], ['diff', 'Given the difference']] as [Mode, string][]).map(([m, l]) => (
          <button key={m} role="tab" className="tab" aria-selected={mode === m} onClick={() => { setMode(m); setStep(0); if (m === 'diff' && ratio.length > 2) setRatio(ratio.slice(0, 2)); }}>{l}</button>
        ))}
      </div>
      <div className="row">
        <span>Ratio</span>
        {ratio.map((r, i) => (
          <span key={i} className="row" style={{ gap: 4 }}>
            {i > 0 && <strong>:</strong>}
            <input type="number" inputMode="numeric" min={1} max={9} value={r} onChange={(e) => setR(i, Number(e.target.value))} style={{ width: 70 }} aria-label={`Ratio part ${NAMES[i]}`} />
          </span>
        ))}
        {mode !== 'diff' && (ratio.length < 3
          ? <button className="btn ghost small" onClick={() => setRatio([...ratio, 1])}>+ part</button>
          : <button className="btn ghost small" onClick={() => setRatio(ratio.slice(0, 2))}>− part</button>)}
      </div>
      <div className="row">
        <label htmlFor="amt">{mode === 'total' ? 'Total' : mode === 'part' ? 'A gets' : 'Difference'}</label>
        <input id="amt" type="number" inputMode="numeric" min={1} value={amount} onChange={(e) => { setAmount(Math.max(1, Number(e.target.value))); setStep(0); }} style={{ width: 110 }} />
      </div>

      <div className="stack" style={{ gap: 10 }} aria-hidden>
        {ratio.map((r, i) => (
          <div key={i} className="row" style={{ flexWrap: 'nowrap', gap: 8 }}>
            <strong style={{ width: 22 }}>{NAMES[i]}</strong>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: r }, (_, k) => {
                const isDiff = mode === 'diff' && r === Math.max(...ratio) && k >= Math.min(...ratio) && diffParts > 0;
                const known = (mode === 'part' && i === 0) || (mode === 'total') || isDiff;
                return (
                  <motion.div key={k} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: k * 0.06 + i * 0.15 }}
                    style={{ width: 'clamp(28px, 7vw, 54px)', height: 44, borderRadius: 8, background: COLOURS[i], border: isDiff ? '3px dashed var(--text)' : '2px solid rgba(0,0,0,0.25)',
                      display: 'grid', placeItems: 'center', color: '#111', fontWeight: 700, fontSize: 14, transformOrigin: 'left', opacity: step >= 1 || known ? 1 : 0.7 }}>
                    {step >= 1 ? nice(unit) : ''}
                  </motion.div>
                );
              })}
            </div>
            {step >= 2 && <motion.strong initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>= {nice(r * unit)}</motion.strong>}
          </div>
        ))}
        {mode === 'total' && <div className="small muted">Whole bar = {amount}</div>}
      </div>

      <ol style={{ paddingLeft: 22, margin: 0 }} aria-live="polite">
        {explain.slice(0, step + 1).filter(Boolean).map((e, i) => <motion.li key={i + mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{e}</motion.li>)}
      </ol>
      <div className="row">
        <button className="btn" disabled={step >= 2} onClick={() => setStep((s) => s + 1)}>Next step →</button>
        <button className="btn secondary" onClick={() => setStep(0)}>Reset</button>
      </div>
    </section>
  );
}
