import confetti from 'canvas-confetti';

let calm = false;
export function setCalmConfetti(c: boolean) { calm = c; }

function reduced(): boolean {
  try { return calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return calm; }
}

export function celebrate(big = false) {
  if (reduced()) return;
  const colors = getComputedStyle(document.documentElement).getPropertyValue('--confetti').split(',').map((s) => s.trim()).filter(Boolean);
  confetti({ particleCount: big ? 160 : 70, spread: big ? 100 : 70, origin: { y: 0.7 }, colors: colors.length ? colors : undefined, disableForReducedMotion: true });
  if (big) {
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors, disableForReducedMotion: true }), 250);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors, disableForReducedMotion: true }), 400);
  }
}
