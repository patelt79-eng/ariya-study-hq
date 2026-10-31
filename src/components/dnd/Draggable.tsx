// Drag-and-drop that also works by tapping: tap a chip, then tap where it goes.
// Drop targets are any element with data-drop="<id>".
import { motion } from 'framer-motion';
import { useRef, type CSSProperties, type ReactNode } from 'react';

let lastOver: Element | null = null;

function targetAt(x: number, y: number): Element | null {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    const t = (el as HTMLElement).closest?.('[data-drop]');
    if (t) return t;
  }
  return null;
}

export function Draggable({
  children, onDrop, onTap, className = 'chip', style, selected, disabled, label,
}: {
  children: ReactNode;
  onDrop: (targetId: string) => void;
  onTap?: () => void;
  className?: string;
  style?: CSSProperties;
  selected?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  const dragged = useRef(false);
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      className={`${className} draggable ${selected ? 'selected' : ''}`}
      style={{ ...style, position: 'relative' }}
      drag={!disabled}
      dragSnapToOrigin
      dragMomentum={false}
      whileDrag={{ scale: 1.08, zIndex: 100 }}
      onDragStart={() => { dragged.current = true; }}
      onDrag={(_, info) => {
        const t = targetAt(info.point.x - window.scrollX, info.point.y - window.scrollY);
        if (t !== lastOver) { lastOver?.classList.remove('over'); t?.classList.add('over'); lastOver = t; }
      }}
      onDragEnd={(_, info) => {
        lastOver?.classList.remove('over');
        lastOver = null;
        const t = targetAt(info.point.x - window.scrollX, info.point.y - window.scrollY);
        const id = t?.getAttribute('data-drop');
        if (id) onDrop(id);
        window.setTimeout(() => { dragged.current = false; }, 50);
      }}
      onClick={() => { if (!dragged.current && !disabled) onTap?.(); }}
    >
      {children}
    </motion.button>
  );
}
