// Quiz result emails for a parent.
// Nothing is sent unless a parent has pasted their own Google Apps Script address
// into the Parent page on this device. The address is saved on the device only;
// it is never in the app's code. Results that cannot be sent (for example when
// offline) wait in a queue and are tried again the next time the app is open.

const URL_KEY = 'ariya-study-hq:reportUrl';
const QUEUE_KEY = 'ariya-study-hq:reportQueue';
const MAX_QUEUE = 50;

export interface QuizReport {
  subject: string;
  topic: string;
  quiz: string;
  score: number;
  total: number;
  /** e.g. "42% mastered (flashcards 30%, quiz average 54%)" */
  subjectProgress: string;
}
type Payload = QuizReport & { v: 1; app: string; student: string; test?: boolean };

function read<T>(key: string, fallback: T): T {
  try { const s = window.localStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage blocked: reports simply stay off */ }
}

export const reportUrl = (): string => read<string>(URL_KEY, '');

/** Only a Google Apps Script web app address is accepted. */
export function validReportUrl(url: string): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url.trim());
}

export function saveReportUrl(url: string): boolean {
  const u = url.trim();
  if (u && !validReportUrl(u)) return false;
  write(URL_KEY, u || null);
  return true;
}

// Apps Script does not let the page read its reply, so a request that leaves the
// device without a network error is counted as sent.
async function post(url: string, payload: Payload): Promise<void> {
  await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
}

let flushing = false;

export async function flushReports(): Promise<void> {
  const url = reportUrl();
  if (!url || flushing) return;
  flushing = true;
  try {
    let queue = read<Payload[]>(QUEUE_KEY, []);
    while (queue.length) {
      await post(url, queue[0]);
      queue = read<Payload[]>(QUEUE_KEY, []).slice(1);
      write(QUEUE_KEY, queue);
    }
  } catch {
    // Offline or blocked: leave the queue for next time.
  } finally {
    flushing = false;
  }
}

export function sendQuizReport(student: string, report: QuizReport): void {
  if (!reportUrl()) return;
  const queue = read<Payload[]>(QUEUE_KEY, []);
  queue.push({ v: 1, app: 'Study HQ', student: student || 'Student', ...report });
  write(QUEUE_KEY, queue.slice(-MAX_QUEUE));
  void flushReports();
}

/** For the "Send a test email" button. True if the request left the device. */
export async function sendTestReport(student: string): Promise<boolean> {
  const url = reportUrl();
  if (!url) return false;
  try {
    await post(url, {
      v: 1, app: 'Study HQ', student: student || 'Student', test: true,
      subject: 'Test', topic: 'This is a test', quiz: 'Test email', score: 4, total: 5,
      subjectProgress: '50% mastered (flashcards 40%, quiz average 60%)',
    });
    return true;
  } catch {
    return false;
  }
}
