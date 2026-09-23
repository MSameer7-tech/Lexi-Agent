import * as fs from 'fs';

let content = fs.readFileSync('src/types/index.ts', 'utf8');

const newTypes = `
export interface DictionaryDefinition {
  definition: string;
  example: string | null;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryData {
  word: string;
  phonetic: string | null;
  meanings: DictionaryMeaning[];
  synonyms?: string[];
  antonyms?: string[];
}
`;

content = newTypes + content;

content = content.replace('dictionary?: any | null;', 'dictionary?: DictionaryData | null;');

fs.writeFileSync('src/types/index.ts', content);

let parserContent = fs.readFileSync('src/lib/parser.ts', 'utf8');
if (!parserContent.includes('import type { DictionaryData } from \'../types\';')) {
  parserContent = "import type { DictionaryData } from '../types';\n" + parserContent;
  parserContent = parserContent.replace(
    'export function mapDictionaryApiToParsedEntry(dict: any, rawMarkdown: string): ParsedDictionaryEntry {',
    'export function mapDictionaryApiToParsedEntry(dict: DictionaryData | null | undefined, rawMarkdown: string): ParsedDictionaryEntry {'
  );
  fs.writeFileSync('src/lib/parser.ts', parserContent);
}

let wordResultContent = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf8');
if (!wordResultContent.includes('import type { DictionaryData } from \'../../types\';')) {
  wordResultContent = wordResultContent.replace(
    "import type { ParsedDictionaryEntry } from '../../lib/parser';",
    "import type { ParsedDictionaryEntry } from '../../lib/parser';\nimport type { DictionaryData } from '../../types';"
  );
  wordResultContent = wordResultContent.replace(
    '  rawDictionaryData?: any;',
    '  rawDictionaryData?: DictionaryData;'
  );
  fs.writeFileSync('src/components/dictionary/WordResult.tsx', wordResultContent);
}
