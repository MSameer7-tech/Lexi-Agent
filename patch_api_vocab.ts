import * as fs from 'fs';

let content = fs.readFileSync('src/services/lexiAgentApi.ts', 'utf8');

if (!content.includes('export async function saveWord')) {
  content += `

// --- VOCABULARY API ---

async function fetchVocabularyApi(payload: any, signal?: AbortSignal) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const res = await fetch(\`\${SUPABASE_URL}/functions/v1/lexi-chat\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error(\`Network response was not ok. Status: \${res.status}\`);
  }
  return res.json();
}

export async function saveWord(word: string, dictionaryData: any) {
  return fetchVocabularyApi({ action: 'save_word', word, dictionary_data: dictionaryData });
}

export async function removeSavedWord(word: string) {
  return fetchVocabularyApi({ action: 'remove_word', word });
}

export async function isWordSaved(word: string) {
  return fetchVocabularyApi({ action: 'is_saved', word });
}

export async function getSavedWords() {
  return fetchVocabularyApi({ action: 'get_saved' });
}

export async function getWordHistory() {
  return fetchVocabularyApi({ action: 'get_history' });
}
`;
}

fs.writeFileSync('src/services/lexiAgentApi.ts', content);
