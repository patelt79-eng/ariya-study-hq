import { expect, test, type Page } from '@playwright/test';

// A fake speechSynthesis: records what would be spoken, never plays audio.
function mockSpeech() {
  type U = { text: string; voice: { voiceURI: string } | null; rate: number; volume: number; onend: null | ((e: unknown) => void) };
  const w = window as unknown as { __spoken: { text: string; voice: string | null; rate: number; volume: number }[]; __cancels: number };
  w.__spoken = [];
  w.__cancels = 0;
  const voices = [
    { name: 'Daniel (English (United Kingdom))', voiceURI: 'com.apple.voice.compact.en-GB.Daniel', lang: 'en-GB' },
    { name: 'Serena (Premium)', voiceURI: 'com.apple.voice.premium.en-GB.Serena', lang: 'en-GB' },
    { name: 'Samantha', voiceURI: 'com.apple.voice.compact.en-US.Samantha', lang: 'en-US' },
    { name: 'Zarvox', voiceURI: 'com.apple.speech.synthesis.voice.Zarvox', lang: 'en-US' },
    { name: 'Grandma (English (United Kingdom))', voiceURI: 'com.apple.eloquence.en-GB.Grandma', lang: 'en-GB' },
  ];
  let timer: number | undefined;
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices: () => voices,
    speak(u: U) {
      w.__spoken.push({ text: u.text, voice: u.voice?.voiceURI ?? null, rate: u.rate, volume: u.volume });
      this.speaking = true;
      timer = window.setTimeout(() => { this.speaking = false; u.onend?.({}); }, 1500);
    },
    cancel() { w.__cancels++; this.speaking = false; window.clearTimeout(timer); },
    pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
  };
  class FakeUtterance { voice = null; lang = ''; rate = 1; volume = 1; onend = null; onerror = null; constructor(public text: string) {} }
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true });
}

const spoken = (page: Page) => page.evaluate(() => (window as unknown as { __spoken: { text: string; volume: number }[] }).__spoken.filter((s) => s.volume !== 0).map((s) => s.text).join(' | '));

async function seed(page: Page, extra: Record<string, unknown> = {}) {
  await page.goto('./');
  await page.evaluate((x) => localStorage.setItem('ariya-study-hq:v1', JSON.stringify({ v: 1, onboarded: true, name: 'Ariya', theme: 'blossom', ...x })), extra);
  await page.reload();
}

test.use({ viewport: { width: 768, height: 1024 } });

