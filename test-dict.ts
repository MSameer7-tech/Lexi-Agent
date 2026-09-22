import { dictionary_lookup } from "./supabase/functions/lexi-chat/tools/dictionary.ts";

async function runTests() {
  const words = ["pragmatic", "serendipity", "ephemeral", "xyzqwertyabc"];
  
  for (const word of words) {
    console.log(`\n=== Testing: ${word} ===`);
    const result = await dictionary_lookup(word);
    console.log(JSON.stringify(result, null, 2));
  }
}

runTests();
