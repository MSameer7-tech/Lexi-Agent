const fs = require('fs');
let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf-8');

const rightSectionTarget = `          {/* AI Example Sentence Button (Right side, prominent) */}
          <div className="mt-2 flex flex-col gap-3">
            {aiExample ? (
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[9px] sm:text-[10px] text-foreground/75 uppercase tracking-[0.25em] font-medium">AI Generated Example</span>
                <p className="font-serif text-[15px] sm:text-[16px] text-foreground leading-[1.5] italic border-l-[2px] border-foreground/30 pl-4 py-1">
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

// Just to be sure, make sure 'aiExample' variable usages that I missed in JS are gone
content = content.replace(/aiExample/g, 'aiExamples');
content = content.replace(/aiExampless/g, 'aiExamples');
content = content.replace(/setAiExampless/g, 'setAiExamples');

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
console.log('Fixed AI Example section correctly');
