import { useState } from 'react';
import { motion } from 'framer-motion';
import { PractiseMenu } from '../PractiseMenu';
import { ParagraphBuilder, type ParagraphTask } from '../../writing/ParagraphBuilder';
import { KEY_WORDS } from '../../../content/re';
import { play } from '../../../lib/sound';
import { useProgress } from '../../../state/progress';

const STARTERS = {
  point: ['Catholics believe that…', 'One reason is…', 'Another reason is…', 'Science teaches that…'],
  evidence: ['For example, Genesis 1:27 says “', 'Genesis 2:15 says God put Adam in the garden “to till it and keep it”.', 'In Laudato Si’, Pope Francis teaches…', 'The Church teaches that…'],
  analysis: ['This shows that…', 'This means that Catholics…', 'Therefore…', 'So…'],
};
const IDEAS = ['God created everything out of nothing', 'Creation is good', 'Humans are made in God’s image', 'Stewardship', 'Science explains how; faith explains why', 'Big Bang (Lemaître)', 'Evolution (Darwin)', 'Laudato Si’', 'Prayer and thanksgiving', 'Literary form of Genesis'];

export const PEE_TASKS: ParagraphTask[] = [
  {
    id: 're-q1', question: 'What do Catholics believe about creation?', starters: STARTERS, devices: IDEAS,
    model: 'Catholics believe that God created the whole universe out of nothing. For example, Genesis 1 describes God creating light, land, plants, animals and humans over six days, and seeing that it was “good”. This shows that Catholics believe the world has a purpose and is good because it was made by a loving God.\n\nCatholics also believe that humans are special in creation. Genesis 1:27 says “God created man in his own image… male and female he created them.” This means that every human life is valuable and has dignity, so Catholics believe they should respect and care for all people.',
  },
  {
    id: 're-q2', question: 'What does science say about creation?', starters: STARTERS, devices: IDEAS,
    model: 'Science teaches that the universe began with the Big Bang about 13.8 billion years ago. The theory was first proposed by Georges Lemaître, a Catholic priest and scientist, in the 1920s. This shows that the universe has been expanding and developing for billions of years, rather than being made in six 24-hour days.\n\nScience also teaches that life developed through evolution. Charles Darwin explained in 1859 that living things change over millions of years by natural selection. This means that humans and animals developed gradually, and Catholics believe this can fit with faith, because science explains how creation happened while Genesis explains why.',
  },
  {
    id: 're-q3', question: 'Why is stewardship important?', starters: STARTERS, devices: IDEAS,
    model: 'Stewardship is important because God gave humans the job of looking after creation. Genesis 2:15 says God put Adam in the Garden of Eden “to till it and keep it”. This shows that humans are caretakers of the Earth, not owners, so Catholics have a duty to protect it.\n\nStewardship is also important because damaging the environment hurts other people, especially the poor. In Laudato Si’ (2015), Pope Francis calls the Earth “our common home” and says the cry of the earth and the cry of the poor are linked. This means that Catholics should recycle, save energy and campaign against climate change to protect both nature and people.',
  },
  {
    id: 're-q4', question: 'How do the teachings on creation affect Catholics today?', starters: STARTERS, devices: IDEAS,
    model: 'The teachings on creation affect how Catholics treat the environment. Because Genesis 2:15 tells humans to “till it and keep it”, and Laudato Si’ asks everyone to care for our common home, many Catholics recycle, reduce waste and support environmental charities. This shows that their belief in God as creator leads to real actions.\n\nThe teachings also affect how Catholics pray and treat others. Since creation is a gift and humans are made in God’s image (Genesis 1:27), Catholics thank God in prayer, for example saying grace before meals, and believe every person deserves respect. This means that creation teachings shape both their relationship with God and with other people.',
  },
];

export default function REPractise({ tool }: { tool?: string }) {
  return (
    <PractiseMenu subject="re" tool={tool} boss="15 mixed questions on both units."
      note={<>📌 Use the <strong>RE knowledge organisers on ClassCharts</strong>: they have your school’s exact definitions. Writing topics: Creation; the Genesis accounts; scientific creation stories; Prayer; Stewardship and Laudato Si’.</>}
      tools={[
        { id: 'pee', icon: '🧱', name: 'PEE Paragraph Builder', desc: 'The four challenge questions, 2 × PEE each, with model answers.', render: () => <ParagraphBuilder subject="re" mode="PEE" tasks={PEE_TASKS} /> },
        { id: 'keywords', icon: '🗂️', name: 'Visual Key Word Bank', desc: 'Every key term with an icon. Tap to flip and test yourself.', render: () => <KeyWordBank /> },
      ]} />
  );
}

function KeyWordBank() {
  const { award } = useProgress();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [unit, setUnit] = useState<'all' | 'Creation and Covenant' | 'Prophecy and Promise'>('all');
  const [testMode, setTestMode] = useState(true);
  const list = KEY_WORDS.filter((k) => unit === 'all' || k.unit === unit);
  return (
    <section className="stack">
      <div className="card flat row">
        <div className="tabs" role="tablist" style={{ margin: 0 }}>
          {(['all', 'Creation and Covenant', 'Prophecy and Promise'] as const).map((u) => (
            <button key={u} role="tab" className="tab" aria-selected={unit === u} onClick={() => setUnit(u)}>{u === 'all' ? 'All' : u}</button>
          ))}
        </div>
        <span className="spacer" />
        <button className="btn ghost small" onClick={() => { setTestMode((t) => !t); setFlipped({}); }}>{testMode ? 'Show all definitions' : 'Test me (hide them)'}</button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}>
        {list.map((k) => {
          const show = !testMode || flipped[k.term];
          return (
            <motion.button key={k.term} className="card" whileTap={{ scale: 0.97 }}
              style={{ minHeight: 170, cursor: 'pointer', color: 'var(--text)', textAlign: 'center', display: 'grid', placeItems: 'center', gap: 6, background: show ? 'var(--surface-2)' : 'var(--surface)' }}
              onClick={() => { if (!testMode) return; setFlipped((f) => ({ ...f, [k.term]: !f[k.term] })); play('flip'); if (!flipped[k.term]) award(1); }}
              aria-label={show ? `${k.term}: ${k.def}` : `${k.term}. Tap to reveal the definition`}>
              <span style={{ fontSize: 40 }} aria-hidden>{k.icon}</span>
              <strong style={{ fontSize: '1.1rem' }}>{k.term}</strong>
              <motion.span key={String(show)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="small">{show ? k.def : 'Say the definition, then tap to check'}</motion.span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
