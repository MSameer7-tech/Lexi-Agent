import React from 'react';
import { PlayCircle, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isWordSaved, saveWord, removeSavedWord } from '../../services/lexiAgentApi';
import type { ParsedDictionaryEntry } from '../../lib/parser';
import type { DictionaryData } from '../../types';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

interface WordResultProps {
  entry: ParsedDictionaryEntry;
  rawDictionaryData?: DictionaryData;
}

export const WordResult: React.FC<WordResultProps> = ({ entry, rawDictionaryData }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (session && entry.word) {
      // Check if word is saved
      isWordSaved(entry.word)
        .then(res => setIsSaved(res.saved))
        .catch(err => console.error("Failed to check saved status:", err));
    }
  }, [session, entry.word]);

  const handleSaveToggle = async () => {
    if (!session) {
      // Guest user attempting to save
      if (confirm("Sign in to save words to your Vocabulary Library. Go to sign in?")) {
        navigate('/auth');
      }
      return;
    }

    if (!entry.word) return;
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      if (isSaved) {
        await removeSavedWord(entry.word);
        setIsSaved(false);
      } else {
        await saveWord(entry.word, rawDictionaryData || entry);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
      setSaveError("Couldn't save this word. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[28px] sm:text-[30px] lg:text-[32px] font-medium text-foreground tracking-tight leading-none">
              {entry.word}
            </h2>
            <div className="flex flex-col items-end">
              <button 
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={`flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest transition-colors duration-300 ${isSaved ? 'text-foreground' : 'text-muted hover:text-foreground'} ${isSaving ? 'opacity-50' : ''}`}
              >
                <Heart size={14} className={isSaved ? 'fill-foreground text-foreground' : ''} />
                <span>{isSaved ? 'Saved' : 'Save word'}</span>
              </button>
              {saveError && <span className="text-[10px] text-red-500 mt-1 font-sans">{saveError}</span>}
            </div>
          </div>
          
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
          <section className="flex flex-col gap-8 pt-6 border-t border-border-subtle/50">
            {entry.synonyms && entry.synonyms.length > 0 && (
              <WordListSection title="Synonyms" words={entry.synonyms} />
            )}
            
            {entry.antonyms && entry.antonyms.length > 0 && (
              <WordListSection title="Antonyms" words={entry.antonyms} />
            )}
          </section>
        )}
        
      </div>
    </div>
  );
};

const WordListSection = ({ title, words }: { title: string, words: string[] }) => {
  const [expanded, setExpanded] = useState(false);
  if (!words || words.length === 0) return null;
  
  const limit = 8;
  const isExpandable = words.length > limit;
  const displayWords = expanded ? words : words.slice(0, limit);
  
  return (
    <div className="flex flex-col gap-4 max-w-[720px]">
      <h4 className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle">{title}</h4>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
        {displayWords.map((word, i) => (
          <React.Fragment key={i}>
            <span className="font-serif text-[15px] sm:text-[16px] text-foreground/90">{word}</span>
            {(i < displayWords.length - 1 || (!expanded && isExpandable)) && (
              <span className="text-subtle/40 select-none">·</span>
            )}
          </React.Fragment>
        ))}
        {isExpandable && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors ml-1 border-b border-muted/30 hover:border-foreground pb-0.5"
          >
            {expanded ? 'Show less' : `+ ${words.length - limit} more`}
          </button>
        )}
      </div>
    </div>
  );
};

