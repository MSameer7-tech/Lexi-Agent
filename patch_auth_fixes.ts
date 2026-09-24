import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

// Fix imports
content = content.replace(
  /import \{.*?\} from 'lucide-react';/,
  "import { ArrowRight, Bookmark, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, Sparkles, Book } from 'lucide-react';"
);

// Fix label
content = content.replace('Personal lexicon, remixed', 'LexiAgent Personal Archive');
content = content.replace(/<Sparkles size=\{14\} strokeWidth=\{1\.8\} className="text-\[#D65A50\]" \/>/g, 
  '<Book size={14} strokeWidth={1.8} className="text-foreground/70" />'
);

fs.writeFileSync('src/pages/Auth.tsx', content);
