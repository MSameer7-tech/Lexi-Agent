import * as fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

if (!content.includes('const navigate = useNavigate();')) {
  // We need to import useNavigate from 'react-router-dom' if not already imported
  // Currently it imports: import { Link, Outlet, useLocation } from 'react-router-dom';
  content = content.replace(
    "import { Link, Outlet, useLocation } from 'react-router-dom';",
    "import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';"
  );
  
  content = content.replace(
    "export const MainLayout: React.FC = () => {",
    "export const MainLayout: React.FC = () => {\n  const navigate = useNavigate();"
  );
}

content = content.replace(
  "action: () => signOut()",
  "action: async () => { await signOut(); navigate('/auth'); }"
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
