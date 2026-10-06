const fs = require('fs');
let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf-8');

const targetStr = `              if (wotdData && wotdData.word && wotdData.dictionary_data) {
                return new Response(JSON.stringify({ success: true, word: wotdData.word, dictionary: wotdData.dictionary_data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
              }`;

const replacement = `              const backgroundCards = ['ephemeral', 'petrichor', 'halcyon', 'eloquent', 'liminal', 'ethereal', 'serendipity'];
              
              if (wotdData && wotdData.word && wotdData.dictionary_data && !backgroundCards.includes(wotdData.word)) {
                return new Response(JSON.stringify({ success: true, word: wotdData.word, dictionary: wotdData.dictionary_data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
              }`;

content = content.replace(targetStr, replacement);

const targetStr2 = `const fallbackWords = ["ephemeral", "serendipity", "petrichor", "halcyon", "eloquent", "liminal", "ethereal", "sonder", "mellifluous", "ineffable", "luminescence", "perspicacious", "resilience", "tenacious", "sagacious", "luminous", "vicarious", "quintessential", "recalcitrant", "obfuscate", "alacrity", "pellucid", "sycophant", "solipsistic", "phosphenes"];`;
const replacement2 = `const fallbackWords = ["sonder", "mellifluous", "ineffable", "luminescence", "perspicacious", "resilience", "tenacious", "sagacious", "luminous", "vicarious", "quintessential", "recalcitrant", "obfuscate", "alacrity", "pellucid", "sycophant", "solipsistic", "phosphenes", "defenestration", "magnanimous", "fastidious", "clandestine", "cacophony", "euphemism"];`;

content = content.replace(targetStr2, replacement2);

const targetStr3 = `const prompt = "You are a master lexicographer. Select a beautiful, highly useful, advanced English word (e.g., GRE/SAT level, eloquent, poetic). It MUST be a standard word that exists in the Merriam-Webster dictionary. Do NOT pick ultra-obscure, medical, or highly technical terms. Respond ONLY with the single word in lowercase, with no punctuation or explanation.";`;
const replacement3 = `const prompt = "You are a master lexicographer. Select a beautiful, highly useful, advanced English word. It MUST exist in the Merriam-Webster dictionary. Do NOT use any of these words: ephemeral, petrichor, halcyon, eloquent, liminal, ethereal, serendipity. Respond ONLY with the single word in lowercase, with no punctuation.";`;

content = content.replace(targetStr3, replacement3);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
console.log('Fixed background card collision');
