import * as fs from 'fs';

let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf8');

if (!content.includes('import { Heart } from \'lucide-react\';')) {
  content = content.replace(
    "import { PlayCircle } from 'lucide-react';",
    "import { PlayCircle, Heart } from 'lucide-react';\nimport { useState, useEffect } from 'react';\nimport { useAuth } from '../../contexts/AuthContext';\nimport { useNavigate } from 'react-router-dom';\nimport { isWordSaved, saveWord, removeSavedWord } from '../../services/lexiAgentApi';"
  );
}

const componentStart = `export const WordResult: React.FC<WordResultProps> = ({ entry }) => {

  const handleListen = () => {`;

const newComponentStart = `export const WordResult: React.FC<WordResultProps> = ({ entry }) => {
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
        await saveWord(entry.word, entry.rawDictionaryData || {});
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
      setSaveError("Couldn't save this word. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleListen = () => {`;

content = content.replace(componentStart, newComponentStart);

const targetInsert = `        {/* WORD, PRONUNCIATION, POS */}
        <header className="flex flex-col gap-4">`;

const replaceInsert = `        {/* WORD, PRONUNCIATION, POS */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[28px] sm:text-[30px] lg:text-[32px] font-medium text-foreground tracking-tight leading-none">
              {entry.word}
            </h2>
            <div className="flex flex-col items-end">
              <button 
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={\`flex items-center gap-2 font-sans text-[11px] uppercase tracking-widest transition-colors duration-300 \${isSaved ? 'text-foreground' : 'text-muted hover:text-foreground'} \${isSaving ? 'opacity-50' : ''}\`}
              >
                <Heart size={14} className={isSaved ? 'fill-foreground text-foreground' : ''} />
                <span>{isSaved ? 'Saved' : 'Save word'}</span>
              </button>
              {saveError && <span className="text-[10px] text-red-500 mt-1 font-sans">{saveError}</span>}
            </div>
          </div>`;

content = content.replace(`        {/* WORD, PRONUNCIATION, POS */}
        <header className="flex flex-col gap-4">
          <h2 className="font-serif text-[28px] sm:text-[30px] lg:text-[32px] font-medium text-foreground tracking-tight leading-none">
            {entry.word}
          </h2>`, replaceInsert);

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
