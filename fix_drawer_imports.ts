import * as fs from 'fs';

let content = fs.readFileSync('src/components/history/HistoryDrawer.tsx', 'utf8');

if (!content.includes("import { useNavigate } from 'react-router-dom';")) {
  content = "import { useNavigate } from 'react-router-dom';\n" + content;
}

fs.writeFileSync('src/components/history/HistoryDrawer.tsx', content);
