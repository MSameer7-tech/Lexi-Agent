import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { DictionaryResult } from "./tools/dictionary.ts";

/**
 * Saves a word to the vocabulary library for the authenticated user.
 */
export async function saveWord(
  supabaseClient: SupabaseClient, 
  userId: string, 
  word: string, 
  dictionaryData: DictionaryResult,
  note: string | null = null
) {
  const normalizedWord = word.trim().toLowerCase();
  
  const { error } = await supabaseClient
    .from('saved_words')
    .upsert(
      {
        user_id: userId,
        word: normalizedWord,
        dictionary_data: dictionaryData,
        note: note
      },
      { onConflict: 'user_id, word' }
    );
    
  if (error) {
    console.error("saveWord Error:", error.code);
    throw new Error("Failed to save word");
  }
  
  return { success: true };
}

/**
 * Removes a word from the vocabulary library.
 */
export async function removeSavedWord(
  supabaseClient: SupabaseClient,
  userId: string,
  word: string
) {
  const normalizedWord = word.trim().toLowerCase();
  
  const { error } = await supabaseClient
    .from('saved_words')
    .delete()
    .eq('user_id', userId)
    .eq('word', normalizedWord);
    
  if (error) {
    console.error("removeSavedWord Error:", error.code);
    throw new Error("Failed to remove saved word");
  }
  
  return { success: true };
}

/**
 * Checks if a word is saved by the authenticated user.
 */
export async function isWordSaved(
  supabaseClient: SupabaseClient,
  userId: string,
  word: string
) {
  const normalizedWord = word.trim().toLowerCase();
  
  const { data, error } = await supabaseClient
    .from('saved_words')
    .select('id')
    .eq('user_id', userId)
    .eq('word', normalizedWord)
    .maybeSingle();
    
  if (error && error.code !== 'PGRST116') {
    console.error("isWordSaved Error:", error.message);
    throw new Error("Failed to check saved word status");
  }
  
  return { saved: !!data };
}

/**
 * Retrieves all saved words for the authenticated user, ordered chronologically.
 */
export async function getSavedWords(
  supabaseClient: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabaseClient
    .from('saved_words')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("getSavedWords Error:", error.code);
    throw new Error("Failed to retrieve saved words");
  }
  
  return { saved_words: data };
}


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
