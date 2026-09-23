import * as fs from 'fs';

let content = fs.readFileSync('src/components/history/HistoryDrawer.tsx', 'utf8');

// Need to import useNavigate
if (!content.includes('useNavigate')) {
  content = content.replace(
    "import { X, Search, Clock, ChevronRight, MessageSquare, Trash2 } from 'lucide-react';",
    "import { X, Search, Clock, ChevronRight, MessageSquare, Trash2 } from 'lucide-react';\nimport { useNavigate } from 'react-router-dom';"
  );
}

// Inject useNavigate inside component
if (!content.includes('const navigate = useNavigate();')) {
  content = content.replace(
    "export const HistoryDrawer: React.FC = () => {",
    "export const HistoryDrawer: React.FC = () => {\n  const navigate = useNavigate();"
  );
}

// Update the onClick for "Start New Exploration"
content = content.replace(
  `              <button 
                onClick={() => {
                  setActiveSession(null);
                  setDrawerOpen(false);
                }}`,
  `              <button 
                onClick={() => {
                  setActiveSession(null);
                  setDrawerOpen(false);
                  navigate('/');
                }}`
);

fs.writeFileSync('src/components/history/HistoryDrawer.tsx', content);
