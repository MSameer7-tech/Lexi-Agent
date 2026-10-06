const fs = require('fs');
let content = fs.readFileSync('src/components/history/HistoryDrawer.tsx', 'utf-8');

// Remove deletingId state completely
content = content.replace(/const \[deletingId\] = useState<string \| null>\(null\);\n?/g, '');
content = content.replace(/const \[deletingId, setDeletingId\] = useState<string \| null>\(null\);\n?/g, '');

// Remove disabled condition
content = content.replace(/disabled=\{deletingId === session\.id\}/g, '');

// Replace loader check with just Trash2
content = content.replace(/\{deletingId === session\.id \? <Loader2 size=\{14\} className="animate-spin" \/> : <Trash2 size=\{14\} \/>\}/g, '<Trash2 size={14} />');

fs.writeFileSync('src/components/history/HistoryDrawer.tsx', content);
console.log('Cleaned up deletingId');
