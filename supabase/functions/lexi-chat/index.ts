import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callGroqChatCompletion } from "./groq.ts";
import { SYSTEM_PROMPT } from "./prompts/system.ts";
import { dictionary_lookup, DictionaryResult } from "./tools/dictionary.ts";
import { saveWord, removeSavedWord, isWordSaved, getSavedWords, getWordHistory } from "./saved_words.ts";

export default {
  fetch: async (req: Request) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let body;
      try {
        body = await req.json();
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: "Invalid JSON body" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { action, word, note, dictionary_data, message, sessionId } = body;

      // ----------------------------------------------------
      // AUTH & ROUTING FOR VOCABULARY API (Phase 6C)
      // ----------------------------------------------------
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

      if (action) {
        if (!authenticatedUser) {
          return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { 
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
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
            case 'get_history':
              const historyResult = await getWordHistory(supabaseClient, authenticatedUser.id);
              return new Response(JSON.stringify(historyResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            default:
              return new Response(JSON.stringify({ success: false, error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        } catch (error: any) {
          console.error("Vocabulary API Error:", error);
          return new Response(JSON.stringify({ success: false, error: "Application error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
      // ----------------------------------------------------


      if (!message || typeof message !== 'string' || message.trim() === '') {
        return new Response(JSON.stringify({ success: false, error: "Message is required" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const safeSessionId = sessionId || crypto.randomUUID();

      const groqApiKey = Deno.env.get('GROQ_API_KEY');
      if (!groqApiKey) {
        console.error("GROQ_API_KEY environment variable is not set");
        return new Response(JSON.stringify({ success: false, error: "Internal Configuration Error" }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

// Auth logic extracted to top of function for action routing

      let conversationId = null;
      let historyMessages: any[] = [];
      const CONTEXT_WINDOW = 12; // Load up to 12 previous messages to provide adequate context without overwhelming Groq

      if (authenticatedUser) {
        // Find existing conversation by session_id and user_id
        const { data: convData, error: convError } = await supabaseClient
          .from('conversations')
          .select('id')
          .eq('session_id', safeSessionId)
          .eq('user_id', authenticatedUser.id)
          .maybeSingle();

        if (convData) {
          conversationId = convData.id;
          console.log("CONVERSATION DEBUG:", { lookupSuccess: true, conversationCreated: false, conversationId, databaseErrorCode: null });
          
          // Load history
          const { data: msgsData } = await supabaseClient
            .from('messages')
            .select('role, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(CONTEXT_WINDOW);
            
          if (msgsData) {
            historyMessages = msgsData.reverse().map(m => ({
              role: m.role,
              content: m.content
            }));
          }
        } else {
          // Create new conversation
          let title = message.trim().substring(0, 50);
          if (message.length > 50) title += '...';
          
          const { data: newConv, error: insertError } = await supabaseClient
            .from('conversations')
            .insert({
              session_id: safeSessionId,
              user_id: authenticatedUser.id,
              title: title
            })
            .select('id')
            .single();

          if (insertError) {
            console.error("Failed to create conversation:", insertError);
            console.log("CONVERSATION DEBUG:", { lookupSuccess: false, conversationCreated: false, conversationId: null, databaseErrorCode: insertError.code });
            return new Response(JSON.stringify({ success: false, error: "Database error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          
          conversationId = newConv?.id;
          console.log("CONVERSATION DEBUG:", { lookupSuccess: false, conversationCreated: true, conversationId, databaseErrorCode: null });
        }

        // Save the new incoming user message to the database
        if (conversationId) {
          const { error: msgError } = await supabaseClient.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: message,
            dictionary_data: null,
            events: null
          });
          console.log("MESSAGE DEBUG [USER]:", { userMessageSaved: !msgError, databaseErrorCode: msgError?.code || null });
        }
      }

      // Construct conversation for Groq
      let conversation: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...historyMessages,
        { role: "user", content: message }
      ];

      let iterations = 0;
      const MAX_ITERATIONS = 3;
      let finalResponse = "";
      let dictionaryData: DictionaryResult | null = null;
      let events: any[] = [];

      // The Agentic Loop
      while (iterations < MAX_ITERATIONS) {
        iterations++;
        
        let responseMessage = await callGroqChatCompletion(groqApiKey, conversation);

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          conversation.push(responseMessage);
          
          for (const toolCall of responseMessage.tool_calls) {
            if (toolCall.function.name === "dictionary_lookup") {
              let args;
              try {
                args = JSON.parse(toolCall.function.arguments);
              } catch (e) {
                conversation.push({
                  tool_call_id: toolCall.id,
                  role: "tool",
                  name: "dictionary_lookup",
                  content: JSON.stringify({ error: "Invalid tool arguments" }),
                });
                events.push({ type: "tool_result", tool: "dictionary_lookup", success: false });
                continue;
              }

              events.push({ type: "tool_call", tool: "dictionary_lookup", input: args.word });

              const dictResult = await dictionary_lookup(args.word);
              
              if (!("error" in dictResult)) {
                dictionaryData = dictResult as DictionaryResult;
                events.push({ type: "tool_result", tool: "dictionary_lookup", success: true });
              } else {
                events.push({ type: "tool_result", tool: "dictionary_lookup", success: false, error: (dictResult as any).error });
              }

              conversation.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: "dictionary_lookup",
                content: JSON.stringify(dictResult),
              });
            } else {
              conversation.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: toolCall.function.name,
                content: JSON.stringify({ error: "Tool not found or not permitted" }),
              });
            }
          }
        } else {
          finalResponse = responseMessage.content;
          break;
        }
      }

      if (!finalResponse) {
        finalResponse = "I am having trouble retrieving that information right now. Please try again.";
      }

      // Persist word history if there is a successful dictionary lookup
      if (authenticatedUser && dictionaryData) {
        try {
          const normalizedWord = dictionaryData.word.trim().toLowerCase();
          
          // Fetch existing to get lookup_count and first_seen_at
          const { data: existing, error: selectError } = await supabaseClient
            .from('word_history')
            .select('lookup_count, first_seen_at')
            .eq('user_id', authenticatedUser.id)
            .eq('word', normalizedWord)
            .maybeSingle();
            
          if (selectError && selectError.code !== 'PGRST116') {
             console.error("Word history lookup failed:", selectError.message);
          }
          
          const newLookupCount = existing ? existing.lookup_count + 1 : 1;
          const firstSeenAt = existing ? existing.first_seen_at : new Date().toISOString();

          const { error: upsertError } = await supabaseClient
            .from('word_history')
            .upsert(
              {
                user_id: authenticatedUser.id,
                word: normalizedWord,
                dictionary_data: dictionaryData,
                lookup_count: newLookupCount,
                first_seen_at: firstSeenAt,
                last_seen_at: new Date().toISOString()
              },
              { onConflict: 'user_id, word' }
            );

          if (upsertError) {
            console.error("Failed to upsert word history:", upsertError.code);
          } else {
            console.log("WORD HISTORY DEBUG:", { wordHistoryUpserted: true, word: normalizedWord, lookupCount: newLookupCount });
          }
        } catch (err) {
          console.error("Unexpected error persisting word history:", err);
        }
      }

      // Persist assistant response
      if (authenticatedUser && conversationId) {
        const { error: asstMsgError } = await supabaseClient.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: finalResponse,
          dictionary_data: dictionaryData,
          events: events.length > 0 ? events : null
        });
        console.log("MESSAGE DEBUG [ASSISTANT]:", { assistantMessageSaved: !asstMsgError, databaseErrorCode: asstMsgError?.code || null });
        
        // Touch updated_at (or let Postgres trigger handle it, but we can do a manual update just in case)
        await supabaseClient.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
      }

      return new Response(JSON.stringify({
        success: true,
        response: finalResponse,
        sessionId: safeSessionId,
        dictionary: dictionaryData,
        events: events
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err: any) {
      console.error('Edge Function Error:', err);
      return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
