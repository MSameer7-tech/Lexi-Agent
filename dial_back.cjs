const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* MAIN WOTD CARD */}';
const startIndex = content.indexOf(startStr);

if (startIndex === -1) {
  console.log('Could not find boundaries');
  process.exit(1);
}

const endIndex = content.indexOf('</div>\n              </div>', startIndex);
let cardStr = content.substring(startIndex, endIndex);

// 1. "Word of the Day" subtitle
cardStr = cardStr.replace(
  'uppercase text-black/70 dark:text-white/70 font-bold tracking-[0.2em]',
  'uppercase text-black/60 dark:text-white/60 font-semibold tracking-[0.2em]'
);

// 2. Date
cardStr = cardStr.replace(
  'font-serif text-black/60 dark:text-white/60 italic font-medium',
  'font-serif text-black/50 dark:text-white/50 italic'
);

// 3. Main Word (Removing font-medium because on huge serifs it makes it too thick, keeping it text-black/95)
cardStr = cardStr.replace(
  'leading-[1] text-black dark:text-white tracking-tight font-medium antialiased',
  'leading-[1] text-black/95 dark:text-white/95 tracking-tight antialiased'
);

// 4. Phonetic
cardStr = cardStr.replace(
  'text-black/75 dark:text-white/75 tracking-wide font-semibold antialiased',
  'text-black/60 dark:text-white/60 tracking-wide font-medium antialiased'
);

// 5. Part of speech pill
cardStr = cardStr.replace(
  'uppercase text-black/60 dark:text-white/60 px-2.5 py-0.5 rounded-full border border-black/20 dark:border-white/20 font-bold',
  'uppercase text-black/50 dark:text-white/50 px-2.5 py-0.5 rounded-full border border-black/15 dark:border-white/15 font-semibold'
);

// 6. Definition
cardStr = cardStr.replace(
  'text-black/80 dark:text-white/80 leading-relaxed italic font-medium antialiased',
  'text-black/70 dark:text-white/70 leading-relaxed italic antialiased'
);

const newContent = content.substring(0, startIndex) + cardStr + content.substring(endIndex);
fs.writeFileSync('src/pages/Home.tsx', newContent);
console.log('Dialed back typography successfully');
