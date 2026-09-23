import * as fs from 'fs';
let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');

const target = "import { saveWord, removeSavedWord, isWordSaved, getSavedWords, getWordHistory } from \"./saved_words.ts\";";
const newTarget = target + "\nimport { fetchThesaurusTest } from \"./test-thesaurus-temp.ts\";";

content = content.replace(target, newTarget);

content = content.replace(
  "switch (action) {",
  "switch (action) {\n            case 'test_thesaurus':\n              const data = await fetchThesaurusTest(word);\n              return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });"
);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
