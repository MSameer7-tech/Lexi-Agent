const fs = require('fs');
let content = fs.readFileSync('src/components/dictionary/WordResult.tsx', 'utf-8');

const target = `  useEffect(() => {
    const checkSaved = async () => {`;
const replacement = `  useEffect(() => {
    setAiExample(null);
  }, [entry.word]);

  useEffect(() => {
    const checkSaved = async () => {`;
content = content.replace(target, replacement);

fs.writeFileSync('src/components/dictionary/WordResult.tsx', content);
console.log('Fixed aiExample reset');
