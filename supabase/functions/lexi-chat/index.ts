import "@supabase/functions-js/edge-runtime.d.ts";

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
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 4. Parse JSON
      let body;
      try {
        body = await req.json();
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { message, sessionId } = body;

      // 5. Validate message
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return new Response(JSON.stringify({ error: "Missing or invalid 'message' parameter" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const safeSessionId = sessionId || crypto.randomUUID();

      // 6. Return dummy JSON response
      return new Response(JSON.stringify({
        success: true,
        message: "LexiAgent serverless endpoint is working",
        sessionId: safeSessionId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err: any) {
      console.error('Edge Function Error:', err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
