import * as fs from 'fs';

let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf8');

content = content.replace(
  'interface WordResultProps {\n  entry: ParsedDictionaryEntry;\n}',
  'interface WordResultProps {\n  entry: ParsedDictionaryEntry;\n  rawDictionaryData?: any;\n}'
);

content = content.replace(
  'export const WordResult: React.FC<WordResultProps> = ({ entry }) => {',
  'export const WordResult: React.FC<WordResultProps> = ({ entry, rawDictionaryData }) => {'
);

// Fix the saveWord call which used entry.rawDictionaryData (which wasn't a prop on entry)
content = content.replace(
  'await saveWord(entry.word, entry.rawDictionaryData || {});',
  'await saveWord(entry.word, rawDictionaryData || entry);'
);

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);

let homeContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeContent = homeContent.replace(
  '<WordResult entry={message.dictionary ? mapDictionaryApiToParsedEntry(message.dictionary, message.content) : parseDictionaryMarkdown(message.content)} />',
  '<WordResult entry={message.dictionary ? mapDictionaryApiToParsedEntry(message.dictionary, message.content) : parseDictionaryMarkdown(message.content)} rawDictionaryData={message.dictionary} />'
);
fs.writeFileSync('src/pages/Home.tsx', homeContent);
