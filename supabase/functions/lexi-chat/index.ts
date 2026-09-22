import "@supabase/functions-js/edge-runtime.d.ts";
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

      let conversation: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ];

      let iterations = 0;
      const MAX_ITERATIONS = 3;
      
      let finalResponse = "";
      let dictionaryData: DictionaryResult | null = null;
      let events: any[] = [];

      // The Agentic Loop
      // We repeatedly call the model until it stops asking for tools or hits the iteration limit.
      while (iterations < MAX_ITERATIONS) {
        iterations++;
        
        let responseMessage = await callGroqChatCompletion(groqApiKey, conversation);

        // If the model wants to call a tool
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          // Add the assistant's tool_call request to the conversation history
          conversation.push(responseMessage);
          
          for (const toolCall of responseMessage.tool_calls) {
            
            // Only allow the explicitly permitted dictionary_lookup tool
            if (toolCall.function.name === "dictionary_lookup") {
              let args;
              try {
                args = JSON.parse(toolCall.function.arguments);
              } catch (e) {
                // If arguments are invalid, tell the model it failed so it can gracefully recover
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

              // Execute the actual tool
              const dictResult = await dictionary_lookup(args.word);
              
              if (!("error" in dictResult)) {
                dictionaryData = dictResult as DictionaryResult;
                events.push({ type: "tool_result", tool: "dictionary_lookup", success: true });
              } else {
                events.push({ type: "tool_result", tool: "dictionary_lookup", success: false });
              }

              // Append the tool result back into the conversation for the model to read
              conversation.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: "dictionary_lookup",
                content: JSON.stringify(dictResult),
              });
            } else {
              // The model hallucinated a tool we didn't give it. Tell it the tool doesn't exist.
              conversation.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: toolCall.function.name,
                content: JSON.stringify({ error: "Tool not found or not permitted" }),
              });
            }
          }
        } else {
          // The model returned a normal text response (no tool calls). The loop is done.
          finalResponse = responseMessage.content;
          break;
        }
      }

      // If the loop maxed out without a final text response, handle gracefully
      if (!finalResponse) {
        finalResponse = "I am having trouble retrieving that information right now. Please try again.";
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
