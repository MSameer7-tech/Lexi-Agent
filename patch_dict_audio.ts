import * as fs from 'fs';

let content = fs.readFileSync('supabase/functions/lexi-chat/tools/dictionary.ts', 'utf8');

const interfaceReplacement = `export interface DictionaryPronunciation {
  phonetic: string;
  audioUrl: string | null;
}

export interface DictionaryResult {
  word: string;
  phonetic: string | null;
  pronunciations: DictionaryPronunciation[];
  meanings: DictionaryMeaning[];
  synonyms: string[];
  antonyms: string[];
}`;

content = content.replace(/export interface DictionaryResult {[\s\S]*?}/, interfaceReplacement);

const newConstructorLogic = `    const result: DictionaryResult = {
      word: cleanWord,
      phonetic: null,
      pronunciations: [],
      meanings: [],
      synonyms: [],
      antonyms: []
    };

    const targetWordLower = cleanWord.toLowerCase();
    
    // Process all matching entries for the word
    for (const entry of data) {
      const entryId = entry.meta?.id?.split(':')[0]?.toLowerCase();
      if (!entryId) continue;

      if (entryId !== targetWordLower) continue;

      // Extract phonetic and audio
      if (entry.hwi?.prs && Array.isArray(entry.hwi.prs)) {
        for (const pr of entry.hwi.prs) {
          if (pr.mw) {
            const phoneticStr = \`/\${pr.mw}/\`;
            
            // Set the backwards-compatible phonetic if not set
            if (!result.phonetic) {
              result.phonetic = phoneticStr;
            }

            let audioUrl: string | null = null;
            if (pr.sound && pr.sound.audio) {
              const audioFilename = pr.sound.audio;
              let subdir = audioFilename.charAt(0);
              if (audioFilename.startsWith("bix")) subdir = "bix";
              else if (audioFilename.startsWith("gg")) subdir = "gg";
              else if (/^[^a-zA-Z]/.test(audioFilename)) subdir = "number";
              
              audioUrl = \`https://media.merriam-webster.com/audio/prons/en/us/mp3/\${subdir}/\${audioFilename}.mp3\`;
            }

            // Only push if we haven't already added this exact phonetic spelling to avoid duplicates
            if (!result.pronunciations.some(p => p.phonetic === phoneticStr)) {
              result.pronunciations.push({
                phonetic: phoneticStr,
                audioUrl
              });
            }
          }
        }
      }`;

content = content.replace(/    const result: DictionaryResult = {[\s\S]*?      if \(!result\.phonetic && entry\.hwi\?\.prs && entry\.hwi\.prs\.length > 0\) {[\s\S]*?         if \(entry\.hwi\.prs\[0\]\.mw\) {[\s\S]*?           result\.phonetic = \`\/\$\{entry\.hwi\.prs\[0\]\.mw\}\/\`;[\s\S]*?         }[\s\S]*?      }/, newConstructorLogic);

fs.writeFileSync('supabase/functions/lexi-chat/tools/dictionary.ts', content);
