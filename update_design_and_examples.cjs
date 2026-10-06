const fs = require('fs');
let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf-8');

// 1. Fix AI Examples State (Array instead of single string)
content = content.replace(
  "const [aiExample, setAiExample] = useState<string | null>(null);",
  "const [aiExamples, setAiExamples] = useState<string[]>([]);"
);

// Update reset
content = content.replace(
  "setAiExample(null);",
  "setAiExamples([]);"
);

// Update generation logic
const genLogicTarget = `      if (res && res.example) {
        setAiExample(res.example);
      }`;
const genLogicReplacement = `      if (res && res.example) {
        setAiExamples(prev => [...prev, res.example]);
      }`;
content = content.replace(genLogicTarget, genLogicReplacement);

// 2. Fix Card Colors
const colorsTarget = `  const colors = [
    'bg-[#FFE6E0]/40 dark:bg-[#51332F]/40 border-[#FFD9D0]/50 dark:border-[#63403B]/50', // Pink
    'bg-[#DCE4FF]/40 dark:bg-[#283566]/40 border-[#CDDAFF]/50 dark:border-[#33427D]/50', // Blue
    'bg-[#E5D9FF]/40 dark:bg-[#3B2C59]/40 border-[#D9CAFF]/50 dark:border-[#4B3A70]/50', // Purple
    'bg-[#FFF1CC]/40 dark:bg-[#594B22]/40 border-[#FFE9A6]/50 dark:border-[#6E5D2A]/50'  // Yellow
  ];`;
const colorsReplacement = `  const colors = [
    'bg-[#FFE6E0]/60 dark:bg-[#51332F]/60 border-[#FFD9D0]/80 dark:border-[#63403B]/80', // Pink
    'bg-[#DCE4FF]/60 dark:bg-[#283566]/60 border-[#CDDAFF]/80 dark:border-[#33427D]/80', // Blue
    'bg-[#E5D9FF]/60 dark:bg-[#3B2C59]/60 border-[#D9CAFF]/80 dark:border-[#4B3A70]/80', // Purple
    'bg-[#FFF1CC]/60 dark:bg-[#594B22]/60 border-[#FFE9A6]/80 dark:border-[#6E5D2A]/80'  // Yellow
  ];`;
content = content.replace(colorsTarget, colorsReplacement);

// 3. Fix Typography and Contrast throughout the file
content = content.replace(/text-foreground\/60/g, 'text-foreground/75');
content = content.replace(/text-foreground\/80/g, 'text-foreground/90');
content = content.replace(/text-foreground\/90/g, 'text-foreground');
content = content.replace(/text-subtle\/40/g, 'text-subtle/60');
content = content.replace(/group-hover:text-subtle\/70/g, 'group-hover:text-subtle');


// 4. Update Right Section AI Example UI
const rightSectionTarget = `          {/* AI Example Sentence Button (Right side, prominent) */}
          <div className="mt-2 flex flex-col gap-3">
            {aiExample ? (
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[9px] sm:text-[10px] text-foreground/60 uppercase tracking-[0.25em] font-medium">AI Generated Example</span>
                <p className="font-serif text-[15px] sm:text-[16px] text-foreground/90 leading-[1.5] italic border-l-[2px] border-foreground/30 pl-4 py-1">
                  "{aiExample}"
                </p>
              </div>
            ) : (
              <button 
                onClick={handleGenerateExample} 
                disabled={isGeneratingExample} 
                className="group relative overflow-hidden flex items-center justify-center gap-2 w-full sm:w-auto self-start px-5 py-2.5 bg-foreground text-background rounded-full font-sans text-[11px] uppercase tracking-[0.15em] font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isGeneratingExample ? (
                  <><span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin"></span> Generating...</>
                ) : (
                  <>✨ Generate Example Sentence</>
                )}
              </button>
            )}
          </div>`;

const rightSectionReplacement = `          {/* AI Example Sentences (Right side) */}
          <div className="mt-4 flex flex-col gap-5 pt-4 border-t border-border-subtle/20">
            {aiExamples.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="font-sans text-[9px] sm:text-[10px] text-foreground/75 uppercase tracking-[0.25em] font-semibold">Examples in context</span>
                <div className="flex flex-col gap-4">
                  {aiExamples.map((ex, idx) => (
                    <p key={idx} className="font-serif text-[15px] sm:text-[16px] text-foreground leading-[1.6] border-l-[2px] border-border-subtle/60 pl-4 py-0.5">
                      {ex}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleGenerateExample} 
              disabled={isGeneratingExample} 
              className="group relative overflow-hidden flex items-center justify-center gap-2 w-full sm:w-auto self-start px-4 py-2 bg-background border border-border-subtle/50 text-foreground rounded-md font-sans text-[10px] uppercase tracking-[0.1em] font-semibold hover:bg-border-subtle/10 hover:border-foreground/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed mt-2"
            >
              {isGeneratingExample ? (
                <><span className="w-3 h-3 border border-foreground/30 border-t-foreground rounded-full animate-spin"></span> Generating...</>
              ) : (
                aiExamples.length > 0 ? "+ Generate another" : "✨ Generate Example"
              )}
            </button>
          </div>`;

content = content.replace(rightSectionTarget, rightSectionReplacement);

// 5. Clean up old left-side aiExample references
content = content.replace("allExamples.length > 0 || aiExample", "allExamples.length > 0");
content = content.replace(/\{aiExample && \(\n.*?\{aiExample\}"\n.*?\)\}/s, "");

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
console.log('Applied design updates and multi-example support');
