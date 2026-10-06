import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '../lib/motion';
import { Search, ArrowRight, RefreshCw, AlertCircle, Bookmark, Mic } from 'lucide-react';
import { WordResult } from '../components/dictionary/WordResult';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { ActivityTimeline, type AgentEvent } from '../components/agent/ActivityTimeline';
import { mapDictionaryApiToParsedEntry } from '../lib/parser';
import { sendMessage, getConversationMessages, getWordOfTheDay } from '../services/lexiAgentApi';
import { useAuth } from '../contexts/AuthContext';
import { useHistoryStore } from '../store/historyStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Message } from '../types';

export const Home: React.FC = () => {
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

  const [wotdData, setWotdData] = useState<{ word: string, dictionary: any } | null>(null);
  useEffect(() => {
    getWordOfTheDay().then(res => {
      if (res && res.word) setWotdData({ word: res.word, dictionary: res.dictionary });
    }).catch(console.error);
  }, []);

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
  // Scroll to bottom only when switching to a new session
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [activeSessionId]);




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
      navigate('/', { replace: true });
      const newPrompt = `Tell me more about the word "${askWord}"`;
      if (activeSessionId) {
        setInputValue(newPrompt);
        setTimeout(() => { if (textareaRef.current) textareaRef.current.focus(); }, 100);
      } else {
        setQuery(newPrompt);
        setTimeout(() => handleInitialSearch(newPrompt), 100);
      }
    } else if (location.state?.triggerWotd) {
      navigate('/', { replace: true });
      if (wotdData?.word) {
        setQuery(wotdData.word);
        setTimeout(() => handleInitialSearch(wotdData.word), 100);
      } else {
        // Fallback if not loaded yet
        getWordOfTheDay().then(res => {
          if (res && res.word) {
            setWotdData({ word: res.word, dictionary: res.dictionary });
            setQuery(res.word);
            setTimeout(() => handleInitialSearch(res.word), 100);
          }
        });
      }
    }
  }, [location.state, wotdData]);

  const executeTurn = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    setError(null);
    
    // Scroll to bottom immediately to show the user's new message, 
    // but DO NOT scroll again when the AI responds, so they can read from the top!
    setTimeout(scrollToBottom, 50);

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
            <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[45%_1fr] xl:grid-cols-[40%_1fr] md:gap-x-8 lg:gap-x-12 items-center justify-between z-10 py-4 sm:py-6 md:py-0">
              
              {/* LEFT SIDE: TYPOGRAPHY (Top on Mobile, Left on Desktop) */}
              <div className="w-full z-10 relative flex flex-col justify-center pt-4 sm:pt-8 md:pt-0 md:mt-0 order-1 md:col-start-1 md:row-start-1">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="mb-6 md:mb-8 flex items-center gap-4"
                >
                  <span className="text-[9px] uppercase tracking-widest text-subtle">A Modern Lexicon</span>
                  <div className="w-12 h-[1px] bg-border-strong/50"></div>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                  className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-foreground tracking-tight mb-6 md:mb-8"
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
                  className="font-sans text-base md:text-lg text-muted w-full max-w-[340px] leading-relaxed"
                >
                  LexiAgent lets you explore language through natural, intelligent conversation.
                </motion.p>
              </div>

              {/* RIGHT SIDE: BLOOMING FLOWER WOTD CLUSTER */}
              <div className="w-full md:h-[640px] relative overflow-hidden md:overflow-visible z-0 order-2 md:col-start-2 md:row-start-1 md:row-span-2 my-8 md:my-0 flex items-center justify-center pointer-events-none md:pointer-events-auto">
                <div className="relative flex items-center justify-center w-full max-w-[380px] h-full group/cluster">
                  
                  {/* BACKGROUND CARDS (Wrapped in layout divs for hover transitions) */}
                  
                  {/* 1. ELOQUENT (Top Left) */}
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[180px] md:h-[200px] -mt-[80px] sm:-mt-[90px] md:-mt-[100px] -ml-[70px] sm:-ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 -translate-x-[90px] md:-translate-x-[130px] -translate-y-[70px] md:-translate-y-[90px] -rotate-6 group-hover/cluster:-translate-x-[160px] sm:group-hover/cluster:-translate-x-[200px] md:group-hover/cluster:-translate-x-[260px] group-hover/cluster:-translate-y-[130px] sm:group-hover/cluster:-translate-y-[160px] md:group-hover/cluster:-translate-y-[200px] group-hover/cluster:-rotate-[18deg] opacity-80 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="w-full h-full bg-[#FFE6E0] dark:bg-[#51332F] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("eloquent"); handleInitialSearch("eloquent"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[24px] sm:text-[28px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">eloquent</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">fluent or<br/>persuasive</p>
                    </motion.div>
                  </div>

                  {/* 2. PETRICHOR (Bottom Left) */}
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[180px] md:h-[200px] -mt-[80px] sm:-mt-[90px] md:-mt-[100px] -ml-[70px] sm:-ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 -translate-x-[80px] md:-translate-x-[110px] translate-y-[70px] md:translate-y-[90px] -rotate-6 group-hover/cluster:-translate-x-[140px] sm:group-hover/cluster:-translate-x-[180px] md:group-hover/cluster:-translate-x-[230px] group-hover/cluster:translate-y-[140px] sm:group-hover/cluster:translate-y-[180px] md:group-hover/cluster:translate-y-[220px] group-hover/cluster:-rotate-[22deg] opacity-80 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="w-full h-full bg-[#E5D9FF] dark:bg-[#3B2C59] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("petrichor"); handleInitialSearch("petrichor"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">petrichor</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">the pleasant<br/>smell of rain</p>
                    </motion.div>
                  </div>

                  {/* 3. HALCYON (Top Right) */}
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[180px] md:h-[200px] -mt-[80px] sm:-mt-[90px] md:-mt-[100px] -ml-[70px] sm:-ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 translate-x-[80px] md:translate-x-[120px] -translate-y-[60px] md:-translate-y-[80px] rotate-[8deg] group-hover/cluster:translate-x-[150px] sm:group-hover/cluster:translate-x-[190px] md:group-hover/cluster:translate-x-[250px] group-hover/cluster:-translate-y-[120px] sm:group-hover/cluster:-translate-y-[150px] md:group-hover/cluster:-translate-y-[190px] group-hover/cluster:rotate-[20deg] opacity-70 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="w-full h-full bg-[#FFF2CC] dark:bg-[#5C4D26] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("halcyon"); handleInitialSearch("halcyon"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">halcyon</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">calm, peaceful<br/>days</p>
                    </motion.div>
                  </div>

                  {/* 4. LIMINAL (Bottom Right) */}
                  <div className="absolute top-1/2 left-1/2 w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] md:w-[180px] md:h-[200px] -mt-[80px] sm:-mt-[90px] md:-mt-[100px] -ml-[70px] sm:-ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 translate-x-[70px] md:translate-x-[100px] translate-y-[80px] md:translate-y-[110px] rotate-[6deg] group-hover/cluster:translate-x-[130px] sm:group-hover/cluster:translate-x-[170px] md:group-hover/cluster:translate-x-[220px] group-hover/cluster:translate-y-[160px] sm:group-hover/cluster:translate-y-[200px] md:group-hover/cluster:translate-y-[250px] group-hover/cluster:rotate-[24deg] opacity-70 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="w-full h-full bg-[#DCE4FF] dark:bg-[#283566] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("liminal"); handleInitialSearch("liminal"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">liminal</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">a transitional<br/>phase</p>
                    </motion.div>
                  </div>

                  {/* 5. EPHEMERAL (Far Left Middle) - Hidden on Mobile */}
                  <div className="hidden sm:block absolute top-1/2 left-1/2 w-[160px] h-[180px] md:w-[180px] md:h-[200px] -mt-[90px] md:-mt-[100px] -ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 -translate-x-[130px] md:-translate-x-[170px] translate-y-[5px] md:translate-y-[10px] -rotate-[12deg] group-hover/cluster:-translate-x-[230px] md:group-hover/cluster:-translate-x-[320px] group-hover/cluster:translate-y-[15px] group-hover/cluster:-rotate-[32deg] opacity-60 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="w-full h-full bg-[#E6F3E6] dark:bg-[#2A3B2A] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("ephemeral"); handleInitialSearch("ephemeral"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">ephemeral</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">lasting for a<br/>very short time</p>
                    </motion.div>
                  </div>

                  {/* 6. ETHEREAL (Far Right Middle) - Hidden on Mobile */}
                  <div className="hidden sm:block absolute top-1/2 left-1/2 w-[160px] h-[180px] md:w-[180px] md:h-[200px] -mt-[90px] md:-mt-[100px] -ml-[80px] md:-ml-[90px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 translate-x-[130px] md:translate-x-[170px] -translate-y-[5px] md:-translate-y-[10px] rotate-[10deg] group-hover/cluster:translate-x-[230px] md:group-hover/cluster:translate-x-[320px] group-hover/cluster:-translate-y-[15px] group-hover/cluster:rotate-[30deg] opacity-60 group-hover/cluster:opacity-100">
                    <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="w-full h-full bg-[#FCE8D5] dark:bg-[#4A3219] p-4 sm:p-5 shadow-lg rounded-2xl flex flex-col cursor-pointer pointer-events-auto" onClick={() => { setQuery("ethereal"); handleInitialSearch("ethereal"); }}>
                      <div className="flex justify-between items-start text-black/40 dark:text-white/40 mb-auto"><Bookmark size={16} strokeWidth={2} /><div className="w-2 h-2 rounded-full bg-black/15 dark:bg-white/15" /></div>
                      <p className="font-serif text-[26px] sm:text-[30px] leading-none text-black/80 dark:text-white/90 tracking-tight mb-1.5">ethereal</p>
                      <p className="font-sans text-[10px] sm:text-xs text-black/60 dark:text-white/60 leading-tight">extremely delicate<br/>and light</p>
                    </motion.div>
                  </div>

                  {/* MAIN WOTD CARD */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => { if (wotdData?.word) { setQuery(wotdData.word); handleInitialSearch(wotdData.word); } }}
                    className="relative z-40 w-[85%] sm:w-[90%] bg-[#F9F7F1] dark:bg-[#1E1D1A] rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] border border-black/5 dark:border-white/5 cursor-pointer flex flex-col gap-12 sm:gap-16 overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] pointer-events-auto ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    {/* Subtle grain texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                    
                    {/* Soft Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FDFCFB]/80 to-[#E2D1C3]/30 dark:from-[#2F2D28]/40 dark:to-[#1C1B19]/80 pointer-events-none transition-opacity duration-700 opacity-60"></div>

                    {/* Header */}
                    <div className="relative flex justify-between items-start z-10">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.25em] uppercase text-black/60 dark:text-white/60 font-semibold tracking-[0.2em] transition-colors duration-700">Word of the Day</span>
                        <span className="text-[10px] sm:text-xs font-serif text-black/50 dark:text-white/50 italic">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center transition-colors duration-700">
                        <Bookmark size={14} strokeWidth={2} className="text-black/40 dark:text-white/40" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex flex-col z-10">
                      {wotdData ? (
                        <>
                          <h2 className="font-serif text-[36px] sm:text-[44px] md:text-[52px] leading-[1] text-black/95 dark:text-white/95 tracking-tight antialiased mb-3 break-words transition-colors duration-700">
                            {wotdData.word}
                          </h2>
                          
                          {wotdData.dictionary?.phonetic && (
                            <div className="flex items-center gap-3 mb-5">
                              <span className="font-sans text-sm sm:text-base text-black/60 dark:text-white/60 tracking-wide font-medium antialiased">{wotdData.dictionary.phonetic}</span>
                              <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-black/50 dark:text-white/50 px-2.5 py-0.5 rounded-full border border-black/15 dark:border-white/15 font-semibold">
                                {wotdData.dictionary.meanings?.[0]?.partOfSpeech || 'word'}
                              </span>
                            </div>
                          )}

                          {wotdData.dictionary?.meanings?.[0]?.definitions?.[0]?.definition ? (
                            <p className="font-serif text-sm sm:text-base md:text-[17px] text-black/70 dark:text-white/70 leading-relaxed italic antialiased">
                              "{wotdData.dictionary.meanings[0].definitions[0].definition}"
                            </p>
                          ) : (
                            <p className="font-sans text-xs sm:text-sm text-black/40 dark:text-white/40 leading-tight">
                              tap to discover full meaning & synonyms
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col gap-4 py-2 w-full animate-pulse">
                          {/* Skeleton Word */}
                          <div className="h-[48px] sm:h-[56px] bg-black/10 dark:bg-white/10 rounded-lg w-3/4 mb-1"></div>
                          
                          {/* Skeleton Phonetic & Pill */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-5 sm:h-6 bg-black/5 dark:bg-white/5 rounded w-1/3"></div>
                            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-16"></div>
                          </div>

                          {/* Skeleton Definition */}
                          <div className="space-y-2">
                            <div className="h-4 sm:h-5 bg-black/5 dark:bg-white/5 rounded w-full"></div>
                            <div className="h-4 sm:h-5 bg-black/5 dark:bg-white/5 rounded w-11/12"></div>
                            <div className="h-4 sm:h-5 bg-black/5 dark:bg-white/5 rounded w-4/5"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
              {/* LEFT SIDE: SEARCH AREA (Bottom on Mobile, Left on Desktop) */}
              <div className="w-full relative z-10 order-3 md:col-start-1 md:row-start-2 pb-8 sm:pb-12 md:pb-0">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="w-full max-w-xl relative mt-8 sm:mt-12 md:mt-16"
                >
                  <div className="mb-3 text-[9px] uppercase tracking-[0.15em] text-subtle">
                    FIG. 01 / INQUIRY
                  </div>
                  <form 
                    onSubmit={handleInitialSearch} 
                    className={`relative flex items-center transition-all duration-200 rounded-[1px] bg-white dark:bg-[#2F2D28] ${isInputFocused ? 'border-foreground/40 shadow-[0_8px_30px_-6px_rgba(42,41,40,0.12)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.3)]' : 'border-foreground/20 shadow-md dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)]'}`}
                    style={{ borderWidth: '1px' }}
                  >
                    <div className="absolute left-3.5 sm:left-6 flex items-center text-muted pointer-events-none">
                      <Search size={18} strokeWidth={1.5} />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="Ask about a word..."
                      className="w-full min-w-0 h-14 sm:h-16 md:h-20 pl-11 sm:pl-16 pr-[84px] sm:pr-[90px] bg-transparent text-base sm:text-lg text-foreground font-serif focus:outline-none placeholder:text-muted"
                    />
                    <div className="absolute right-1 sm:right-2 flex items-center gap-0 sm:gap-1">
                      <button
                        type="button"
                        onClick={handleMicClick}
                        className={`flex items-center justify-center w-[42px] h-[42px] sm:w-10 sm:h-10 bg-transparent transition-colors duration-200 rounded-full ${isRecording ? 'text-red-500 hover:text-red-600 bg-red-500/10' : 'text-muted hover:text-foreground hover:bg-border-subtle/20'}`}
                        title={isRecording ? "Stop recording" : "Use voice input"}
                      >
                        <Mic size={18} strokeWidth={1.5} className={isRecording ? "animate-pulse" : ""} />
                      </button>
                      <button
                        type="submit"
                        disabled={!query.trim()}
                        className="flex items-center justify-center w-[42px] h-[42px] sm:w-10 sm:h-10 bg-transparent text-muted hover:text-foreground disabled:opacity-20 transition-colors duration-200"
                      >
                        <ArrowRight size={20} strokeWidth={1.5} />
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-8 sm:mt-10 flex flex-col gap-4 sm:gap-5">
                    {examplePrompts.map((prompt, i) => (
                      <button
                        key={prompt}
                        onClick={() => { setQuery(prompt); handleInitialSearch(prompt); }}
                        className="text-left font-sans text-[13px] sm:text-sm text-foreground/90 hover:text-foreground transition-colors duration-300 flex items-center group w-max max-w-full"
                      >
                        <span className="w-6 sm:w-8 text-[10px] sm:text-[11px] font-medium tracking-widest text-foreground/70 group-hover:text-foreground transition-colors shrink-0">0{i+1}</span>
                        <span className="transform group-hover:translate-x-[3px] transition-transform duration-300 truncate text-base sm:text-[17px]">{prompt}</span>
                      </button>
                    ))}
                  </div>
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
                        <p className="text-lg font-serif text-muted leading-relaxed">
                          {message.content}
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
                          <WordResult entry={mapDictionaryApiToParsedEntry(message.dictionary, message.content)} rawDictionaryData={message.dictionary} variant="chat" />
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
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[2px] z-40 pointer-events-none flex flex-col items-center">
              <div className="w-full max-w-[760px] relative pointer-events-auto">
                <div className="mb-3 text-[9px] uppercase tracking-[0.15em] text-subtle">
                  FIG. 01 / INQUIRY
                </div>
                <form 
                  onSubmit={handleSendMessage} 
                  className={`relative flex items-center transition-all duration-200 rounded-[1px] bg-white dark:bg-[#2F2D28] border-foreground/20 shadow-md dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)] focus-within:border-foreground/40 focus-within:shadow-[0_8px_30px_-6px_rgba(42,41,40,0.12)] focus-within:dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.3)]`}
                  style={{ borderWidth: '1px' }}
                >
                  <div className="absolute left-3.5 sm:left-6 flex items-center text-muted pointer-events-none">
                    <Search size={18} strokeWidth={1.5} />
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a follow up..."
                    rows={1}
                    className="w-full min-w-0 min-h-[56px] sm:min-h-[80px] py-[16px] sm:py-[28px] pl-11 sm:pl-16 pr-[84px] sm:pr-[90px] bg-transparent text-base sm:text-lg text-foreground font-serif focus:outline-none resize-none placeholder:text-muted custom-scrollbar"
                    disabled={isLoading}
                  />
                  <div className="absolute right-1 sm:right-4 flex items-center gap-0 sm:gap-1">
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={`flex items-center justify-center w-[42px] h-[42px] sm:w-10 sm:h-10 bg-transparent transition-colors duration-200 rounded-full ${isRecording ? 'text-red-500 hover:text-red-600 bg-red-500/10' : 'text-muted hover:text-foreground hover:bg-border-subtle/20'}`}
                      title={isRecording ? "Stop recording" : "Use voice input"}
                    >
                      <Mic size={18} strokeWidth={1.5} className={isRecording ? "animate-pulse" : ""} />
                    </button>
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="flex items-center justify-center w-[42px] h-[42px] sm:w-10 sm:h-10 bg-transparent text-muted hover:text-foreground disabled:opacity-20 transition-colors duration-200"
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
