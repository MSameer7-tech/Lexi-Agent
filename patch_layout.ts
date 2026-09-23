import * as fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Add "Home" to navItems
content = content.replace(
  "{ type: 'button', action: () => setDrawerOpen(true), label: 'Chats', icon: Clock, id: 'history' },",
  "{ type: 'link', path: '/', label: 'Home', icon: undefined, id: 'home' },\n    { type: 'button', action: () => setDrawerOpen(true), label: 'Chats', icon: Clock, id: 'history' },"
);

// Update header to sticky
content = content.replace(
  'header className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-8 md:px-12 md:py-10 bg-transparent"',
  'header className="sticky top-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 bg-background/95 backdrop-blur-sm border-b border-border-subtle/10 transition-all duration-300"'
);

// Remove pt-20 from main since header is now sticky and takes up space in flow
content = content.replace(
  '<main className="flex-1 w-full flex flex-col relative z-10 pt-20">',
  '<main className="flex-1 w-full flex flex-col relative z-10 pt-6">'
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
