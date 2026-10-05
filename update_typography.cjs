const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* MAIN WOTD CARD */}';
const startIndex = content.indexOf(startStr);

if (startIndex === -1) {
  console.log('Could not find boundaries');
  process.exit(1);
}

// Slice out the main WOTD card string
const endIndex = content.indexOf('</div>\n              </div>', startIndex);
let cardStr = content.substring(startIndex, endIndex);

// 1. "Word of the Day" subtitle
cardStr = cardStr.replace(
  'uppercase text-black/50 dark:text-white/50 font-semibold',
  'uppercase text-black/70 dark:text-white/70 font-bold tracking-[0.2em]'
);

// 2. Date
cardStr = cardStr.replace(
  'font-serif text-black/40 dark:text-white/40 italic',
  'font-serif text-black/60 dark:text-white/60 italic font-medium'
);

// 3. Main Word
cardStr = cardStr.replace(
  'leading-[1] text-black/90 dark:text-white/90 tracking-tight',
  'leading-[1] text-black dark:text-white tracking-tight font-medium antialiased'
);

// 4. Phonetic
cardStr = cardStr.replace(
  'text-black/50 dark:text-white/50 tracking-wide font-medium',
  'text-black/75 dark:text-white/75 tracking-wide font-semibold antialiased'
);

// 5. Part of speech pill
cardStr = cardStr.replace(
  'uppercase text-black/40 dark:text-white/40 px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/10',
  'uppercase text-black/60 dark:text-white/60 px-2.5 py-0.5 rounded-full border border-black/20 dark:border-white/20 font-bold'
);

// 6. Definition
cardStr = cardStr.replace(
  'text-black/60 dark:text-white/60 leading-relaxed italic',
  'text-black/80 dark:text-white/80 leading-relaxed italic font-medium antialiased'
);

// Reconstruct
const newContent = content.substring(0, startIndex) + cardStr + content.substring(endIndex);
fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log('Typography updated successfully');
