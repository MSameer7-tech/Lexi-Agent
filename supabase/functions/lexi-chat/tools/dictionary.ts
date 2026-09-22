export interface DictionaryDefinition {
  definition: string;
  example: string | null;
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryResult {
  word: string;
  phonetic: string | null;
  meanings: DictionaryMeaning[];
  synonyms: string[];
  antonyms: string[];
}

export async function dictionary_lookup(word: string): Promise<DictionaryResult | { error: string }> {
  try {
    const cleanWord = word.trim().replace(/\s+/g, ' ');
    if (!cleanWord) return { error: "Empty word provided" };

    const encodedWord = encodeURIComponent(cleanWord);
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodedWord}`;

    const response = await fetch(url);
    
    if (response.status === 404) {
      return { error: `Word not found: ${cleanWord}` };
    }
    
    if (!response.ok) {
      return { error: `Dictionary API returned status ${response.status}` };
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { error: "Malformed response from Dictionary API" };
    }

    // Process all entries for the word to get all phonetics, meanings, synonyms
    const result: DictionaryResult = {
      word: data[0].word,
      phonetic: null,
      meanings: [],
      synonyms: [],
      antonyms: []
    };

    const globalSynonyms = new Set<string>();
    const globalAntonyms = new Set<string>();

    for (const entry of data) {
      // Get the first valid phonetic text
      if (!result.phonetic && entry.phonetic) {
        result.phonetic = entry.phonetic;
      }
      if (!result.phonetic && entry.phonetics && Array.isArray(entry.phonetics)) {
        for (const ph of entry.phonetics) {
          if (ph.text) {
            result.phonetic = ph.text;
            break;
          }
        }
      }

      // Process meanings
      if (entry.meanings && Array.isArray(entry.meanings)) {
        for (const meaning of entry.meanings) {
          
          const newMeaning: DictionaryMeaning = {
            partOfSpeech: meaning.partOfSpeech || "unknown",
            definitions: []
          };

          if (meaning.synonyms && Array.isArray(meaning.synonyms)) {
            meaning.synonyms.forEach((s: string) => globalSynonyms.add(s));
          }
          if (meaning.antonyms && Array.isArray(meaning.antonyms)) {
            meaning.antonyms.forEach((a: string) => globalAntonyms.add(a));
          }

          if (meaning.definitions && Array.isArray(meaning.definitions)) {
            for (const def of meaning.definitions) {
              const newDef: DictionaryDefinition = {
                definition: def.definition,
                example: def.example || null,
                synonyms: def.synonyms || [],
                antonyms: def.antonyms || []
              };
              
              if (newDef.synonyms.length > 0) newDef.synonyms.forEach(s => globalSynonyms.add(s));
              if (newDef.antonyms.length > 0) newDef.antonyms.forEach(a => globalAntonyms.add(a));

              newMeaning.definitions.push(newDef);
            }
          }
          
          result.meanings.push(newMeaning);
        }
      }
    }

    result.synonyms = Array.from(globalSynonyms);
    result.antonyms = Array.from(globalAntonyms);

    return result;
  } catch (error) {
    console.error("Dictionary lookup failed:", error);
    return { error: "Network failure or unexpected error during lookup" };
  }
}
