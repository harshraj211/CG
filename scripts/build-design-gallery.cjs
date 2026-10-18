const fs=require('node:fs');
const read=name=>JSON.parse(fs.readFileSync(`data/${name}.json`,'utf8'));
const content={question:read('sql-mcqs').find(q=>q.id==='sql-026'),lesson:read('lessons').find(l=>l.id==='rag'),problems:read('coding-problems').slice(0,8),debug:read('debugging-problems')[0],interviews:read('interview-questions').filter(q=>['Projects','AI/RAG','HR'].includes(q.topic)).slice(0,6)};
fs.writeFileSync('public/design-review/data.js','window.DESIGN_CONTENT = '+JSON.stringify(content,null,2)+';\n');
console.log('Design gallery uses current local question and problem content.');
