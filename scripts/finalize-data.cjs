const fs=require('node:fs');
const counterexamples={
 'Majority vote':[[[1,2,1,2,1,1,2],1]],
 'Group anagram messages':[[['abb','aab'],[['aab'],['abb']]]],
 'At most one deletion':[['cbbcc',true]],
 'Backspace comparison':[[{a:'ab#c',b:'ac'},true]],
 'Longest unique substring':[['abba',2]],
 'Window distinct counts':[[{nums:[1,2,3],k:1},[1,1,1]]],
 'Maximum vowel window':[[{text:'uuu',k:2},2]],
 'Find target position':[[{nums:[1],target:1},0]]
};
const aiFile='data/ai-coding-problems.json';const ai=JSON.parse(fs.readFileSync(aiFile,'utf8'));
if(ai.length<30){const bank=JSON.parse(fs.readFileSync('data/coding-problems.json','utf8'));const extra=bank.find(p=>p.topic==='Sorting'&&!ai.some(q=>q.title===p.title));ai.push({...extra,id:'ai-'+extra.id});fs.writeFileSync(aiFile,JSON.stringify(ai,null,2));}
for(const file of ['coding-problems','debugging-problems','ai-coding-problems']){
 const data=JSON.parse(fs.readFileSync(`data/${file}.json`,'utf8'));
 for(const p of data){p.tags=p.tags??[p.topic.toLowerCase().replaceAll(' ','-')];for(const [input,expected] of counterexamples[p.title.replace('Repair: ','')]??[])if(!p.tests.some(t=>JSON.stringify(t.input)===JSON.stringify(input)))p.tests.push({input,expected,hidden:true});}
 fs.writeFileSync(`data/${file}.json`,JSON.stringify(data,null,2));
}
const reasoning=JSON.parse(fs.readFileSync('data/reasoning-questions.json','utf8'));
reasoning.filter(q=>q.topic==='Logical reasoning').forEach((q,i)=>q.options[3]=String(i+6));
reasoning.filter(q=>q.topic==='Pattern recognition').forEach(q=>q.explanation=`Each value is twice the previous value. Doubling the final displayed term gives ${q.options[0]}.`);
reasoning.filter(q=>q.topic==='Data interpretation').forEach(q=>{if(!q.explanation.startsWith('Tuesday'))q.explanation='Tuesday’s share equals Tuesday tickets divided by the two-day total: '+q.explanation;});
fs.writeFileSync('data/reasoning-questions.json',JSON.stringify(reasoning,null,2));
