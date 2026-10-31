// Temperature slider: particles change from solid to liquid to gas (water: melts at 0 °C, boils at 100 °C).
import { useEffect, useRef, useState } from 'react';
import { useProgress } from '../../../state/progress';

const N = 36;
const W = 360, H = 240, R = 9;

interface P { x: number; y: number; vx: number; vy: number; hx: number; hy: number }

function init(): P[] {
  const cols = 6;
  return Array.from({ length: N }, (_, i) => {
    const hx = W / 2 - (cols * 2 * R) / 2 + R + (i % cols) * 2 * R;
    const hy = H - R - 2 - Math.floor(i / cols) * 2 * R;
    return { x: hx, y: hy, vx: 0, vy: 0, hx, hy };
  });
}

export function ParticleSim() {
  const { p } = useProgress();
  const [temp, setTemp] = useState(-20);
  const canvas = useRef<HTMLCanvasElement>(null);
  const parts = useRef<P[]>(init());
  const tRef = useRef(temp);
  tRef.current = temp;
  const state = temp < 0 ? 'Solid (ice)' : temp < 100 ? 'Liquid (water)' : 'Gas (steam)';

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const colour = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4cc9f0';
    const still = p.calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      const t = tRef.current;
      const energy = still ? 0.4 : Math.max(0.3, (t + 40) / 40);
      for (const q of parts.current) {
        if (t < 0) {
          // Vibrate around a fixed position.
          q.x = q.hx + (Math.random() - 0.5) * energy * 2.5;
          q.y = q.hy + (Math.random() - 0.5) * energy * 2.5;
          q.vx = q.vy = 0;
        } else {
          const speed = t < 100 ? 0.6 + energy * 0.5 : 2 + energy * 0.8;
          q.vx += (Math.random() - 0.5) * speed * 0.5;
          q.vy += (Math.random() - 0.5) * speed * 0.5 + (t < 100 ? 0.25 : 0);
          const v = Math.hypot(q.vx, q.vy);
          if (v > speed * 1.6) { q.vx *= (speed * 1.6) / v; q.vy *= (speed * 1.6) / v; }
          q.x += q.vx; q.y += q.vy;
          const top = t < 100 ? H * 0.45 : R;
          if (q.x < R) { q.x = R; q.vx = Math.abs(q.vx); }
          if (q.x > W - R) { q.x = W - R; q.vx = -Math.abs(q.vx); }
          if (q.y < top) { q.y = top; q.vy = Math.abs(q.vy); }
          if (q.y > H - R) { q.y = H - R; q.vy = -Math.abs(q.vy); }
        }
      }
      // Keep liquid particles from overlapping too much.
      if (t >= 0 && t < 100) {
        const ps = parts.current;
        for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[j].x - ps[i].x, dy = ps[j].y - ps[i].y, d = Math.hypot(dx, dy);
          if (d > 0 && d < 2 * R) { const push = (2 * R - d) / 2; ps[i].x -= (dx / d) * push; ps[i].y -= (dy / d) * push; ps[j].x += (dx / d) * push; ps[j].y += (dy / d) * push; }
        }
      }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = colour;
      for (const q of parts.current) { ctx.beginPath(); ctx.arc(q.x, q.y, R - 1, 0, Math.PI * 2); ctx.fill(); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [p.calm]);

  return (
    <section className="card stack">
      <h2>Particle Simulator</h2>
      <p className="muted small" style={{ margin: 0 }}>Water melts at 0 °C and boils at 100 °C. Slide the temperature and watch the particles.</p>
      <canvas ref={canvas} width={W} height={H} style={{ width: '100%', maxWidth: 560, margin: '0 auto', display: 'block', background: 'var(--surface-solid)', borderRadius: 14, border: '2px solid var(--border)' }}
        role="img" aria-label={`Particles in a ${state}`} />
      <label htmlFor="temp">Temperature: <strong>{temp} °C</strong> → <span style={{ color: 'var(--accent)' }}>{state}</span></label>
      <input id="temp" type="range" min={-40} max={160} value={temp} onChange={(e) => setTemp(Number(e.target.value))} style={{ width: '100%', minHeight: 44 }} />
      <div className="card flat" aria-live="polite" style={{ background: 'var(--surface-2)' }}>
        {temp < 0 && 'Solid: particles are close together in a regular pattern and vibrate in fixed positions. Heat it to 0 °C to MELT it.'}
        {temp >= 0 && temp < 100 && 'Liquid: particles are close together but random, and slide past each other. Cool below 0 °C to FREEZE; heat to 100 °C to BOIL.'}
        {temp >= 100 && 'Gas: particles are far apart and move quickly in all directions. Cool below 100 °C to CONDENSE.'}
      </div>
    </section>
  );
}
