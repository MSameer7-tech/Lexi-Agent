import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, Sparkle, BookOpen } from 'lucide-react';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { sendMessage } from '../services/api';
import type { Message, Session } from '../types';

export const Home: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleInitialSearch = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const searchQuery = typeof e === 'string' ? e : query;
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsLoading(true);

    const sessionId = 'session-' + Date.now();
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: searchQuery,
      timestamp: Date.now(),
    };

    setSession({
      id: sessionId,
      messages: [newUserMessage],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    try {
      const response = await sendMessage({ message: searchQuery, sessionId });
      
      const newAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.response,
        timestamp: Date.now(),
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newAgentMessage],
        updatedAt: Date.now(),
      } : null);
    } catch (error) {
      console.error('Error fetching definition:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !session || isLoading) return;

    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newUserMessage],
      updatedAt: Date.now(),
    } : null);

    try {
      const response = await sendMessage({ message: messageText, sessionId: session.id });
      
      const newAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.response,
        timestamp: Date.now(),
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newAgentMessage],
        updatedAt: Date.now(),
      } : null);
    } catch (error) {
      console.error('Error fetching response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedWords = [
    { word: 'Serendipity', desc: 'happy coincidence' },
    { word: 'Ephemeral', desc: 'short-lived' },
    { word: 'Pragmatic', desc: 'practical' },
  ];

  return (
    <div className="flex-1 flex flex-col w-full h-full px-4 sm:px-8 py-8 md:py-12">
      <AnimatePresence mode="wait">
        {!isSearching ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col justify-center items-center max-w-3xl mx-auto w-full"
          >
            <div className="text-center space-y-6 mb-16 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center justify-center p-3 bg-accent text-accent-fg rounded-full mb-6"
              >
                <Sparkle size={20} className="mr-2" />
                <span className="text-xs uppercase tracking-widest font-medium">Daily Curations</span>
              </motion.div>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground tracking-tighter leading-[1.1]">
                Master the art <br/>
                <span className="italic text-muted font-light">of language.</span>
              </h1>
            </div>

            <form onSubmit={handleInitialSearch} className="w-full relative group mb-16">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-muted group-focus-within:text-foreground transition-colors duration-300">
                <Search size={22} strokeWidth={1.5} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a word..."
                className="w-full h-16 sm:h-20 pl-16 pr-20 rounded-full border border-border-subtle bg-surface shadow-subtle text-lg sm:text-xl focus:ring-1 focus:ring-border-strong focus:outline-none transition-all duration-300 placeholder:text-subtle font-sans"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute inset-y-2 right-2 sm:inset-y-3 sm:right-3 flex items-center justify-center w-12 sm:w-14 rounded-full bg-foreground text-background disabled:opacity-50 hover:bg-foreground/90 transition-transform active:scale-95"
              >
                <CornerDownLeft size={20} strokeWidth={1.5} />
              </button>
            </form>

            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
              {suggestedWords.map((item, i) => {
                const bgColors = [
                  'bg-[var(--color-peach)] text-[#8A5A44] border-transparent',
                  'bg-[var(--color-sage)] text-[#4A5D4E] border-transparent',
                  'bg-[var(--color-lavender)] text-[var(--color-lavender-dark)] border-transparent'
                ];
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                    key={item.word}
                    onClick={() => { setQuery(item.word); handleInitialSearch(item.word); }}
                    className={`p-6 rounded-2xl cursor-pointer hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group ${bgColors[i % bgColors.length]}`}
                  >
                    <BookOpen size={16} className="mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <h3 className="font-serif text-xl mb-1">{item.word}</h3>
                    <p className="font-sans text-sm opacity-80">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col h-[calc(100vh-140px)] w-full mx-auto"
          >
            <div className="flex-1 overflow-y-auto pb-10 space-y-12 pr-2 sm:pr-6 custom-scrollbar">
              {session?.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.5, delay: index === session.messages.length - 1 ? 0.1 : 0 }}
                  className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'user' ? (
                    <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-foreground px-6 py-4 text-background shadow-elevated">
                      <p className="text-lg font-sans">{message.content}</p>
                    </div>
                  ) : (
                    <div className="w-full md:max-w-[85%] lg:max-w-[75%]">
                      <div className="p-8 md:p-12 rounded-3xl bg-surface border border-border-subtle shadow-subtle relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <MarkdownRenderer content={message.content} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start w-full"
                >
                  <div className="px-8 py-6 rounded-2xl bg-surface border border-border-subtle flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-subtle rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-subtle rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-subtle rounded-full animate-pulse delay-150" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="pt-6 pb-2 bg-gradient-to-t from-background via-background to-transparent sticky bottom-0">
              <form onSubmit={handleSendMessage} className="relative flex items-center max-w-3xl mx-auto w-full group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a follow up question..."
                  className="w-full h-14 pl-6 pr-14 rounded-xl border border-border-strong bg-surface text-foreground shadow-subtle focus:ring-1 focus:ring-foreground focus:outline-none transition-all duration-300 placeholder:text-subtle"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-tint text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <CornerDownLeft size={16} strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
