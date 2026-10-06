const fs = require('fs');
let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf-8');

// Replace the WOTD block
const targetStr = `            case 'get_word_of_the_day': {
              const today = new Date().toISOString().split('T')[0];
              const { data: wotdData } = await supabaseClient
                .from('word_of_the_day')
                .select('word, dictionary_data')
                .eq('date', today)
                .maybeSingle();

              if (wotdData && wotdData.word && wotdData.dictionary_data) {
                return new Response(JSON.stringify({ success: true, word: wotdData.word, dictionary: wotdData.dictionary_data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
              }

              let newWord = wotdData?.word;
              let dictionaryData = null;

              // If a word exists, try to get its dictionary data
              if (newWord && !wotdData.dictionary_data) {
                const dictResult = await dictionary_lookup(newWord);
                if (!("error" in dictResult)) {
                  dictionaryData = dictResult;
                }
              }

              // If we still don't have a valid word + dictionary data, find a new one
              if (!newWord || !dictionaryData) {
                const groqKey = Deno.env.get('GROQ_API_KEY');
                if (!groqKey) throw new Error("Internal Configuration Error");

                const fallbackWords = ["ephemeral", "serendipity", "petrichor", "halcyon", "eloquent", "liminal", "ethereal", "sonder", "mellifluous", "ineffable", "luminescence", "perspicacious", "resilience", "tenacious", "sagacious", "luminous", "vicarious", "quintessential"];
                
                let attempts = 0;
                while (!dictionaryData && attempts < 3) {
                  let candidateWord = "";
                  if (attempts === 2) {
                     // On final attempt, pick from safe fallback list
                     const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
                     candidateWord = fallbackWords[dayOfYear % fallbackWords.length];
                  } else {
                     const prompt = "You are a vocabulary expert. Select a beautiful, highly useful, advanced English word (e.g., GRE/SAT level, eloquent, poetic). It MUST be a standard word that exists in the Merriam-Webster dictionary. Do NOT pick ultra-obscure, medical, or highly technical terms. Respond ONLY with the single word in lowercase, with no punctuation.";
                     const groqResponse = await callGroqChatCompletion(groqKey, [
                       { role: "system", content: prompt },
                       { role: "user", content: \`Give me a beautiful, valid dictionary word for \${today}\` }
                     ]);
                     candidateWord = groqResponse.content?.trim().toLowerCase().replace(/[^a-z]/g, '') || "serendipity";
                  }

                  const dictResult = await dictionary_lookup(candidateWord);
                  if (!("error" in dictResult)) {
                     newWord = candidateWord;
                     dictionaryData = dictResult;
                     break;
                  }
                  attempts++;
                }
              }

              if (!wotdData) {
                // Insert new row
                await supabaseClient.from('word_of_the_day').insert({ date: today, word: newWord, dictionary_data: dictionaryData });
              } else if (newWord !== wotdData.word || (!wotdData.dictionary_data && dictionaryData)) {
                // Overwrite the bad word or missing dictionary data
                await supabaseClient.from('word_of_the_day')
                  .update({ word: newWord, dictionary_data: dictionaryData })
                  .eq('date', today);
              }
              
              return new Response(JSON.stringify({ success: true, word: newWord, dictionary: dictionaryData }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }`;

const replacement = `            case 'get_word_of_the_day': {
              const today = new Date().toISOString().split('T')[0];
              
              // We MUST use the service role key to bypass RLS, so every user sees the exact same global Word of the Day
              const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
              const adminClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : supabaseClient;

              const { data: wotdData } = await adminClient
                .from('word_of_the_day')
                .select('word, dictionary_data')
                .eq('date', today)
                .maybeSingle();

              if (wotdData && wotdData.word && wotdData.dictionary_data) {
                return new Response(JSON.stringify({ success: true, word: wotdData.word, dictionary: wotdData.dictionary_data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
              }

              let newWord = wotdData?.word;
              let dictionaryData = null;

              // If a word exists, try to get its dictionary data
              if (newWord && !wotdData.dictionary_data) {
                const dictResult = await dictionary_lookup(newWord);
                if (!("error" in dictResult)) {
                  dictionaryData = dictResult;
                }
              }

              // If we still don't have a valid word + dictionary data, find a new one
              if (!newWord || !dictionaryData) {
                const groqKey = Deno.env.get('GROQ_API_KEY');
                if (!groqKey) throw new Error("Internal Configuration Error");

                const fallbackWords = ["ephemeral", "serendipity", "petrichor", "halcyon", "eloquent", "liminal", "ethereal", "sonder", "mellifluous", "ineffable", "luminescence", "perspicacious", "resilience", "tenacious", "sagacious", "luminous", "vicarious", "quintessential", "recalcitrant", "obfuscate", "alacrity", "pellucid", "sycophant", "solipsistic", "phosphenes"];
                
                let attempts = 0;
                while (!dictionaryData && attempts < 3) {
                  let candidateWord = "";
                  if (attempts === 2) {
                     // On final attempt, pick from safe fallback list
                     const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
                     candidateWord = fallbackWords[(dayOfYear + Math.floor(Math.random() * 10)) % fallbackWords.length];
                  } else {
                     // Instruct Groq with a random seed category to ensure variety every single time
                     const themes = ["nature", "emotions", "light and darkness", "time", "philosophy", "intelligence", "courage", "mystery", "sound and music", "architecture", "the cosmos", "human connection"];
                     const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                     
                     const prompt = "You are a master lexicographer. Select a beautiful, highly useful, advanced English word (e.g., GRE/SAT level, eloquent, poetic). It MUST be a standard word that exists in the Merriam-Webster dictionary. Do NOT pick ultra-obscure, medical, or highly technical terms. Respond ONLY with the single word in lowercase, with no punctuation or explanation.";
                     const groqResponse = await callGroqChatCompletion(groqKey, [
                       { role: "system", content: prompt },
                       { role: "user", content: \`Give me a beautiful, valid dictionary word related to the theme of "\${randomTheme}". Random seed: \${Math.random()}\` }
                     ]);
                     
                     // Clean up the output aggressively in case Groq chatters
                     let rawResponse = groqResponse.content?.trim().toLowerCase() || "";
                     // If it returned a sentence like "the word is ephemeral", extract the last word
                     if (rawResponse.includes(' ')) {
                         const parts = rawResponse.split(' ');
                         rawResponse = parts[parts.length - 1];
                     }
                     candidateWord = rawResponse.replace(/[^a-z]/g, '') || fallbackWords[0];
                  }

                  const dictResult = await dictionary_lookup(candidateWord);
                  if (!("error" in dictResult)) {
                     newWord = candidateWord;
                     dictionaryData = dictResult;
                     break;
                  }
                  attempts++;
                }
              }

              if (!wotdData) {
                // Insert new row
                await adminClient.from('word_of_the_day').insert({ date: today, word: newWord, dictionary_data: dictionaryData });
              } else if (newWord !== wotdData.word || (!wotdData.dictionary_data && dictionaryData)) {
                // Overwrite the bad word or missing dictionary data
                await adminClient.from('word_of_the_day')
                  .update({ word: newWord, dictionary_data: dictionaryData })
                  .eq('date', today);
              }
              
              return new Response(JSON.stringify({ success: true, word: newWord, dictionary: dictionaryData }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
console.log('Fixed WOTD logic for true global state and variance');
