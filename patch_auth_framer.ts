import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

// Ensure motion is imported
if (!content.includes('import { motion } from')) {
  content = content.replace(
    "import { ArrowRight, Loader2 } from 'lucide-react';",
    "import { ArrowRight, Loader2 } from 'lucide-react';\nimport { motion } from 'framer-motion';"
  );
}

// Replace left text container
content = content.replace(
  '<div className="max-w-[380px] z-10 flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700">',
  '<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-[380px] z-10 flex-shrink-0">'
);
content = content.replace('</div>\n\n          {/* Decorative Archive/Index Visual', '</motion.div>\n\n          {/* Decorative Archive/Index Visual');

// Replace archive visual container
content = content.replace(
  '<div className="w-full max-w-[280px] flex-shrink-0 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">',
  '<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }} className="w-full max-w-[280px] flex-shrink-0">'
);
content = content.replace('</div>\n\n        </div>', '</motion.div>\n\n        </div>');

// Replace auth card container
content = content.replace(
  '<div className="w-full max-w-[420px] flex flex-col gap-8 bg-background sm:bg-[#FDFBF9] dark:bg-[#1C1C1A] p-0 sm:p-10 md:p-12 sm:shadow-[0_4px_30px_-4px_rgba(0,0,0,0.03)] dark:sm:shadow-none sm:border sm:border-border-subtle/50 rounded-[4px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">',
  '<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="w-full max-w-[420px] flex flex-col gap-8 bg-background sm:bg-[#FDFBF9] dark:bg-[#1C1C1A] p-0 sm:p-10 md:p-12 sm:shadow-[0_4px_30px_-4px_rgba(0,0,0,0.03)] dark:sm:shadow-none sm:border sm:border-border-subtle/50 rounded-[4px]">'
);
content = content.replace('</div>\n      </div>\n    </div>', '</motion.div>\n      </div>\n    </div>');

fs.writeFileSync('src/pages/Auth.tsx', content);
