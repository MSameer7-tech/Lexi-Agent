import type { DictionaryData } from '../types';
import type { DictionaryPronunciation } from '../types';

export interface ParsedDefinition {
  text: string;
  example?: string;
}

export interface ParsedDictionaryMeaning {
  partOfSpeech: string;
  definitions: ParsedDefinition[];
}

export interface ParsedDictionaryEntry {
  word?: string;
  phonetic?: string;
  pronunciations?: DictionaryPronunciation[];
  meanings?: ParsedDictionaryMeaning[];
  synonyms?: string[];
  antonyms?: string[];
  rawMarkdown: string;
}

export function parseDictionaryMarkdown(markdown: string): ParsedDictionaryEntry {
  const entry: ParsedDictionaryEntry = { rawMarkdown: markdown };
  // We keep this minimal since we rely on the structured dict data mostly, 
  // but if we only have markdown we do a best effort parsing.
  return entry;
}

export function mapDictionaryApiToParsedEntry(dict: DictionaryData | null | undefined, rawMarkdown: string): ParsedDictionaryEntry {
  if (!dict) return { rawMarkdown };
  
  const meanings: ParsedDictionaryMeaning[] = [];
  if (dict.meanings && dict.meanings.length > 0) {
    dict.meanings.forEach((m: any) => {
      const defs = m.definitions?.map((d: any) => ({
        text: d.definition,
        example: d.example || undefined
      })) || [];
      
      if (defs.length > 0) {
        meanings.push({
          partOfSpeech: m.partOfSpeech || 'unknown',
          definitions: defs
        });
      }
    });
  }

  return {
    word: dict.word,
    phonetic: dict.phonetic || undefined,
    pronunciations: (dict.pronunciations && dict.pronunciations.length > 0) ? dict.pronunciations : undefined,
    meanings: meanings.length > 0 ? meanings : undefined,
    synonyms: (dict.synonyms && dict.synonyms.length > 0) ? dict.synonyms : undefined,
    antonyms: (dict.antonyms && dict.antonyms.length > 0) ? dict.antonyms : undefined,
    rawMarkdown
  };
}
