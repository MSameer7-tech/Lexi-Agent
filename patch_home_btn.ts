import * as fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Change Home link to a button that clears active session and navigates
content = content.replace(
  "{ type: 'link', path: '/', label: 'Home', icon: undefined, id: 'home' },",
  "{ type: 'button', action: () => { setActiveSession(null); navigate('/'); }, label: 'Home', icon: undefined, id: 'home' },"
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
