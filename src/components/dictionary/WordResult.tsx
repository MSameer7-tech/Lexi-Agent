import React from 'react';
import { PlayCircle } from 'lucide-react';
import type { ParsedDictionaryEntry } from '../../lib/parser';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

interface WordResultProps {
  entry: ParsedDictionaryEntry;
}

export const WordResult: React.FC<WordResultProps> = ({ entry }) => {

  const handleListen = () => {
    // In a real implementation, this would use Web Speech API
    console.log("Listen to", entry.word);
  };

  if (!entry.word || (!entry.definitions || entry.definitions.length === 0)) {
    return (
      <div className="w-full max-w-[760px] pl-6 md:pl-8 border-l border-border-subtle py-4">
        <div className="font-serif text-base md:text-lg text-foreground leading-relaxed prose prose-stone dark:prose-invert">
          <MarkdownRenderer content={entry.rawMarkdown} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative pl-6 md:pl-10 border-l border-border-subtle py-4 md:py-6">
      <div className="w-full max-w-[760px] flex flex-col gap-10">
        
        {/* WORD, PRONUNCIATION, POS */}
        <header className="flex flex-col gap-4">
          <h2 className="font-serif text-[28px] sm:text-[30px] lg:text-[32px] font-medium text-foreground tracking-tight leading-none">
            {entry.word}
          </h2>
          
          <div className="flex flex-col gap-3">
            {entry.phonetic && (
              <div className="flex items-center gap-3">
                <span className="font-sans text-[11px] text-subtle uppercase tracking-widest">Pronunciation</span>
                <span className="font-sans text-[15px] sm:text-[16px] text-foreground tracking-wide">{entry.phonetic}</span>
                <button 
                  onClick={handleListen}
                  className="flex items-center gap-1.5 ml-2 text-muted hover:text-foreground transition-colors group"
                >
                  <PlayCircle size={14} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] uppercase tracking-widest">Listen</span>
                </button>
              </div>
            )}
            
            {entry.partOfSpeech && (
              <div className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle">
                {entry.partOfSpeech.replace(/\./g, '')}
              </div>
            )}
          </div>
        </header>

        {/* DEFINITIONS */}
        {entry.definitions && entry.definitions.length > 0 && (
          <section className="flex flex-col gap-6">
            <h3 className="font-serif text-[18px] sm:text-[20px] text-foreground tracking-tight">
              Definitions
            </h3>
            
            <div className="flex flex-col gap-8">
              {entry.definitions.map((def, idx) => (
                <div key={idx} className="flex gap-4 sm:gap-6">
                  <div className="font-sans text-[11px] text-subtle mt-1.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex flex-col gap-3 max-w-[720px]">
                    <p className="font-sans text-[16px] sm:text-[17px] text-foreground leading-[1.6]">
                      {def.text}
                    </p>
                    {def.example && (
                      <div className="flex gap-2">
                        <span className="font-sans text-[12px] text-muted mt-0.5">Example:</span>
                        <p className="font-serif italic text-[14px] sm:text-[15px] text-muted leading-relaxed">
                          "{def.example}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SYNONYMS & ANTONYMS */}
        {(entry.synonyms || entry.antonyms) && (
          <section className="flex flex-col gap-6 pt-4">
            {entry.synonyms && entry.synonyms.length > 0 && (
              <div className="flex flex-col gap-2 max-w-[720px]">
                <h4 className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle">Synonyms</h4>
                <p className="font-sans text-[14px] sm:text-[15px] text-foreground leading-relaxed">
                  {entry.synonyms.join(' · ')}
                </p>
              </div>
            )}
            
            {entry.antonyms && entry.antonyms.length > 0 && (
              <div className="flex flex-col gap-2 max-w-[720px]">
                <h4 className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle">Antonyms</h4>
                <p className="font-sans text-[14px] sm:text-[15px] text-foreground leading-relaxed">
                  {entry.antonyms.join(' · ')}
                </p>
              </div>
            )}
          </section>
        )}
        
      </div>
    </div>
  );
};
