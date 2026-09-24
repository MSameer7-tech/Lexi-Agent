import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EASE } from '../lib/motion';
import { Search, ArrowRight, RefreshCw, AlertCircle, Bookmark, Mic } from 'lucide-react';
import { WordResult } from '../components/dictionary/WordResult';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { ActivityTimeline, type AgentEvent } from '../components/agent/ActivityTimeline';
import { mapDictionaryApiToParsedEntry } from '../lib/parser';
import { sendMessage, getConversationMessages } from '../services/lexiAgentApi';
import { useAuth } from '../contexts/AuthContext';
import { useHistoryStore } from '../store/historyStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Message } from '../types';

export const Home: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  const { sessions, activeSessionId, setActiveSession, addSession, addMessageToSession, setMessages, prependMessages } = useHistoryStore();
  const session = sessions.find(s => s.id === activeSessionId) || null;

  const location = useLocation();
  const navigate = useNavigate();



  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEvents, setActiveEvents] = useState<AgentEvent[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

    // Cloud Hydration for Messages
  useEffect(() => {
    if (activeSessionId && user && session && !session.isLoaded && session.messages.length === 0) {
      setIsLoadingMessages(true);
      getConversationMessages(activeSessionId, 50, null)
        .then(res => {
          if (res && res.messages) {
            // Note: messages come back newest first. Reverse them to display oldest -> newest
            const mapped: Message[] = [...res.messages].reverse().map((m: any) => ({
              id: m.id || crypto.randomUUID(),
              role: m.role === 'assistant' ? 'agent' : m.role,
              content: m.content,
              timestamp: new Date(m.created_at).getTime(),
              events: m.events || undefined,
              dictionary: m.dictionary_data || undefined,
            }));
            setMessages(activeSessionId, mapped, res.hasMore, res.nextCursor);
          } else {
            setMessages(activeSessionId, [], false, null);
          }
        })
        .catch(err => console.error("Failed to fetch messages", err))
        .finally(() => setIsLoadingMessages(false));
    }
  }, [activeSessionId, user, session, setMessages]);

  const handleLoadOlderMessages = async () => {
    if (!activeSessionId || !session || isLoadingOlder || !session.hasMoreMessages || !session.nextMessageCursor) return;
    setIsLoadingOlder(true);
    try {
      const res = await getConversationMessages(activeSessionId, 50, session.nextMessageCursor);
      if (res && res.messages) {
        const mapped: Message[] = [...res.messages].reverse().map((m: any) => ({
          id: m.id || crypto.randomUUID(),
          role: m.role === 'assistant' ? 'agent' : m.role,
          content: m.content,
          timestamp: new Date(m.created_at).getTime(),
          events: m.events || undefined,
          dictionary: m.dictionary_data || undefined,
        }));
        // Use prependMessages to add to the top and deduplicate
        prependMessages(activeSessionId, mapped, res.hasMore, res.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load older messages", err);
      alert("Couldn't load older messages.");
    } finally {
      setIsLoadingOlder(false);
    }
  };


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

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsRecording(true);
            recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const currentActiveSession = useHistoryStore.getState().activeSessionId;
        if (!currentActiveSession) {
          setQuery(prev => prev ? prev + ' ' + transcript : transcript);
        } else {
          setInputValue(prev => {
            const newVal = prev ? prev + ' ' + transcript : transcript;
            setTimeout(adjustTextareaHeight, 10);
            return newVal;
          });
        }
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      };
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support voice input.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

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

    useEffect(() => {
    if (location.state?.askAbout) {
      const askWord = location.state.askAbout;
      // Clear the state so it doesn't trigger on reload
      navigate('/', { replace: true });
      
      const newPrompt = `Tell me more about the word "${askWord}"`;
      
      if (activeSessionId) {
        setInputValue(newPrompt);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 100);
      } else {
        setQuery(newPrompt);
        // Automatically start the search?
        // handleInitialSearch(newPrompt);
        setTimeout(() => {
          handleInitialSearch(newPrompt);
        }, 100);
      }
    }
  }, [location.state]);

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
      
      let finalEvents: AgentEvent[] = [];
      if (response.events && response.events.length > 0) {
        finalEvents = response.events
          .filter((evt: any) => !(evt.type === 'tool_call' && evt.tool === 'thesaurus_lookup'))
          .map((evt: any, i: number) => ({
            id: i.toString(),
            label: evt.type === 'tool_call' 
              ? `Looking up "${evt.input}"`
              : evt.type === 'tool_result'
                ? (evt.tool === 'thesaurus_lookup' 
                    ? (evt.success ? 'Thesaurus information retrieved' : (evt.error ? `Thesaurus failed: ${evt.error}` : 'Thesaurus lookup failed'))
                    : (evt.success ? 'Dictionary information retrieved' : (evt.error ? `Dictionary failed: ${evt.error}` : 'Dictionary lookup failed')))
                : evt.type,
            status: evt.success === false ? 'error' : 'success',
            timestamp: Date.now()
        }));
      } else {
        finalEvents = []; // For normal conversation, keep events empty
      }
      
      setActiveEvents(finalEvents);

      const newAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.response,
        timestamp: Date.now(),
        events: finalEvents,
        dictionary: response.dictionary
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
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex-1 flex flex-col justify-center min-h-[calc(100svh-120px)] relative overflow-hidden bg-transparent"
          >
            {/* HERO COMPOSITION */}
            <section className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between z-10 py-10 md:py-0">
              
              {/* LEFT SIDE (Typography & Search) */}
              <div className="w-full lg:w-[45%] xl:w-[40%] z-10 relative flex flex-col justify-center mt-12 md:mt-0">
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                  className="mb-8 flex items-center gap-4"
                >
                  <span className="text-[9px] uppercase tracking-widest text-subtle">A Modern Lexicon</span>
                  <div className="w-12 h-[1px] bg-border-strong/50"></div>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                  className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-foreground tracking-tight mb-8"
                >
                  Words, <br/>
                  <span className="italic text-foreground font-light -ml-1">
                    understood
                  </span> <br/>
                  differently.
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
                  className="font-sans text-base md:text-lg text-muted max-w-[340px] mb-14 leading-relaxed"
                >
                  LexiAgent lets you explore language through natural, intelligent conversation.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="w-full max-w-xl relative"
                >
                  <div className="mb-3 text-[9px] uppercase tracking-[0.15em] text-subtle">
                    FIG. 01 / INQUIRY
                  </div>
                  <form 
                    onSubmit={handleInitialSearch} 
                    className={`relative flex items-center bg-surface transition-all duration-200 rounded-[1px] ${isInputFocused ? 'border-foreground/30 shadow-[0_6px_24px_-6px_rgba(42,41,40,0.08)] dark:shadow-[0_6px_24px_-6px_rgba(0,0,0,0.2)] bg-white dark:bg-[#2F2D28]' : 'border-border-strong/60 shadow-[0_2px_12px_-2px_rgba(42,41,40,0.05)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.1)]'}`}
                    style={{ borderWidth: '1px' }}
                  >
                    <div className="absolute left-6 flex items-center text-muted pointer-events-none">
                      <Search size={18} strokeWidth={1.5} />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="Ask about a word, phrase, synonym..."
                      className="w-full h-16 sm:h-20 pl-16 pr-[90px] bg-transparent text-lg text-foreground font-serif italic focus:outline-none placeholder:text-muted"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleMicClick}
                        className={`flex items-center justify-center w-10 h-10 bg-transparent transition-colors duration-200 rounded-full ${isRecording ? 'text-red-500 hover:text-red-600 bg-red-500/10' : 'text-muted hover:text-foreground hover:bg-border-subtle/20'}`}
                        title={isRecording ? "Stop recording" : "Use voice input"}
                      >
                        <Mic size={18} strokeWidth={1.5} className={isRecording ? "animate-pulse" : ""} />
                      </button>
                      <button
                        type="submit"
                        disabled={!query.trim()}
                        className="flex items-center justify-center w-10 h-10 bg-transparent text-muted hover:text-foreground disabled:opacity-20 transition-colors duration-200"
                      >
                        <ArrowRight size={20} strokeWidth={1.5} />
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-10 flex flex-col gap-5">
                    {examplePrompts.map((prompt, i) => (
                      <button
                        key={prompt}
                        onClick={() => { setQuery(prompt); handleInitialSearch(prompt); }}
                        className="text-left font-sans text-sm text-muted hover:text-foreground transition-colors duration-300 flex items-center group w-max"
                      >
                        <span className="w-8 text-[9px] tracking-widest text-subtle group-hover:text-muted transition-colors">0{i+1}</span>
                        <span className="transform group-hover:translate-x-[3px] transition-transform duration-300">{prompt}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* RIGHT SIDE (Floating Colored Cards) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 md:static md:w-[50%] md:h-[640px] md:pointer-events-auto">
                <div className="relative w-full h-full min-h-[500px]">
                  
                  {/* ELOQUENT (Pink) */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: -3, y: 10 }}
                    animate={{ opacity: 1, y: shouldReduceMotion ? 0 : [2, -2, 2] }}
                    transition={{ opacity: { duration: 0.8, delay: 0.3 }, y: { repeat: Infinity, duration: 16, ease: "easeInOut" } }}
                    className="absolute top-[25%] left-[10%] md:top-[28%] md:left-[5%] w-[180px] h-[200px] sm:w-[220px] sm:h-[240px] bg-[#FFE6E0] dark:bg-[#51332F] p-5 sm:p-6 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] rounded-2xl z-20 flex flex-col transition-transform hover:-rotate-1"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={20} strokeWidth={2} />
                      <div className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[32px] sm:text-[40px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-2">eloquent</p>
                    <p className="font-sans text-sm sm:text-base text-black/60 dark:text-white/60 leading-tight">fluent or<br/>persuasive</p>
                  </motion.div>

                  {/* LIMINAL (Blue) */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: 6, y: 10 }}
                    animate={{ opacity: 1, y: shouldReduceMotion ? 0 : [-2, 2, -2] }}
                    transition={{ opacity: { duration: 1.2, delay: 0.6 }, y: { repeat: Infinity, duration: 9, ease: "easeInOut", delay: 1 } }}
                    className="hidden sm:flex absolute top-[5%] right-[2%] md:top-[5%] md:right-[5%] w-[190px] h-[210px] sm:w-[230px] sm:h-[250px] bg-[#DCE4FF] dark:bg-[#283566] p-5 sm:p-6 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] rounded-2xl z-10 flex-col transition-transform hover:rotate-3"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={20} strokeWidth={2} />
                      <div className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[36px] sm:text-[44px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-2">liminal</p>
                    <p className="font-sans text-sm sm:text-base text-black/60 dark:text-white/60 leading-tight">a transitional<br/>phase</p>
                  </motion.div>

                  {/* PETRICHOR (Purple) */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: -6, y: 10 }}
                    animate={{ opacity: 1, y: [3, -3, 3] }}
                    transition={{ opacity: { duration: 1.2, delay: 0.7 }, y: { repeat: Infinity, duration: 7.5, ease: "easeInOut", delay: 0.5 } }}
                    className="hidden md:flex absolute bottom-[10%] left-[20%] md:bottom-[5%] md:left-[25%] w-[170px] h-[190px] sm:w-[210px] sm:h-[230px] bg-[#E5D9FF] dark:bg-[#3B2C59] p-5 sm:p-6 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] rounded-2xl z-10 flex-col transition-transform hover:-rotate-2"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={20} strokeWidth={2} />
                      <div className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[32px] sm:text-[40px] leading-[0.95] text-black/80 dark:text-white/90 tracking-tight mb-2">petrichor</p>
                    <p className="font-sans text-sm sm:text-base text-black/60 dark:text-white/60 leading-tight mt-1">the pleasant<br/>smell of rain</p>
                  </motion.div>

                  {/* HALCYON (Yellow) */}
                  <motion.div 
                    initial={{ opacity: 0, rotate: 3, y: 10 }}
                    animate={{ opacity: 1, y: [-3, 3, -3] }}
                    transition={{ opacity: { duration: 1.2, delay: 0.8 }, y: { repeat: Infinity, duration: 8.5, ease: "easeInOut", delay: 1.5 } }}
                    className="hidden lg:flex absolute bottom-[8%] right-[8%] md:bottom-[15%] md:right-[10%] w-[200px] h-[220px] sm:w-[240px] sm:h-[260px] bg-[#FFF1CC] dark:bg-[#594B22] p-5 sm:p-6 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] rounded-2xl z-30 flex-col transition-transform hover:rotate-1"
                  >
                    <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto">
                      <Bookmark size={20} strokeWidth={2} />
                      <div className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <p className="font-serif text-[36px] sm:text-[44px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-2">halcyon</p>
                    <p className="font-sans text-sm sm:text-base text-black/60 dark:text-white/60 leading-tight">calm, peaceful<br/>days</p>
                  </motion.div>

                </div>
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
            <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 md:px-12 space-y-16">
              {isLoadingMessages && (
                <div className="flex justify-center py-20">
                  <div className="font-sans text-[10px] uppercase tracking-widest text-subtle flex flex-col items-center gap-3">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Loading your lexicon...</span>
                  </div>
                </div>
              )}
              
              {session?.hasMoreMessages && (
                <div className="flex justify-center mt-8 mb-4">
                  <button
                    onClick={handleLoadOlderMessages}
                    disabled={isLoadingOlder}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface hover:bg-border-subtle/50 border border-border-subtle text-subtle hover:text-foreground text-[11px] uppercase tracking-widest font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoadingOlder ? <><Loader2 size={12} className="animate-spin" /> Loading older entries...</> : '↑ Load older messages'}
                  </button>
                </div>
              )}

              {!isLoadingMessages && session?.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: message.role === 'user' ? 8 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: message.role === 'user' ? 0.35 : 0.45, ease: [0.25, 0.1, 0.25, 1.0], delay: index === session.messages.length - 1 ? 0.05 : 0 }}
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
                      {message.dictionary ? (
                        <div className="w-full mt-2">
                          <WordResult entry={mapDictionaryApiToParsedEntry(message.dictionary, message.content)} rawDictionaryData={message.dictionary} />
                        </div>
                      ) : (
                        message.content && (
                          <div className="w-full max-w-[90%] md:max-w-[85%] bg-surface border border-border-subtle shadow-[0_4px_12px_-4px_rgba(42,41,40,0.05)] dark:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.2)] rounded-[20px] p-6 sm:p-8 font-serif text-[17px] text-foreground leading-[1.6]">
                            <MarkdownRenderer content={message.content} />
                          </div>
                        )
                      )}
                      <span className="text-[9px] text-subtle uppercase tracking-widest mt-2 pl-6 md:pl-10 opacity-70">
                        LexiAgent · {formatTime(message.timestamp)}
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
            <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[2px] z-40 pointer-events-none flex flex-col items-center">
              <div className="w-full max-w-[760px] relative pointer-events-auto">
                <div className="mb-3 text-[9px] uppercase tracking-[0.15em] text-subtle">
                  FIG. 01 / INQUIRY
                </div>
                <form 
                  onSubmit={handleSendMessage} 
                  className={`relative flex items-center bg-surface transition-all duration-200 rounded-[1px] border-border-strong/60 shadow-[0_2px_12px_-2px_rgba(42,41,40,0.05)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.1)] focus-within:border-foreground/30 focus-within:shadow-[0_6px_24px_-6px_rgba(42,41,40,0.08)] focus-within:dark:shadow-[0_6px_24px_-6px_rgba(0,0,0,0.2)] focus-within:bg-white focus-within:dark:bg-[#2F2D28]`}
                  style={{ borderWidth: '1px' }}
                >
                  <div className="absolute left-6 flex items-center text-muted pointer-events-none">
                    <Search size={18} strokeWidth={1.5} />
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a follow up question..."
                    rows={1}
                    className="w-full min-h-[64px] sm:min-h-[80px] py-[22px] sm:py-[28px] pl-16 pr-[90px] bg-transparent text-lg text-foreground font-serif italic focus:outline-none resize-none placeholder:text-muted custom-scrollbar"
                    disabled={isLoading}
                  />
                  <div className="absolute right-4 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={`flex items-center justify-center w-10 h-10 bg-transparent transition-colors duration-200 rounded-full ${isRecording ? 'text-red-500 hover:text-red-600 bg-red-500/10' : 'text-muted hover:text-foreground hover:bg-border-subtle/20'}`}
                      title={isRecording ? "Stop recording" : "Use voice input"}
                    >
                      <Mic size={18} strokeWidth={1.5} className={isRecording ? "animate-pulse" : ""} />
                    </button>
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="flex items-center justify-center w-10 h-10 bg-transparent text-muted hover:text-foreground disabled:opacity-20 transition-colors duration-200"
                    >
                      <ArrowRight size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </form>
              <div className="text-center mt-3 pointer-events-auto hidden sm:block">
                <span className="text-[10px] text-subtle font-sans tracking-widest uppercase">
                  Press <kbd className="font-sans px-1 border-b border-border-strong">Enter</kbd> to send, <kbd className="font-sans px-1 border-b border-border-strong">Shift</kbd> + <kbd className="font-sans px-1 border-b border-border-strong">Enter</kbd> for newline
                </span>
              </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
