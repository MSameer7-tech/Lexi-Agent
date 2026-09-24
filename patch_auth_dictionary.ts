import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

// Replace Pin icon with Bookmark or Library icon
content = content.replace(/import \{.*?\} from 'lucide-react';/, 
  "import { ArrowRight, Loader2, Mail, LockKeyhole, Eye, EyeOff, Check, BookMarked, Bookmark, Library } from 'lucide-react';"
);

// Remove rainbow bar
content = content.replace(/<div className="h-1 w-full bg-gradient-to-r from-\[#FF887B\] via-\[#8598FF\] to-\[#D5C2FF\]"><\/div>/, 
  '<div className="h-1 w-full bg-foreground/10 dark:bg-foreground/20"></div>'
);

// Personal Lexicon label
content = content.replace(
  /<div className="mb-8 flex w-fit items-center gap-2 rounded-full border border-border-subtle bg-background\/60 px-3 py-1\.5 text-\[11px\] font-semibold uppercase tracking-widest text-subtle backdrop-blur-md">[\s\S]*?<\/div>/,
  `<div className="mb-8 flex w-fit items-center gap-2 rounded-full border border-border-subtle bg-background/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-subtle backdrop-blur-md">
                  <Library size={13} strokeWidth={2} />
                  LEXIAGENT PERSONAL ARCHIVE
                </div>`
);

// Headlines
content = content.replace('Pin your words.', 'Master your words.');
content = content.replace('Build a vocabulary board that feels personal, searchable, and ready whenever a new word catches your attention.', 'Curate a vocabulary archive that feels personal, searchable, and ready whenever a new word catches your attention.');

// Pastel sticky notes -> Dictionary flashcards
// Note 1: serendipity
content = content.replace(
  /className="absolute left-\[2%\] top-\[12%\] z-20 flex h-\[110px\] w-\[130px\] -rotate-3 flex-col rounded-md border border-border-subtle bg-\[#FFE6E0\] p-4 shadow-sm transition-transform hover:-rotate-1 dark:bg-\[#51332F\]"/,
  'className="absolute left-[2%] top-[12%] z-20 flex h-[110px] w-[130px] -rotate-3 flex-col rounded-sm border border-border-subtle/50 bg-[#Fdfbf9] p-4 shadow-sm transition-transform hover:-rotate-1 dark:bg-[#1E1E1C]"'
);
content = content.replace(/<Pin size={12}.*?\/>/, '<Bookmark size={12} strokeWidth={2.5} className="text-muted" />');

// Note 2: sonder
content = content.replace(
  /className="absolute right-\[5%\] top-\[8%\] z-10 flex h-\[110px\] w-\[130px\] rotate-6 flex-col rounded-md border border-border-subtle bg-\[#DCE4FF\] p-4 shadow-sm transition-transform hover:rotate-3 dark:bg-\[#283566\]"/,
  'className="absolute right-[5%] top-[8%] z-10 flex h-[110px] w-[130px] rotate-6 flex-col rounded-sm border border-border-subtle/50 bg-[#F9F9F8] p-4 shadow-sm transition-transform hover:rotate-3 dark:bg-[#232322]"'
);
content = content.replace(/<Pin size={12}.*?\/>/, '<Bookmark size={12} strokeWidth={2.5} className="text-muted" />');

// Note 3: glow-
content = content.replace(
  /className="absolute bottom-\[20%\] left-\[8%\] z-10 flex h-\[110px\] w-\[130px\] -rotate-6 flex-col rounded-md border border-border-subtle bg-\[#E5D9FF\] p-4 shadow-sm transition-transform hover:-rotate-2 dark:bg-\[#3B2C59\]"/,
  'className="absolute bottom-[20%] left-[8%] z-10 flex h-[110px] w-[130px] -rotate-6 flex-col rounded-sm border border-border-subtle/50 bg-[#F5F4F2] p-4 shadow-sm transition-transform hover:-rotate-2 dark:bg-[#1C1C1A]"'
);
content = content.replace(/<Pin size={12}.*?\/>/, '<Bookmark size={12} strokeWidth={2.5} className="text-muted" />');

// Note 4: apricity
content = content.replace(
  /className="absolute bottom-\[15%\] right-\[10%\] z-20 flex h-\[110px\] w-\[130px\] rotate-2 flex-col rounded-md border border-border-subtle bg-\[#FFF1CC\] p-4 shadow-sm transition-transform hover:rotate-1 dark:bg-\[#594B22\]"/,
  'className="absolute bottom-[15%] right-[10%] z-20 flex h-[110px] w-[130px] rotate-2 flex-col rounded-sm border border-border-subtle/50 bg-[#Fdfbf9] p-4 shadow-sm transition-transform hover:rotate-1 dark:bg-[#201F1E]"'
);
content = content.replace(/<Pin size={12}.*?\/>/, '<Bookmark size={12} strokeWidth={2.5} className="text-muted" />');

// Note 5: Toast overlay
content = content.replace(
  /className="absolute -bottom-6 left-1\/2 z-30 flex w-\[110%\] -translate-x-1\/2 items-center gap-4 rounded-xl border border-border-strong\/30 bg-background\/95 p-4 shadow-\[0_20px_40px_-15px_rgba(0,0,0,0.1)\] backdrop-blur-md"/,
  'className="absolute -bottom-6 left-1/2 z-30 flex w-[110%] -translate-x-1/2 items-center gap-4 rounded-md border border-border-strong/30 bg-background/95 p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md"'
);

// Stats labels
content = content.replace('WORDS FOUND', 'DEFINITIONS');
content = content.replace('SAVED NOTES', 'SAVED WORDS');
content = content.replace('DAILY RECALL', 'VOCABULARY');

// Right Card
content = content.replace(/<div className="mb-4 flex w-fit items-center gap-2 rounded-\[6px\] bg-\[#FFE6E0\] px-3 py-1\.5 text-\[11px\] font-medium uppercase text-\[#7E352F\] dark:bg-\[#51332F\] dark:text-\[#FFD1C9\]">/g, 
  '<div className="mb-4 flex w-fit items-center gap-2 rounded-[4px] bg-foreground/5 px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-foreground">'
);
content = content.replace(/'Back to your board' : 'Start your board'/, "'Secure Sign In' : 'Create an Account'");
content = content.replace('Sign in and pick up right where your word board left off.', 'Sign in to continue building your personal lexicon.');
content = content.replace('Join LexiAgent and start collecting language that sticks.', 'Join LexiAgent and start archiving the words you discover.');

// Red hover button -> standard charcoal hover
content = content.replace(
  /className="group mt-1 flex h-13 min-h-13 w-full items-center justify-between rounded-md border border-foreground bg-foreground px-5 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0\.5 hover:bg-\[#D65A50\] hover:text-white hover:shadow-\[0_18px_36px_-26px_rgba\(214,90,80,0\.95\)\] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground\/15 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"/,
  'className="group mt-1 flex h-13 min-h-13 w-full items-center justify-between rounded-sm border border-foreground bg-foreground px-5 text-sm font-medium uppercase tracking-[0.1em] text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-foreground hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/15 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"'
);

// "Or continue with" line
content = content.replace(/font-medium uppercase tracking-\[0\.14em\]/g, 'font-medium uppercase tracking-[0.2em]');

// Replace all remaining <Pin ... /> if any are missed
content = content.replace(/<Pin /g, '<Bookmark ');

fs.writeFileSync('src/pages/Auth.tsx', content);
