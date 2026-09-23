import * as fs from 'fs';

let content = fs.readFileSync('src/store/historyStore.ts', 'utf8');

if (!content.includes('clearSessions: () => void;')) {
  content = content.replace(
    'addMessageToSession: (sessionId: string, message: Message) => void;',
    'addMessageToSession: (sessionId: string, message: Message) => void;\n  clearSessions: () => void;'
  );
  
  content = content.replace(
    'addMessageToSession: (sessionId, message) => set((state) => {',
    'clearSessions: () => set({ sessions: [], activeSessionId: null }),\n\n      addMessageToSession: (sessionId, message) => set((state) => {'
  );
}

fs.writeFileSync('src/store/historyStore.ts', content);
