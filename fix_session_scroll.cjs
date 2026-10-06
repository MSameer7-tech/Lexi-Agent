const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const replacement = `  // Scroll to bottom only when switching to a new session
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [activeSessionId]);
`;

// Insert it right after the scrollToBottom definition
content = content.replace(
  `  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };`,
  `  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
${replacement}`
);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Added session change auto-scroll');
