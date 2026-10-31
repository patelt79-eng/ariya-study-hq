// Short synthesised sound effects using the Web Audio API (no audio files to download).
// iOS only allows audio after a tap, so the context is created on the first pointer event.

type Sfx = 'correct' | 'wrong' | 'levelup' | 'flip' | 'click' | 'coin';

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) { muted = m; }

export function unlockAudio() {
  if (ctx) { if (ctx.state === 'suspended') void ctx.resume(); return; }
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  } catch { ctx = null; }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export function play(sfx: Sfx) {
  if (muted || !ctx) return;
  switch (sfx) {
    case 'correct': tone(660, 0, 0.12, 'triangle'); tone(990, 0.09, 0.2, 'triangle'); break;
    case 'wrong': tone(220, 0, 0.18, 'sine', 0.12); tone(196, 0.12, 0.22, 'sine', 0.1); break;
    case 'levelup': [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.16)); break;
    case 'flip': tone(880, 0, 0.05, 'square', 0.04); break;
    case 'click': tone(1200, 0, 0.03, 'square', 0.03); break;
    case 'coin': tone(988, 0, 0.08, 'square', 0.06); tone(1319, 0.07, 0.18, 'square', 0.06); break;
  }
}
