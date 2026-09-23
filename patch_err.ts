import * as fs from 'fs';
let content = fs.readFileSync('src/pages/Vocabulary.tsx', 'utf8');
content = content.replace('}).catch(err => {', '}).catch((_err) => {');
fs.writeFileSync('src/pages/Vocabulary.tsx', content);
