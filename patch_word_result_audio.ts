import * as fs from 'fs';

let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf8');

// Replace the imports to include Volume2 and Loader2
content = content.replace("import { PlayCircle, Heart } from 'lucide-react';", "import { Volume2, Loader2, Heart } from 'lucide-react';\nimport { useRef } from 'react';");

// Remove handleListen function
content = content.replace(/  const handleListen = \(\) => {[\s\S]*?  };\n/, '');

const oldPronunciationBlock = `          <div className="flex flex-col gap-3">
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
                {entry.partOfSpeech.replace(/\\./g, '')}
              </div>
            )}
          </div>`;

const newPronunciationBlock = `          <div className="flex flex-col gap-3">
            {entry.phonetic && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-sans text-[11px] text-subtle uppercase tracking-widest">Pronunciation</span>
                  <span className="font-sans text-[15px] sm:text-[16px] text-foreground tracking-wide">{entry.phonetic}</span>
                  {entry.pronunciations?.[0]?.audioUrl && (
                    <AudioButton url={entry.pronunciations[0].audioUrl} label="pronunciation" />
                  )}
                </div>
                
                {/* Other pronunciations variants if they exist */}
                {entry.pronunciations && entry.pronunciations.length > 1 && (
                  <div className="flex flex-col gap-1.5 mt-1 border-l border-border-subtle/50 pl-3">
                    <span className="font-sans text-[9px] text-subtle uppercase tracking-widest">Other Variants</span>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
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
            )}
            
            {!entry.phonetic && entry.partOfSpeech && (
              <div className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle">
                {entry.partOfSpeech.replace(/\\./g, '')}
              </div>
            )}
            {entry.phonetic && entry.partOfSpeech && (
               <div className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-subtle mt-1">
                 {entry.partOfSpeech.replace(/\\./g, '')}
               </div>
            )}
          </div>`;

content = content.replace(oldPronunciationBlock, newPronunciationBlock);

// Inject AudioButton Component
const audioButtonComponent = `
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
      aria-label={isPlaying ? \`Pause \${label}\` : \`Listen to \${label}\`}
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
`;

content += audioButtonComponent;

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
