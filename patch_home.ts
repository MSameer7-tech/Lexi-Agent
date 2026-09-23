import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const targetLine = "          label: evt.type === 'tool_call' ? \`Looking up \"\${evt.input}\"\` : evt.type === 'tool_result' ? (evt.success ? 'Dictionary information retrieved' : 'Dictionary lookup failed') : evt.type,";

const newMapping = `          label: evt.type === 'tool_call' 
            ? (evt.tool === 'thesaurus_lookup' ? \`Checking thesaurus for "\${evt.input}"\` : \`Looking up "\${evt.input}"\`)
            : evt.type === 'tool_result'
              ? (evt.tool === 'thesaurus_lookup' 
                  ? (evt.success ? 'Thesaurus information retrieved' : 'Thesaurus lookup failed')
                  : (evt.success ? 'Dictionary information retrieved' : 'Dictionary lookup failed'))
              : evt.type,`;

content = content.replace(targetLine, newMapping);
fs.writeFileSync('src/pages/Home.tsx', content);
