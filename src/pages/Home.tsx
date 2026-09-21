import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, Search, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { WordResult } from '../components/dictionary/WordResult';
import { ActivityTimeline, type AgentEvent } from '../components/agent/ActivityTimeline';
import { parseDictionaryMarkdown } from '../lib/parser';
import { sendMessage } from '../services/lexiAgentApi';
import { useHistoryStore } from '../store/historyStore';
import type { Message } from '../types';

export const Home: React.FC = () => {
  const { sessions, activeSessionId, setActiveSession, addSession, addMessageToSession } = useHistoryStore();
  const session = sessions.find(s => s.id === activeSessionId) || null;

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEvents, setActiveEvents] = useState<AgentEvent[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync isSearching state based on active session
  useEffect(() => {
    if (activeSessionId) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setQuery('');
      setInputValue('');
    }
  }, [activeSessionId]);

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

    // Initialize telemetry
    setActiveEvents([
      { id: '1', label: 'Request sent to LexiAgent', timestamp: Date.now(), status: 'success' },
      { id: '2', label: 'Processing request', status: 'pending' }
    ]);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    const isFirstMessage = !session;
    const sessionId = session?.id || 'session-' + Date.now();

    if (isFirstMessage) {
      addSession({
        id: sessionId,
        title: messageText.slice(0, 40) + (messageText.length > 40 ? '...' : ''),
        preview: messageText,
        messages: [newUserMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setActiveSession(sessionId);
    } else {
      addMessageToSession(sessionId, newUserMessage);
    }

    try {
      const response = await sendMessage({ message: messageText, sessionId });
      
      const finalEvents: AgentEvent[] = [
        { id: '1', label: 'Request sent to LexiAgent', timestamp: Date.now() - 1200, status: 'success' },
        { id: '2', label: 'Processing request', status: 'success' },
        { id: '3', label: 'Response generated', timestamp: Date.now(), status: 'success' }
      ];
      setActiveEvents(finalEvents);

      const newAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.response,
        timestamp: Date.now(),
        events: finalEvents
      };

      addMessageToSession(sessionId, newAgentMessage);
    } catch (err) {
      console.error('Error fetching response:', err);
      setError("LexiAgent had trouble finding that information. Please try again.");
      setActiveEvents(prev => {
        const newEvents = [...prev];
        const pendingItem = newEvents.find(e => e.status === 'pending');
        if (pendingItem) pendingItem.status = 'error';
        return newEvents;
      });
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
        // We do not delete messages from history easily here since we rely on the store. 
        // For now, retry just re-submits the last message query.
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
            className="w-full flex-1 flex flex-col justify-center min-h-[calc(100svh-120px)] relative overflow-hidden"
          >
            {/* BACKGROUND ART DIRECTION */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
              {/* Layer 1: Warm paper foundation (handled by index.css --bg-base) */}
              
              {/* Layer 4: Tonal Atmosphere - extremely soft warm natural light */}
              <div className="absolute top-0 left-0 w-full h-[80%] bg-[radial-gradient(circle_at_20%_30%,#FFFFFF_0%,transparent_60%)] opacity-[0.2] dark:opacity-[0.03]"></div>

              {/* Minimal Editorial Edge Detail */}
              <div className="absolute bottom-8 left-8 text-[8px] uppercase tracking-widest text-muted opacity-40 hidden md:block">
                WORDS / 2026
              </div>
            </div>

            {/* HERO SECTION */}
            <section className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between z-10 pt-16 pb-10">
              
              {/* Left Content (Typography & Search) */}
              <div className="w-full lg:w-[50%] xl:w-[45%] z-10 relative mt-10 md:mt-0">
                
                {/* Tiny Editorial Metadata */}
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-widest text-muted">A Modern Lexicon</span>
                  <div className="w-8 h-[1px] bg-foreground/30"></div>
                </div>

                <h1 className="font-serif text-5xl sm:text-6xl lg:text-[5.5rem] leading-[0.95] text-foreground tracking-tighter mb-8">
                  Words, <br/>
                  <span className="italic text-muted font-light relative -ml-1 sm:-ml-2">
                    understood
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-muted opacity-20" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="1" fill="transparent" />
                    </svg>
                  </span> <br/>
                  differently.
                </h1>
                
                <p className="font-sans text-base md:text-lg text-subtle max-w-sm mb-12 leading-relaxed">
                  LexiAgent lets you explore language through natural, intelligent conversation.
                </p>

                <div className="max-w-2xl relative">
                  <form 
                    onSubmit={handleInitialSearch} 
                    className={`relative flex items-center bg-surface transition-all duration-700 rounded-none ${isInputFocused ? 'border-foreground/40 shadow-sm' : 'border-border-strong/50 shadow-[0_2px_12px_-2px_rgba(60,50,40,0.04)]'}`}
                    style={{ borderWidth: '0.5px' }}
                  >
                    <div className="absolute -top-5 left-0 text-[8px] uppercase tracking-[0.2em] text-muted hidden sm:flex items-center gap-2">
                      FIG. 01 <span className="opacity-40">/</span> INQUIRY
                    </div>
                    <div className={`absolute left-5 flex items-center transition-colors duration-300 ${isInputFocused ? 'text-foreground/80' : 'text-muted/60'}`}>
                      <Search size={18} strokeWidth={1} />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="Ask about a word, phrase, synonym..."
                      className="w-full h-14 sm:h-16 pl-14 pr-16 bg-transparent text-base sm:text-lg text-foreground font-serif italic focus:outline-none placeholder:text-subtle/60 placeholder:font-light"
                    />
                    <button
                      type="submit"
                      disabled={!query.trim()}
                      className="absolute right-3 flex items-center justify-center w-10 h-10 bg-transparent text-foreground/60 hover:text-foreground disabled:opacity-20 transition-colors duration-300"
                    >
                      <CornerDownLeft size={16} strokeWidth={1} />
                    </button>
                  </form>
                  
                  <div className="mt-10">
                    <div className="flex flex-col gap-4">
                      {examplePrompts.map((prompt, i) => (
                        <motion.button
                          key={prompt}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          onClick={() => { setQuery(prompt); handleInitialSearch(prompt); }}
                          className="text-left font-serif text-base text-muted hover:text-foreground/90 transition-all duration-300 flex items-center group w-max"
                        >
                          <span className="w-8 text-[9px] font-sans tracking-widest text-border-strong group-hover:text-foreground/50 transition-colors">0{i+1}</span>
                          <span className="transform group-hover:translate-x-1 transition-transform duration-300">{prompt}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING WORD CONSTELLATION */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                
                {/* PRAGMATIC (Small card slightly behind serendipity) */}
                <motion.div 
                  initial={{ opacity: 0, rotate: -2, y: 0 }}
                  animate={{ opacity: 0.9, y: [2, -1, 2] }}
                  whileHover={{ y: -2, rotate: -1, opacity: 1, transition: { duration: 0.4 } }}
                  transition={{ opacity: { duration: 1.5, delay: 0.6 }, y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 } }}
                  className="hidden sm:block absolute top-[13%] right-[22%] lg:right-[26%] w-[120px] bg-[#F6F2EA] dark:bg-surface-tint px-4 py-3 border-[0.5px] border-[#3c3228]/[0.06] dark:border-border-subtle shadow-[0_2px_12px_-2px_rgba(60,50,40,0.05),0_1px_3px_-1px_rgba(60,50,40,0.03)] rounded-[1px_2px_1px_2px] z-10 pointer-events-auto cursor-default"
                >
                  <p className="font-serif text-sm text-foreground/80 italic tracking-wide">pragmatic</p>
                </motion.div>

                {/* SERENDIPITY (Main floating card, upper-right) */}
                <motion.div 
                  initial={{ opacity: 0, rotate: 1, y: 0 }}
                  animate={{ opacity: 1, y: [-2, 2, -2] }}
                  whileHover={{ y: -3, rotate: 0.5, transition: { duration: 0.4 } }}
                  transition={{ opacity: { duration: 1.5, delay: 0.2 }, y: { repeat: Infinity, duration: 8, ease: "easeInOut" } }}
                  className="absolute top-[8%] right-[5%] sm:top-[16%] sm:right-[12%] lg:right-[15%] w-[190px] bg-[#FAF7F1] dark:bg-surface px-5 py-4 border-[0.5px] border-[#3c3228]/[0.08] dark:border-border-strong/30 shadow-[0_4px_16px_-4px_rgba(60,50,40,0.06),0_2px_6px_-2px_rgba(60,50,40,0.04)] rounded-[2px_1px_2px_3px] z-20 pointer-events-auto cursor-default flex flex-col"
                >
                  <p className="font-serif text-xl sm:text-2xl text-foreground tracking-tight">serendipity</p>
                  <p className="font-sans text-[8px] text-muted/70 mt-2 uppercase tracking-[0.2em] pl-0.5">[ noun ]</p>
                </motion.div>

                {/* EPHEMERAL (Medium card farther down-right) */}
                <motion.div 
                  initial={{ opacity: 0, rotate: 1.5, y: 0 }}
                  animate={{ opacity: 1, y: [3, -2, 3] }}
                  whileHover={{ y: -3, rotate: 0.5, transition: { duration: 0.4 } }}
                  transition={{ opacity: { duration: 1.5, delay: 0.4 }, y: { repeat: Infinity, duration: 9, ease: "easeInOut", delay: 2 } }}
                  className="hidden md:flex absolute top-[48%] right-[6%] lg:right-[10%] w-[160px] bg-[#F8F4ED] dark:bg-surface px-4 py-4 border-[0.5px] border-[#3c3228]/[0.06] dark:border-border-strong/30 shadow-[0_3px_12px_-3px_rgba(60,50,40,0.05),0_1px_4px_-1px_rgba(60,50,40,0.03)] rounded-[1px_3px_2px_2px] z-10 pointer-events-auto cursor-default flex-col"
                >
                  <p className="font-serif text-lg sm:text-xl text-foreground tracking-tight">ephemeral</p>
                  <p className="font-sans text-[8px] text-muted/60 mt-1 uppercase tracking-[0.2em]">[ adjective ]</p>
                </motion.div>

                {/* METICULOUS (Small card lower-right) */}
                <motion.div 
                  initial={{ opacity: 0, rotate: -1, y: 0 }}
                  animate={{ opacity: 0.9, y: [-2, 1, -2] }}
                  whileHover={{ y: -2, rotate: -0.5, opacity: 1, transition: { duration: 0.4 } }}
                  transition={{ opacity: { duration: 1.5, delay: 0.8 }, y: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 } }}
                  className="absolute bottom-[10%] right-[10%] sm:bottom-[15%] sm:right-[18%] lg:right-[22%] w-[130px] bg-[#F9F6F0] dark:bg-surface-tint px-4 py-3 border-[0.5px] border-[#3c3228]/[0.05] dark:border-border-subtle shadow-[0_2px_10px_-2px_rgba(60,50,40,0.04),0_1px_3px_-1px_rgba(60,50,40,0.02)] rounded-[2px_1px_3px_2px] z-10 pointer-events-auto cursor-default flex flex-col"
                >
                  <p className="font-serif text-base sm:text-lg text-foreground tracking-tight">meticulous</p>
                  <p className="font-sans text-[7px] text-muted/60 mt-1.5 uppercase tracking-[0.2em]">[ adjective ]</p>
                </motion.div>
                
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
                      {message.events && message.events.length > 0 && (
                        <ActivityTimeline events={message.events} className="mb-2" />
                      )}
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
                  className="flex flex-col items-start w-full gap-4"
                >
                  {activeEvents.length > 0 && (
                    <ActivityTimeline events={activeEvents} className="mb-2" />
                  )}
                  <div className="pl-4 border-l-2 border-border-strong flex items-center h-12">
                     <p className="font-sans text-sm text-muted animate-pulse tracking-wide flex items-center gap-2">
                       <span className="inline-block w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin"></span>
                       Synthesizing response...
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
                className="relative flex items-end max-w-3xl mx-auto w-full pointer-events-auto bg-surface border border-foreground/20 rounded-none shadow-sm focus-within:border-foreground transition-colors duration-300"
              >
                <div className="absolute -top-6 left-0 text-[9px] uppercase tracking-widest text-muted">
                  Fig. 01 / Inquiry
                </div>
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a follow up question..."
                  rows={1}
                  className="w-full max-h-32 py-5 pl-6 pr-16 bg-transparent text-foreground focus:outline-none resize-none placeholder:text-subtle font-serif italic text-lg leading-relaxed custom-scrollbar"
                  disabled={isLoading}
                />
                <div className="absolute right-3 bottom-3 flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="flex h-10 w-10 items-center justify-center bg-transparent text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 border border-transparent hover:border-foreground disabled:hover:bg-transparent disabled:hover:text-foreground"
                  >
                    <ArrowRight size={18} strokeWidth={1} />
                  </button>
                </div>
              </form>
              <div className="text-center mt-3 pointer-events-auto hidden sm:block">
                <span className="text-[10px] text-subtle font-sans tracking-widest uppercase">
                  Press <kbd className="font-sans px-1 border-b border-border-strong">Enter</kbd> to send, <kbd className="font-sans px-1 border-b border-border-strong">Shift</kbd> + <kbd className="font-sans px-1 border-b border-border-strong">Enter</kbd> for newline
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
