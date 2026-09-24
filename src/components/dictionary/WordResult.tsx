import React from 'react';
import { Volume2, Loader2, Heart } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
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
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (session && entry.word) {
      isWordSaved(entry.word)
        .then(res => setIsSaved(res.saved))
        .catch(err => console.error("Failed to check saved status:", err));
    }
  }, [session, entry.word]);

  const handleSaveToggle = async () => {
    if (!session) {
      if (confirm("Sign in to save words to your Vocabulary Library. Go to sign in?")) {
        navigate('/auth');
      }
      return;
    }

    if (!entry.word) return;

    try {
      setIsSaving(true);
      setSaveError('');
      
      if (isSaved) {
        await removeSavedWord(entry.word);
        setIsSaved(false);
      } else {
        await saveWord(entry.word, rawDictionaryData);
        setIsSaved(true);
      }
    } catch (err: any) {
      console.error("Save toggle error:", err);
      setSaveError(err.message || 'Failed to update saved status');
    } finally {
      setIsSaving(false);
    }
  };

  if (!entry.word || (!entry.meanings || entry.meanings.length === 0)) return null;

  // Extract all examples from all definitions to display on the left
  const allExamples: string[] = [];
  if (entry.meanings) {
    entry.meanings.forEach(m => {
      m.definitions.forEach(d => {
        if (d.example) {
          allExamples.push(d.example);
        }
      });
    });
  }

  // Editorial date label
  const dateStr = `${String(new Date().getDate()).padStart(2, '0')}.${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  const colorClasses = getCardColorClasses(entry.word || 'default');

  return (
    <div className={`w-full max-w-[960px] relative shadow-[0_12px_24px_-10px_rgba(42,41,40,0.05)] dark:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.2)] rounded-[20px] p-6 sm:p-8 lg:px-10 lg:py-9 transition-all border ${colorClasses}`}>
      
      {/* INTRODUCTORY AI RESPONSE */}
      {entry.rawMarkdown && (
        <div className="w-full lg:max-w-[80%] font-serif text-[14px] sm:text-[15px] text-foreground/80 leading-[1.6] prose prose-stone prose-p:text-foreground/80 dark:prose-invert max-w-none mb-8 relative border-b border-border-subtle/30 pb-6">
          <div className="font-sans text-[9px] uppercase tracking-[0.25em] text-foreground/60 font-medium mb-3 flex items-center gap-3">
            <span className="w-3 h-[1px] bg-foreground/30"></span>
            LexiAgent · Explanation
          </div>
          <MarkdownRenderer content={entry.rawMarkdown} />
        </div>
      )}

      {/* MAIN DICTIONARY CONTENT (Asymmetric 40/60 Split) */}
      <div className="w-full flex flex-col lg:flex-row gap-10 xl:gap-14">
        
        {/* LEFT SIDE: WORD IDENTITY (40%) */}
        <header className="flex flex-col lg:w-[40%] shrink-0">
          
          {/* Pinterest/Editorial annotation */}
          <div className="font-sans text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-foreground/50 font-medium mb-5">
            Dictionary Entry / {dateStr}
          </div>

          <div className="flex items-start justify-between mb-6">
            <h2 className="font-serif text-[36px] sm:text-[40px] lg:text-[42px] font-medium text-foreground tracking-tighter leading-none">
              {entry.word}
            </h2>
            
            {/* SAVE BUTTON */}
            <div className="shrink-0 mt-2 ml-4 flex flex-col items-end">
              <button 
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={`flex items-center gap-2 font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${isSaved ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'} ${isSaving ? 'opacity-50' : ''}`}
              >
                {isSaved ? <Heart size={14} className="fill-foreground text-foreground" /> : <Heart size={14} />}
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              {saveError && <span className="text-[10px] text-red-500 mt-2 font-sans">{saveError}</span>}
            </div>
          </div>
          
          <div className="flex flex-col">
            {/* Part of Speech */}
            {entry.meanings?.[0]?.partOfSpeech && (
              <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-foreground/60 font-medium mb-4">
                {entry.meanings[0].partOfSpeech.replace(/\./g, '')}
              </span>
            )}

            {/* Pronunciation & Audio */}
            {entry.phonetic && (
              <div className="flex items-center gap-4 mb-6">
                <span className="font-sans text-[15px] sm:text-[16px] text-foreground/80 tracking-wide">{entry.phonetic}</span>
                {entry.pronunciations?.[0]?.audioUrl && (
                  <AudioButton url={entry.pronunciations[0].audioUrl} label="pronunciation" />
                )}
              </div>
            )}

            {/* Examples in Context */}
            {allExamples.length > 0 && (
              <div className="flex flex-col gap-4 mb-6">
                <span className="font-sans text-[9px] sm:text-[10px] text-foreground/60 uppercase tracking-[0.25em] font-medium">In Context</span>
                <div className="flex flex-col gap-3">
                  {allExamples.slice(0, 4).map((ex, i) => (
                    <p key={i} className="font-serif text-[13px] sm:text-[14px] text-foreground/80 leading-[1.45] italic border-l-[2px] border-border-subtle/50 pl-3 py-0.5">
                      "{ex}"
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Other Variants */}
            {entry.pronunciations && entry.pronunciations.length > 1 && (
              <div className="flex flex-col gap-4 mt-2 pt-5 border-t border-border-subtle/20">
                <span className="font-sans text-[9px] text-foreground/60 uppercase tracking-[0.25em] font-medium">Other Pronunciations</span>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {entry.pronunciations.slice(1).map((pron, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-sans text-[13px] text-subtle tracking-wide">{pron.phonetic}</span>
                      {pron.audioUrl && (
                        <AudioButton url={pron.audioUrl} label="variant pronunciation" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* RIGHT SIDE: DEFINITIONS (60%) */}
        <div className="flex flex-col gap-10 lg:w-[60%] w-full pt-1 lg:pt-8">
          {entry.meanings && entry.meanings.map((meaning, mIdx) => (
            <section key={mIdx} className="flex flex-col">
              <h3 className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-foreground/60 font-medium border-b border-foreground/10 pb-3 mb-6">
                {meaning.partOfSpeech.replace(/\./g, '')}
              </h3>
              
              <div className="flex flex-col gap-8 w-full">
                {meaning.definitions.map((def, dIdx) => (
                  <div key={dIdx} className="flex gap-4 sm:gap-6 w-full group">
                    <div className="font-sans text-[9px] sm:text-[10px] text-subtle/40 mt-[3px] shrink-0 font-medium transition-opacity group-hover:text-subtle/70">
                      {String(dIdx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <p className="font-serif text-[16px] sm:text-[17px] text-foreground/90 leading-[1.5]">
                        {def.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* SYNONYMS & ANTONYMS (Full width, 2-column editorial footer) */}
      {(entry.synonyms || entry.antonyms) && (
        <section className="flex flex-col md:flex-row gap-8 lg:gap-12 xl:gap-16 w-full mt-10 pt-8 border-t border-border-subtle/20">
          
          {entry.synonyms && entry.synonyms.length > 0 && (
            <div className="flex-1 flex flex-col gap-4">
               <h4 className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-foreground/60 font-medium">Synonyms</h4>
               <WordListCluster words={entry.synonyms} />
            </div>
          )}

          {entry.synonyms && entry.synonyms.length > 0 && entry.antonyms && entry.antonyms.length > 0 && (
            <div className="hidden md:block w-[1px] bg-border-subtle/20"></div>
          )}

          {entry.antonyms && entry.antonyms.length > 0 && (
            <div className="flex-1 flex flex-col gap-4">
               <h4 className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-foreground/60 font-medium">Antonyms</h4>
               <WordListCluster words={entry.antonyms} />
            </div>
          )}

        </section>
      )}
      
    </div>
  );
};

const WordListCluster = ({ words }: { words: string[] }) => {
  const [expanded, setExpanded] = useState(false);
  if (!words || words.length === 0) return null;
  
  const limit = 24;
  const isExpandable = words.length > limit;
  const displayWords = expanded ? words : words.slice(0, limit);
  
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {displayWords.map((word, i) => (
        <span key={i} className="font-serif text-[13.5px] sm:text-[14px] text-foreground/80 leading-[1.75]">
          {word}
        </span>
      ))}
      {isExpandable && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="font-sans text-[9px] uppercase tracking-[0.2em] text-foreground/50 hover:text-foreground transition-colors ml-1 mt-[2px]"
        >
          {expanded ? 'Show less' : `+ ${words.length - limit} more`}
        </button>
      )}
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
      className="flex items-center justify-center w-7 h-7 rounded-full bg-border-subtle/10 text-muted hover:text-foreground hover:bg-border-subtle/30 transition-all group focus:outline-none focus:ring-2 focus:ring-border-subtle shrink-0"
    >
      {isPlaying ? (
        <Loader2 size={13} className="animate-spin text-foreground" />
      ) : (
        <Volume2 size={14} strokeWidth={2.5} className="group-hover:scale-110 transition-transform ml-[1px]" />
      )}
    </button>
  );
};
