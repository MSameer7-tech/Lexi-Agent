const fs = require('fs');
const content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* RIGHT SIDE: PINTEREST STYLE WOTD CARD CLUSTER */}';
const endStr = '              {/* LEFT SIDE: SEARCH AREA (Bottom on Mobile, Left on Desktop) */}';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find boundaries');
  process.exit(1);
}

const replacement = `{/* RIGHT SIDE: BLOOMING FLOWER WOTD CLUSTER */}
              <div className="w-full md:h-[640px] relative overflow-hidden md:overflow-visible z-0 order-2 md:col-start-2 md:row-start-1 md:row-span-2 my-8 md:my-0 flex items-center justify-center pointer-events-none md:pointer-events-auto">
                <div className="relative flex items-center justify-center w-full max-w-[380px] h-full group/cluster">
                  
                  {/* BACKGROUND CARDS (Wrapped in layout divs for hover transitions) */}
                  
                  {/* 1. ELOQUENT (Top Left) */}
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[180px] md:h-[200px] -mt-[80px] sm:-mt-[90px] md:-mt-[100px] -ml-[70px] sm:-ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 -translate-x-[30px] -translate-y-[30px] -rotate-3 group-hover/cluster:-translate-x-[120px] sm:group-hover/cluster:-translate-x-[150px] md:group-hover/cluster:-translate-x-[180px] group-hover/cluster:-translate-y-[100px] sm:group-hover/cluster:-translate-y-[120px] group-hover/cluster:-rotate-12 opacity-80 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="w-full h-full bg-[#FFE6E0] dark:bg-[#51332F] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("eloquent"); handleInitialSearch("eloquent"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[24px] sm:text-[28px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">eloquent</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">fluent or<br/>persuasive</p>
                    </motion.div>
                  </div>

                  {/* 2. PETRICHOR (Bottom Left) */}
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[180px] md:h-[200px] -mt-[80px] sm:-mt-[90px] md:-mt-[100px] -ml-[70px] sm:-ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 -translate-x-[20px] translate-y-[30px] rotate-2 group-hover/cluster:-translate-x-[100px] sm:group-hover/cluster:-translate-x-[130px] md:group-hover/cluster:-translate-x-[160px] group-hover/cluster:translate-y-[100px] sm:group-hover/cluster:translate-y-[130px] group-hover/cluster:-rotate-[16deg] opacity-80 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="w-full h-full bg-[#E5D9FF] dark:bg-[#3B2C59] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("petrichor"); handleInitialSearch("petrichor"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">petrichor</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">the pleasant<br/>smell of rain</p>
                    </motion.div>
                  </div>

                  {/* 3. HALCYON (Top Right) */}
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[180px] md:h-[200px] -mt-[80px] sm:-mt-[90px] md:-mt-[100px] -ml-[70px] sm:-ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 translate-x-[25px] -translate-y-[20px] rotate-[4deg] group-hover/cluster:translate-x-[110px] sm:group-hover/cluster:translate-x-[140px] md:group-hover/cluster:translate-x-[170px] group-hover/cluster:-translate-y-[80px] sm:group-hover/cluster:-translate-y-[100px] group-hover/cluster:rotate-[14deg] opacity-70 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="w-full h-full bg-[#FFF2CC] dark:bg-[#5C4D26] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("halcyon"); handleInitialSearch("halcyon"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">halcyon</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">calm, peaceful<br/>days</p>
                    </motion.div>
                  </div>

                  {/* 4. LIMINAL (Bottom Right) */}
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[180px] md:h-[200px] -mt-[80px] sm:-mt-[90px] md:-mt-[100px] -ml-[70px] sm:-ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 translate-x-[15px] translate-y-[20px] -rotate-1 group-hover/cluster:translate-x-[90px] sm:group-hover/cluster:translate-x-[120px] md:group-hover/cluster:translate-x-[150px] group-hover/cluster:translate-y-[110px] sm:group-hover/cluster:translate-y-[140px] group-hover/cluster:rotate-[18deg] opacity-70 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="w-full h-full bg-[#DCE4FF] dark:bg-[#283566] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("liminal"); handleInitialSearch("liminal"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">liminal</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">a transitional<br/>phase</p>
                    </motion.div>
                  </div>

                  {/* 5. EPHEMERAL (Far Left Middle) - Hidden on Mobile */}
                  <div className="hidden sm:block absolute top-1/2 left-1/2 w-[160px] h-[180px] md:w-[180px] md:h-[200px] -mt-[90px] md:-mt-[100px] -ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 -translate-x-[10px] translate-y-[5px] rotate-[1deg] group-hover/cluster:-translate-x-[180px] md:group-hover/cluster:-translate-x-[220px] group-hover/cluster:translate-y-[10px] group-hover/cluster:-rotate-[25deg] opacity-60 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="w-full h-full bg-[#E6F3E6] dark:bg-[#2A3B2A] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("ephemeral"); handleInitialSearch("ephemeral"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">ephemeral</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">lasting for a<br/>very short time</p>
                    </motion.div>
                  </div>

                  {/* 6. ETHEREAL (Far Right Middle) - Hidden on Mobile */}
                  <div className="hidden sm:block absolute top-1/2 left-1/2 w-[160px] h-[180px] md:w-[180px] md:h-[200px] -mt-[90px] md:-mt-[100px] -ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 translate-x-[10px] -translate-y-[5px] -rotate-[2deg] group-hover/cluster:translate-x-[180px] md:group-hover/cluster:translate-x-[220px] group-hover/cluster:-translate-y-[10px] group-hover/cluster:rotate-[22deg] opacity-60 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="w-full h-full bg-[#FCE8D5] dark:bg-[#4A3219] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("ethereal"); handleInitialSearch("ethereal"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">ethereal</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">extremely delicate<br/>and light</p>
                    </motion.div>
                  </div>

                  {/* MAIN WOTD CARD */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => { if (wotdData?.word) { setQuery(wotdData.word); handleInitialSearch(wotdData.word); } }}
                    className="relative z-40 w-[85%] sm:w-[90%] bg-[#F9F7F1] dark:bg-[#1E1D1A] rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] border border-black/5 dark:border-white/5 cursor-pointer flex flex-col gap-12 sm:gap-16 overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] pointer-events-auto ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    {/* Subtle grain texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                    
                    {/* Soft Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FDFCFB]/80 to-[#E2D1C3]/30 dark:from-[#2F2D28]/40 dark:to-[#1C1B19]/80 pointer-events-none transition-opacity duration-700 opacity-60"></div>

                    {/* Header */}
                    <div className="relative flex justify-between items-start z-10">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.25em] uppercase text-black/50 dark:text-white/50 font-semibold transition-colors duration-700">Word of the Day</span>
                        <span className="text-[10px] sm:text-xs font-serif text-black/40 dark:text-white/40 italic">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center transition-colors duration-700">
                        <Bookmark size={14} strokeWidth={2} className="text-black/40 dark:text-white/40" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex flex-col z-10">
                      {wotdData ? (
                        <>
                          <h2 className="font-serif text-[36px] sm:text-[44px] md:text-[52px] leading-[1] text-black/90 dark:text-white/90 tracking-tight mb-3 break-words transition-colors duration-700">
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

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log('Replaced layout with blooming cluster successfully');
