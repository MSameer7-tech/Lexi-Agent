import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const targetStr = `      let finalEvents: AgentEvent[] = [];
      if (response.events && response.events.length > 0) {
        finalEvents = response.events.map((evt: any, i: number) => ({
          id: i.toString(),
          label: evt.type === 'tool_call' 
            ? (evt.tool === 'thesaurus_lookup' ? \`Checking thesaurus for "\${evt.input}"\` : \`Looking up "\${evt.input}"\`)
            : evt.type === 'tool_result'
              ? (evt.tool === 'thesaurus_lookup' 
                  ? (evt.success ? 'Thesaurus information retrieved' : 'Thesaurus lookup failed')
                  : (evt.success ? 'Dictionary information retrieved' : 'Dictionary lookup failed'))
              : evt.type,
          status: evt.success === false ? 'error' : 'success',
          timestamp: Date.now()
        }));
      }`;

const replacementStr = `      let finalEvents: AgentEvent[] = [];
      if (response.events && response.events.length > 0) {
        finalEvents = response.events
          .filter((evt: any) => !(evt.type === 'tool_call' && evt.tool === 'thesaurus_lookup'))
          .map((evt: any, i: number) => ({
            id: i.toString(),
            label: evt.type === 'tool_call' 
              ? \`Looking up "\${evt.input}"\`
              : evt.type === 'tool_result'
                ? (evt.tool === 'thesaurus_lookup' 
                    ? (evt.success ? 'Thesaurus information retrieved' : 'Thesaurus lookup failed')
                    : (evt.success ? 'Dictionary information retrieved' : 'Dictionary lookup failed'))
                : evt.type,
            status: evt.success === false ? 'error' : 'success',
            timestamp: Date.now()
        }));
      }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/pages/Home.tsx', content);
