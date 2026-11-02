// Read-aloud ("Listen mode") using the browser's built-in Web Speech API.
// Every component goes through this module; nothing else touches speechSynthesis.
// Works offline with the device's installed voices. No API keys, no network.

export interface VoiceLike { name: string; voiceURI: string; lang: string }
export interface RankedVoice { voiceURI: string; name: string; lang: string; quality: 'premium' | 'enhanced' | 'standard' }

// Apple's novelty voices: never listed.
const JOKE = ['albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news', 'jester', 'organ', 'superstar',
  'trinoids', 'whisper', 'wobble', 'zarvox', 'junior', 'ralph', 'fred', 'kathy'];
// Robotic "Eloquence" voices: listed under "More voices", never chosen automatically.
const ROBOTIC = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley'];

/** "Daniel (English (United Kingdom))" → "Daniel". Keeps "(Enhanced)" / "(Premium)". */
export function cleanName(name: string): string {
  return name.replace(/\s*\((?:English|Anglais|Inglés|Englisch)\s*(?:\([^)]*\))?\)\s*$/i, '').trim();
}

/** Base name for matching joke/robotic lists: "Bad News (English (US))" → "bad news", "Flo (Enhanced)" → "flo". */
function baseName(name: string): string {
  return cleanName(name).replace(/\s*\((enhanced|premium)\)\s*$/i, '').trim().toLowerCase();
}

function quality(v: VoiceLike): RankedVoice['quality'] {
  const s = `${v.name} ${v.voiceURI}`.toLowerCase();
  return s.includes('premium') ? 'premium' : s.includes('enhanced') ? 'enhanced' : 'standard';
}

const isGB = (lang: string) => /^en[-_]gb/i.test(lang);

/** English voices, best first: Premium, then Enhanced, then the rest; en-GB ahead of other accents. */
export function rankVoices(voices: VoiceLike[]): { main: RankedVoice[]; more: RankedVoice[] } {
  const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang) && !JOKE.includes(baseName(v.name)));
  const order = { premium: 0, enhanced: 1, standard: 2 };
  const ranked = english
    .map((v) => ({ voiceURI: v.voiceURI, name: cleanName(v.name), lang: v.lang, quality: quality(v) }))
    .sort((a, b) => order[a.quality] - order[b.quality] || Number(isGB(b.lang)) - Number(isGB(a.lang)) || a.name.localeCompare(b.name));
  // De-duplicate (some browsers list the same voice twice).
  const seen = new Set<string>();
  const unique = ranked.filter((v) => (seen.has(v.voiceURI) ? false : (seen.add(v.voiceURI), true)));
  return {
    main: unique.filter((v) => !ROBOTIC.includes(baseName(v.name))),
    more: unique.filter((v) => ROBOTIC.includes(baseName(v.name))),
  };
}

const SUPERSCRIPT: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

