import * as fs from 'fs';

let content = fs.readFileSync('src/types/index.ts', 'utf8');

const replacement = `export interface DictionaryPronunciation {
  phonetic: string;
  audioUrl?: string | null;
}

export interface DictionaryData {
  word: string;
  phonetic: string | null;
  pronunciations?: DictionaryPronunciation[];
  meanings: DictionaryMeaning[];
  synonyms?: string[];
  antonyms?: string[];
}`;

content = content.replace(/export interface DictionaryData {[\s\S]*?}/, replacement);
fs.writeFileSync('src/types/index.ts', content);
