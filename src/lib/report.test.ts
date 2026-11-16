import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushReports, reportUrl, saveReportUrl, sendQuizReport, validReportUrl } from './report';

const GOOD = 'https://script.google.com/macros/s/AKfycbTEST_test-123/exec';
const result = { subject: 'RE', topic: 'Genesis', quiz: 'Quiz round', score: 7, total: 10, subjectProgress: '40% mastered' };

let store: Record<string, string>;
let fetchMock: ReturnType<typeof vi.fn>;
const tick = () => new Promise((r) => setTimeout(r, 0));
const queue = () => JSON.parse(store['ariya-study-hq:reportQueue'] ?? '[]') as unknown[];

beforeEach(() => {
  store = {};
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    },
  });
  fetchMock = vi.fn(() => Promise.resolve({}));
  vi.stubGlobal('fetch', fetchMock);
});

describe('quiz report emails', () => {
  it('only accepts a Google Apps Script web app address', () => {
    expect(validReportUrl(GOOD)).toBe(true);
    expect(validReportUrl('https://example.com/exec')).toBe(false);
    expect(validReportUrl('http://script.google.com/macros/s/abc/exec')).toBe(false);
    expect(validReportUrl('https://script.google.com/macros/s/abc/dev')).toBe(false);
    expect(saveReportUrl('https://evil.example/steal')).toBe(false);
    expect(reportUrl()).toBe('');
  });

  it('sends nothing until a parent has saved an address', async () => {
    sendQuizReport('Ariya', result);
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(queue()).toEqual([]);
  });

  it('posts the result to the saved address', async () => {
    saveReportUrl(GOOD);
    sendQuizReport('Ariya', result);
    await tick();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string; mode: string }];
    expect(url).toBe(GOOD);
    expect(init.mode).toBe('no-cors');
    expect(JSON.parse(init.body)).toMatchObject({ student: 'Ariya', subject: 'RE', topic: 'Genesis', score: 7, total: 10, app: 'Study HQ' });
    expect(queue()).toEqual([]);
  });

  it('keeps the result while offline and sends it later', async () => {
    saveReportUrl(GOOD);
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('offline')));
    sendQuizReport('Ariya', result);
    await tick();
    expect(queue()).toHaveLength(1);

    fetchMock.mockImplementation(() => Promise.resolve({}));
    await flushReports();
    expect(queue()).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('turning reports off stops sending', async () => {
    saveReportUrl(GOOD);
    saveReportUrl('');
    sendQuizReport('Ariya', result);
    await tick();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
