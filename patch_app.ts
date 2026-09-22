import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import { Auth }")) {
  content = content.replace("import { Settings } from './pages/Settings';", "import { Settings } from './pages/Settings';\nimport { Auth } from './pages/Auth';");
}

if (!content.includes('<Route path="auth" element={<Auth />} />')) {
  content = content.replace('<Route path="settings" element={<Settings />} />', '<Route path="settings" element={<Settings />} />\n          <Route path="auth" element={<Auth />} />');
}

fs.writeFileSync('src/App.tsx', content);

let layoutContent = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

if (!layoutContent.includes("import { useAuth }")) {
  layoutContent = layoutContent.replace("import { useHistoryStore } from '../store/historyStore';", "import { useHistoryStore } from '../store/historyStore';\nimport { useAuth } from '../contexts/AuthContext';");
}

if (!layoutContent.includes("const { session, signOut } = useAuth();")) {
  layoutContent = layoutContent.replace("const { setDrawerOpen, setActiveSession } = useHistoryStore();", "const { setDrawerOpen, setActiveSession } = useHistoryStore();\n  const { session, signOut } = useAuth();");
}

// Modify navItems dynamically inside the component instead of static
const oldNavItems = `  const navItems = [
    { type: 'button', action: () => setDrawerOpen(true), label: 'Chats', icon: Clock, id: 'history' },
    { type: 'link', path: '/settings', label: 'Settings', icon: Settings, id: 'settings' },
  ];`;

const newNavItems = `  const navItems = [
    { type: 'button', action: () => setDrawerOpen(true), label: 'Chats', icon: Clock, id: 'history' },
    { type: 'link', path: '/settings', label: 'Settings', icon: Settings, id: 'settings' },
    session 
      ? { type: 'button', action: () => signOut(), label: 'Sign Out', icon: undefined, id: 'signout' }
      : { type: 'link', path: '/auth', label: 'Sign In', icon: undefined, id: 'signin' }
  ];`;

layoutContent = layoutContent.replace(oldNavItems, newNavItems);
fs.writeFileSync('src/layouts/MainLayout.tsx', layoutContent);
