const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.cpSync(path.join(root,'node_modules','monaco-editor','min','vs'), path.join(root,'public','monaco','vs'), { recursive:true });
console.log('Monaco editor assets ready (served locally).');
