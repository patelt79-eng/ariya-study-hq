import { expect, test, type Page } from '@playwright/test';

const SUBJECTS = ['maths', 'science', 'english', 're', 'geography', 'history'];
const TABS = ['test', 'learn', 'cards', 'quiz', 'practise', 'links', 'boss'];

async function onboard(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('radio', { name: '7A3' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: /Launch/ }).click();
  await expect(page.getByRole('heading', { name: /Hi Ariya/ })).toBeVisible();
}

async function noSideScroll(page: Page, where: string) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(over, `horizontal overflow on ${where}`).toBeLessThanOrEqual(1);
}

/** Answer whatever question is showing (right or wrong doesn't matter), then press Next. */
async function answerOne(page: Page) {
  const quiz = page.getByTestId('quiz');
  // Wait until the question's controls have rendered (tabs animate in).
  await quiz.locator('input[aria-label="Your answer"], button.option, button:has-text("Check matches")').first().waitFor();
  const input = quiz.getByLabel('Your answer');
  if (await input.count()) {
    await input.fill('1');
    await quiz.getByRole('button', { name: 'Check', exact: true }).click();
  } else if (await quiz.getByRole('button', { name: 'Check matches' }).count()) {
    for (let k = 0; k < 6; k++) {
      const chip = quiz.locator('button.draggable').first();
      if (!(await chip.count())) break;
      await chip.click();
      await quiz.locator('[data-drop]').filter({ hasText: 'Tap to place' }).first().click();
    }
    await quiz.getByRole('button', { name: 'Check matches' }).click();
  } else {
    await quiz.locator('button.option').first().click();
  }
  await quiz.getByRole('button', { name: /Next/ }).click();
}

test('home: countdown, mission, subjects, no sideways scroll', async ({ page }) => {
  await onboard(page);
  await expect(page.getByText('Next assessment')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Today's/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Start$/ }).first()).toBeVisible();
  await noSideScroll(page, 'home');
});

test('every subject and tab loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page);
  for (const s of SUBJECTS) {
    for (const t of TABS) {
      await page.goto(`./#/subject/${s}/${t}`);
      await expect(page.locator('h1').first()).toBeVisible();
      await noSideScroll(page, `${s}/${t}`);
    }
  }
  expect(errors).toEqual([]);
});

test('a maths quiz can be finished and progress survives a reload', async ({ page }) => {
  await onboard(page);
  await page.goto('./#/subject/maths/quiz');
  for (let i = 0; i < 10; i++) await answerOne(page);
  await expect(page.getByRole('button', { name: 'Another round' })).toBeVisible();
  const xp = await page.evaluate(() => JSON.parse(localStorage.getItem('ariya-study-hq:v1')!).xp);
  expect(xp).toBeGreaterThan(0);
  await page.reload();
  await page.goto('./#/');
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('ariya-study-hq:v1')!));
  expect(after.xp).toBe(xp);
  expect(after.badges['first-quiz']).toBeTruthy();
  await expect(page.getByRole('heading', { name: /Hi Ariya/ })).toBeVisible();
});

const TOOLS: Record<string, string[]> = {
  maths: ['generators', 'angles', 'ratio', 'blitz'],
  science: ['cell', 'particles', 'forces', 'foodweb'],
  english: ['extract-athlete', 'extract-inventor', 'extract-campaigner', 'pea', 'spag', 'writing'],
  re: ['pee', 'keywords'],
  geography: ['exam', 'map', 'water', 'plates', 'pangaea', 'cases'],
  history: ['timeline', 'showdown', 'claimants', 'silk', 'pee'],
};

test('every practise tool opens without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page);
  for (const [s, tools] of Object.entries(TOOLS)) {
    for (const t of tools) {
      await page.goto(`./#/subject/${s}/practise/${t}`);
      await expect(page.getByRole('button', { name: '← All tools' })).toBeVisible();
      await page.waitForTimeout(150);
      await noSideScroll(page, `${s}/practise/${t}`);
    }
  }
  expect(errors).toEqual([]);
});

for (const s of SUBJECTS.filter((x) => x !== 'maths')) {
  test(`a ${s} quiz can be finished`, async ({ page }) => {
    await onboard(page);
    await page.goto(`./#/subject/${s}/quiz`);
    for (let i = 0; i < 10; i++) await answerOne(page);
    await expect(page.getByRole('button', { name: 'Another round' })).toBeVisible();
  });
}

test('theme switching', async ({ page }) => {
  await onboard(page);
  await page.goto('./#/settings');
  for (const [name, id] of [['Neon Arcade', 'arcade'], ['Adventure Map', 'map'], ['Space Quest', 'space']]) {
    await page.getByRole('radio', { name: new RegExp(name) }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', id);
    await page.goto('./#/');
    await noSideScroll(page, `home (${id})`);
    await page.goto('./#/settings');
  }
});

test('works offline after the first load', async ({ page, context }) => {
  await onboard(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Hi Ariya/ })).toBeVisible();
  await page.goto('./#/subject/maths/cards');
  await expect(page.getByText(/Card 1 of/)).toBeVisible();
  await context.setOffline(false);
});
