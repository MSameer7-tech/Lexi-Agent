import * as fs from 'fs';
let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');

content = content.replace("import { fetchThesaurusTest } from \"./test-thesaurus-temp.ts\";\n", "");

// Let's just use regex to remove the test_thesaurus block
content = content.replace(/case 'test_thesaurus':[\s\S]*?case 'save_word':/, "case 'save_word':");

// Re-secure the auth check
content = content.replace(
  "if (!authenticatedUser && action !== 'test_thesaurus') {",
  "if (!authenticatedUser) {"
);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
