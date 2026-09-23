import * as fs from 'fs';

let parserContent = fs.readFileSync('src/lib/parser.ts', 'utf8');
parserContent = parserContent.replace(
  'phonetic: dict.phonetic,',
  'phonetic: dict.phonetic || undefined,'
);
parserContent = parserContent.replace(
  'synonyms: dict.synonyms?.length > 0 ? dict.synonyms : undefined,',
  'synonyms: (dict.synonyms && dict.synonyms.length > 0) ? dict.synonyms : undefined,'
);
parserContent = parserContent.replace(
  'antonyms: dict.antonyms?.length > 0 ? dict.antonyms : undefined,',
  'antonyms: (dict.antonyms && dict.antonyms.length > 0) ? dict.antonyms : undefined,'
);
fs.writeFileSync('src/lib/parser.ts', parserContent);

let homeContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeContent = homeContent.replace(
  'rawDictionaryData={message.dictionary}',
  'rawDictionaryData={message.dictionary || undefined}'
);
fs.writeFileSync('src/pages/Home.tsx', homeContent);

