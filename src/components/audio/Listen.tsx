// Listen button, Listen-mode switch and auto-read hook. All speech goes through src/audio/speech.ts.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { currentId, hasGesture, isAvailable, onVoicesChanged, rankVoices, speak, stop, subscribe, voices, type RankedVoice } from '../../audio/speech';
import { useProgress } from '../../state/progress';

function snapshot() { return `${isAvailable()}|${currentId() ?? ''}|${hasGesture()}`; }

/** Re-renders when speech starts/stops or availability changes. */
export function useSpeech() {
  const snap = useSyncExternalStore(subscribe, snapshot, () => 'false||false');
  const [available, id] = snap.split('|');
  return { available: available === 'true', speakingId: id || null };
}

/** Speak with the saved voice and speed. */
export function useSay() {
  const { p } = useProgress();
  return (text: string, id: string, voiceURI?: string | null) => speak(text, { id, voiceURI: voiceURI === undefined ? p.voiceURI : voiceURI, rate: p.speechRate });
}

/** Tap to read `text`; tap again to stop. Hidden when the device can't speak. */
export function ListenButton({ id, text, label = 'Listen', small = true, voiceURI }: {
  id: string; text: string | (() => string); label?: string; small?: boolean;
  /** Preview a specific voice instead of the saved one. */
  voiceURI?: string | null;
}) {
  const { available, speakingId } = useSpeech();
  const say = useSay();
  const playing = speakingId === id;
  // Stop if this item disappears while it is being read.
  useEffect(() => () => { if (currentId() === id) stop(); }, [id]);
  if (!available) return null;
  return (
    <span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
      <button type="button" className={`btn secondary listen-btn ${small ? 'small' : ''}`} aria-pressed={playing}
        aria-label={playing ? 'Stop reading aloud' : label === 'Listen' ? 'Listen: read this aloud' : label}
        onClick={(e) => { e.stopPropagation(); if (playing) stop(); else say(typeof text === 'function' ? text() : text, id, voiceURI === undefined ? undefined : voiceURI); }}>
        <span aria-hidden>{playing ? '⏹' : '🔊'}</span> {playing ? 'Stop' : label}
      </button>
      {playing && <span className="small muted" aria-live="polite">Speaking…</span>}
    </span>
  );
}

/** The quick on/off switch for Listen mode. */
export function ListenToggle() {
  const { p, update } = useProgress();
  const { available } = useSpeech();
  if (!available) return null;
  return (
    <button type="button" role="switch" aria-checked={p.listen} className={`btn small ${p.listen ? '' : 'secondary'} listen-toggle`}
      onClick={() => { if (p.listen) stop(); update((x) => ({ ...x, listen: !x.listen })); }}>
      <span aria-hidden>🎧</span> Listen mode: {p.listen ? 'On' : 'Off'}
    </button>
  );
}

/**
 * In Listen mode, read `text` once when the item `id` appears (or when Listen mode is switched on).
 * Never speaks before the first tap (iPad rule) and stops when the item goes away.
 */
export function useAutoRead(id: string, text: string, active = true) {
  const { p } = useProgress();
  const say = useSay();
  const textRef = useRef(text);
  textRef.current = text;
  const sayRef = useRef(say);
  sayRef.current = say;
  useEffect(() => {
    if (!p.listen || !active || !isAvailable() || !hasGesture()) return;
    sayRef.current(textRef.current, id);
    return () => { if (currentId() === id) stop(); };
  }, [id, p.listen, active]);
}

/** The device's voices, ranked, refreshed when the list changes (voices load late on iPad). */
export function useVoices(): { main: RankedVoice[]; more: RankedVoice[] } {
  const [list, setList] = useState(() => rankVoices(voices()));
  useEffect(() => {
    const refresh = () => setList(rankVoices(voices()));
    refresh();
    const off = onVoicesChanged(refresh);
    // Some browsers never fire the event: check again shortly.
    const t = window.setTimeout(refresh, 1200);
    return () => { off(); window.clearTimeout(t); };
  }, []);
  return list;
}
