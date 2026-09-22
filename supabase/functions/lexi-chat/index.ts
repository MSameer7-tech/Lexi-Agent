import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const SYSTEM_PROMPT = `You are LexiAgent, a highly sophisticated, editorial digital lexicon.
Your goal is to define words beautifully and clearly, acting as an erudite but accessible dictionary.

When a user asks about a word, you MUST use the \`dictionary_lookup\` tool to get the factual definition.
Once you have the definition, you must format your response EXACTLY as follows:

word (part_of_speech)
Pronunciation: /phonetic/

Definition
1. First factual definition here.
   Example: "A contextual sentence using the word."
2. Second factual definition here (if available).
   Example: "Another sentence."

Synonyms: word1, word2, word3
Antonyms: word4, word5

Important rules:
- Always preserve the EXACT structure above (including "Definition", "Synonyms:", "Antonyms:").
- Do NOT add conversational filler like "Here is the definition of..." just output the structured dictionary format.
- Do NOT use markdown bold/italics for the headings. Just write them as plain text like the template.
- If the word is not found, apologize gracefully in an editorial tone.
- If the user asks a follow-up question (not a direct word lookup), you may answer conversationally in a refined tone without the dictionary formatting.
`;

const tools = [
  {
    type: "function",
    function: {
      name: "dictionary_lookup",
      description: "Lookup a word in the factual dictionary.",
      parameters: {
        type: "object",
        properties: {
          word: {
            type: "string",
            description: "The word to look up (e.g. serendipity)",
          },
        },
        required: ["word"],
      },
    },
  },
];

async function callGroq(messages: any[]) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.2,
    }),
  });
  
  if (!res.ok) {
    throw new Error(`Groq error: ${res.status} ${await res.text()}`);
  }
  
  return res.json();
}

async function lookupWord(word: string) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) {
      return { error: "Word not found in dictionary API." };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { error: "Dictionary API request failed." };
  }
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req: Request, ctx: any) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { message, sessionId } = await req.json();

      if (!message) {
        return new Response(JSON.stringify({ error: "Missing message parameter" }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY environment variable is not set.");
      }

      let conversation = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ];

      // Step 1: Initial call to Groq
      let groqResponse = await callGroq(conversation);
      let responseMessage = groqResponse.choices[0].message;

      // Step 2: Handle potential Tool Calls
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        conversation.push(responseMessage);
        
        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.function.name === "dictionary_lookup") {
            const args = JSON.parse(toolCall.function.arguments);
            const dictionaryData = await lookupWord(args.word);
            
            conversation.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "dictionary_lookup",
              content: JSON.stringify(dictionaryData),
            });
          }
        }
        
        // Step 3: Get final synthesized response
        groqResponse = await callGroq(conversation);
        responseMessage = groqResponse.choices[0].message;
      }

      return new Response(JSON.stringify({
        response: responseMessage.content,
        sessionId: sessionId || crypto.randomUUID(),
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (err: any) {
      console.error(err);
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }),
};
