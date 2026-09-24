import React from 'react';
import { Volume2, Loader2, Bookmark } from 'lucide-react';
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
  const colorClasses = getCardColorClasses(entry.word || 'default');
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

  return (
    <div className={`w-full relative shadow-[0_12px_24px_-10px_rgba(42,41,40,0.05)] dark:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.2)] rounded-[20px] p-8 sm:p-10 lg:p-12 transition-all border ${colorClasses}`}>
      
      {/* TOP INTRO SECTION */}
      <div className={`w-full flex ${entry.rawMarkdown ? 'flex-col sm:flex-row justify-between items-start gap-6 border-b border-border-subtle/30 mb-10 pb-8' : 'justify-end mb-6'}`}>
        {entry.rawMarkdown && (
          <div className="w-full sm:max-w-[75%] font-serif text-[16px] md:text-[17px] text-foreground/90 leading-relaxed prose prose-stone dark:prose-invert max-w-none">
            <MarkdownRenderer content={entry.rawMarkdown} />
          </div>
        )}
        
        {/* Save Button */}
        <div className="shrink-0 mt-2 sm:mt-0 flex flex-col items-end">
          <button 
            onClick={handleSaveToggle}
            disabled={isSaving}
            className={`flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest transition-colors duration-300 ${isSaved ? 'text-foreground' : 'text-muted hover:text-foreground'} ${isSaving ? 'opacity-50' : ''}`}
          >
            <Bookmark size={14} className={isSaved ? 'fill-foreground text-foreground' : ''} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save word'}</span>
          </button>
          {saveError && <span className="text-[10px] text-red-500 mt-2 font-sans">{saveError}</span>}
        </div>
      </div>

      <div className="w-full flex flex-col gap-10 lg:gap-14">
        
        {/* 40/60 Split */}
        <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24">
          
          {/* LEFT SIDE: WORD IDENTITY (40%) */}
          <header className="flex flex-col gap-8 lg:w-[40%] shrink-0">
            <h2 className="font-serif text-[46px] sm:text-[52px] lg:text-[60px] font-medium text-foreground tracking-tight leading-none">
              {entry.word}
            </h2>
            
            <div className="flex flex-col gap-6">
              {/* Part of Speech */}
              {entry.meanings?.[0]?.partOfSpeech && (
                <span className="font-sans text-[12px] sm:text-[13px] uppercase tracking-[0.2em] text-subtle font-medium">
                  {entry.meanings[0].partOfSpeech.replace(/\\./g, '')}
                </span>
              )}

              {/* Pronunciation & Audio */}
              {entry.phonetic && (
                <div className="flex items-center gap-4">
                  <span className="font-sans text-[17px] sm:text-[19px] text-foreground tracking-wide font-medium">{entry.phonetic}</span>
                  {entry.pronunciations?.[0]?.audioUrl && (
                    <AudioButton url={entry.pronunciations[0].audioUrl} label="pronunciation" />
                  )}
                </div>
              )}

              {/* Short Meaning Descriptor */}
              {entry.meanings?.[0]?.definitions?.[0]?.text && (
                <p className="font-serif text-[17px] text-foreground/85 leading-[1.6] italic mt-2 border-l-[3px] border-border-subtle/40 pl-5 py-1">
                  "{entry.meanings[0].definitions[0].text}"
                </p>
              )}
              
              {/* Other Variants */}
              {entry.pronunciations && entry.pronunciations.length > 1 && (
                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border-subtle/30">
                  <span className="font-sans text-[10px] text-subtle uppercase tracking-widest font-medium">Other Variants</span>
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
          </header>

          {/* RIGHT SIDE: DEFINITIONS (60%) */}
          <div className="flex flex-col gap-14 lg:w-[60%] w-full">
            {entry.meanings && entry.meanings.map((meaning, mIdx) => (
              <section key={mIdx} className="flex flex-col gap-6">
                <h3 className="font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-subtle font-semibold border-b border-border-subtle/40 pb-3">
                  {meaning.partOfSpeech.replace(/\\./g, '')}
                </h3>
                
                <div className="flex flex-col gap-10 w-full mt-2">
                  {meaning.definitions.map((def, dIdx) => (
                    <div key={dIdx} className="flex gap-5 sm:gap-8 w-full group">
                      <div className="font-sans text-[11px] sm:text-[12px] text-subtle mt-1.5 shrink-0 select-none font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                        {String(dIdx + 1).padStart(2, '0')}
                      </div>
                      <div className="flex flex-col gap-3 w-full">
                        <p className="font-serif text-[18px] sm:text-[20px] text-foreground leading-[1.6]">
                          {def.text}
                        </p>
                        {def.example && (
                          <div className="flex gap-3 mt-1">
                            <span className="font-sans text-[12px] text-muted mt-[3px] shrink-0">Example:</span>
                            <p className="font-serif italic text-[15.5px] sm:text-[16.5px] text-muted leading-[1.7]">
                              "{def.example}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* FULL-WIDTH SYNONYMS & ANTONYMS */}
        {(entry.synonyms || entry.antonyms) && (
          <section className="flex flex-col gap-10 pt-10 border-t border-border-subtle/30 w-full mt-2">
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
  
  // For a full width section, we can show more words before truncating
  const limit = 16;
  const isExpandable = words.length > limit;
  const displayWords = expanded ? words : words.slice(0, limit);
  
  return (
    <div className="flex flex-col gap-5 w-full">
      <h4 className="font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-subtle font-semibold">{title}</h4>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {displayWords.map((word, i) => (
          <React.Fragment key={i}>
            <span className="font-serif text-[16px] sm:text-[17.5px] text-foreground/90 leading-none">{word}</span>
            {(i < displayWords.length - 1 || (!expanded && isExpandable)) && (
              <span className="text-subtle/30 select-none px-1">·</span>
            )}
          </React.Fragment>
        ))}
        {isExpandable && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors ml-2 border-b border-muted/30 hover:border-foreground pb-0.5 mt-0.5"
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
      className="flex items-center justify-center w-7 h-7 rounded-full bg-border-subtle/20 text-muted hover:text-foreground hover:bg-border-subtle/40 transition-all group focus:outline-none focus:ring-2 focus:ring-border-subtle"
    >
      {isPlaying ? (
        <Loader2 size={13} className="animate-spin text-foreground" />
      ) : (
        <Volume2 size={14} strokeWidth={2.5} className="group-hover:scale-110 transition-transform ml-[1px]" />
      )}
    </button>
  );
};
