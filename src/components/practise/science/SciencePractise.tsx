import { PractiseMenu } from '../PractiseMenu';
import { BuildACell } from './BuildACell';
import { ParticleSim } from './ParticleSim';
import { ForceArrows } from './ForceArrows';
import { FoodWebBuilder } from './FoodWebBuilder';

export default function SciencePractise({ tool }: { tool?: string }) {
  return (
    <PractiseMenu subject="science" tool={tool} boss="15 mixed questions from all three topics."
      note={<>Also complete the <strong>Educake</strong> quizzes your teacher sets.</>}
      tools={[
        { id: 'cell', icon: '🦠', name: 'Build-a-Cell', desc: 'Drag organelles onto animal and plant cells.', render: () => <BuildACell /> },
        { id: 'particles', icon: '🫧', name: 'Particle Simulator', desc: 'Heat and cool water: solid, liquid, gas.', render: () => <ParticleSim /> },
        { id: 'forces', icon: '➡️', name: 'Force Arrows', desc: 'Work out resultant forces and what happens next.', render: () => <ForceArrows /> },
        { id: 'foodweb', icon: '🕸️', name: 'Food Web Builder', desc: 'Draw the energy arrows in a woodland food web.', render: () => <FoodWebBuilder /> },
      ]} />
  );
}
