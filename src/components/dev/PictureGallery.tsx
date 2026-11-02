// Development-only page (#/pictures) showing every learn-card picture, for checking them by eye.
import { SUBJECT_LIST } from '../../content';
import { Diagram } from '../subject/Diagrams';

export default function PictureGallery() {
  const names = [...new Set(SUBJECT_LIST.flatMap((s) => s.learn.map((c) => c.diagram!)))];
  for (const t of ['r-terms-creation', 'r-terms-prophecy']) for (let i = 0; i < 2; i++) names.push(`keywords-${t}-${i}`);
  return (
    <main className="page" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
      {names.map((n) => <div key={n} data-pic={n} style={{ background: '#fff', padding: 4, borderRadius: 8 }}><div style={{ color: '#111', font: '12px sans-serif' }}>{n}</div><Diagram name={n} /></div>)}
    </main>
  );
}
