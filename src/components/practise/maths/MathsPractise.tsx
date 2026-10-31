import { useState } from 'react';
import { go } from '../../../lib/router';
import { GeneratorTool } from './GeneratorTool';
import { AngleExplorer } from './AngleExplorer';
import { RatioBarModel } from './RatioBarModel';
import { TablesBlitz } from './TablesBlitz';

const TOOLS = [
  { id: 'generators', icon: '♾️', name: 'Question generators', desc: 'Endless practice on every skill, with worked solutions.' },
  { id: 'angles', icon: '📐', name: 'Angle Explorer', desc: 'Drag points and watch the totals stay at 180° or 360°.' },
  { id: 'ratio', icon: '📊', name: 'Ratio Bar Model', desc: 'See how sharing in a ratio really works.' },
  { id: 'blitz', icon: '⚡', name: 'Times-tables Blitz', desc: '60-second arcade challenge.' },
];

export default function MathsPractise({ tool }: { tool?: string }) {
  const [skill] = useState<string | undefined>(undefined);
  const back = <button className="btn ghost small" onClick={() => go('subject/maths/practise')}>← All tools</button>;
  if (tool === 'generators') return <>{back}<GeneratorTool initial={skill} /></>;
  if (tool === 'angles') return <>{back}<AngleExplorer /></>;
  if (tool === 'ratio') return <>{back}<RatioBarModel /></>;
  if (tool === 'blitz') return <>{back}<TablesBlitz /></>;
  return (
    <div className="grid">
      {TOOLS.map((t) => (
        <button key={t.id} className="card" style={{ textAlign: 'left', cursor: 'pointer', color: 'var(--text)' }} onClick={() => go(`subject/maths/practise/${t.id}`)}>
          <div style={{ fontSize: 40 }} aria-hidden>{t.icon}</div>
          <h3>{t.name}</h3>
          <p className="muted small" style={{ margin: 0 }}>{t.desc}</p>
        </button>
      ))}
      <button className="card" style={{ textAlign: 'left', cursor: 'pointer', color: 'var(--text)' }} onClick={() => go('subject/maths/boss')}>
        <div style={{ fontSize: 40 }} aria-hidden>🧮</div>
        <h3>Maths Boss Battle</h3>
        <p className="muted small" style={{ margin: 0 }}>Procedural and worded problems against the clock.</p>
      </button>
    </div>
  );
}
