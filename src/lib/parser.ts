export interface ParsedDictionaryEntry {
  word?: string;
  partOfSpeech?: string;
  phonetic?: string;
  definition?: string;
  synonyms?: string[];
  antonyms?: string[];
  examples?: string[];
  rawMarkdown: string;
}

/**
 * Attempts to parse the current AI markdown response into structured dictionary fields.
 * If the markdown doesn't follow the expected structure, it returns the raw markdown for fallback rendering.
 */
export function parseDictionaryMarkdown(markdown: string): ParsedDictionaryEntry {
  const entry: ParsedDictionaryEntry = { rawMarkdown: markdown };

  try {
    // Extract Word (usually the first bold text, e.g., **serendipity**)
    const wordMatch = markdown.match(/\*\*([^*]+)\*\*/);
    if (wordMatch) {
      entry.word = wordMatch[1].trim();
    }

    // Extract Part of Speech (usually the first italic text, e.g., *noun*)
    // We only look near the beginning to avoid catching other italics
    const posMatch = markdown.match(/^\*\*.*\*\*\s*\n+\*([^*]+)\*/);
    if (posMatch) {
      entry.partOfSpeech = posMatch[1].trim();
    }

    // Extract Synonyms
    const synonymsMatch = markdown.match(/\*\*Synonyms:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/i);
    if (synonymsMatch) {
      entry.synonyms = synonymsMatch[1].split(',').map(s => s.trim());
    }

    // Extract Antonyms
    const antonymsMatch = markdown.match(/\*\*Antonyms:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/i);
    if (antonymsMatch) {
      entry.antonyms = antonymsMatch[1].split(',').map(s => s.trim());
    }

    // Extract Example
    const exampleMatch = markdown.match(/\*\*Example:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/i);
    if (exampleMatch) {
      entry.examples = [exampleMatch[1].trim().replace(/^"|"$/g, '')];
    }

    // Extract Definition (the text between part of speech and the first list like Synonyms/Example)
    // This is a bit tricky, but we can find the text between the POS and the next **
    if (entry.word && entry.partOfSpeech) {
      const posRegexStr = `\\*${entry.partOfSpeech}\\*`;
      const regex = new RegExp(`${posRegexStr}\\s*\\n+([\\s\\S]+?)(?:\\n\\n\\*\\*|$)`);
      const defMatch = markdown.match(regex);
      if (defMatch) {
        entry.definition = defMatch[1].trim();
      }
    }

    return entry;
  } catch (error) {
    console.error("Failed to parse dictionary markdown", error);
    return { rawMarkdown: markdown };
  }
}
