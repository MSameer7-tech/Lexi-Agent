const fs = require('fs');
const content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* RIGHT SIDE: PINTEREST STYLE WOTD CARD */}';
const endStr = '              {/* LEFT SIDE: SEARCH AREA (Bottom on Mobile, Left on Desktop) */}';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find boundaries');
  process.exit(1);
}

const replacement = `{/* RIGHT SIDE: PINTEREST STYLE WOTD CARD CLUSTER */}
              <div className="w-full md:h-[640px] relative overflow-hidden md:overflow-visible z-0 order-2 md:col-start-2 md:row-start-1 md:row-span-2 my-8 md:my-0 flex items-center justify-center pointer-events-none md:pointer-events-auto">
                <div className="relative flex items-center justify-center w-full max-w-[380px]">
                  
                  {/* ELOQUENT (Pink) */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: -6, y: 10 }}
                    animate={{ opacity: 1, y: [4, -4, 4] }}
                    transition={{ opacity: { duration: 0.8, delay: 0.3 }, y: { repeat: Infinity, duration: 14, ease: "easeInOut" } }}
                    className="absolute -top-[5%] -left-[5%] md:-left-[15%] w-[130px] h-[150px] sm:w-[150px] sm:h-[170px] md:w-[170px] md:h-[190px] bg-[#FFE6E0] dark:bg-[#51332F] p-4 md:p-5 shadow-lg rounded-2xl z-10 flex flex-col transition-transform hover:-rotate-2 opacity-90"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={16} strokeWidth={2} />
                      <div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[22px] sm:text-[26px] md:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">eloquent</p>
                    <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">fluent or<br/>persuasive</p>
                  </motion.div>

                  {/* PETRICHOR (Purple) - Hidden on Mobile */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: -8, y: 10 }}
                    animate={{ opacity: 1, y: [3, -3, 3] }}
                    transition={{ opacity: { duration: 1.2, delay: 0.5 }, y: { repeat: Infinity, duration: 9, ease: "easeInOut", delay: 0.5 } }}
                    className="hidden md:flex absolute -bottom-[10%] -left-[10%] w-[140px] h-[160px] md:w-[180px] md:h-[200px] bg-[#E5D9FF] dark:bg-[#3B2C59] p-4 sm:p-5 shadow-lg rounded-2xl z-20 flex-col transition-transform hover:-rotate-4 opacity-90"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={16} strokeWidth={2} />
                      <div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[26px] md:text-[32px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">petrichor</p>
                    <p className="font-sans text-[10px] md:text-xs text-black/60 dark:text-white/60 leading-tight">the pleasant<br/>smell of rain</p>
                  </motion.div>

                  {/* HALCYON (Yellow) - Hidden on Mobile */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: 6, y: 10 }}
                    animate={{ opacity: 1, y: [-4, 4, -4] }}
                    transition={{ opacity: { duration: 1.5, delay: 0.6 }, y: { repeat: Infinity, duration: 11, ease: "easeInOut", delay: 1 } }}
                    className="hidden lg:flex absolute top-[60%] -right-[15%] w-[150px] h-[170px] bg-[#FFF2CC] dark:bg-[#5C4D26] p-4 shadow-lg rounded-2xl z-10 flex-col transition-transform hover:rotate-3 opacity-80"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={16} strokeWidth={2} />
                      <div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[26px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">halcyon</p>
                    <p className="font-sans text-[10px] text-black/60 dark:text-white/60 leading-tight">calm, peaceful<br/>days</p>
                  </motion.div>

                  {/* MAIN WOTD CARD */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => { if (wotdData?.word) { setQuery(wotdData.word); handleInitialSearch(wotdData.word); } }}
                    className="relative z-40 w-[85%] sm:w-[90%] bg-[#F9F7F1] dark:bg-[#1E1D1A] rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] border border-black/5 dark:border-white/5 cursor-pointer flex flex-col gap-12 sm:gap-16 overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] pointer-events-auto"
                  >
                    {/* Subtle grain texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                    
                    {/* Soft Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FDFCFB]/80 to-[#E2D1C3]/30 dark:from-[#2F2D28]/40 dark:to-[#1C1B19]/80 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60"></div>

                    {/* Header */}
                    <div className="relative flex justify-between items-start z-10">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.25em] uppercase text-black/50 dark:text-white/50 font-semibold">Word of the Day</span>
                        <span className="text-[10px] sm:text-xs font-serif text-black/40 dark:text-white/40 italic">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">
                        <Bookmark size={14} strokeWidth={2} className="text-black/40 dark:text-white/40" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex flex-col z-10">
                      {wotdData ? (
                        <>
                          <h2 className="font-serif text-[36px] sm:text-[44px] md:text-[52px] leading-[1] text-black/90 dark:text-white/90 tracking-tight mb-3 break-words group-hover:text-black dark:group-hover:text-white transition-colors">
                            {wotdData.word}
                          </h2>
                          
                          {wotdData.dictionary?.phonetic && (
                            <div className="flex items-center gap-3 mb-5">
                              <span className="font-sans text-sm sm:text-base text-black/50 dark:text-white/50 tracking-wide font-medium">{wotdData.dictionary.phonetic}</span>
                              <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-black/40 dark:text-white/40 px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/10">
                                {wotdData.dictionary.meanings?.[0]?.partOfSpeech || 'word'}
                              </span>
                            </div>
                          )}

                          {wotdData.dictionary?.meanings?.[0]?.definitions?.[0]?.definition ? (
                            <p className="font-serif text-sm sm:text-base md:text-[17px] text-black/60 dark:text-white/60 leading-relaxed italic">
                              "{wotdData.dictionary.meanings[0].definitions[0].definition}"
                            </p>
                          ) : (
                            <p className="font-sans text-xs sm:text-sm text-black/40 dark:text-white/40 leading-tight">
                              tap to discover full meaning & synonyms
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                          <span className="w-6 h-6 border-2 border-black/20 dark:border-white/20 border-t-black/60 dark:border-t-white/60 rounded-full animate-spin"></span>
                          <span className="text-xs font-sans tracking-widest uppercase text-black/30 dark:text-white/30">Curating...</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>

`;

let newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log('Replaced layout successfully');
