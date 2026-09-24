import React from 'react';
import { Volume2, Loader2, Heart } from 'lucide-react';
import { useRef } from 'react';
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


const getCardColorClasses = (word: string) => {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 4;
  
  const colors = [
    'bg-[#FFE6E0]/40 dark:bg-[#51332F]/40 border-[#FFD9D0]/50 dark:border-[#63403B]/50', // Pink
    'bg-[#DCE4FF]/40 dark:bg-[#283566]/40 border-[#CDDAFF]/50 dark:border-[#33427D]/50', // Blue
    'bg-[#E5D9FF]/40 dark:bg-[#3B2C59]/40 border-[#D9CAFF]/50 dark:border-[#4B3A70]/50', // Purple
    'bg-[#FFF1CC]/40 dark:bg-[#594B22]/40 border-[#FFE9A6]/50 dark:border-[#6E5D2A]/50'  // Yellow
  ];
  return colors[index];
};

export const WordResult: React.FC<WordResultProps> = ({ entry, rawDictionaryData }) => {
  const colorClasses = getCardColorClasses(entry.word || 'default');
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
    <div className={`w-full relative shadow-[0_12px_24px_-10px_rgba(42,41,40,0.05)] dark:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.2)] rounded-[20px] p-8 sm:p-10 lg:p-14 transition-all border ${colorClasses}`}>
      
      {/* Absolute Save Button */}
      <div className="absolute top-8 right-8 sm:top-10 sm:right-10 z-10">
        <button 
          onClick={handleSaveToggle}
          disabled={isSaving}
          className={`flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest transition-colors duration-300 ${isSaved ? 'text-foreground' : 'text-muted hover:text-foreground'} ${isSaving ? 'opacity-50' : ''}`}
        >
          <Heart size={14} className={isSaved ? 'fill-foreground text-foreground' : ''} />
          <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save word'}</span>
        </button>
        {saveError && <span className="text-[10px] text-red-500 mt-1 font-sans absolute right-0">{saveError}</span>}
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24">
        
        {/* Left Side: WORD, PRONUNCIATION, POS */}
        <header className="flex flex-col gap-6 lg:w-[35%] shrink-0">
          <h2 className="font-serif text-[42px] sm:text-[48px] lg:text-[56px] font-medium text-foreground tracking-tight leading-none pr-16 lg:pr-0">
            {entry.word}
          </h2>
          
          <div className="flex flex-col gap-6">
            {entry.phonetic && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-start gap-2">
                  <span className="font-sans text-[10px] text-subtle uppercase tracking-widest">Pronunciation</span>
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-[16px] sm:text-[18px] text-foreground tracking-wide">{entry.phonetic}</span>
                    {entry.pronunciations?.[0]?.audioUrl && (
                      <AudioButton url={entry.pronunciations[0].audioUrl} label="pronunciation" />
                    )}
                  </div>
                </div>
                
                {entry.pronunciations && entry.pronunciations.length > 1 && (
                  <div className="flex flex-col gap-2 mt-2 border-l border-border-subtle/50 pl-4">
                    <span className="font-sans text-[9px] text-subtle uppercase tracking-widest">Other Variants</span>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                      {entry.pronunciations.slice(1).map((pron, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-sans text-[14px] text-subtle tracking-wide">{pron.phonetic}</span>
                          {pron.audioUrl && (
                            <AudioButton url={pron.audioUrl} label="variant pronunciation" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!entry.phonetic && entry.partOfSpeech && (
              <div className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle">
                {entry.partOfSpeech.replace(/\./g, '')}
              </div>
            )}
            {entry.phonetic && entry.partOfSpeech && (
               <div className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle mt-2">
                 {entry.partOfSpeech.replace(/\./g, '')}
               </div>
            )}
          </div>
        </header>

        {/* Right Side: DEFINITIONS, SYNONYMS & ANTONYMS */}
        <div className="flex flex-col gap-12 lg:w-[65%] w-full">
          
          {/* DEFINITIONS */}
          {entry.definitions && entry.definitions.length > 0 && (
            <section className="flex flex-col gap-6">
              <h3 className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle">
                Definitions
              </h3>
              
              <div className="flex flex-col gap-8 w-full">
                {entry.definitions.map((def, idx) => (
                  <div key={idx} className="flex gap-4 sm:gap-6 w-full">
                    <div className="font-sans text-[11px] text-subtle mt-1.5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                      <p className="font-serif text-[18px] sm:text-[20px] text-foreground leading-[1.6]">
                        {def.text}
                      </p>
                      {def.example && (
                        <div className="flex gap-2">
                          <span className="font-sans text-[12px] text-muted mt-0.5">Example:</span>
                          <p className="font-serif italic text-[15px] sm:text-[16px] text-muted leading-relaxed">
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
            <section className="flex flex-col gap-8 pt-8 border-t border-border-subtle/50 w-full">
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
    <div className="flex flex-col gap-4 w-full">
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


const AudioButton = ({ url, label }: { url: string, label: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = async () => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
      }
      
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        console.error("Audio playback error");
      };
      
      await audioRef.current.play();
    } catch (err) {
      setIsPlaying(false);
      console.error(err);
    }
  };

  return (
    <button 
      onClick={handlePlay}
      disabled={isPlaying}
      aria-label={isPlaying ? `Pause ${label}` : `Listen to ${label}`}
      className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors group focus:outline-none focus:ring-1 focus:ring-border-subtle rounded px-1 -ml-1"
    >
      {isPlaying ? (
        <Loader2 size={13} className="animate-spin text-foreground" />
      ) : (
        <Volume2 size={14} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
};
