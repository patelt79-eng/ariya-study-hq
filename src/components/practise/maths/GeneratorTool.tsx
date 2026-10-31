import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { SKILLS, type GenQ } from './generators';
import { AngleDiagram } from './AngleDiagram';
import { isAcceptable } from '../../../lib/fuzzy';
import { useProgress } from '../../../state/progress';
import { genToQuestion } from '../../subject/registry';
import { play } from '../../../lib/sound';

export function GeneratorTool({ initial }: { initial?: string }) {
  const { answer, bump, unlock } = useProgress();
  const [skillId, setSkillId] = useState(initial ?? SKILLS[0].id);
  const skill = SKILLS.find((s) => s.id === skillId) ?? SKILLS[0];
  const [q, setQ] = useState<GenQ>(() => skill.make());
  const [val, setVal] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  const [streak, setStreak] = useState(0);
  const controls = useAnimationControls();
  const input = useRef<HTMLInputElement>(null);

  const next = (id = skillId) => {
    const s = SKILLS.find((x) => x.id === id) ?? SKILLS[0];
    setQ(s.make()); setVal(''); setResult(null);
    window.setTimeout(() => input.current?.focus({ preventScroll: true }), 50);
  };
  useEffect(() => { next(skillId); }, [skillId]); // eslint-disable-line react-hooks/exhaustive-deps

  const check = () => {
    if (!val.trim() || result !== null) return;
    const ok = isAcceptable(val, [q.answer, ...(q.accept ?? [])], q.numeric);
    setResult(ok);
    answer(genToQuestion(q), 'maths', ok);
    if (ok) {
      play('correct');
      setStreak((s) => s + 1);
      void controls.start({ scale: [1, 1.05, 1] });
      if (skill.group === 'Angles' && bump('angleCorrect') >= 20) unlock('angle-ace');
      if (skill.group === 'Ratio' && bump('ratioCorrect') >= 20) unlock('ratio-ranger');
    } else {
      play('wrong');
      setStreak(0);
      void controls.start({ x: [0, -10, 10, -6, 6, 0] });
    }
  };

  const groups = [...new Set(SKILLS.map((s) => s.group))];
  return (
    <section className="stack">
      <div className="card flat">
        <label htmlFor="skill">Skill</label>
        <select id="skill" value={skillId} onChange={(e) => setSkillId(e.target.value)} style={{ marginTop: 6 }}>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {SKILLS.filter((s) => s.group === g).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
      <motion.div className="card" animate={controls}>
        <div className="row small muted" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <span>{skill.group} · {skill.label}</span><span>🔥 {streak} in a row</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem' }}>{q.prompt}</h2>
        {q.figure && <AngleDiagram spec={q.figure} />}
        <form className="row" onSubmit={(e) => { e.preventDefault(); check(); }}>
          <input ref={input} value={val} onChange={(e) => setVal(e.target.value)} disabled={result !== null} aria-label="Your answer"
            placeholder="Your answer" autoComplete="off" autoCapitalize="off" autoCorrect="off" style={{ flex: '1 1 180px' }} />
          <button className="btn" disabled={result !== null || !val.trim()}>Check</button>
        </form>
        {result !== null && (
          <motion.div className={`feedback ${result ? 'good' : 'bad'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status">
            <strong>{result ? 'Correct!' : `Not quite. The answer is ${q.answer}. Here’s how:`}</strong>
            <ol style={{ margin: '8px 0 0', paddingLeft: 22 }}>{q.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            <button className="btn" style={{ marginTop: 12 }} onClick={() => next()}>Next question →</button>
          </motion.div>
        )}
        {result === null && (
          <button className="btn ghost small" style={{ marginTop: 10 }} onClick={() => { setResult(false); answer(genToQuestion(q), 'maths', false); setStreak(0); }}>
            Show me how
          </button>
        )}
      </motion.div>
    </section>
  );
}
