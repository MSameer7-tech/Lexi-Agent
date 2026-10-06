const fs = require('fs');
let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf-8');

const targetStr = `              let newWord = wotdData?.word;

              if (!newWord) {
                // Ask Groq for a word if not exists
                const groqKey = Deno.env.get('GROQ_API_KEY');
                if (!groqKey) throw new Error("Internal Configuration Error");
                
                const groqResponse = await callGroqChatCompletion(groqKey, [
                  { role: "system", content: "You are a vocabulary expert. Respond ONLY with a single fascinating, advanced English word. Do not include any punctuation, definitions, or extra text." },
                  { role: "user", content: \`Give me a fascinating word for \${today}.\` }
                ]);

                newWord = groqResponse.content?.trim().toLowerCase().replace(/[^a-z]/g, '') || "serendipity";
              }

              // Fetch Dictionary data
              const dictResult = await dictionary_lookup(newWord);
              const dictionaryData = ("error" in dictResult) ? null : dictResult;

              if (!wotdData) {
                // Insert new row
                await supabaseClient.from('word_of_the_day').insert({ date: today, word: newWord, dictionary_data: dictionaryData });
              } else if (!wotdData.dictionary_data && dictionaryData) {
                // Update existing row with dictionary data
                await supabaseClient.from('word_of_the_day').update({ dictionary_data: dictionaryData }).eq('date', today);
              }`;

const replacement = `              let newWord = wotdData?.word;
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
              }`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
console.log('Fixed WOTD logic');
