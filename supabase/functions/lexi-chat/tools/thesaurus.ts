export interface ThesaurusResult {
  word: string;
  synonyms: string[];
  antonyms: string[];
}

export async function thesaurus_lookup(word: string): Promise<ThesaurusResult | { error: string }> {
  try {
    const cleanWord = word.trim().replace(/\s+/g, ' ');
    if (!cleanWord) return { error: "Empty word provided" };

    const apiKey = Deno.env.get('MW_THESAURUS_API_KEY');
    if (!apiKey) {
      console.error("MW_THESAURUS_API_KEY is not set.");
      return { error: "Thesaurus provider configuration error" };
    }

    const encodedWord = encodeURIComponent(cleanWord);
    const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodedWord}?key=${apiKey}`;

    const response = await fetch(url);
    
    if (response.status === 404) {
      return { error: `Word not found: ${cleanWord}` };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("MW Thesaurus API Error:", response.status, errorText);
      return { error: `Thesaurus provider error: ${response.status}` };
    }

    // Attempt to parse JSON safely since MW sometimes returns plain text on invalid keys
    const textResponse = await response.text();
    if (textResponse.includes('Invalid API key') || textResponse.includes('Not subscribed')) {
      console.error("MW Thesaurus Subscription Error: Key is invalid or not subscribed to the Thesaurus API.");
      return { error: "Thesaurus API key is invalid or lacks subscription" };
    }

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (err) {
      return { error: "Thesaurus returned malformed response" };
    }

    if (!Array.isArray(data) || data.length === 0) {
      return { error: `No thesaurus entry found for: ${cleanWord}` };
    }

    // If the array contains strings, it's a list of spelling suggestions
    if (typeof data[0] === 'string') {
      return { error: `Word not found in thesaurus. Did you mean: ${data.slice(0, 3).join(', ')}?` };
    }

    // Look for exact word match first, or just take the first result
    const targetWord = cleanWord.toLowerCase();
    let exactEntry = data.find(entry => entry.meta?.id?.split(':')[0]?.toLowerCase() === targetWord);
    if (!exactEntry) {
      exactEntry = data[0]; // fallback to first entry
    }

    if (!exactEntry || !exactEntry.meta) {
       return { error: `Malformed thesaurus entry for: ${cleanWord}` };
    }

    // Flatten synonyms and antonyms from arrays of arrays
    const synonymsSet = new Set<string>();
    if (Array.isArray(exactEntry.meta.syns)) {
      exactEntry.meta.syns.forEach((synGroup: string[]) => {
        if (Array.isArray(synGroup)) {
          synGroup.forEach(syn => synonymsSet.add(syn));
        }
      });
    }

    const antonymsSet = new Set<string>();
    if (Array.isArray(exactEntry.meta.ants)) {
      exactEntry.meta.ants.forEach((antGroup: string[]) => {
        if (Array.isArray(antGroup)) {
          antGroup.forEach(ant => antonymsSet.add(ant));
        }
      });
    }

    return {
      word: exactEntry.meta.id?.split(':')[0] || cleanWord,
      synonyms: Array.from(synonymsSet),
      antonyms: Array.from(antonymsSet)
    };

  } catch (error) {
    console.error("Thesaurus lookup error:", error);
    return { error: "Internal thesaurus processing error" };
  }
}
