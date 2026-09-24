import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSavedWords, getWordHistory, removeSavedWord, saveWord } from '../services/lexiAgentApi';
import { WordResult } from '../components/dictionary/WordResult';
import { mapDictionaryApiToParsedEntry } from '../lib/parser';
import { Heart, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const getVocabularyCardClasses = (word: string) => {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 6;
  const rotateIndex = Math.abs(hash) % 3;
  
  const colors = [
    'bg-[#FDF7F5] dark:bg-[#332A29] border-[#F2E5E1] dark:border-[#453837]', // Blush
    'bg-[#F5F8F5] dark:bg-[#282E29] border-[#E3ECE3] dark:border-[#384239]', // Sage
    'bg-[#F5F8FC] dark:bg-[#282B33] border-[#E2E9F2] dark:border-[#383C47]', // Blue
    'bg-[#FCFAF2] dark:bg-[#333026] border-[#EBE6D8] dark:border-[#474236]', // Butter
    'bg-[#FCF6F0] dark:bg-[#362D26] border-[#EDE0D3] dark:border-[#4A3E36]', // Peach
    'bg-[#F8F5FC] dark:bg-[#2B2733] border-[#E6DEF2] dark:border-[#3D3747]'  // Lavender
  ];

  const rotations = ['-rotate-1', 'rotate-0', 'rotate-1'];
  return `${colors[index]} ${rotations[rotateIndex]} transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:border-foreground/20 dark:hover:border-foreground/30 cursor-pointer border rounded-[12px] p-5 sm:p-6 mb-4 sm:mb-6 flex flex-col group`;
};

export const Vocabulary: React.FC = () => {
  const { session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (session) {
      setLoading(true);
      Promise.all([
        getWordHistory().catch(e => { console.error(e); return { word_history: [] }; }),
        getSavedWords().catch(e => { console.error(e); return { saved_words: [] }; })
      ]).then(([historyRes, savedRes]) => {
        setHistory(historyRes.word_history || []);
        setSaved(savedRes.saved_words || []);
        setLoading(false);
      }).catch((_err) => {
        setError("Vocabulary history couldn't be loaded.");
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [session, authLoading]);

  const toggleSave = async (wordObj: any, isCurrentlySaved: boolean) => {
    try {
      if (isCurrentlySaved) {
        await removeSavedWord(wordObj.word);
        setSaved(prev => prev.filter(w => w.word !== wordObj.word));
      } else {
        await saveWord(wordObj.word, wordObj.dictionary_data);
        const savedRes = await getSavedWords();
        setSaved(savedRes.saved_words || []);
      }
    } catch (err) {
      alert("Couldn't save this word. Please try again.");
    }
  };

  if (authLoading) return null;

  if (!session) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-6 min-h-[70vh]">
        <div className="w-full max-w-[400px] flex flex-col items-center gap-6 p-10 text-center">
          <h1 className="font-serif text-3xl font-medium text-foreground tracking-tight">Vocabulary Library</h1>
          <p className="font-sans text-sm text-subtle">
            Sign in to unlock your personal dictionary history and save words for later.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="group flex items-center justify-between w-full border border-foreground bg-foreground text-background py-3 px-4 font-sans text-[11px] uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300"
          >
            <span>Sign In to LexiAgent</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  const renderWordCard = (item: any, isSavedList: boolean) => {
    const isSaved = saved.some(w => w.word === item.word);
    const data = item.dictionary_data;
    
    let shortDef = "";
    let pos = "";
    if (data?.meanings?.[0]) {
      pos = data.meanings[0].partOfSpeech || "";
      shortDef = data.meanings[0].definitions?.[0]?.definition || "";
    } else if (Array.isArray(data) && data[0]?.shortdef?.[0]) {
      pos = data[0].fl || "";
      shortDef = data[0].shortdef[0] || "";
    }

    return (
      <div 
        key={item.id || item.word} 
        className={getVocabularyCardClasses(item.word)}
        onClick={() => setExpandedWord(item.word)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-serif text-[20px] sm:text-[22px] text-foreground font-medium leading-none">{item.word}</h3>
            {pos && <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-foreground/50">{pos}</span>}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleSave(item, isSaved); }}
            className="p-1 -mr-1 -mt-1 text-subtle hover:text-foreground transition-colors z-10"
          >
            <Heart size={14} className={isSaved ? "fill-foreground text-foreground" : ""} />
          </button>
        </div>
        
        {shortDef && (
          <p className="font-sans text-[13px] sm:text-[14px] text-foreground/80 line-clamp-2 leading-relaxed mb-4">
            {shortDef}
          </p>
        )}
        
        <div className="mt-auto pt-2 border-t border-border-subtle/40">
          <span className="font-sans text-[8px] sm:text-[9px] uppercase tracking-widest text-foreground/40 flex items-center gap-1.5">
            ◷ {new Date(isSavedList ? item.created_at : item.last_seen_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  };

  const expandedItem = useMemo(() => {
    if (!expandedWord) return null;
    return saved.find(w => w.word === expandedWord) || history.find(w => w.word === expandedWord);
  }, [expandedWord, history, saved]);

  return (
    <div className="flex-1 w-full max-w-[1150px] mx-auto px-6 sm:px-10 lg:px-16 pt-12 pb-24">
      <header className="mb-14">
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight mb-4">Vocabulary</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <p className="font-sans text-xs text-muted uppercase tracking-[0.2em]">Your personal lexicon</p>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-border-strong"></span>
          <p className="font-sans text-[9px] text-subtle uppercase tracking-[0.25em]">LexiAgent · Archive</p>
        </div>
      </header>

      {error ? (
        <div className="text-red-500 font-sans text-sm">{error}</div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-subtle" />
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          
          <AnimatePresence>
            {expandedItem && expandedItem.dictionary_data && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full overflow-hidden"
              >
                <div className="pb-8">
                  <WordResult 
                    entry={mapDictionaryApiToParsedEntry(expandedItem.dictionary_data, "")} 
                    rawDictionaryData={expandedItem.dictionary_data}
                    variant="vocabulary"
                    onClose={() => setExpandedWord(null)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <section className="flex flex-col">
              <h2 className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-foreground border-b border-border-strong pb-4 mb-8">
                Recent Words
              </h2>
              {history.length === 0 ? (
                <div className="flex flex-col gap-3 py-4 text-foreground/70 font-serif italic text-sm">
                  <p>Your vocabulary trail starts here.</p>
                  <p>Look up a word to begin building your lexicon.</p>
                  <button onClick={() => navigate('/')} className="text-left mt-2 font-sans text-[10px] uppercase tracking-widest text-foreground hover:text-muted transition-colors">
                    Explore a word →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {history.map(item => renderWordCard(item, false))}
                </div>
              )}
            </section>

            <section className="flex flex-col">
              <h2 className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-foreground border-b border-border-strong pb-4 mb-8">
                Saved
              </h2>
              {saved.length === 0 ? (
                <div className="flex flex-col gap-3 py-4 text-foreground/70 font-serif italic text-sm">
                  <p>Your saved words will appear here.</p>
                  <p>Save a word while exploring to build your personal lexicon.</p>
                  <button onClick={() => navigate('/')} className="text-left mt-2 font-sans text-[10px] uppercase tracking-widest text-foreground hover:text-muted transition-colors flex items-center gap-2">
                    <Heart size={12} /> Save your first word
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {saved.map(item => renderWordCard(item, true))}
                </div>
              )}
            </section>
          </div>

        </div>
      )}
    </div>
  );
};
