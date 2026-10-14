import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('reference/screenshots', { recursive: true });
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const errors = [];
async function capture(name, path, viewport, full = false) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  page.on('pageerror', err => errors.push(`${name}: ${err.message}`));
  await page.goto('http://127.0.0.1:3000'+path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('h1').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(600);
  if (full) {
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 900) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0,0); });
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: `reference/screenshots/${name}.png`, fullPage: full });
  const info = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, h1: document.querySelector('h1')?.textContent, fonts: document.fonts.status, youtubeIframe: document.querySelector('.youtube-cover iframe')?.getAttribute('src') }));
  console.log(name,JSON.stringify(info)); await page.close();
}
await Promise.all([
  capture('home-desktop','/',{width:1440,height:1000}),
  capture('home-mobile','/',{width:390,height:844}),
  capture('home-full','/',{width:1440,height:1000},true)
]);
await Promise.all([
  capture('services-desktop','/services',{width:1440,height:1000},true),
  capture('contact-desktop','/contact',{width:1440,height:1000},true),
  capture('work-mobile','/work',{width:390,height:844},true)
]);
console.log('PAGE_ERRORS:',errors);
await browser.close();
