const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Remove the aggressive auto-scroll hook
const oldEffect = `  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isLoading, error]);`;

content = content.replace(oldEffect, '');

// 2. Add scrollToBottom only when sending a message
const executeTurnStart = `  const executeTurn = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    setError(null);`;

const executeTurnReplacement = `  const executeTurn = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    setError(null);
    
    // Scroll to bottom immediately to show the user's new message, 
    // but DO NOT scroll again when the AI responds, so they can read from the top!
    setTimeout(scrollToBottom, 50);`;

content = content.replace(executeTurnStart, executeTurnReplacement);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Fixed auto-scrolling behavior');
