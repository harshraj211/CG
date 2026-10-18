/* eslint-disable @typescript-eslint/no-require-imports -- standalone CommonJS QA script */
const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const screens=['dashboard','preparation','practice','coding','editor','debugging','ai','mocks','exam','communication','interview','analytics','bookmarks','notes','settings'];
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const direction of ['navy','teal'])for(const theme of ['light','dark']){
await page.goto(`http://127.0.0.1:3000/design-review/index.html?direction=${direction}&theme=${theme}`);
assert.equal(await page.locator('#appearance').inputValue(),theme);
for(const screen of screens){
await page.locator('#screen').selectOption(screen);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${direction}/${theme}/${screen} overflow`);
if(theme==='dark'){
const wrong=await page.locator('.site, .site .panel, .site .scenario, .site .editor, .site .editor-toolbar, .site .code, .site .journey-rail, .site .journal-index, .site .trail-start, .site .trail-path>button').evaluateAll(elements=>elements.filter(e=>getComputedStyle(e).backgroundColor!=='rgb(0, 0, 0)').map(e=>e.className));
assert.deepEqual(wrong,[],`${direction}/${screen} surfaces must be #000`);
}
if(screen==='dashboard'||screen==='practice')await page.locator('.site').screenshot({path:`artifacts/design-review/images/${direction}-refined-${theme}-${screen}.png`});
}
await page.setViewportSize({width:390,height:844});
for(const screen of screens){
await page.locator('#screen').selectOption(screen);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Mobile ${direction}/${theme}/${screen}`);
const content=await page.locator('.content').boundingBox();assert.ok(content.width>=300);
if(screen==='practice'){
const answer=await page.locator('.answer').first().boundingBox();assert.ok(answer.x+answer.width<=390);
await page.locator('.site').screenshot({path:`artifacts/design-review/images/${direction}-refined-${theme}-mobile.png`});
}
}
await page.setViewportSize({width:1440,height:1000});
await page.locator('#screen').selectOption('practice');
await page.locator('input[name=answer]').first().check();await page.locator('#check-answer').click();
assert.ok(await page.locator('#answer-feedback').textContent());
}
await page.locator('#appearance').selectOption('dark');
await page.goto('http://127.0.0.1:3000/design-review/index.html?direction=navy');
assert.equal(await page.locator('#appearance').inputValue(),'dark');
await page.locator('#direction').selectOption('teal');assert.ok(await page.locator('.site').evaluate(e=>e.classList.contains('pure-black')));
assert.deepEqual(errors,[]);
console.log('PASS: A/B × light/pure black × 15 screens at desktop and mobile (120 views); #000 surface checks, explanation feedback and theme persistence.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
