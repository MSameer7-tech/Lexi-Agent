import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const oldMap = `          label: evt.type === 'tool_call' ? \`Lookup: \${evt.input}\` : evt.type === 'tool_result' ? \`Dictionary Result (\${evt.success ? 'Success' : 'Error'})\` : evt.type,`;
const newMap = `          label: evt.type === 'tool_call' ? \`Looking up "\${evt.input}"\` : evt.type === 'tool_result' ? (evt.success ? 'Dictionary information retrieved' : 'Dictionary lookup failed') : evt.type,`;

content = content.replace(oldMap, newMap);

const oldElse = `      } else {
        finalEvents = [
          { id: '1', label: 'Request processed', timestamp: Date.now(), status: 'success' }
        ];
      }`;
const newElse = `      } else {
        finalEvents = []; // For normal conversation, keep events empty
      }`;

content = content.replace(oldElse, newElse);

fs.writeFileSync('src/pages/Home.tsx', content);
