import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

content = content.replace(
  "import { ArrowRight, Bookmark, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, Sparkles, Book } from 'lucide-react';",
  "import { ArrowRight, Bookmark, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, Book } from 'lucide-react';"
);

fs.writeFileSync('src/pages/Auth.tsx', content);
