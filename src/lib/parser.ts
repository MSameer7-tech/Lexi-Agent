export interface ParsedDefinition {
  text: string;
  example?: string;
}

export interface ParsedDictionaryEntry {
  word?: string;
  partOfSpeech?: string;
  phonetic?: string;
  definitions?: ParsedDefinition[];
  synonyms?: string[];
  antonyms?: string[];
  rawMarkdown: string;
}

export function parseDictionaryMarkdown(markdown: string): ParsedDictionaryEntry {
  const entry: ParsedDictionaryEntry = { rawMarkdown: markdown };

  try {
    // Clean up carriage returns
    const lines = markdown.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Check if it's the new n8n format: "word (pos)" on line 1
    const firstLineMatch = lines[0].match(/^([^(]+?)\s*\(([^)]+)\)$/);
    if (firstLineMatch) {
      entry.word = firstLineMatch[1].trim();
      entry.partOfSpeech = firstLineMatch[2].trim();
    } else {
      // Fallback old format
      const wordMatch = markdown.match(/\*\*([^*]+)\*\*/);
      if (wordMatch) entry.word = wordMatch[1].trim();
      const posMatch = markdown.match(/^\*\*.*\*\*\s*\n+\*([^*]+)\*/);
      if (posMatch) entry.partOfSpeech = posMatch[1].trim();
    }

    // Pronunciation
    const pronMatch = markdown.match(/Pronunciation:\s*(.+)$/m);
    if (pronMatch) {
      entry.phonetic = pronMatch[1].trim();
    }

    // Synonyms
    const synMatch = markdown.match(/Synonyms(?:[^:]*):\s*(.+)$/m) || markdown.match(/\*\*Synonyms:\*\*\s*(.+)$/m);
    if (synMatch) {
      entry.synonyms = synMatch[1].split(',').map(s => s.trim().replace(/\.$/, ''));
    }

    // Antonyms
    const antMatch = markdown.match(/Antonyms(?:[^:]*):\s*(.+)$/m) || markdown.match(/\*\*Antonyms:\*\*\s*(.+)$/m);
    if (antMatch) {
      entry.antonyms = antMatch[1].split(',').map(s => s.trim().replace(/\.$/, ''));
    }

    // Definitions
    // We look for lines starting with "1.", "2.", or just after "Definition"
    entry.definitions = [];
    
    const defBlockRegex = /Definition\s*\n([\s\S]+?)(?=\nSynonyms|\nAntonyms|$)/i;
    const defBlockMatch = markdown.match(defBlockRegex);
    
    if (defBlockMatch) {
      const defLines = defBlockMatch[1].split('\n').map(l => l.trim());
      let currentDef: ParsedDefinition | null = null;
      
      for (const line of defLines) {
        if (/^\d+\.\s+/.test(line)) {
          if (currentDef) entry.definitions.push(currentDef);
          currentDef = { text: line.replace(/^\d+\.\s+/, '').trim() };
        } else if (line.toLowerCase().startsWith('example') || line.toLowerCase().startsWith('*example')) {
          const exMatch = line.match(/:\s*(.+)$/);
          if (currentDef && exMatch) {
            currentDef.example = exMatch[1].replace(/^"|"$/g, '').trim();
          } else if (currentDef) {
            currentDef.example = line.replace(/^(?:\*?)Example.*?(?:\*?):\s*/i, '').replace(/^"|"$/g, '').trim();
          }
        } else if (currentDef && line.length > 0) {
           currentDef.text += " " + line;
        } else if (!currentDef && line.length > 0) {
           currentDef = { text: line };
        }
      }
      if (currentDef) {
        entry.definitions.push(currentDef);
      }
    } else {
      // Old format fallback
      const oldDefMatch = markdown.match(/\*noun\*\s*\n+([\s\S]+?)(?:\n\n\*\*|$)/i);
      if (oldDefMatch) {
        entry.definitions.push({ text: oldDefMatch[1].trim() });
      }
    }
    
    return entry;
  } catch (error) {
    console.error("Failed to parse", error);
    return { rawMarkdown: markdown };
  }
}

export function mapDictionaryApiToParsedEntry(dict: any, rawMarkdown: string): ParsedDictionaryEntry {
  if (!dict) return { rawMarkdown };
  
  const primaryMeaning = dict.meanings?.[0];
  
  const definitions: ParsedDefinition[] = [];
  if (primaryMeaning?.definitions) {
    primaryMeaning.definitions.forEach((d: any) => {
      definitions.push({
        text: d.definition,
        example: d.example || undefined
      });
    });
  }

  return {
    word: dict.word,
    phonetic: dict.phonetic,
    partOfSpeech: primaryMeaning?.partOfSpeech,
    definitions: definitions.length > 0 ? definitions : undefined,
    synonyms: dict.synonyms?.length > 0 ? dict.synonyms : undefined,
    antonyms: dict.antonyms?.length > 0 ? dict.antonyms : undefined,
    rawMarkdown
  };
}
