const fs = require('fs');
const content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const targetStr = 'md:pr-4">\n';
const insertIndex = content.indexOf(targetStr, content.indexOf('PINTEREST STYLE WOTD CARD')) + targetStr.length;

if (insertIndex === targetStr.length - 1) {
  console.log('Could not find boundaries');
  process.exit(1);
}

const scatteredCards = `
                  {/* ELOQUENT (Pink) */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: -6, y: 10 }}
                    animate={{ opacity: 1, y: [4, -4, 4] }}
                    transition={{ opacity: { duration: 0.8, delay: 0.3 }, y: { repeat: Infinity, duration: 14, ease: "easeInOut" } }}
                    className="absolute top-[5%] left-[2%] sm:left-[5%] md:top-[15%] md:left-[-5%] w-[130px] h-[150px] sm:w-[150px] sm:h-[170px] md:w-[180px] md:h-[200px] bg-[#FFE6E0] dark:bg-[#51332F] p-4 md:p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] rounded-2xl z-10 flex flex-col transition-transform hover:-rotate-2 opacity-80 hover:opacity-100"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={16} strokeWidth={2} />
                      <div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[22px] sm:text-[26px] md:text-[32px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">eloquent</p>
                    <p className="font-sans text-[10px] sm:text-xs md:text-sm text-black/60 dark:text-white/60 leading-tight">fluent or<br/>persuasive</p>
                  </motion.div>

                  {/* PETRICHOR (Purple) - Hidden on Mobile */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: -8, y: 10 }}
                    animate={{ opacity: 1, y: [3, -3, 3] }}
                    transition={{ opacity: { duration: 1.2, delay: 0.5 }, y: { repeat: Infinity, duration: 9, ease: "easeInOut", delay: 0.5 } }}
                    className="hidden md:flex absolute bottom-[10%] left-[10%] md:bottom-[5%] md:left-[5%] w-[140px] h-[160px] md:w-[190px] md:h-[210px] bg-[#E5D9FF] dark:bg-[#3B2C59] p-4 sm:p-5 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] rounded-2xl z-20 flex-col transition-transform hover:-rotate-4 opacity-75 hover:opacity-100"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={16} strokeWidth={2} />
                      <div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[26px] md:text-[34px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">petrichor</p>
                    <p className="font-sans text-[10px] md:text-xs text-black/60 dark:text-white/60 leading-tight">the pleasant<br/>smell of rain</p>
                  </motion.div>

                  {/* HALCYON (Yellow) - Hidden on Mobile */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: 6, y: 10 }}
                    animate={{ opacity: 1, y: [-4, 4, -4] }}
                    transition={{ opacity: { duration: 1.5, delay: 0.6 }, y: { repeat: Infinity, duration: 11, ease: "easeInOut", delay: 1 } }}
                    className="hidden lg:flex absolute top-[60%] right-[-5%] w-[150px] h-[170px] bg-[#FFF2CC] dark:bg-[#5C4D26] p-4 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] rounded-2xl z-10 flex-col transition-transform hover:rotate-3 opacity-60 hover:opacity-100"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={16} strokeWidth={2} />
                      <div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[26px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">halcyon</p>
                    <p className="font-sans text-[10px] text-black/60 dark:text-white/60 leading-tight">calm, peaceful<br/>days</p>
                  </motion.div>
`;

let newContent = content.substring(0, insertIndex) + scatteredCards + content.substring(insertIndex);

// Add z-40 to the Pinterest card
newContent = newContent.replace('className="relative w-[90%] max-w-[340px]', 'className="relative z-40 w-[90%] max-w-[340px]');

fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log('Added scattered cards successfully');
