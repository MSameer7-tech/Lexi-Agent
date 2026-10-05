const fs = require('fs');
const content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* RIGHT SIDE: CARDS (Middle on Mobile, Right on Desktop) */}';
const endStr = '              {/* LEFT SIDE: SEARCH AREA (Bottom on Mobile, Left on Desktop) */}';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find boundaries');
  process.exit(1);
}

const replacement = `{/* RIGHT SIDE: PINTEREST STYLE WOTD CARD */}
              <div className="w-full md:h-[640px] relative overflow-hidden md:overflow-visible z-0 order-2 md:col-start-2 md:row-start-1 md:row-span-2 my-8 md:my-0 flex items-center justify-center md:justify-end pointer-events-none md:pointer-events-auto pr-0 md:pr-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => { if (wotdData?.word) { setQuery(wotdData.word); handleInitialSearch(wotdData.word); } }}
                  className="relative w-[90%] max-w-[340px] sm:max-w-[380px] md:max-w-[420px] aspect-[4/5] sm:aspect-[3/4] bg-[#F9F7F1] dark:bg-[#1E1D1A] rounded-[32px] sm:rounded-[48px] p-8 sm:p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] border border-black/5 dark:border-white/5 cursor-pointer flex flex-col justify-between overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] pointer-events-auto"
                >
                  {/* Subtle grain texture overlay */}
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                  
                  {/* Soft Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FDFCFB]/80 to-[#E2D1C3]/20 dark:from-[#2F2D28]/40 dark:to-[#1C1B19]/80 pointer-events-none transition-opacity duration-500 group-hover:opacity-70"></div>

                  {/* Header */}
                  <div className="relative flex justify-between items-start z-10">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.25em] uppercase text-black/40 dark:text-white/40 font-semibold">Word of the Day</span>
                      <span className="text-[10px] sm:text-xs font-serif text-black/30 dark:text-white/30 italic">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">
                      <Bookmark size={14} strokeWidth={2} className="text-black/40 dark:text-white/40" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative flex flex-col justify-end flex-1 z-10 pt-12">
                    {wotdData ? (
                      <>
                        <h2 className="font-serif text-[40px] sm:text-[48px] md:text-[56px] leading-[0.9] text-black/90 dark:text-white/90 tracking-tight mb-4 break-words group-hover:text-black dark:group-hover:text-white transition-colors">
                          {wotdData.word}
                        </h2>
                        
                        {wotdData.dictionary?.phonetic && (
                          <div className="flex items-center gap-3 mb-6">
                            <span className="font-sans text-sm sm:text-base text-black/50 dark:text-white/50 tracking-wide font-medium">{wotdData.dictionary.phonetic}</span>
                            <span className="text-[10px] sm:text-xs font-sans tracking-widest uppercase text-black/40 dark:text-white/40 px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">
                              {wotdData.dictionary.meanings?.[0]?.partOfSpeech || 'word'}
                            </span>
                          </div>
                        )}

                        {wotdData.dictionary?.meanings?.[0]?.definitions?.[0]?.definition ? (
                          <p className="font-serif text-sm sm:text-base md:text-lg text-black/60 dark:text-white/60 leading-relaxed line-clamp-3 italic">
                            "{wotdData.dictionary.meanings[0].definitions[0].definition}"
                          </p>
                        ) : (
                          <p className="font-sans text-xs sm:text-sm md:text-base text-black/40 dark:text-white/40 leading-tight">
                            tap to discover<br/>full meaning & synonyms
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <span className="w-6 h-6 border-2 border-black/20 dark:border-white/20 border-t-black/60 dark:border-t-white/60 rounded-full animate-spin"></span>
                        <span className="text-xs font-sans tracking-widest uppercase text-black/30 dark:text-white/30">Curating...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log('Replaced successfully');
