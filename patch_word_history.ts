import * as fs from 'fs';

let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');

const oldPersistAssistantMessage = `      // Persist assistant response
      if (authenticatedUser && conversationId) {`;

const newPersistAssistantMessage = `      // Persist word history if there is a successful dictionary lookup
      if (authenticatedUser && dictionaryData) {
        try {
          const normalizedWord = dictionaryData.word.trim().toLowerCase();
          
          // Fetch existing to get lookup_count and first_seen_at
          const { data: existing, error: selectError } = await supabaseClient
            .from('word_history')
            .select('lookup_count, first_seen_at')
            .eq('user_id', authenticatedUser.id)
            .eq('word', normalizedWord)
            .maybeSingle();
            
          if (selectError && selectError.code !== 'PGRST116') {
             console.error("Word history lookup failed:", selectError.message);
          }
          
          const newLookupCount = existing ? existing.lookup_count + 1 : 1;
          const firstSeenAt = existing ? existing.first_seen_at : new Date().toISOString();

          const { error: upsertError } = await supabaseClient
            .from('word_history')
            .upsert(
              {
                user_id: authenticatedUser.id,
                word: normalizedWord,
                dictionary_data: dictionaryData,
                lookup_count: newLookupCount,
                first_seen_at: firstSeenAt,
                last_seen_at: new Date().toISOString()
              },
              { onConflict: 'user_id, word' }
            );

          if (upsertError) {
            console.error("Failed to upsert word history:", upsertError.code);
          } else {
            console.log("WORD HISTORY DEBUG:", { wordHistoryUpserted: true, word: normalizedWord, lookupCount: newLookupCount });
          }
        } catch (err) {
          console.error("Unexpected error persisting word history:", err);
        }
      }

      // Persist assistant response
      if (authenticatedUser && conversationId) {`;

content = content.replace(oldPersistAssistantMessage, newPersistAssistantMessage);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