/** Turn on-screen text into something that sounds right: no emoji or arrows, maths in words. */
export function toSpeech(text: string): string {
  let s = text;
  s = s.replace(/([0-9a-zA-Z)])([²³⁰¹⁴⁵⁶⁷⁸⁹]+)/g, (_, base: string, sup: string) => {
    const n = [...sup].map((c) => SUPERSCRIPT[c]).join('');
    return n === '2' ? `${base} squared` : `${base} to the power ${n}`;
  });
  s = s.replace(/[→←↑↓⇉⇇›»]/g, ', ').replace(/…/g, '.');
  s = s.replace(/(\d)\s*×\s*(\d|[a-z(])/gi, '$1 times $2').replace(/×/g, ' times ');
  s = s.replace(/÷/g, ' divided by ');
  s = s.replace(/(^|[\s(=])[−-](?=\d)/g, '$1minus ').replace(/(\d|\))\s*[−]\s*/g, '$1 minus ').replace(/−/g, ' minus ');
  s = s.replace(/(\d)\s+-\s+(\d)/g, '$1 minus $2');
  s = s.replace(/\s=\s/g, ' equals ');
  s = s.replace(/(\d)\s*:\s*(\d)(\s*:\s*(\d))?/g, (_, a, b, _c, d) => (d ? `${a} to ${b} to ${d}` : `${a} to ${b}`));
  s = s.replace(/\b(\d+)\/(\d+)\b/g, '$1 over $2');
  s = s.replace(/(\d)\s*°\s*C\b/g, '$1 degrees Celsius').replace(/°/g, ' degrees');
  s = s.replace(/(\d)\s*%/g, '$1 percent');
  s = s.replace(/\bm\/s\b/g, 'metres per second').replace(/\bkm\/h\b/g, 'kilometres per hour').replace(/\bN\/kg\b/g, 'newtons per kilogram');
  s = s.replace(/\bc\.\s*(?=\d)/g, 'around ');
  // Strip emoji and pictographs (keep letters, numbers and punctuation).
  s = s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, '');
  s = s.replace(/[“”"]/g, '').replace(/\s*,\s*,+/g, ',').replace(/\s+/g, ' ').replace(/\s+([.,!?;:])/g, '$1').trim();
  return s.replace(/^[,.\s]+/, '');
}

/** Join bits of on-screen text into sentences for reading aloud (adds full stops where missing). */
export function sentences(parts: (string | false | null | undefined)[]): string {
  return parts.filter((t): t is string => !!t && !!t.trim()).map((t) => t.trim()).map((t) => (/[.!?:]$/.test(t) ? t : `${t}.`)).join(' ');
}

/** Split long text into sentence-sized chunks (some browsers cut off long utterances). */
export function chunk(text: string, max = 220): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  const out: string[] = [];
  let cur = '';
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if ((cur + ' ' + s).trim().length > max && cur) { out.push(cur.trim()); cur = s; } else cur = `${cur} ${s}`;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// ---------- runtime ----------
type Listener = () => void;
const listeners = new Set<Listener>();
let speakingId: string | null = null;
let blocked = false;
let gestured = false;
let runToken = 0;

function synth(): SpeechSynthesis | null {
  try {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'
      ? window.speechSynthesis : null;
  } catch { return null; }
}

function emit() { listeners.forEach((l) => l()); }
function setSpeaking(id: string | null) { if (speakingId !== id) { speakingId = id; emit(); } }

/** True when read-aloud can be offered (API present and not blocked by the browser). */
export function isAvailable(): boolean { return !!synth() && !blocked; }
export function currentId(): string | null { return speakingId; }
/** Has the user tapped anything yet? iPad only allows speech after a tap. */
export function hasGesture(): boolean { return gestured; }

export function subscribe(l: Listener): () => void { listeners.add(l); return () => { listeners.delete(l); }; }

/** Call on the first tap. Speaks a silent utterance so iPad Safari allows later automatic reading. */
export function markGesture() {
  if (gestured) return;
  gestured = true;
  const s = synth();
  if (!s) return;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; s.speak(u); } catch { /* ignore */ }
  emit();
}

export function voices(): VoiceLike[] {
  try { return synth()?.getVoices() ?? []; } catch { return []; }
}

/** Calls back when the device's voice list changes (voices load late on iPad). */
export function onVoicesChanged(cb: () => void): () => void {
  const s = synth();
  if (!s) return () => {};
  s.addEventListener?.('voiceschanged', cb);
  return () => s.removeEventListener?.('voiceschanged', cb);
}

/** The voice "Automatic" picks: the best non-robotic English voice. */
export function bestVoiceURI(): string | null {
  return rankVoices(voices()).main[0]?.voiceURI ?? null;
}

export function stop() {
  runToken++;
  const s = synth();
  try { if (s && (s.speaking || s.pending)) s.cancel(); } catch { /* ignore */ }
  setSpeaking(null);
}

/**
 * Read `text` aloud. `id` names what is being read so its Listen button can show "Stop".
 * `voiceURI` null/undefined = Automatic.
 */
export function speak(text: string, opts: { id?: string; voiceURI?: string | null; rate?: number } = {}) {
  const s = synth();
  if (!s || blocked) return;
  const clean = toSpeech(text);
  if (!clean) return;
  try { s.cancel(); } catch { /* ignore */ }
  const token = ++runToken;
  const id = opts.id ?? 'speech';
  const all = s.getVoices();
  const wanted = opts.voiceURI ?? bestVoiceURI();
  const voice = all.find((v) => v.voiceURI === wanted) ?? null;
  const parts = chunk(clean);
  setSpeaking(id);
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-GB';
    u.rate = opts.rate ?? 1;
    if (i === parts.length - 1) u.onend = () => { if (token === runToken) setSpeaking(null); };
    u.onerror = (e: SpeechSynthesisErrorEvent) => {
      if (e.error === 'not-allowed') { blocked = true; emit(); }
      if (token === runToken && e.error !== 'interrupted' && e.error !== 'canceled') setSpeaking(null);
    };
    s.speak(u);
  });
}
