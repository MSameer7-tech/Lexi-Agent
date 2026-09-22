import "@supabase/functions-js/edge-runtime.d.ts";
import { callGroqChatCompletion } from "./groq.ts";
import { SYSTEM_PROMPT } from "./prompts/system.ts";

export default {
  fetch: async (req: Request) => {
    // 1. CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // 2. Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      // 3. Ensure it's a POST request
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 4. Parse JSON
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

      // 5. Validate message
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return new Response(JSON.stringify({ success: false, error: "Message is required" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const safeSessionId = sessionId || crypto.randomUUID();

      // 6. Get Groq API Key
      const groqApiKey = Deno.env.get('GROQ_API_KEY');
      if (!groqApiKey) {
        console.error("GROQ_API_KEY environment variable is not set");
        return new Response(JSON.stringify({ success: false, error: "Internal Configuration Error" }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 7. Call Groq
      const aiResponse = await callGroqChatCompletion(groqApiKey, SYSTEM_PROMPT, message);

      // 8. Return response
      return new Response(JSON.stringify({
        success: true,
        response: aiResponse,
        sessionId: safeSessionId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err: any) {
      console.error('Edge Function Error:', err);
      // Don't expose raw internal errors directly to the client
      return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
