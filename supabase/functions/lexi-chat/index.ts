import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callGroqChatCompletion } from "./groq.ts";
import { SYSTEM_PROMPT } from "./prompts/system.ts";
import { dictionary_lookup, DictionaryResult } from "./tools/dictionary.ts";

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

      const { message, sessionId } = body;

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

      // Supabase Client Initialization for Persistence
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      const authHeader = req.headers.get('Authorization');
      
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
      }

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
