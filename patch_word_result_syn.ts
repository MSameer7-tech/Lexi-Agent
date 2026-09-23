import * as fs from 'fs';

let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf8');

const targetSection = `{/* SYNONYMS & ANTONYMS */}
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
        )}`;

const newSection = `{/* SYNONYMS & ANTONYMS */}
        {(entry.synonyms || entry.antonyms) && (
          <section className="flex flex-col gap-8 pt-6 border-t border-border-subtle/50">
            {entry.synonyms && entry.synonyms.length > 0 && (
              <WordListSection title="Synonyms" words={entry.synonyms} />
            )}
            
            {entry.antonyms && entry.antonyms.length > 0 && (
              <WordListSection title="Antonyms" words={entry.antonyms} />
            )}
          </section>
        )}`;

content = content.replace(targetSection, newSection);

const wordListSectionComponent = `
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
            {expanded ? 'Show less' : \`+ \${words.length - limit} more\`}
          </button>
        )}
      </div>
    </div>
  );
};

`;

// Insert the subcomponent at the end of the file, outside the WordResult component
content += wordListSectionComponent;

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
