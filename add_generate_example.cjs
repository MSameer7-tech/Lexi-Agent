const fs = require('fs');
let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf-8');

const target = "            case 'get_conversations': {";
const replacement = `            case 'generate_example': {
              const targetWord = body.word;
              if (!targetWord) throw new Error("Missing word");
              const groqKey = Deno.env.get('GROQ_API_KEY');
              if (!groqKey) throw new Error("Internal Configuration Error");

              const prompt = \`You are an expert lexicographer. Write a single, elegant example sentence using the word "\${targetWord}". The sentence should clearly demonstrate the meaning of the word in a natural context. Do not include definitions, quotes, or extra text. Respond ONLY with the sentence.\`;
              const groqResponse = await callGroqChatCompletion(groqKey, [
                { role: "system", content: prompt },
                { role: "user", content: \`Write an example sentence for \${targetWord}\` }
              ]);

              let example = groqResponse.content?.trim() || "";
              // clean up wrapping quotes if present
              example = example.replace(/^["']|["']$/g, '');

              return new Response(JSON.stringify({ success: true, example }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'get_conversations': {`;

content = content.replace(target, replacement);
fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
console.log('Added generate_example action');
