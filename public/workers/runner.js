// Each run receives a new disposable worker. No user code runs on the server.
const stable=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
self.onmessage=async({data:{code,language,tests}})=>{
 try {
  let run;
  if(language==='Python'){
   importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
   const py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
   // Drop network bridges before candidate code executes.
   py.runPython('import sys\nsys.modules["js"] = None\nsys.modules["pyodide.http"] = None');
   run=async input=>{py.globals.set('_candidate_code',code);py.globals.set('_candidate_input',JSON.stringify(input));return JSON.parse(await py.runPythonAsync('import json\n_scope = {}\nexec(_candidate_code, _scope)\njson.dumps(_scope["solve"](json.loads(_candidate_input)))'));};
  }else{
   // Worker has no DOM or local storage. Remove network APIs from the candidate scope.
   self.fetch=undefined;self.XMLHttpRequest=undefined;self.WebSocket=undefined;self.importScripts=undefined;
   self.postMessage=undefined;
   const fn=new Function('data','"use strict";'+code+'\nreturn solve(data);');
   run=async input=>await fn(structuredClone(input));
  }
  const results=[];
  for(const test of tests){try{const actual=await run(test.input);results.push({passed:stable(actual)===stable(test.expected),...(test.hidden?{hidden:true}:{input:test.input,expected:test.expected,actual})});}catch(e){results.push({passed:false,error:String(e).slice(0,800),hidden:!!test.hidden});}}
  send({passed:results.filter(r=>r.passed).length,total:results.length,results});
 }catch(e){send({passed:0,total:tests.length,results:[],error:'Runtime error: '+String(e).slice(0,1000)});}
};
const send=self.postMessage.bind(self);
