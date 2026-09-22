import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Update imports
content = content.replace(
  "import { parseDictionaryMarkdown } from '../lib/parser';",
  "import { parseDictionaryMarkdown, mapDictionaryApiToParsedEntry } from '../lib/parser';"
);

// 2. Update executeTurn try/catch
const executeTurnOld = `    try {
      const response = await sendMessage({ message: messageText, sessionId });
      
      const finalEvents: AgentEvent[] = [
        { id: '1', label: 'Request sent to LexiAgent', timestamp: Date.now() - 1200, status: 'success' },
        { id: '2', label: 'Processing request', status: 'success' },
        { id: '3', label: 'Response generated', timestamp: Date.now(), status: 'success' }
      ];
      setActiveEvents(finalEvents);

      const newAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.response,
        timestamp: Date.now(),
        events: finalEvents
      };

      addMessageToSession(sessionId, newAgentMessage);`;

const executeTurnNew = `    try {
      const response = await sendMessage({ message: messageText, sessionId });
      
      let finalEvents: AgentEvent[] = [];
      if (response.events && response.events.length > 0) {
        finalEvents = response.events.map((evt: any, i: number) => ({
          id: i.toString(),
          label: evt.type === 'tool_call' ? \`Lookup: \${evt.input}\` : evt.type === 'tool_result' ? \`Dictionary Result (\${evt.success ? 'Success' : 'Error'})\` : evt.type,
          status: evt.success === false ? 'error' : 'success',
          timestamp: Date.now()
        }));
      } else {
        finalEvents = [
          { id: '1', label: 'Request processed', timestamp: Date.now(), status: 'success' }
        ];
      }
      
      setActiveEvents(finalEvents);

      const newAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.response,
        timestamp: Date.now(),
        events: finalEvents,
        dictionary: response.dictionary
      };

      addMessageToSession(sessionId, newAgentMessage);`;

content = content.replace(executeTurnOld, executeTurnNew);

// 3. Update WordResult rendering
const renderOld = `<WordResult entry={parseDictionaryMarkdown(message.content)} />`;
const renderNew = `<WordResult entry={message.dictionary ? mapDictionaryApiToParsedEntry(message.dictionary, message.content) : parseDictionaryMarkdown(message.content)} />`;
content = content.replace(renderOld, renderNew);

fs.writeFileSync('src/pages/Home.tsx', content);
