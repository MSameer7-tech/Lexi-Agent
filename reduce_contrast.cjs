const fs = require('fs');
let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf-8');

const colorsTarget = `  const colors = [
    'bg-[#FFE6E0]/60 dark:bg-[#51332F]/60 border-[#FFD9D0]/80 dark:border-[#63403B]/80', // Pink
    'bg-[#DCE4FF]/60 dark:bg-[#283566]/60 border-[#CDDAFF]/80 dark:border-[#33427D]/80', // Blue
    'bg-[#E5D9FF]/60 dark:bg-[#3B2C59]/60 border-[#D9CAFF]/80 dark:border-[#4B3A70]/80', // Purple
    'bg-[#FFF1CC]/60 dark:bg-[#594B22]/60 border-[#FFE9A6]/80 dark:border-[#6E5D2A]/80'  // Yellow
  ];`;

const colorsReplacement = `  const colors = [
    'bg-[#FFE6E0]/50 dark:bg-[#51332F]/50 border-[#FFD9D0]/60 dark:border-[#63403B]/60', // Pink
    'bg-[#DCE4FF]/50 dark:bg-[#283566]/50 border-[#CDDAFF]/60 dark:border-[#33427D]/60', // Blue
    'bg-[#E5D9FF]/50 dark:bg-[#3B2C59]/50 border-[#D9CAFF]/60 dark:border-[#4B3A70]/60', // Purple
    'bg-[#FFF1CC]/50 dark:bg-[#594B22]/50 border-[#FFE9A6]/60 dark:border-[#6E5D2A]/60'  // Yellow
  ];`;

content = content.replace(colorsTarget, colorsReplacement);

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
console.log('Reduced card contrast');
