import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { Vocabulary }')) {
  content = content.replace(
    "import { Auth } from './pages/Auth';",
    "import { Auth } from './pages/Auth';\nimport { Vocabulary } from './pages/Vocabulary';"
  );
  
  content = content.replace(
    '<Route path="settings" element={<Settings />} />',
    '<Route path="vocabulary" element={<Vocabulary />} />\n          <Route path="settings" element={<Settings />} />'
  );
}

fs.writeFileSync('src/App.tsx', content);

let layoutContent = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

if (!layoutContent.includes("path: '/vocabulary'")) {
  layoutContent = layoutContent.replace(
    "{ type: 'button', action: () => setDrawerOpen(true), label: 'Chats', icon: Clock, id: 'history' },",
    "{ type: 'button', action: () => setDrawerOpen(true), label: 'Chats', icon: Clock, id: 'history' },\n    { type: 'link', path: '/vocabulary', label: 'Vocabulary', icon: undefined, id: 'vocabulary' },"
  );
}

fs.writeFileSync('src/layouts/MainLayout.tsx', layoutContent);
