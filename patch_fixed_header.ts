import * as fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Change sticky to fixed
content = content.replace(
  'header className="sticky top-0 w-full z-50',
  'header className="fixed top-0 left-0 right-0 w-full z-50'
);

// Restore main padding to account for fixed header height
content = content.replace(
  '<main className="flex-1 w-full flex flex-col relative z-10 pt-6">',
  '<main className="flex-1 w-full flex flex-col relative z-10 pt-24 md:pt-28">'
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
