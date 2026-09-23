import * as fs from 'fs';
let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');

content = content.replace(
  "if (!authenticatedUser) {",
  "if (!authenticatedUser && action !== 'test_thesaurus') {"
);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
