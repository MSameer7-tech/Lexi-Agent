import * as fs from 'fs';

let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

if (!content.includes('useHistoryStore')) {
  content = content.replace(
    "import { supabase } from '../lib/supabase';",
    "import { supabase } from '../lib/supabase';\nimport { useHistoryStore } from '../store/historyStore';"
  );
  
  content = content.replace(
    '  const signOut = async () => {\n    await supabase.auth.signOut();\n  };',
    '  const signOut = async () => {\n    await supabase.auth.signOut();\n    useHistoryStore.getState().clearSessions();\n  };'
  );
}

// Also clear on Auth State change if the user changes!
if (!content.includes('// Check if user changed')) {
  content = content.replace(
    `    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });`,
    `    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession((prevSession) => {
        // Check if user changed
        if (prevSession?.user?.id && prevSession.user.id !== newSession?.user?.id) {
          useHistoryStore.getState().clearSessions();
        }
        return newSession;
      });
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });`
  );
}

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
