import * as fs from 'fs';

let content = fs.readFileSync('supabase/functions/lexi-chat/tools/thesaurus.ts', 'utf8');

content = content.replace(
  `    let data;
    try {
      data = await response.json();
    } catch (err) {
      return { error: "Thesaurus returned malformed response" };
    }`,
  `    const textResponse = await response.text();
    if (textResponse.includes('Invalid API key') || textResponse.includes('Not subscribed')) {
      console.error("MW Thesaurus Subscription Error: Key is invalid or not subscribed to the Thesaurus API.");
      return { error: "Thesaurus API key is invalid or lacks subscription" };
    }

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (err) {
      return { error: "Thesaurus returned malformed response" };
    }`
);

fs.writeFileSync('supabase/functions/lexi-chat/tools/thesaurus.ts', content);
