import { getTtsAudio } from './tts.ts';

export interface DictionaryDefinition {
  definition: string;
  example: string | null;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryPronunciation {
  phonetic: string;
  audioUrl: string | null;
}

export interface DictionaryResult {
  audioUrl?: string | null;
  word: string;
  phonetic: string | null;
  pronunciations: DictionaryPronunciation[];
  meanings: DictionaryMeaning[];
  synonyms: string[];
  antonyms: string[];
}

function cleanMwText(text: string): string {
  if (!text) return "";
  let result = text
    .replace(/{bc}/g, "") // remove bold colon
    .replace(/{wi}(.*?){(?:\/)?wi}/g, "$1") // italic
    .replace(/{it}(.*?){(?:\/)?it}/g, "_$1_") // italic
    .replace(/{b}(.*?){(?:\/)?b}/g, "**$1**") // bold
    .replace(/{sup}(.*?){(?:\/)?sup}/g, "$1") 
    .replace(/{inf}(.*?){(?:\/)?inf}/g, "$1") 
    .replace(/{sx\|([^|]+)\|([^|]*)\|([^|]*)}/g, "$1") // synonym cross ref
    .replace(/{dxt\|([^|]+)\|([^|]*)\|([^|]*)}/g, "$1") // dict cross ref
    .replace(/{a_link\|([^}]+)}/g, "$1") 
    .replace(/{d_link\|([^|]+)\|([^}]+)}/g, "$1") 
    .replace(/{gloss}(.*?){(?:\/)?gloss}/g, "($1)");
    
  // Strip any remaining generic tags like {dx_def} or {dx} that didn't match the pairs
  result = result.replace(/{[^}]+}/g, "");
  
  return result.trim().replace(/\s+/g, ' ');
}

// Recursively find text and vis inside dt arrays
function extractDefinitionsAndExamples(dtArray: any[]): DictionaryDefinition | null {
  let defText = "";
  let example = null;

  for (const item of dtArray) {
    if (Array.isArray(item) && item.length === 2) {
      if (item[0] === "text") {
        defText += cleanMwText(item[1]) + " ";
      } else if (item[0] === "vis" && Array.isArray(item[1]) && item[1].length > 0) {
        // take the first verbal illustration
        if (item[1][0].t) {
          example = cleanMwText(item[1][0].t);
        }
      }
    }
  }

  defText = defText.trim();
  if (defText) {
    return { definition: defText, example };
  }
  return null;
}

function traverseSseq(sseq: any[], defs: DictionaryDefinition[]) {
  if (!Array.isArray(sseq)) return;
  
  for (const item of sseq) {
    if (Array.isArray(item)) {
      if (item[0] === "sense" && item[1] && item[1].dt) {
        const extracted = extractDefinitionsAndExamples(item[1].dt);
        if (extracted) defs.push(extracted);
      } else if (item[0] === "pseq" || item[0] === "bs") { // nested sequences
        traverseSseq(item[1], defs);
      } else {
        // Continue traversing down if it's an array
        for (const sub of item) {
           if (Array.isArray(sub)) traverseSseq([sub], defs);
        }
      }
    }
  }
}

export async function dictionary_lookup(word: string): Promise<DictionaryResult | { error: string }> {
  try {
    const cleanWord = word.trim().replace(/\s+/g, ' ');
    if (!cleanWord) return { error: "Empty word provided" };

    const apiKey = Deno.env.get('MW_DICTIONARY_API_KEY');
    if (!apiKey) {
      console.error("MW_DICTIONARY_API_KEY is not set.");
      return { error: "Dictionary provider configuration error" };
    }

    const encodedWord = encodeURIComponent(cleanWord);
    const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodedWord}?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.status === 404) {
      return { error: `Word not found: ${cleanWord}` };
    }
    
    if (!response.ok) {
      return { error: `Dictionary API returned status ${response.status}` };
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { error: `Word not found: ${cleanWord}` };
    }

    // Merriam-Webster returns an array of strings if word is not found but there are spelling suggestions
    if (typeof data[0] === "string") {
      return { error: `Word not found. Did you mean: ${data.slice(0, 3).join(', ')}?` };
    }

    const result: DictionaryResult = {
      word: cleanWord,
      phonetic: null,
      audioUrl: null,
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
            const phoneticStr = `/${pr.mw}/`;
            
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
              
              audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audioFilename}.mp3`;
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
      }
      
      const partOfSpeech = entry.fl || "unknown";
      
      const definitions: DictionaryDefinition[] = [];

      // Try to extract rich definitions + examples using sseq traversal
      if (entry.def && Array.isArray(entry.def)) {
        for (const d of entry.def) {
           if (d.sseq) {
              traverseSseq(d.sseq, definitions);
           }
        }
      }

      // Fallback: if complex traversal failed, try to use shortdef
      if (definitions.length === 0 && entry.shortdef && Array.isArray(entry.shortdef)) {
        for (const sd of entry.shortdef) {
          definitions.push({ definition: cleanMwText(sd), example: null });
        }
      }

      if (definitions.length > 0) {
        result.meanings.push({
          partOfSpeech,
          definitions
        });
      }
    }
    
    if (result.meanings.length === 0) {
       return { error: `No definitions found for ${cleanWord}` };
    }

    // Normalize phonetic for comparison: remove slashes, stress marks, and hyphens.
    const normalizePhonetic = (p: string) => p.replace(/[\/ˈˌ-]/g, '').trim();

    // Filter out partial shorthand pronunciations (e.g. "/-ˈn(y)u̇r/" or "/ˌäⁿn-/")
    // and count unique normalized phonetic strings.
    const fullPhonetics = result.pronunciations
      .filter(p => {
        if (!p.phonetic) return false;
        const inner = p.phonetic.replace(/^\//, '').replace(/\/$/, '');
        return !inner.startsWith('-') && !inner.endsWith('-');
      })
      .map(p => normalizePhonetic(p.phonetic));
      
    const uniquePhonetics = new Set(fullPhonetics);

    // Enhance with high-quality TTS audio ONLY if there is exactly 1 distinct full phonetic spelling.
    // If > 1, we preserve all MW native audio to ensure phonetics match the audio exactly (Homographs).
    if (uniquePhonetics.size <= 1) {
      const mwAudioUrl = result.pronunciations[0]?.audioUrl || null;
      const ttsUrl = await getTtsAudio(cleanWord, mwAudioUrl);
      
      if (ttsUrl) {
        result.audioUrl = ttsUrl; // Root property for frontend compatibility
        if (result.pronunciations.length > 0) {
          result.pronunciations[0].audioUrl = ttsUrl; // Overwrite primary MW audio
        } else {
          result.pronunciations.push({ phonetic: result.phonetic || `/${cleanWord}/`, audioUrl: ttsUrl });
        }
      } else {
        result.audioUrl = mwAudioUrl;
      }
    } else {
      // Homograph or multiple valid variants: DO NOT use ElevenLabs.
      // Retain the MW native URLs to ensure accuracy.
      result.audioUrl = result.pronunciations[0]?.audioUrl || null;
    }

    return result;
  } catch (error) {
    console.error("Dictionary lookup failed:", error);
    return { error: "Network failure or unexpected error during lookup" };
  }
}

