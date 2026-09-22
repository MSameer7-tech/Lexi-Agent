import * as fs from 'fs';

let authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
authContext = authContext.replace("import { Session, User } from '@supabase/supabase-js';", "import type { Session, User } from '@supabase/supabase-js';");
fs.writeFileSync('src/contexts/AuthContext.tsx', authContext);

let authPage = fs.readFileSync('src/pages/Auth.tsx', 'utf8');
authPage = authPage.replace("import { ArrowRight, Loader2, Github, Mail } from 'lucide-react';", "import { ArrowRight, Loader2 } from 'lucide-react';");
fs.writeFileSync('src/pages/Auth.tsx', authPage);
