import * as fs from 'fs';

let content = fs.readFileSync('src/lib/parser.ts', 'utf8');

if (!content.includes('pronunciations?: DictionaryPronunciation[];')) {
  // Update ParsedDictionaryEntry
  content = content.replace(
    'export interface ParsedDictionaryEntry {',
    "import type { DictionaryPronunciation } from '../types';\n\nexport interface ParsedDictionaryEntry {"
  );
  content = content.replace(
    'phonetic?: string;',
    'phonetic?: string;\n  pronunciations?: DictionaryPronunciation[];'
  );
  
  // Update mapping function
  content = content.replace(
    'phonetic: dict.phonetic || undefined,',
    'phonetic: dict.phonetic || undefined,\n    pronunciations: (dict.pronunciations && dict.pronunciations.length > 0) ? dict.pronunciations : undefined,'
  );
}

fs.writeFileSync('src/lib/parser.ts', content);
