const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Statically import getWordOfTheDay to speed up loading
content = content.replace(
  "import { sendMessage, getConversationMessages } from '../services/lexiAgentApi';",
  "import { sendMessage, getConversationMessages, getWordOfTheDay } from '../services/lexiAgentApi';"
);

// 2. Remove dynamic import delay
content = content.replace(
  `  useEffect(() => {
    import('../services/lexiAgentApi').then(({ getWordOfTheDay }) => {
      getWordOfTheDay().then(res => {
        if (res && res.word) setWotdData({ word: res.word, dictionary: res.dictionary });
      }).catch(console.error);
    });
  }, []);`,
  `  useEffect(() => {
    getWordOfTheDay().then(res => {
      if (res && res.word) setWotdData({ word: res.word, dictionary: res.dictionary });
    }).catch(console.error);
  }, []);`
);

// 3. Replace spinner with Skeleton Loader
const oldLoader = `                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                          <span className="w-6 h-6 border-2 border-black/20 dark:border-white/20 border-t-black/60 dark:border-t-white/60 rounded-full animate-spin"></span>
                          <span className="text-xs font-sans tracking-widest uppercase text-black/30 dark:text-white/30">Curating...</span>
                        </div>`;

const skeletonLoader = `                        <div className="flex flex-col gap-4 py-2 w-full animate-pulse">
                          {/* Skeleton Word */}
                          <div className="h-[48px] sm:h-[56px] bg-black/10 dark:bg-white/10 rounded-lg w-3/4 mb-1"></div>
                          
                          {/* Skeleton Phonetic & Pill */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-5 sm:h-6 bg-black/5 dark:bg-white/5 rounded w-1/3"></div>
                            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-16"></div>
                          </div>

                          {/* Skeleton Definition */}
                          <div className="space-y-2">
                            <div className="h-4 sm:h-5 bg-black/5 dark:bg-white/5 rounded w-full"></div>
                            <div className="h-4 sm:h-5 bg-black/5 dark:bg-white/5 rounded w-11/12"></div>
                            <div className="h-4 sm:h-5 bg-black/5 dark:bg-white/5 rounded w-4/5"></div>
                          </div>
                        </div>`;

content = content.replace(oldLoader, skeletonLoader);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Loader updated successfully');
