import { chromium } from '@playwright/test';
const browser=await chromium.launch({args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();const messages=[];
page.on('console',m=>{if(m.type()==='error')messages.push(m.text().slice(0,200));});
page.on('pageerror',e=>messages.push(e.message));
await page.goto('http://127.0.0.1:3000/',{waitUntil:'domcontentloaded'});
try{await page.locator('.video-control').filter({hasText:'SOUND OFF'}).waitFor({state:'visible',timeout:5000});await page.waitForFunction(()=>!document.querySelector('.video-control')?.disabled,{timeout:25000});}catch(e){messages.push('Waiting for ready control: '+e.message.slice(0,200));}
try { await page.locator('.hero.has-video').waitFor({state:'visible',timeout:12000}); } catch { messages.push('Playback did not start within 12 seconds in the test browser.'); }
const result=await page.evaluate(()=>({playing:document.querySelector('.hero')?.classList.contains('has-video'),soundEnabled:!document.querySelector('.video-control')?.disabled,iframe:document.querySelector('.youtube-cover iframe')?.getAttribute('src'),fallback:document.querySelector('.youtube-fallback')?.textContent}));
console.log('ACTUAL YOUTUBE CHECK:',JSON.stringify(result));console.log('NETWORK/CONSOLE:',messages);
if(result.playing){await page.locator('.video-control').filter({hasText:'SOUND OFF'}).click();console.log('SOUND TOGGLE:',await page.locator('.video-control').filter({hasText:'SOUND ON'}).count());}
await browser.close();
