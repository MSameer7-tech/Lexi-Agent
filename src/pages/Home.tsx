import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, BookOpen, BrainCircuit, SpellCheck, Search, ArrowRight, Sparkles, Volume2, Split } from 'lucide-react';
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

  const examplePrompts = [
    "What does ephemeral mean?",
    "Find synonyms for meticulous",
    "How do you pronounce serendipity?",
  ];

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      <AnimatePresence mode="wait">
        {!isSearching ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex-1"
          >
            {/* HERO SECTION */}
            <section className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-10 md:pt-20 pb-24 md:pb-32 overflow-hidden flex flex-col md:flex-row items-center min-h-[75vh]">
              
              {/* Decorative organic background blobs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-peach)] opacity-20 dark:opacity-5 blur-3xl rounded-[60%_40%_30%_70%/60%_30%_70%_40%] -z-10 translate-x-1/3 -translate-y-1/4 animate-pulse duration-[10s]"></div>
              <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--color-lavender)] opacity-30 dark:opacity-10 blur-3xl rounded-[40%_60%_70%_30%/40%_70%_30%_60%] -z-10 -translate-x-1/2"></div>
              
              {/* Decorative vertical line */}
              <div className="hidden lg:block absolute top-0 bottom-0 left-[60%] w-[1px] bg-border-subtle -z-10"></div>

              {/* Left Content (Typography & Search) */}
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

                {/* Primary Search Input */}
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
                  
                  {/* Curated Suggestions */}
                  <div className="mt-8">
                    <p className="text-xs uppercase tracking-widest text-muted font-medium mb-4 flex items-center gap-2">
                      <Sparkles size={12} /> Try asking
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

              {/* Right Content (Floating Labels / Decorative) */}
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

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="absolute bottom-1/4 right-[10%] p-4 bg-[var(--color-sage)]/20 dark:bg-[var(--color-sage)]/10 backdrop-blur-sm rounded-full border border-[var(--color-sage)]/30 text-foreground z-20"
                >
                  <Volume2 size={24} strokeWidth={1} />
                </motion.div>
                
                {/* Large decorative quotation mark */}
                <span className="absolute left-1/3 top-1/3 font-serif text-[20rem] leading-none text-border-subtle/50 select-none -z-10">
                  "
                </span>
              </div>
            </section>

            {/* DIVIDER */}
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border-strong to-transparent opacity-50"></div>
            </div>

            {/* CAPABILITIES SECTION (Bento Grid) */}
            <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-24">
              <div className="mb-16">
                <h2 className="font-serif text-4xl text-foreground mb-4">A complete toolkit.</h2>
                <p className="font-sans text-muted">Everything you need to master a word, thoughtfully presented.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]">
                
                {/* Definitions */}
                <div className="lg:col-span-2 lg:row-span-2 bg-surface border border-border-subtle rounded-2xl p-8 flex flex-col justify-between group hover:border-foreground/30 transition-colors">
                  <div className="w-12 h-12 bg-surface-tint rounded-xl flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform duration-500">
                    <BookOpen size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl text-foreground mb-2">Definitions</h3>
                    <p className="text-subtle font-sans leading-relaxed">Precise, context-aware meanings extracted from the world's most trusted lexicons.</p>
                  </div>
                </div>

                {/* Synonyms & Antonyms */}
                <div className="bg-[var(--color-peach)]/20 dark:bg-[var(--color-peach)]/10 border border-[var(--color-peach)]/30 rounded-2xl p-6 flex flex-col justify-between group">
                  <Split size={20} className="text-[#8A5A44] dark:text-[#FADAC9]" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-[#8A5A44] dark:text-[#FADAC9] mb-1">Synonyms</h3>
                    <p className="text-sm opacity-80 text-[#8A5A44] dark:text-[#FADAC9]">Nuanced alternatives.</p>
                  </div>
                </div>

                <div className="bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col justify-between">
                  <h3 className="font-serif text-xl text-foreground">Antonyms</h3>
                  <div className="flex gap-2 flex-wrap mt-2">
                    <span className="px-3 py-1 bg-surface-tint border border-border-subtle rounded-md text-xs text-muted line-through">boring</span>
                  </div>
                </div>

                {/* Pronunciation */}
                <div className="bg-foreground text-background rounded-2xl p-6 flex flex-col justify-between lg:row-span-2 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Volume2 size={24} className="mb-4" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-2xl mb-2">Audio</h3>
                    <p className="text-sm text-background/70 leading-relaxed">Hear the phonetic nuances spoken aloud.</p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 opacity-50">
                    <div className="w-1 h-3 bg-background rounded-full animate-pulse"></div>
                    <div className="w-1 h-5 bg-background rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-2 bg-background rounded-full animate-pulse delay-150"></div>
                    <div className="w-1 h-4 bg-background rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>

                {/* Examples */}
                <div className="lg:col-span-2 bg-[var(--color-sage)]/20 dark:bg-[var(--color-sage)]/10 border border-[var(--color-sage)]/30 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                  <SpellCheck size={100} className="absolute -right-6 -bottom-6 text-[var(--color-sage)] opacity-40 dark:opacity-20 stroke-1" />
                  <h3 className="font-serif text-2xl text-[#4A5D4E] dark:text-[var(--color-sage)] mb-2 relative z-10">Real-world Examples</h3>
                  <p className="font-serif italic text-[#4A5D4E]/80 dark:text-[var(--color-sage)]/80 relative z-10">"The <span className="underline decoration-wavy underline-offset-4">ephemeral</span> nature of fashion."</p>
                </div>

              </div>
            </section>

            {/* AGENTIC EXPLAINER SECTION */}
            <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 mb-24">
              <div className="max-w-2xl p-10 md:p-14 bg-surface-tint border border-border-strong rounded-3xl relative">
                <BrainCircuit size={32} className="text-muted mb-6" strokeWidth={1} />
                <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4 leading-tight">
                  LexiAgent doesn't just answer. <br/>
                  <span className="text-muted italic">It knows when to look something up.</span>
                </h2>
                <p className="font-sans text-subtle leading-relaxed text-lg">
                  Powered by an autonomous reasoning loop, it curates factual dictionary data before crafting a response, ensuring precision meets elegance.
                </p>
                
                {/* Decorative dots */}
                <div className="absolute top-10 right-10 flex gap-2 hidden sm:flex">
                  <div className="w-2 h-2 rounded-full bg-border-strong"></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--color-lavender)]"></div>
                </div>
              </div>
            </section>
            
          </motion.div>
        ) : (
          /* CONVERSATIONAL VIEW (Remains largely the same, fits the editorial style) */
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col h-[calc(100vh-100px)] w-full max-w-5xl mx-auto px-4 sm:px-8 pt-8"
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
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-[2rem] rounded-tr-md bg-foreground px-6 py-4 text-background shadow-elevated">
                      <p className="text-lg font-sans">{message.content}</p>
                    </div>
                  ) : (
                    <WordResult entry={parseDictionaryMarkdown(message.content)} />
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start w-full"
                >
                  <div className="px-8 py-6 rounded-[2rem] rounded-tl-md bg-surface border border-border-subtle flex space-x-2 items-center shadow-subtle">
                    <div className="w-2.5 h-2.5 bg-border-strong rounded-full animate-pulse" />
                    <div className="w-2.5 h-2.5 bg-border-strong rounded-full animate-pulse delay-75" />
                    <div className="w-2.5 h-2.5 bg-border-strong rounded-full animate-pulse delay-150" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="pt-6 pb-6 bg-gradient-to-t from-background via-background to-transparent sticky bottom-0 z-10">
              <form onSubmit={handleSendMessage} className="relative flex items-center max-w-4xl mx-auto w-full group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a follow up question..."
                  className="w-full h-16 pl-6 pr-16 rounded-2xl border border-border-strong bg-surface text-foreground shadow-elevated focus:ring-1 focus:ring-foreground focus:outline-none transition-all duration-300 placeholder:text-subtle font-sans text-lg"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-tint text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <CornerDownLeft size={18} strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
