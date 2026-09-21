import React from 'react';
import { Volume2, Bookmark, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ParsedDictionaryEntry } from '../../lib/parser';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

interface WordResultProps {
  entry: ParsedDictionaryEntry;
}

export const WordResult: React.FC<WordResultProps> = ({ entry }) => {
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.word || entry.rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If we couldn't parse the core elements, fallback to markdown renderer
  // but wrap it in our beautiful container
  if (!entry.word || !entry.definition) {
    return (
      <div className="w-full">
        <div className="pl-6 md:pl-10 border-l-[3px] border-[var(--color-peach)]/50 relative py-2 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-peach)] opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity duration-700 group-hover:opacity-10 pointer-events-none"></div>
          
          <div className="relative z-10 font-serif text-lg md:text-xl text-foreground leading-loose">
            <MarkdownRenderer content={entry.rawMarkdown} />
          </div>
        </div>
      </div>
    );
  }

  // Structured Editorial Layout
  return (
    <div className="w-full relative">
      <div className="absolute -top-6 left-0 text-[9px] uppercase tracking-widest text-muted hidden md:block">
        Vol. 1 / Lexicon
      </div>
      <div className="bg-surface border border-foreground shadow-sm relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-peach)] opacity-10 dark:opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-lavender)] opacity-15 dark:opacity-10 blur-3xl rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* LEFT SIDE: Word, Phonetic, POS, Actions */}
          <div className="lg:w-1/3 flex flex-col items-start shrink-0">
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground tracking-tighter mb-4 leading-none">
              {entry.word}
            </h2>
            
            <div className="flex flex-col gap-2 mb-8">
              {entry.phonetic && (
                <p className="font-sans text-lg text-muted font-light tracking-wide">
                  {entry.phonetic}
                </p>
              )}
              {entry.partOfSpeech && (
                <p className="font-serif italic text-xl text-subtle">
                  {entry.partOfSpeech}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full border border-foreground/30 text-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors shadow-sm"
                aria-label="Listen to pronunciation"
                title="Pronounce"
              >
                <Volume2 size={16} strokeWidth={1} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSaved(!saved)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shadow-sm ${saved ? 'bg-foreground border-foreground text-background' : 'border-foreground/30 text-foreground hover:bg-foreground hover:text-background'}`}
                aria-label="Save word"
                title="Save"
              >
                <Bookmark size={16} strokeWidth={1} fill={saved ? 'currentColor' : 'none'} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="w-10 h-10 rounded-full border border-foreground/30 text-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors shadow-sm"
                aria-label="Copy to clipboard"
                title="Copy"
              >
                {copied ? <Check size={16} strokeWidth={1} /> : <Copy size={16} strokeWidth={1} />}
              </motion.button>
            </div>
          </div>

          {/* RIGHT SIDE: Definition, Example, Synonyms/Antonyms */}
          <div className="lg:w-2/3 flex flex-col gap-10 lg:border-l lg:border-border-subtle lg:pl-16">
            
            {/* Definition */}
            <section>
              <h3 className="text-xs font-sans uppercase tracking-widest font-semibold text-subtle mb-4">Definition</h3>
              <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
                {entry.definition}
              </p>
            </section>

            {/* Example Block */}
            {entry.examples && entry.examples.length > 0 && (
              <section>
                <div className="relative p-6 md:p-8 rounded-2xl bg-surface-tint border border-border-subtle overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-peach)] opacity-60"></div>
                  <span className="absolute -top-4 -right-2 font-serif text-[8rem] leading-none text-border-strong opacity-20 select-none group-hover:scale-110 transition-transform duration-700">"</span>
                  <div className="relative z-10">
                    <p className="font-serif italic text-xl md:text-2xl text-muted leading-relaxed">
                      "{entry.examples[0]}"
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Synonyms & Antonyms */}
            {(entry.synonyms || entry.antonyms) && (
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-border-subtle/50">
                
                {entry.synonyms && entry.synonyms.length > 0 && (
                  <div>
                    <h3 className="text-xs font-sans uppercase tracking-widest font-semibold text-subtle mb-4">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {entry.synonyms.map(syn => (
                        <span 
                          key={syn} 
                          className="px-4 py-2 rounded-lg bg-[var(--color-lavender)]/20 dark:bg-[var(--color-lavender)]/10 text-[var(--color-lavender-dark)] dark:text-[var(--color-lavender)] text-sm font-medium border border-[var(--color-lavender)]/30 hover:bg-[var(--color-lavender)]/40 cursor-pointer transition-colors"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.antonyms && entry.antonyms.length > 0 && (
                  <div>
                    <h3 className="text-xs font-sans uppercase tracking-widest font-semibold text-subtle mb-4">Antonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {entry.antonyms.map(ant => (
                        <span 
                          key={ant} 
                          className="px-4 py-2 rounded-lg bg-surface-tint text-muted text-sm font-medium border border-border-subtle hover:text-foreground cursor-pointer transition-colors line-through decoration-muted/50 decoration-1"
                        >
                          {ant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};
