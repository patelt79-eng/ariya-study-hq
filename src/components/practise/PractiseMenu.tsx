import type { ReactNode } from 'react';
import type { SubjectId } from '../../content/types';
import { go } from '../../lib/router';

export interface Tool { id: string; icon: string; name: string; desc: string; render: () => ReactNode }

/** A grid of practise tools; opening one shows it with a back link. */
export function PractiseMenu({ subject, tools, tool, note, boss }: { subject: SubjectId; tools: Tool[]; tool?: string; note?: ReactNode; boss?: string }) {
  const open = tools.find((t) => t.id === tool);
  if (open) {
    return (
      <>
        <button className="btn ghost small" onClick={() => go(`subject/${subject}/practise`)}>← All tools</button>
        {open.render()}
      </>
    );
  }
  return (
    <div className="stack">
      {note && <div className="card flat">{note}</div>}
      <div className="grid">
        {tools.map((t) => (
          <button key={t.id} className="card" style={{ textAlign: 'left', cursor: 'pointer', color: 'var(--text)' }} onClick={() => go(`subject/${subject}/practise/${t.id}`)}>
            <div style={{ fontSize: 40 }} aria-hidden>{t.icon}</div>
            <h3>{t.name}</h3>
            <p className="muted small" style={{ margin: 0 }}>{t.desc}</p>
          </button>
        ))}
        {boss && (
          <button className="card" style={{ textAlign: 'left', cursor: 'pointer', color: 'var(--text)' }} onClick={() => go(`subject/${subject}/boss`)}>
            <div style={{ fontSize: 40 }} aria-hidden>⚔️</div>
            <h3>Boss Battle</h3>
            <p className="muted small" style={{ margin: 0 }}>{boss}</p>
          </button>
        )}
      </div>
    </div>
  );
}
