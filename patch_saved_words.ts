import * as fs from 'fs';

let content = fs.readFileSync('supabase/functions/lexi-chat/saved_words.ts', 'utf8');

if (!content.includes('export async function getWordHistory')) {
  content += `

/**
 * Retrieves the word history for the authenticated user, ordered chronologically.
 */
export async function getWordHistory(
  supabaseClient: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabaseClient
    .from('word_history')
    .select('*')
    .eq('user_id', userId)
    .order('last_seen_at', { ascending: false });
    
  if (error) {
    console.error("getWordHistory Error:", error.code);
    throw new Error("Failed to retrieve word history");
  }
  
  return { word_history: data };
}
`;
}

fs.writeFileSync('supabase/functions/lexi-chat/saved_words.ts', content);

let indexContent = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');
if (!indexContent.includes('getWordHistory')) {
  indexContent = indexContent.replace(
    'import { saveWord, removeSavedWord, isWordSaved, getSavedWords } from "./saved_words.ts";',
    'import { saveWord, removeSavedWord, isWordSaved, getSavedWords, getWordHistory } from "./saved_words.ts";'
  );
  
  indexContent = indexContent.replace(
    `case 'get_saved':
              const getResult = await getSavedWords(supabaseClient, authenticatedUser.id);
              return new Response(JSON.stringify(getResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });`,
    `case 'get_saved':
              const getResult = await getSavedWords(supabaseClient, authenticatedUser.id);
              return new Response(JSON.stringify(getResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            case 'get_history':
              const historyResult = await getWordHistory(supabaseClient, authenticatedUser.id);
              return new Response(JSON.stringify(historyResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });`
  );
}

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', indexContent);
