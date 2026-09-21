import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, BookOpen, BrainCircuit, SpellCheck, Search, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { WordResult } from '../components/dictionary/WordResult';
import { parseDictionaryMarkdown } from '../lib/parser';
import { sendMessage } from '../services/api';
import type { Message, Session } from '../types';

export const Home: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isLoading, error]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const executeTurn = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    setError(null);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    const isFirstMessage = !session;
    const sessionId = session?.id || 'session-' + Date.now();

    if (isFirstMessage) {
      setSession({
        id: sessionId,
        messages: [newUserMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newUserMessage],
        updatedAt: Date.now(),
      } : null);
    }

    try {
      const response = await sendMessage({ message: messageText, sessionId });
      
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
    } catch (err) {
      console.error('Error fetching response:', err);
      setError("LexiAgent had trouble finding that information. Please try again.");
    } finally {
      setIsLoading(false);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleInitialSearch = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const searchQuery = typeof e === 'string' ? e : query;
    executeTurn(searchQuery);
  };

  const handleSendMessage = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue('');
    executeTurn(text);
  };

  const handleRetry = () => {
    if (session && session.messages.length > 0) {
      const lastUserMessage = [...session.messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        // Remove the user message from state so it gets re-added by executeTurn
        setSession(prev => prev ? {
          ...prev,
          messages: prev.messages.filter(m => m.id !== lastUserMessage.id)
        } : null);
        executeTurn(lastUserMessage.content);
      }
    }
  };

  const examplePrompts = [
    "What does ephemeral mean?",
    "Find synonyms for meticulous",
    "How do you pronounce serendipity?",
  ];

  const formatTime = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(ts);
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      <AnimatePresence mode="wait">
        {!isSearching ? (
          // LANDING STATE (unchanged)
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex-1 pb-32"
          >
            {/* HERO SECTION */}
            <section className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-10 md:pt-20 pb-24 md:pb-32 overflow-hidden flex flex-col md:flex-row items-center min-h-[75vh]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-peach)] opacity-20 dark:opacity-5 blur-3xl rounded-[60%_40%_30%_70%/60%_30%_70%_40%] -z-10 translate-x-1/3 -translate-y-1/4 animate-pulse duration-[10s]"></div>
              <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--color-lavender)] opacity-30 dark:opacity-10 blur-3xl rounded-[40%_60%_70%_30%/40%_70%_30%_60%] -z-10 -translate-x-1/2"></div>
              <div className="hidden lg:block absolute top-0 bottom-0 left-[60%] w-[1px] bg-border-subtle -z-10"></div>

              <div className="w-full lg:w-[55%] z-10 relative">
                <div className="mb-4 inline-flex items-center gap-2">
                  <div className="w-8 h-[1px] bg-foreground"></div>
                  <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-muted">A modern lexicon</span>
                </div>
                
                <h1 className="font-serif text-6xl sm:text-7xl lg:text-[5.5rem] leading-[1.05] text-foreground tracking-tighter mb-8">
                  Words, <br/>
                  <span className="italic text-muted font-light relative">
                    understood
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--color-peach)] opacity-50 dark:opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="transparent" />
                    </svg>
                  </span> <br/>
                  differently.
                </h1>
                
                <p className="font-sans text-lg md:text-xl text-subtle max-w-md mb-12 leading-relaxed">
                  LexiAgent lets you explore the nuance of language through natural, intelligent conversation.
                </p>

                <div className="max-w-xl relative">
                  <form 
                    onSubmit={handleInitialSearch} 
                    className={`relative flex items-center bg-surface border transition-all duration-500 rounded-2xl ${isInputFocused ? 'border-foreground shadow-elevated' : 'border-border-strong shadow-subtle'}`}
                  >
                    <div className={`absolute left-5 flex items-center transition-colors duration-300 ${isInputFocused ? 'text-foreground' : 'text-muted'}`}>
                      <Search size={22} strokeWidth={1.5} />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="Ask about a word, phrase, synonym..."
                      className="w-full h-16 sm:h-20 pl-14 pr-20 bg-transparent text-lg sm:text-xl text-foreground focus:outline-none placeholder:text-subtle/70 placeholder:font-light"
                    />
                    <button
                      type="submit"
                      disabled={!query.trim()}
                      className="absolute right-3 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-foreground text-background disabled:opacity-40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-subtle"
                    >
                      <CornerDownLeft size={20} strokeWidth={1.5} />
                    </button>
                  </form>
                  
                  <div className="mt-8">
                    <p className="text-xs uppercase tracking-widest text-muted font-medium mb-4 flex items-center gap-2">
                      <Search size={12} /> Try asking
                    </p>
                    <div className="flex flex-col gap-3">
                      {examplePrompts.map((prompt, i) => (
                        <motion.button
                          key={prompt}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          onClick={() => { setQuery(prompt); handleInitialSearch(prompt); }}
                          className="text-left font-serif text-lg text-subtle hover:text-foreground transition-colors duration-300 flex items-center group w-max"
                        >
                          <span className="w-6 text-sm text-border-strong group-hover:text-foreground transition-colors">0{i+1}</span>
                          <span className="border-b border-transparent group-hover:border-foreground/30 transition-colors pb-0.5">{prompt}</span>
                          <ArrowRight size={14} className="ml-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex w-[45%] relative h-[600px] justify-center items-center">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="absolute top-1/4 right-[20%] bg-surface px-6 py-4 rounded-xl shadow-elevated border border-border-subtle rotate-3 z-20"
                >
                  <p className="font-serif text-2xl text-foreground">serendipity</p>
                  <p className="font-sans text-xs text-muted mt-1 uppercase tracking-widest">[ noun ]</p>
                </motion.div>

                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute bottom-1/3 left-[10%] bg-surface-tint px-6 py-4 rounded-xl border border-border-subtle -rotate-6 z-10"
                >
                  <p className="font-serif text-xl text-muted italic line-through decoration-1">predictable</p>
                  <p className="font-serif text-2xl text-foreground mt-1">ephemeral</p>
                </motion.div>
                
                <span className="absolute left-1/3 top-1/3 font-serif text-[20rem] leading-none text-border-subtle/50 select-none -z-10">"</span>
              </div>
            </section>

            <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border-strong to-transparent opacity-50"></div>
            </div>

            <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-24">
              <div className="mb-16">
                <h2 className="font-serif text-4xl text-foreground mb-4">A complete toolkit.</h2>
                <p className="font-sans text-muted">Everything you need to master a word, thoughtfully presented.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]">
                <div className="lg:col-span-2 lg:row-span-2 bg-surface border border-border-subtle rounded-2xl p-8 flex flex-col justify-between group hover:border-foreground/30 transition-colors">
                  <div className="w-12 h-12 bg-surface-tint rounded-xl flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform duration-500">
                    <BookOpen size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl text-foreground mb-2">Definitions</h3>
                    <p className="text-subtle font-sans leading-relaxed">Precise, context-aware meanings extracted from the world's most trusted lexicons.</p>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-[var(--color-sage)]/20 dark:bg-[var(--color-sage)]/10 border border-[var(--color-sage)]/30 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                  <SpellCheck size={100} className="absolute -right-6 -bottom-6 text-[var(--color-sage)] opacity-40 dark:opacity-20 stroke-1" />
                  <h3 className="font-serif text-2xl text-[#4A5D4E] dark:text-[var(--color-sage)] mb-2 relative z-10">Real-world Examples</h3>
                  <p className="font-serif italic text-[#4A5D4E]/80 dark:text-[var(--color-sage)]/80 relative z-10">"The <span className="underline decoration-wavy underline-offset-4">ephemeral</span> nature of fashion."</p>
                </div>
              </div>
            </section>

            <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16">
              <div className="max-w-2xl p-10 md:p-14 bg-surface-tint border border-border-strong rounded-3xl relative">
                <BrainCircuit size={32} className="text-muted mb-6" strokeWidth={1} />
                <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4 leading-tight">
                  LexiAgent doesn't just answer. <br/>
                  <span className="text-muted italic">It knows when to look something up.</span>
                </h2>
                <p className="font-sans text-subtle leading-relaxed text-lg">
                  Powered by an autonomous reasoning loop, it curates factual dictionary data before crafting a response, ensuring precision meets elegance.
                </p>
              </div>
            </section>
          </motion.div>
        ) : (
          /* CONVERSATIONAL VIEW */
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col w-full min-h-screen pt-4 pb-40"
          >
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 space-y-16">
              {session?.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index === session.messages.length - 1 ? 0.1 : 0 }}
                  className={`flex flex-col w-full ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {message.role === 'user' ? (
                    <div className="flex flex-col items-end gap-2 max-w-[85%] md:max-w-[70%]">
                      <div className="px-6 py-4 rounded-2xl rounded-tr-sm bg-surface border border-border-strong text-foreground shadow-sm">
                        <p className="text-lg font-serif italic text-muted leading-relaxed">
                          "{message.content}"
                        </p>
                      </div>
                      <span className="text-[10px] text-border-strong font-medium uppercase tracking-widest mr-2">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-start gap-4">
                      <WordResult entry={parseDictionaryMarkdown(message.content)} />
                      <span className="text-[10px] text-border-strong font-medium uppercase tracking-widest ml-4 mt-2">
                        LexiAgent • {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* LOADING STATE */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start w-full"
                >
                  <div className="pl-4 border-l-2 border-border-strong flex items-center h-12">
                     <p className="font-sans text-sm text-muted animate-pulse tracking-wide flex items-center gap-2">
                       <span className="inline-block w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin"></span>
                       Searching the lexicon...
                     </p>
                  </div>
                </motion.div>
              )}

              {/* ERROR STATE */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center w-full mt-8"
                >
                  <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex flex-col items-center text-center gap-4 max-w-md">
                    <AlertCircle className="text-red-500" size={24} />
                    <p className="font-sans text-red-800 dark:text-red-400">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-medium hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <RefreshCw size={16} /> Retry
                    </button>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* FLOATING INPUT AREA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm z-40 pointer-events-none">
              <form 
                onSubmit={handleSendMessage} 
                className="relative flex items-end max-w-3xl mx-auto w-full pointer-events-auto bg-surface border border-border-strong rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] focus-within:ring-1 focus-within:ring-foreground transition-shadow duration-300"
              >
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a follow up question..."
                  rows={1}
                  className="w-full max-h-32 py-5 pl-6 pr-16 bg-transparent text-foreground focus:outline-none resize-none placeholder:text-subtle font-sans text-lg leading-relaxed custom-scrollbar"
                  disabled={isLoading}
                />
                <div className="absolute right-3 bottom-3 flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={18} strokeWidth={2} />
                  </button>
                </div>
              </form>
              <div className="text-center mt-3 pointer-events-auto hidden sm:block">
                <span className="text-xs text-subtle font-medium tracking-wide">Press <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-surface-tint border border-border-subtle">Enter</kbd> to send, <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-surface-tint border border-border-subtle">Shift</kbd> + <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-surface-tint border border-border-subtle">Enter</kbd> for newline</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
