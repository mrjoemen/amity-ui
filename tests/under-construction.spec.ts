import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const COPY = [
  "Uh oh! You reached the website while it's under construction!",
  "We're just as stoked as you are at Amity, however, we want to ensure you're provided the best experience possible.",
  "We'll be done soon!",
  '- Amity Team',
];

const illustration = (page: Page) => page.locator('.illustration img');
const copyBlock = (page: Page) => page.locator('.copy');

async function boxes(page: Page) {
  const text = await copyBlock(page).boundingBox();
  const svg = await illustration(page).boundingBox();
  if (!text || !svg) throw new Error('copy or illustration not rendered');
  return { text, svg };
}

async function expectSideBySide(page: Page) {
  const { text, svg } = await boxes(page);
  // Text on the left, illustration on the right, sharing a vertical band.
  expect(text.x + text.width).toBeLessThanOrEqual(svg.x);
  expect(text.y).toBeLessThan(svg.y + svg.height);
  expect(svg.y).toBeLessThan(text.y + text.height);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('content', () => {
  test('shows logo, exact copy in order, and illustration', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Amity Dental Solutions/);
    await expect(page.getByRole('img', { name: 'Amity Dental Solutions' })).toBeVisible();

    const paragraphs = copyBlock(page).locator('h1, p');
    await expect(paragraphs).toHaveText(COPY);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(COPY[0]);

    await expect(illustration(page)).toBeVisible();
    await expect(illustration(page)).toHaveAttribute('alt', '');
  });

  test('uses brand colors for background and all text', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(245, 244, 240)');

    const colors = await copyBlock(page)
      .locator('h1, p, span')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
    expect(colors.length).toBeGreaterThan(0);
    for (const color of colors) expect(color).toBe('rgb(31, 61, 99)');
  });

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('layout', () => {
  for (const width of [1280, 768]) {
    test(`text and illustration side by side at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expectSideBySide(page);
      await expectNoHorizontalScroll(page);
    });
  }

  test('illustration stacked above text at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    const { text, svg } = await boxes(page);
    expect(svg.y + svg.height).toBeLessThanOrEqual(text.y);
    expect(svg.width).toBeLessThanOrEqual(360);
    await expectNoHorizontalScroll(page);
  });

  test('illustration keeps its aspect ratio when scaled down', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    const { svg } = await boxes(page);
    expect(svg.width / svg.height).toBeCloseTo(882 / 551, 1);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('renders the same content and layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(copyBlock(page).locator('h1, p')).toHaveText(COPY);
    await expectSideBySide(page);
  });
});

test.describe('reduced motion', () => {
  test('animated illustration by default', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const src = await illustration(page).evaluate((img: HTMLImageElement) => img.currentSrc);
    expect(src).toMatch(/\/illustration\.svg$/);
  });

  test('still illustration when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const src = await illustration(page).evaluate((img: HTMLImageElement) => img.currentSrc);
    expect(src).toMatch(/\/illustration-still\.svg$/);
  });
});

test.describe('routes', () => {
  for (const path of ['/', '/maintenance']) {
    test(`${path} returns 200 with the headline`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(COPY[0]);
    });
  }

  test('canonical URL points at the primary domain', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://amitydentalsolutions.com/',
    );
  });

  test('unknown path returns branded 404 with a link home', async ({ page }) => {
    const response = await page.goto('/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(245, 244, 240)');
  });
});
