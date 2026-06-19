/*
 * Headless-Chrome deck capture for a flow prototype.
 *
 * Setup (in a throwaway dir, NOT the repo):
 *   mkdir -p /tmp/cap && cd /tmp/cap && npm init -y >/dev/null && npm i puppeteer-core@23
 *   node /path/to/capture.mjs
 * Then zip cleanly:  cd ~/Downloads && zip -rX <flow>-screens.zip <flow>-screens -x "*.DS_Store"
 *
 * Edit BASE / DIRECTIONS / STEPS / OUT for the flow. Drives the harness ?…&bare=1 URL states.
 */
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:8011/docs/sandbox/<flow-name>/';      // ← set your flow
const OUT = path.join(process.env.HOME, 'Downloads', '<flow-name>-screens'); // ← set your flow

const DIRECTIONS = [[1, 'Centred'], [2, 'Hero']];                    // [v, folder name]
const STEPS = [['login', '1. Sign in'], ['select', '2. Select'], ['done', '3. Done']]; // [step, file name]
const GROUPS = [
  { dir: 'Phone', extra: '', vw: 460, vh: 900 },
  { dir: 'Tablet Vertical', extra: '&device=ipad&orient=portrait', vw: 900, vh: 1260 },
  { dir: 'Tablet Horizontal', extra: '&device=ipad&orient=landscape', vw: 1260, vh: 920 },
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--force-device-scale-factor=1'] });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  let count = 0;
  for (const g of GROUPS) {
    await page.setViewport({ width: g.vw, height: g.vh, deviceScaleFactor: 2 });
    for (const [v, dirName] of DIRECTIONS) {
      const folder = path.join(OUT, g.dir, dirName);
      fs.mkdirSync(folder, { recursive: true });
      for (const [step, fileName] of STEPS) {
        await page.goto(`${BASE}?v=${v}&step=${step}&bare=1${g.extra}`, { waitUntil: 'networkidle0', timeout: 60000 });
        await page.waitForFunction(() => {
          const el = document.querySelector('.device-screen .screen-fill');
          return el && el.childElementCount > 0;
        }, { timeout: 60000 });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await new Promise((r) => setTimeout(r, 650)); // fonts / scene settle
        const device = await page.$('.device');
        await device.screenshot({ path: path.join(folder, `${fileName}.png`), omitBackground: true });
        process.stdout.write(`\r${++count} captured…`);
      }
    }
  }
  await browser.close();
  console.log(`\nDone — ${count} screenshots to ${OUT}`);
})().catch((e) => { console.error(e); process.exit(1); });
