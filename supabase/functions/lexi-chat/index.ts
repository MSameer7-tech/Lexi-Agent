import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callGroqChatCompletion } from "./groq.ts";
import { SYSTEM_PROMPT } from "./prompts/system.ts";
import { dictionary_lookup, DictionaryResult } from "./tools/dictionary.ts";
import { thesaurus_lookup } from "./tools/thesaurus.ts";
import { saveWord, removeSavedWord, isWordSaved, getSavedWords, getWordHistory } from "./saved_words.ts";

const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 50; // 50 requests per minute per user/ip in this isolate
  let requests = rateLimitMap.get(identifier) || [];
  requests = requests.filter(time => now - time < windowMs);
  if (requests.length >= maxRequests) {
    rateLimitMap.set(identifier, requests);
    return false;
  }
  requests.push(now);
  rateLimitMap.set(identifier, requests);
  return true;
}

export default {
  fetch: async (req: Request) => {
    const allowedOrigin = Deno.env.get('CORS_ALLOWED_ORIGIN') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
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

      const action = body.action;
      const word = body.word ? String(body.word).trim().substring(0, 100) : undefined;
      const note = body.note ? String(body.note).trim().substring(0, 500) : undefined;
      const dictionary_data = body.dictionary_data;
      const message = body.message ? String(body.message).trim().substring(0, 5000) : undefined;
      const sessionId = body.sessionId ? String(body.sessionId) : undefined;

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
            
            case 'get_conversations': {
              const limit = Math.max(1, Math.min(Number(body.limit) || 30, 100));
              const cursor = body.cursor || null;
              const search = body.search ? String(body.search).trim().substring(0, 200) : null;
              
              const { data: convs, error: convErr } = await supabaseClient
                .rpc('get_conversations_page', {
                  p_limit: limit + 1, // Fetch one extra to determine hasMore
                  p_cursor_pinned: cursor?.pinned ?? null,
                  p_cursor_updated_at: cursor?.updatedAt ?? null,
                  p_cursor_id: cursor?.id ?? null,
                  p_search: search
                });
                
              if (convErr) throw convErr;
              
              const hasMore = (convs || []).length > limit;
              const results = hasMore ? convs.slice(0, limit) : convs;
              let nextCursor = null;
              if (hasMore) {
                const last = results[results.length - 1];
                nextCursor = { pinned: last.is_pinned, updatedAt: last.updated_at, id: last.id };
              }
              
              const formattedConvs = (results || []).map((c: any) => ({
                id: c.id,
                session_id: c.session_id,
                title: c.title,
                preview: c.preview || '',
                created_at: c.created_at,
                updated_at: c.updated_at,
                is_pinned: c.is_pinned || false
              }));
              
              return new Response(JSON.stringify({ conversations: formattedConvs, hasMore, nextCursor }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'rename_conversation': {
              if (!sessionId) throw new Error("Missing sessionId");
              const newTitle = body.title?.trim();
              if (!newTitle) throw new Error("Title is required");
              
              const titleToSave = newTitle.substring(0, 100); // Enforce max 100 chars
              
              const { data: updatedConv, error: renameErr } = await supabaseClient
                .from('conversations')
                .update({ title: titleToSave, updated_at: new Date().toISOString() })
                .eq('session_id', sessionId)
                .eq('user_id', authenticatedUser.id)
                .select()
                .single();
                
              if (renameErr) throw renameErr;
              return new Response(JSON.stringify({ success: true, conversation: updatedConv }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            
            case 'toggle_pin_conversation': {
              if (!sessionId) throw new Error("Missing sessionId");
              
              // First fetch current state to toggle
              const { data: currState } = await supabaseClient
                .from('conversations')
                .select('is_pinned')
                .eq('session_id', sessionId)
                .eq('user_id', authenticatedUser.id)
                .single();
                
              if (!currState) throw new Error("Conversation not found");
              
              const newPinState = !currState.is_pinned;
              
              const { data: pinnedConv, error: pinErr } = await supabaseClient
                .from('conversations')
                .update({ is_pinned: newPinState, updated_at: new Date().toISOString() })
                .eq('session_id', sessionId)
                .eq('user_id', authenticatedUser.id)
                .select()
                .single();
                
              if (pinErr) throw pinErr;
              return new Response(JSON.stringify({ success: true, isPinned: pinnedConv.is_pinned }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'get_messages': {
              if (!sessionId) throw new Error("Missing sessionId");
              const limit = Math.max(1, Math.min(Number(body.limit) || 50, 100));
              const cursor = body.cursor || null;
              
              const { data: messagesData, error: messagesErr } = await supabaseClient
                .rpc('get_messages_page', {
                  p_session_id: sessionId,
                  p_limit: limit + 1,
                  p_cursor_created_at: cursor?.createdAt ?? null,
                  p_cursor_id: cursor?.id ?? null
                });
                
              if (messagesErr) throw messagesErr;
              
              const hasMore = (messagesData || []).length > limit;
              const results = hasMore ? messagesData.slice(0, limit) : messagesData;
              let nextCursor = null;
              if (hasMore) {
                const last = results[results.length - 1];
                nextCursor = { createdAt: last.created_at, id: last.id };
              }
              
              return new Response(JSON.stringify({ messages: results, hasMore, nextCursor }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'delete_conversation': {
              if (!sessionId) throw new Error("Missing sessionId");
              // Verify ownership: find conversation by session_id AND user_id
              const { data: convToDelete } = await supabaseClient
                .from('conversations')
                .select('id')
                .eq('session_id', sessionId)
                .eq('user_id', authenticatedUser.id)
                .maybeSingle();
              
              if (!convToDelete) {
                return new Response(JSON.stringify({ success: false, error: "Conversation not found" }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
              }

              // Delete conversation — messages cascade-delete via FK constraint
              const { error: deleteErr } = await supabaseClient
                .from('conversations')
                .delete()
                .eq('id', convToDelete.id)
                .eq('user_id', authenticatedUser.id);
              
              if (deleteErr) throw deleteErr;

              return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            default:
              return new Response(JSON.stringify({ success: false, error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        } catch (error: any) {
          console.error("Vocabulary API Error:", error);
          return new Response(JSON.stringify({ success: false, error: error.message || String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
            historyMessages = msgsData.reverse().map((m: any) => ({
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
              events.push({ type: "tool_call", tool: "thesaurus_lookup", input: args.word });

              // Fetch both dictionary and thesaurus concurrently
              const [dictResult, thesResult] = await Promise.all([
                dictionary_lookup(args.word),
                thesaurus_lookup(args.word)
              ]);
              
              // Handle dictionary result
              let combinedResult: any = dictResult;
              if (!("error" in dictResult)) {
                dictionaryData = dictResult as DictionaryResult;
                events.push({ type: "tool_result", tool: "dictionary_lookup", success: true });
                
                // Initialize synonyms/antonyms arrays if they don't exist
                if (!dictionaryData.synonyms) dictionaryData.synonyms = [];
                if (!dictionaryData.antonyms) dictionaryData.antonyms = [];
                
                // Handle thesaurus result
                if (!("error" in thesResult)) {
                  events.push({ type: "tool_result", tool: "thesaurus_lookup", success: true });
                  
                  // Merge synonyms and antonyms without duplicates
                  const mergedSynonyms = new Set([...dictionaryData.synonyms, ...thesResult.synonyms]);
                  const mergedAntonyms = new Set([...dictionaryData.antonyms, ...thesResult.antonyms]);
                  
                  dictionaryData.synonyms = Array.from(mergedSynonyms);
                  dictionaryData.antonyms = Array.from(mergedAntonyms);
                  
                  combinedResult = dictionaryData;
                } else {
                  events.push({ type: "tool_result", tool: "thesaurus_lookup", success: false, error: (thesResult as any).error });
                }
              } else {
                events.push({ type: "tool_result", tool: "dictionary_lookup", success: false, error: (dictResult as any).error });
                
                // If dictionary failed, we still log thesaurus failure/success so events align
                if (!("error" in thesResult)) {
                  events.push({ type: "tool_result", tool: "thesaurus_lookup", success: true });
                  // If we ONLY got a thesaurus result (extremely rare), we don't save it to dictionaryData 
                  // to avoid breaking the expected schema which requires definitions.
                  // We just pass it to the LLM.
                  combinedResult = { ...dictResult, thesaurus_fallback: thesResult };
                } else {
                  events.push({ type: "tool_result", tool: "thesaurus_lookup", success: false, error: (thesResult as any).error });
                }
              }

              conversation.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: "dictionary_lookup",
                content: JSON.stringify(combinedResult),
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