test.describe('Listen mode', () => {
  test.beforeEach(async ({ page }) => { await page.addInitScript(mockSpeech); });

  test('reads a lesson step aloud after turning Listen mode on', async ({ page }) => {
    await seed(page);
    await page.goto('./#/settings');
    await page.getByRole('switch', { name: 'Listen mode' }).click();
    await page.goto('./#/subject/maths/learn');
    await page.getByRole('button', { name: /^Start:/ }).click();
    await expect.poll(() => spoken(page)).toContain('Angles on a line and around a point.');
    const text = await spoken(page);
    expect(text).toContain('Angles on a straight line add up to 180 degrees.');
    expect(text).toContain('The picture shows a straight line'); // the diagram description
    expect(text).not.toMatch(/[→📐°]/);
    // Next card / next step stops the old speech and reads the new one.
    await page.getByRole('button', { name: 'Next: flashcards →' }).click();
    await expect.poll(() => spoken(page)).toMatch(/180|360|vertically|right angle|acute|obtuse|reflex/i);
  });

  test('never speaks before the first tap (iPad rule)', async ({ page }) => {
    await seed(page, { listen: true });
    await page.goto('./#/subject/maths/learn/m-angle-rules');
    await expect(page.getByRole('heading', { name: 'Angle rules: on a straight line, around a point' })).toBeVisible();
    await page.waitForTimeout(600);
    expect(await spoken(page)).toBe('');
    // The Listen button still works on tap.
    await page.getByRole('button', { name: 'Listen: read this aloud' }).first().click();
    await expect.poll(() => spoken(page)).toContain('Angles on a line and around a point.');
    await expect(page.getByRole('button', { name: 'Stop reading aloud' }).first()).toBeVisible();
    await expect(page.getByText('Speaking…').first()).toBeVisible();
  });

  test('quiz reads the question with options, then the feedback; Next stops speech', async ({ page }) => {
    await seed(page, { listen: true });
    await page.goto('./#/subject/science/quiz');
    await page.getByRole('switch', { name: /Listen mode/ }).click(); // off
    await page.getByRole('switch', { name: /Listen mode/ }).click(); // on again: a tap, so it reads the current question
    const quiz = page.getByTestId('quiz');
    await quiz.locator('input[aria-label="Your answer"], button.option, button:has-text("Check matches")').first().waitFor();
    await expect.poll(() => spoken(page)).toMatch(/A: .*B: |True or false\?|Type your answer\.|Match each one/);
    const firstOption = quiz.locator('button.option').first();
    if (await firstOption.isVisible()) {
      const said = await spoken(page);
      if (await quiz.locator('button.option .key').count()) expect(said).toContain('A: ');
      await firstOption.click();
      await expect.poll(() => spoken(page)).toMatch(/Correct|Nailed|Spot on|Brilliant|Great thinking|Not quite/);
      const cancels = await page.evaluate(() => (window as unknown as { __cancels: number }).__cancels);
      await quiz.getByRole('button', { name: /Next/ }).click();
      await expect.poll(() => page.evaluate(() => (window as unknown as { __cancels: number }).__cancels)).toBeGreaterThan(cancels);
    }
  });

  test('flashcards read the front, then the back when flipped', async ({ page }) => {
    await seed(page, { listen: true });
    await page.goto('./#/subject/re/cards');
    await page.getByRole('switch', { name: /Listen mode/ }).click();
    await page.getByRole('switch', { name: /Listen mode/ }).click();
    await page.getByRole('button', { name: /Tap to flip/ }).waitFor();
    await expect.poll(() => spoken(page)).not.toBe('');
    const before = (await spoken(page)).split(' | ').length;
    await page.getByRole('button', { name: /Tap to flip/ }).click();
    await expect.poll(async () => (await spoken(page)).split(' | ').length).toBeGreaterThan(before);
  });

  test('Settings lists English voices best first, hides joke voices, folds robotic ones', async ({ page }) => {
    await seed(page);
    await page.goto('./#/settings');
    const voice = page.locator('fieldset').filter({ hasText: 'Reading voice' });
    await expect(voice.getByText('(best available: Serena (Premium))')).toBeVisible();
    const names = await voice.locator('label strong').allTextContents();
    expect(names.slice(0, 4)).toEqual(['Automatic', 'Serena', 'Daniel', 'Samantha']);
    await expect(voice.getByText('Zarvox')).toHaveCount(0);
    await expect(voice.getByText('More voices (1)')).toBeVisible();
    // Preview a voice without choosing it.
    await voice.getByRole('button', { name: 'Listen: read this aloud' }).nth(2).click();
    const last = await page.evaluate(() => { const s = (window as unknown as { __spoken: { voice: string | null }[] }).__spoken; return s[s.length - 1].voice; });
    expect(last).toBe('com.apple.voice.compact.en-GB.Daniel');
    await expect(voice.getByRole('radio', { name: /Automatic/ })).toBeChecked();
    // Choose Slow and a voice; both are saved.
    await page.getByRole('radio', { name: /Slow/ }).click();
    await voice.getByRole('radio', { name: /Daniel/ }).check();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ariya-study-hq:v1')!));
    expect(saved.speechRate).toBe(0.8);
    expect(saved.voiceURI).toBe('com.apple.voice.compact.en-GB.Daniel');
  });
});

test('hides Listen buttons and the switch when speech is unavailable', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }); });
  await seed(page);
  await page.goto('./#/subject/maths/learn/m-angle-rules');
  await expect(page.getByRole('heading', { name: 'Angle rules: on a straight line, around a point' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Listen/ })).toHaveCount(0);
  await expect(page.getByRole('switch', { name: /Listen mode/ })).toHaveCount(0);
  await page.goto('./#/settings');
  await expect(page.getByRole('heading', { name: 'Listen mode' })).toHaveCount(0);
});
