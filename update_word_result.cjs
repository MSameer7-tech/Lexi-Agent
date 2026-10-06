const fs = require('fs');
let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf-8');

// 1. Add generateExample to imports from lexiAgentApi
content = content.replace(
  "import { saveWord, removeSavedWord, isWordSaved } from '../../services/lexiAgentApi';",
  "import { saveWord, removeSavedWord, isWordSaved, generateExample } from '../../services/lexiAgentApi';"
);

// 2. Add state variables inside WordResult component
const stateHookTarget = "const [isSaved, setIsSaved] = useState(false);";
const stateHookReplacement = `const [isSaved, setIsSaved] = useState(false);
  const [aiExample, setAiExample] = useState<string | null>(null);
  const [isGeneratingExample, setIsGeneratingExample] = useState(false);`;
content = content.replace(stateHookTarget, stateHookReplacement);

// 3. Add handleGenerateExample function
const handleGenerateExampleFn = `
  const handleGenerateExample = async () => {
    if (!entry.word || isGeneratingExample) return;
    setIsGeneratingExample(true);
    try {
      const res = await generateExample(entry.word);
      if (res && res.example) {
        setAiExample(res.example);
      }
    } catch (err) {
      console.error('Failed to generate example', err);
    } finally {
      setIsGeneratingExample(false);
    }
  };
`;
// Insert before useEffect
content = content.replace(
  "  useEffect(() => {",
  handleGenerateExampleFn + "\n  useEffect(() => {"
);

// 4. Update the "In Context" section UI
const uiTarget = `{/* Examples in Context */}
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
            )}`;

const uiReplacement = `{/* Examples in Context */}
            {(allExamples.length > 0 || aiExample) ? (
              <div className="flex flex-col gap-4 mb-6">
                <span className="font-sans text-[9px] sm:text-[10px] text-foreground/60 uppercase tracking-[0.25em] font-medium">In Context</span>
                <div className="flex flex-col gap-3">
                  {allExamples.slice(0, 4).map((ex, i) => (
                    <p key={i} className="font-serif text-[13px] sm:text-[14px] text-foreground/80 leading-[1.45] italic border-l-[2px] border-border-subtle/50 pl-3 py-0.5">
                      "{ex}"
                    </p>
                  ))}
                  {aiExample && (
                    <p className="font-serif text-[13px] sm:text-[14px] text-foreground/80 leading-[1.45] italic border-l-[2px] border-border-subtle/50 pl-3 py-0.5">
                      "{aiExample}"
                    </p>
                  )}
                </div>
                {allExamples.length > 0 && !aiExample && (
                  <button onClick={handleGenerateExample} disabled={isGeneratingExample} className="text-left w-max font-sans text-[9px] sm:text-[10px] text-foreground/50 hover:text-foreground uppercase tracking-[0.25em] font-medium transition-colors mt-1">
                    {isGeneratingExample ? 'Generating...' : '+ Generate another example'}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                 <button onClick={handleGenerateExample} disabled={isGeneratingExample} className="text-left w-max font-sans text-[9px] sm:text-[10px] text-foreground/60 hover:text-foreground uppercase tracking-[0.25em] font-medium transition-colors flex items-center gap-2 border border-border-subtle/40 px-3 py-1.5 rounded-md hover:bg-border-subtle/10">
                    {isGeneratingExample ? (
                      <><span className="w-2.5 h-2.5 border border-foreground/30 border-t-foreground/80 rounded-full animate-spin"></span> Generating...</>
                    ) : (
                      '+ See example sentence'
                    )}
                 </button>
              </div>
            )}`;

content = content.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
console.log('Updated WordResult.tsx');
