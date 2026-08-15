import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4321';
const outputDirectory = resolve(process.env.SCREENSHOT_OUTPUT_DIRECTORY ?? 'artifacts/screenshots');

const screenshotProfiles = [
  {
    name: 'pc',
    viewport: { width: 1920, height: 1080 },
    isMobile: false,
    hasTouch: false,
  },
  {
    name: 'mobile',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();

try {
  for (const profile of screenshotProfiles) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      deviceScaleFactor: 1,
      hasTouch: profile.hasTouch,
      isMobile: profile.isMobile,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });

    if (!response?.ok()) {
      throw new Error(`Failed to load ${baseUrl}: ${response?.status() ?? 'no response'}`);
    }

    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content: `
        html.virtual-scroll-root,
        html.virtual-scroll-root body {
          height: auto !important;
          overflow: visible !important;
        }

        [data-virtual-scroll-content] {
          top: 0 !important;
        }

        [data-virtual-scrollbar] {
          display: none !important;
        }
      `,
    });
    await page.screenshot({
      path: resolve(outputDirectory, `necoz-${profile.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    await context.close();
  }
} finally {
  await browser.close();
}
