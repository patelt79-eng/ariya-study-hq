// Animal and plant cell drawings, shared by the Learn cards and Build-a-Cell.
export type CellKind = 'animal' | 'plant';
export type Organelle = 'nucleus' | 'membrane' | 'cytoplasm' | 'mitochondria' | 'ribosomes' | 'wall' | 'chloroplasts' | 'vacuole';

export const ORGANELLES: Record<Organelle, { name: string; job: string; plantOnly?: boolean }> = {
  nucleus: { name: 'Nucleus', job: 'Controls the cell; contains genetic material' },
  membrane: { name: 'Cell membrane', job: 'Controls what goes in and out' },
  cytoplasm: { name: 'Cytoplasm', job: 'Where chemical reactions happen' },
  mitochondria: { name: 'Mitochondria', job: 'Respiration (releases energy)' },
  ribosomes: { name: 'Ribosomes', job: 'Make proteins' },
  wall: { name: 'Cell wall', job: 'Strengthens and supports', plantOnly: true },
  chloroplasts: { name: 'Chloroplasts', job: 'Photosynthesis', plantOnly: true },
  vacuole: { name: 'Vacuole', job: 'Cell sap; keeps cell firm', plantOnly: true },
};

/** Where each label's drop zone sits (in the 300×220 drawing). */
export const SPOTS: Record<CellKind, Partial<Record<Organelle, [number, number]>>> = {
  animal: { nucleus: [150, 105], membrane: [257, 98], cytoplasm: [95, 165], mitochondria: [210, 150], ribosomes: [95, 70] },
  plant: { wall: [30, 30], membrane: [270, 195], cytoplasm: [75, 185], nucleus: [80, 70], vacuole: [175, 115], chloroplasts: [235, 55], mitochondria: [60, 140], ribosomes: [250, 165] },
};

export function CellSvg({ kind, showLabels = false, highlight }: { kind: CellKind; showLabels?: boolean; highlight?: Organelle | null }) {
  const hl = (o: Organelle) => (highlight === o ? { filter: 'drop-shadow(0 0 6px #fff)' } : undefined);
  return (
    <svg viewBox="0 0 300 220" style={{ width: '100%', display: 'block' }} role="img" aria-label={`${kind} cell diagram`}>
      {kind === 'animal' ? (
        <>
          <path d="M40 110 C40 40 120 25 170 30 C240 35 270 80 262 120 C255 175 200 200 140 195 C80 190 40 165 40 110 Z" fill="#ffd6e0" stroke="#d6336c" strokeWidth={3} style={hl('membrane')} />
          <circle cx={150} cy={105} r={30} fill="#9b5de5" stroke="#5a189a" strokeWidth={2} style={hl('nucleus')} />
          <circle cx={150} cy={105} r={9} fill="#5a189a" />
          {[[205, 150], [90, 140], [200, 65]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={16} ry={8} fill="#f77f00" stroke="#9c4a00" strokeWidth={1.5} transform={`rotate(${i * 40} ${x} ${y})`} style={hl('mitochondria')} />)}
          {[[95, 70], [110, 80], [230, 110], [180, 175], [120, 170], [85, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#3a0ca3" style={hl('ribosomes')} />)}
        </>
      ) : (
        <>
          <rect x={20} y={20} width={260} height={180} rx={10} fill="#b7e4c7" stroke="#2d6a4f" strokeWidth={8} style={hl('wall')} />
          <rect x={30} y={30} width={240} height={160} rx={6} fill="#d8f3dc" stroke="#40916c" strokeWidth={2} style={hl('membrane')} />
          <rect x={115} y={60} width={120} height={110} rx={30} fill="#caf0f8" stroke="#0077b6" strokeWidth={2} style={hl('vacuole')} />
          <circle cx={80} cy={70} r={22} fill="#9b5de5" stroke="#5a189a" strokeWidth={2} style={hl('nucleus')} />
          <circle cx={80} cy={70} r={7} fill="#5a189a" />
          {[[235, 50], [255, 90], [60, 175], [100, 180], [250, 140]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={13} ry={7} fill="#2b9348" stroke="#1b4332" strokeWidth={1.5} style={hl('chloroplasts')} />)}
          <ellipse cx={60} cy={140} rx={12} ry={6} fill="#f77f00" stroke="#9c4a00" strokeWidth={1.5} style={hl('mitochondria')} />
          {[[250, 165], [100, 120], [140, 185], [50, 105]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.5} fill="#3a0ca3" style={hl('ribosomes')} />)}
        </>
      )}
      {showLabels && Object.entries(SPOTS[kind]).map(([o, [x, y]]) => (
        <text key={o} x={x} y={y - 14} textAnchor="middle" fontSize={11} fontWeight={700} fill="#111" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}>{ORGANELLES[o as Organelle].name}</text>
      ))}
    </svg>
  );
}
