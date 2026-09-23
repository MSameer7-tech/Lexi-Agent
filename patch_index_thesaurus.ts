import * as fs from 'fs';

let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');

if (!content.includes('import { thesaurus_lookup')) {
  content = content.replace(
    'import { dictionary_lookup, DictionaryResult } from "./tools/dictionary.ts";',
    'import { dictionary_lookup, DictionaryResult } from "./tools/dictionary.ts";\nimport { thesaurus_lookup } from "./tools/thesaurus.ts";'
  );
}

const targetBlock = `              events.push({ type: "tool_call", tool: "dictionary_lookup", input: args.word });

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
              });`;

const replacementBlock = `              events.push({ type: "tool_call", tool: "dictionary_lookup", input: args.word });
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
              });`;

content = content.replace(targetBlock, replacementBlock);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
