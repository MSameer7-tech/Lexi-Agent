import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSavedWords, getWordHistory, removeSavedWord, saveWord } from '../services/lexiAgentApi';
import { WordResult } from '../components/dictionary/WordResult';
import { mapDictionaryApiToParsedEntry } from '../lib/parser';
import { Heart, Clock, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        // Refresh saved words to get the new row with exact created_at
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
    
    // Extract short def
    let shortDef = "";
    let pos = "";
    if (data?.meanings?.[0]) {
      pos = data.meanings[0].partOfSpeech || "";
      shortDef = data.meanings[0].definitions?.[0]?.definition || "";
    } else if (Array.isArray(data) && data[0]?.shortdef?.[0]) {
      pos = data[0].fl || "";
      shortDef = data[0].shortdef[0] || "";
    }

    const isExpanded = expandedWord === item.word;

    return (
      <div key={item.id || item.word} className="flex flex-col border-b border-border-subtle py-6">
        <div className="flex items-start justify-between group cursor-pointer" onClick={() => setExpandedWord(isExpanded ? null : item.word)}>
          <div className="flex flex-col gap-2 flex-1 pr-4">
            <div className="flex items-baseline gap-3">
              <h3 className="font-serif text-2xl text-foreground group-hover:text-muted transition-colors">{item.word}</h3>
              {pos && <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-subtle">{pos}</span>}
            </div>
            {shortDef && (
              <p className="font-sans text-sm text-muted line-clamp-2 leading-relaxed">
                {shortDef}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="font-sans text-[10px] uppercase tracking-widest text-subtle flex items-center gap-1.5">
                <Clock size={10} />
                {new Date(isSavedList ? item.created_at : item.last_seen_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleSave(item, isSaved); }}
            className="p-2 -mr-2 text-subtle hover:text-foreground transition-colors"
          >
            <Heart size={16} className={isSaved ? "fill-foreground text-foreground" : ""} />
          </button>
        </div>
        
        {isExpanded && data && (
          <div className="mt-6 pt-6 border-t border-border-subtle/30 bg-background-subtle rounded-sm">
            <div className="scale-[0.95] origin-top-left -mt-4 -ml-4 w-[105%]">
              <WordResult 
                entry={mapDictionaryApiToParsedEntry(data, "")} 
                rawDictionaryData={data} 
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full max-w-[1000px] mx-auto p-6 md:p-12 pb-24">
      <header className="mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight mb-4">Vocabulary</h1>
        <p className="font-sans text-sm text-muted uppercase tracking-widest">Your personal lexicon</p>
      </header>

      {error ? (
        <div className="text-red-500 font-sans text-sm">{error}</div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-subtle" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          
          <section className="flex flex-col">
            <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] text-foreground border-b border-foreground pb-4 mb-2">
              Recent Words
            </h2>
            {history.length === 0 ? (
              <div className="py-8 text-subtle font-sans text-sm italic">You haven't explored any words yet.</div>
            ) : (
              <div className="flex flex-col">
                {history.map(item => renderWordCard(item, false))}
              </div>
            )}
          </section>

          <section className="flex flex-col">
            <h2 className="font-sans text-[11px] uppercase tracking-[0.2em] text-foreground border-b border-foreground pb-4 mb-2">
              Saved
            </h2>
            {saved.length === 0 ? (
              <div className="py-8 text-subtle font-sans text-sm italic">No saved words yet.</div>
            ) : (
              <div className="flex flex-col">
                {saved.map(item => renderWordCard(item, true))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
};
