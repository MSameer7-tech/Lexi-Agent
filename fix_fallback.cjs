const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

content = content.replace(
  `        // Fallback if not loaded yet
        import('../services/lexiAgentApi').then(({ getWordOfTheDay }) => {
          getWordOfTheDay().then(res => {
            if (res && res.word) {
              setWotdData({ word: res.word, dictionary: res.dictionary });
              setQuery(res.word);
              setTimeout(() => handleInitialSearch(res.word), 100);
            }
          });
        });`,
  `        // Fallback if not loaded yet
        getWordOfTheDay().then(res => {
          if (res && res.word) {
            setWotdData({ word: res.word, dictionary: res.dictionary });
            setQuery(res.word);
            setTimeout(() => handleInitialSearch(res.word), 100);
          }
        });`
);

fs.writeFileSync('src/pages/Home.tsx', content);
