const fs = require('fs');
let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf-8');

// 1. Remove the old button from the left side
const oldLeftSectionTarget = `{/* Examples in Context */}
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

const leftReplacement = `{/* Examples in Context */}
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

content = content.replace(oldLeftSectionTarget, leftReplacement);


// 2. Add the button and AI example to the right side, at the bottom of the definitions list
const rightSectionTarget = `                  </div>
                ))}
              </div>
            </section>
          ))}`;

const rightSectionReplacement = `                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* AI Example Sentence Button (Right side, prominent) */}
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
          </div>
`;

content = content.replace(rightSectionTarget, rightSectionReplacement);

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
console.log('Moved example button to right side');
