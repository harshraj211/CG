/* eslint-disable @typescript-eslint/no-require-imports -- standalone CommonJS QA script */
const {chromium}=require('@playwright/test');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const screens=['dashboard','preparation','practice','coding','editor','debugging','ai','mocks','exam','communication','interview','analytics','bookmarks','notes','settings'];
for(const direction of ['navy','teal','studio']){
await page.goto('http://127.0.0.1:3000/design-review/index.html?direction='+direction);
for(const screen of screens){
await page.locator('#screen').selectOption(screen);
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow: '+direction+' '+screen);
}
await page.locator('#screen').selectOption('dashboard');
await page.locator('.site').screenshot({path:'artifacts/design-review/images/'+direction+'-round-two.png'});
const bounds=await page.locator('.site').boundingBox();
await page.screenshot({path:'artifacts/design-review/images/'+direction+'-overview.png',clip:{x:bounds.x,y:bounds.y,width:bounds.width,height:760}});
await page.locator('#screen').selectOption('practice');
await page.locator('.site').screenshot({path:'artifacts/design-review/images/'+direction+'-round-two-practice.png'});
await page.setViewportSize({width:390,height:844});
for(const screen of screens){
await page.locator('#screen').selectOption(screen);
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Mobile overflow: '+direction+' '+screen);
if((await page.locator('.content').boundingBox()).width<300)throw Error('Collapsed mobile content: '+direction+' '+screen);
if(screen==='practice'){
const bounds=await page.locator('.answer').first().boundingBox();
if(bounds.x+bounds.width>390)throw Error('Clipped mobile answers: '+direction);
await page.locator('.site').screenshot({path:'artifacts/design-review/images/'+direction+'-round-two-mobile.png'});
}
}
await page.setViewportSize({width:1440,height:1000});
}
await page.locator('#screen').selectOption('practice');
await page.locator('input[name=answer]').first().check();await page.locator('#check-answer').click();
if(!await page.locator('#answer-feedback').textContent())throw Error('Missing explanation');
await page.locator('#approve').click();await page.reload();
if(!await page.locator('#decision').textContent().then(t=>t.includes('Control Room')))throw Error('Preference did not persist');
if(errors.length)throw Error(errors.join('\n'));
console.log('PASS: 45 desktop views, 45 mobile views, answer feedback and round-two approval persistence.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
