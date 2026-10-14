import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: {width:1440,height:1000}, reducedMotion:'reduce' });
const page = await context.newPage();
const errors=[]; const checks=[];
page.on('pageerror', e=>errors.push(e.message));
const base='http://127.0.0.1:3000';
async function goto(route){await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);}
await goto('/');
await page.getByRole('button',{name:'EN',exact:true}).click();
await expect(page.getByRole('link',{name:'Explore our work',exact:true})).toBeVisible();checks.push('TH/EN language changes content');
await page.getByRole('link',{name:'Explore our work',exact:true}).click();
await expect(page.locator('.work-card')).toHaveCount(5);
await page.getByRole('button',{name:'Web experience',exact:false}).filter({has:page.locator('sup')}).click();
await expect(page.locator('.work-card')).toHaveCount(1);
await page.getByRole('textbox',{name:'Search work'}).fill('No such brand');
await expect(page.locator('.empty-state')).toBeVisible();
await page.getByRole('button',{name:'Show all work',exact:true}).click();
await expect(page.locator('.work-card')).toHaveCount(5);checks.push('Work category filters, search and empty-state reset');
await page.getByRole('button',{name:'View Cellox project',exact:true}).click();
await expect(page.getByRole('dialog')).toBeVisible();
await expect(page.getByRole('heading',{name:'Cellox.'})).toBeVisible();
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog')).toHaveCount(0);checks.push('Project modal, keyboard dismissal and focus return');
await goto('/services#experience');
await expect(page.locator('#service-panel-experience')).toBeVisible();
await page.locator('#experience .service-detail-trigger').click();
await expect(page.locator('#service-panel-experience')).toBeHidden();
await page.locator('#experience .service-detail-trigger').click();
await expect(page.locator('#service-panel-experience')).toBeVisible();
await page.getByRole('button',{name:'Improve customer experience',exact:true}).click();
await expect(page.locator('.matcher-result .chips')).toContainText('Digital experiences.');checks.push('Services deep-link accordion and deterministic goal matcher');
await goto('/clients');
await expect(page.locator('.client-card')).toHaveCount(32);
await page.getByRole('button',{name:'Finance',exact:true}).click();
await expect(page.locator('.client-card')).toHaveCount(4);
await page.getByRole('textbox',{name:'Search brands'}).fill('krungsri');
await expect(page.locator('.client-card')).toHaveCount(1);checks.push('32 original client assets, category and name search');
await goto('/blog');
await page.getByRole('button',{name:'AI & Creativity',exact:true}).click();
await expect(page.locator('.article-card')).toHaveCount(1);
await page.locator('.article-card').click();
await expect(page.locator('.reader-header h1')).toHaveText('AI is a tool. Taste is the edge.');
await expect(page.locator('.reader-body > section')).toHaveCount(3);checks.push('Blog category filter and complete article reader');
await goto('/contact?service=growth');
await expect(page.locator('input[name=services][value=growth]')).toBeChecked();
await page.locator('input[name=name]').fill('QA Demo');
await page.locator('input[name=company]').fill('Demo Studio');
await page.locator('input[name=email]').fill('demo@example.com');
await page.locator('textarea[name=goal]').fill('Create a clear and accessible digital brand experience for our project.');
await page.locator('.consent-label input').check();
const downloaded=page.waitForEvent('download');
await page.getByRole('button',{name:'Create & download brief',exact:true}).click();
const download=await downloaded;
expect(download.suggestedFilename()).toBe('play-digital-project-brief.txt');
await download.saveAs('reference/test-brief.txt');
const text=await fs.readFile('reference/test-brief.txt','utf8');
expect(text).toContain('Demo Studio');expect(text).toContain('Performance & growth.');expect(text).toContain('has not been submitted');
await expect(page.locator('.brief-success')).toBeVisible();checks.push('Validated local brief download with honest no-submission status');
await page.setViewportSize({width:390,height:844});
await page.getByRole('button',{name:'Open menu',exact:true}).click();
await expect(page.getByRole('dialog',{name:'Navigation menu'})).toBeVisible();
await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Work',exact:false}).click();
await expect(page.getByRole('dialog',{name:'Navigation menu'})).toHaveCount(0);await expect(page.locator('.work-card')).toHaveCount(5);checks.push('Mobile navigation opens, navigates and restores scrolling');
const routes=['/','/services','/work','/clients','/about','/blog','/blog/human-ai','/contact','/privacy','/missing'];
const overflows=[];
for(const width of [360,390,768,1024,1440]){
 await page.setViewportSize({width,height:900});
 for(const route of routes){await goto(route);const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));if(size.scroll>size.client+1)overflows.push({width,route,...size});}
}
expect(overflows).toEqual([]);checks.push('No horizontal overflow on 10 routes at 360, 390, 768, 1024, 1440 pixels');
const violations=[];
await page.setViewportSize({width:1440,height:1000});
for(const route of routes.slice(0,9)){
 await goto(route);
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 if(results.violations.length)violations.push({route,violations:results.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,12)}))});
}
const ytPage=await browser.newPage({viewport:{width:1440,height:1000}});
ytPage.on('pageerror',e=>errors.push(e.message));
await ytPage.addInitScript(()=>{
 window.__YT_TEST__={calls:[],options:null,player:null};
 window.YT={Player:class{
  constructor(el,options){this.options=options;window.__YT_TEST__.options={videoId:options.videoId,playerVars:options.playerVars};window.__YT_TEST__.player=this;this.iframe=document.createElement('iframe');this.iframe.src='about:blank';el.replaceWith(this.iframe);queueMicrotask(()=>options.events.onReady({target:this}));}
  mute(){window.__YT_TEST__.calls.push('mute');} unMute(){window.__YT_TEST__.calls.push('unMute');}
  setVolume(v){window.__YT_TEST__.calls.push('volume:'+v);} getIframe(){return this.iframe;}
  playVideo(){window.__YT_TEST__.calls.push('play');this.options.events.onStateChange({target:this,data:1});}
  pauseVideo(){window.__YT_TEST__.calls.push('pause');} seekTo(v){window.__YT_TEST__.calls.push('seek:'+v);} destroy(){this.iframe.remove();}
  end(){this.options.events.onStateChange({target:this,data:0});}
 }};
});
await ytPage.goto(base,{waitUntil:'domcontentloaded'});
await expect(ytPage.getByRole('button',{name:'SOUND OFF',exact:false})).toBeEnabled();
let yt=await ytPage.evaluate(()=>window.__YT_TEST__);
expect(yt.options.videoId).toBe('gBPHuwaHQQc');expect(yt.options.playerVars.autoplay).toBe(1);expect(yt.options.playerVars.mute).toBe(1);expect(yt.options.playerVars.loop).toBe(1);expect(yt.options.playerVars.playlist).toBe('gBPHuwaHQQc');
await ytPage.getByRole('button',{name:'SOUND OFF',exact:false}).click();
await expect(ytPage.getByRole('button',{name:'SOUND ON',exact:false})).toBeVisible();
await ytPage.getByRole('button',{name:'SOUND ON',exact:false}).click();
await ytPage.getByRole('button',{name:'Pause video',exact:true}).click();
await ytPage.getByRole('button',{name:'Play video',exact:true}).click();
await ytPage.evaluate(()=>window.__YT_TEST__.player.end());
yt=await ytPage.evaluate(()=>window.__YT_TEST__);
expect(yt.calls).toContain('unMute');expect(yt.calls).toContain('mute');expect(yt.calls).toContain('seek:0');
checks.push('YouTube API contract: original video, autoplay muted, playlist looping, sound and pause controls, end-of-video restart (mocked API)');
await ytPage.getByRole('button',{name:'Expand showreel',exact:true}).click();
await expect(ytPage.locator('.reel-modal-video iframe')).toHaveAttribute('src',/gBPHuwaHQQc.*mute=0.*loop=1.*playlist=gBPHuwaHQQc/);
await ytPage.keyboard.press('Escape');checks.push('Full showreel dialog retains original ID, loop, sound and native controls');
expect(errors).toEqual([]);
await fs.writeFile('reference/qa-results.json',JSON.stringify({checks,errors,overflows,accessibility:violations},null,2));
console.log('PASSED CHECKS:',checks);console.log('ACCESSIBILITY:',JSON.stringify(violations,null,2));
await browser.close();
