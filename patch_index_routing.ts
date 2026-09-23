import * as fs from 'fs';

let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');

if (!content.includes('import { saveWord, removeSavedWord, isWordSaved, getSavedWords }')) {
  content = content.replace(
    'import { dictionary_lookup, DictionaryResult } from "./tools/dictionary.ts";',
    'import { dictionary_lookup, DictionaryResult } from "./tools/dictionary.ts";\nimport { saveWord, removeSavedWord, isWordSaved, getSavedWords } from "./saved_words.ts";'
  );
}

const oldBodyCheck = `      const { message, sessionId } = body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        return new Response(JSON.stringify({ success: false, error: "Message is required" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const safeSessionId = sessionId || crypto.randomUUID();

      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';`;

const newBodyCheck = `      const { action, message, sessionId, word, dictionary_data, note } = body;

      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
      
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || '' } }
      });

      let authenticatedUser = null;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '').trim();
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);
        if (user && !error) authenticatedUser = user;
      }

      // Handle explicit vocabulary API actions
      if (action) {
        if (!authenticatedUser) {
          return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        
        try {
          switch (action) {
            case 'save_word':
              if (!word || !dictionary_data) throw new Error("Missing word or dictionary_data");
              const saveResult = await saveWord(supabaseClient, authenticatedUser.id, word, dictionary_data, note);
              return new Response(JSON.stringify(saveResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            case 'remove_word':
              if (!word) throw new Error("Missing word");
              const removeResult = await removeSavedWord(supabaseClient, authenticatedUser.id, word);
              return new Response(JSON.stringify(removeResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            case 'is_saved':
              if (!word) throw new Error("Missing word");
              const isSavedResult = await isWordSaved(supabaseClient, authenticatedUser.id, word);
              return new Response(JSON.stringify(isSavedResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            case 'get_saved':
              const getResult = await getSavedWords(supabaseClient, authenticatedUser.id);
              return new Response(JSON.stringify(getResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            default:
              return new Response(JSON.stringify({ success: false, error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        } catch (error: any) {
          return new Response(JSON.stringify({ success: false, error: "Application error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // Continue with normal chat flow
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return new Response(JSON.stringify({ success: false, error: "Message is required" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const safeSessionId = sessionId || crypto.randomUUID();`;

content = content.replace(oldBodyCheck, newBodyCheck);

// Need to remove the duplicated supabaseClient instantiation further down
const redundantAuthCheck = `      const authHeader = req.headers.get('Authorization');
      
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || '' } }
      });

      let authenticatedUser = null;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '').trim();
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);
        
        console.log("EDGE AUTH DEBUG:", {
          hasAuthorizationHeader: !!authHeader,
          authenticated: !!user,
          userId: user ? user.id : null,
          error: error ? error.message : null
        });

        if (user && !error) {
          authenticatedUser = user;
        }
      } else {
        console.log("EDGE AUTH DEBUG:", {
          hasAuthorizationHeader: false,
          authenticated: false,
          userId: null
        });
      }`;

content = content.replace(redundantAuthCheck, `// Auth has been extracted to top of handler to support routing`);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
