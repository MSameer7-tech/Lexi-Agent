import { supabase } from '../lib/supabase';
export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  sessionId: string;
  dictionary?: any | null;
  events?: any[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function sendMessage(request: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch(`${SUPABASE_URL}/functions/v1/lexi-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Network response was not ok. Status: ${res.status}`);
    }

    const data = await res.json();
    
    // Ensure we have a valid response structure
    if (!data || typeof data.response !== 'string') {
      throw new Error('Invalid or empty response format received from LexiAgent Edge Function.');
    }
    
    return {
      success: data.success,
      response: data.response,
      sessionId: data.sessionId || request.sessionId,
      dictionary: data.dictionary || null,
      events: data.events || [],
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
    } else {
      console.error('LexiAgent API Error:', error);
    }
    throw error;
  }
}


// --- VOCABULARY API ---

async function fetchVocabularyApi(payload: any, signal?: AbortSignal) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const res = await fetch(`${SUPABASE_URL}/functions/v1/lexi-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error(`Network response was not ok. Status: ${res.status}`);
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


export async function getConversations() {
  return fetchVocabularyApi({ action: 'get_conversations' });
}

export async function getConversationMessages(sessionId: string) {
  return fetchVocabularyApi({ action: 'get_messages', sessionId });
}
