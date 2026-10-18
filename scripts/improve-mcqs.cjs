const fs=require('node:fs');
const cards={...require('../data/assessment-contexts.cjs'),...require('../data/technical-contexts.cjs')};
const read=name=>JSON.parse(fs.readFileSync(`data/${name}.json`,'utf8'));
const write=(name,data)=>fs.writeFileSync(`data/${name}.json`,JSON.stringify(data,null,2));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
const titles={'AI Literacy':'AI Literacy',DBMS:'DBMS',SQL:'SQL',OOP:'OOP',OS:'Operating Systems',CN:'Computer Networks'};
const lessons=read('lessons');
for(const [topic,title] of Object.entries(titles)){
 const bank=read(`${slug(topic)}-mcqs`),facts=lessons.find(l=>l.title===title).concepts;
 bank.forEach((q,index)=>{
  const conceptIndex=Math.floor(index/2),c=facts[conceptIndex],row=cards[topic][conceptIndex];
  if(!row||row.length!==7)throw new Error(`Incomplete reviewed scenario: ${topic}/${conceptIndex}`);
  const [context,prompt,options,...reasons]=row;
  if(options.length!==4||reasons.length!==4)throw new Error(`Invalid options: ${q.id}`);
  const conceptAnswer=c.explanation+'.';
  q.context=context;
  q.correctAnswer=0;
  q.contentVersion=2;
  if(index%2===1){
   q.question=prompt;
   q.options=options;
   q.explanation=reasons[0];
   q.optionExplanations=reasons;
  }else{
   q.question=`Which statement correctly explains ${c.name} in this situation?`;
   q.options=[conceptAnswer,c.trap+'.',`The scenario's correct answer would be: ${options[1]}.`,`The scenario's correct answer would be: ${options[2]}.`];
   q.explanation=`${conceptAnswer} ${reasons[0]}`;
   q.optionExplanations=[q.explanation,`That claim conflicts with the principle: ${conceptAnswer} ${reasons[0]}`,reasons[1],reasons[2]];
  }
  q.takeAway=`${c.name}: ${c.explanation}.`;
 });
 write(`${slug(topic)}-mcqs`,bank);
}
const assumptions={
 'Number series':'Assume the intended sequence is arithmetic: the same amount is added between adjacent terms. Continue that rule.',
 'Pattern recognition':'Assume the intended sequence multiplies by the same factor between adjacent terms. Continue that rule.',
 'Logical reasoning':'Queue positions are counted from 1 at either end, and each person occupies exactly one position.',
 'Syllogism':'Treat all/no statements as set relationships. Use only the given premises; do not infer that a group contains members unless stated.',
 'Coding-decoding':'Use the 26-letter English alphabet. Shift each character independently by the stated number; wrap from Z to A.',
 'Directions':'North/south and east/west movements are on perpendicular straight axes. Report the final displacement, not total distance walked.',
 'Blood relations':'Use the family relationships explicitly stated. An aunt is a sibling of a parent; do not assume additional family links.',
 'Data interpretation':'The two listed days form the complete total for this question. Compute the requested share using that two-day total.',
 'Quantitative aptitude':'The stated percentage discount applies once to the original price. Ignore taxes and additional fees.',
 'Sequences':'Include every integer from 1 through the stated upper bound, including both endpoints.'
};
const reasoning=read('reasoning-questions');
for(const q of reasoning){
 q.context=assumptions[q.topic];q.contentVersion=2;
 if(q.topic==='Number series'){const numbers=q.question.match(/\d+/g).map(Number);const d=numbers[1]-numbers[0];q.explanation=`The constant difference is ${numbers[1]} − ${numbers[0]} = ${d}. Add ${d} to the final displayed term to get ${q.options[0]}. Each adjacent pair must follow the same assumed rule.`;}
 if(q.topic==='Pattern recognition')q.explanation=`Each displayed term is twice its predecessor. Continue the stated constant-factor rule: the final term × 2 = ${q.options[0]}.`;
 if(q.topic==='Quantitative aptitude')q.explanation=`A 10% discount leaves 90% of the original price. Selling price = original price × 0.90 = ₹${q.options[0]}. The discount amount is subtracted once, and no extra fees are specified.`;
 if(q.topic==='Sequences'){const n=Number(q.question.match(/\d+/)[0]);q.explanation=`The integers run from 1 through ${n}, inclusive. Pairing the first and last, second and next-to-last, and so on gives the arithmetic-series formula n(n+1)/2. Substituting n=${n} yields ${n} × ${n+1} / 2 = ${q.options[0]}.`;}
 q.optionExplanations=q.options.map((option,i)=>i===q.correctAnswer?q.explanation:`${option} does not follow the stated rule or premises. ${q.explanation}`);
 q.takeAway=assumptions[q.topic];
}
write('reasoning-questions',reasoning);
console.log('Updated all 250 technical/AI MCQs and 80 reasoning questions with explicit context and option feedback.');
