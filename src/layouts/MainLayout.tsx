import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookA, Clock, Settings, Moon, Sun, Menu, X, User } from 'lucide-react';
import { HistoryDrawer } from '../components/history/HistoryDrawer';
import { useHistoryStore } from '../store/historyStore';
import { useAuth } from '../contexts/AuthContext';
import { useThemeStore } from '../store/themeStore';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleDarkMode } = useThemeStore();
  const { setDrawerOpen, setActiveSession } = useHistoryStore();
  const { session, signOut } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMobileNav = (action?: () => void, path?: string) => {
    setIsMobileMenuOpen(false);
    if (action) {
      setTimeout(action, 150); // wait for drawer to start closing
    } else if (path) {
      navigate(path);
    }
  };

  const navItems = [
    { type: 'button', action: () => { setActiveSession(null); navigate('/'); }, label: 'Home', icon: undefined, id: 'home' },
    { type: 'button', action: () => setDrawerOpen(true), label: 'Chats', icon: Clock, id: 'history' },
    { type: 'link', path: '/vocabulary', label: 'Vocabulary', icon: undefined, id: 'vocabulary' },
    { type: 'link', path: '/settings', label: 'Settings', icon: Settings, id: 'settings' },
    session 
      ? { type: 'button', action: async () => { await signOut(); navigate('/auth'); }, label: 'Sign Out', icon: undefined, id: 'signout' }
      : { type: 'link', path: '/auth', label: 'Sign In', icon: undefined, id: 'signin' }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500 overflow-x-hidden w-full max-w-full">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 w-full max-w-full z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-8 bg-background/95 backdrop-blur-sm border-b border-border-subtle/10 transition-all duration-300">
        
        {/* Left: Brand */}
        <Link to="/" onClick={() => setActiveSession(null)} className="flex items-center gap-3 group shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-foreground text-background transition-transform group-hover:rotate-6">
            <BookA size={16} strokeWidth={2} />
          </div>
          <span className="font-serif text-2xl tracking-tight text-foreground">LexiAgent</span>
        </Link>
        
        {/* Right: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10 shrink-0">
          {location.pathname !== '/auth' && navItems.map((item) => {
            const isActive = item.type === 'link' && location.pathname === item.path;
            const className = "text-[10px] font-sans tracking-widest uppercase transition-colors duration-300 hover:text-foreground shrink-0 " + (isActive ? "text-foreground font-medium" : "text-muted");

            if (item.type === 'button') {
              return (
                <button key={item.id} onClick={item.action} className={className}>
                  {item.label}
                </button>
              );
            }

            return (
              <Link key={item.id} to={item.path!} className={className}>
                {item.label}
              </Link>
            );
          })}
          
          <button 
            onClick={toggleDarkMode}
            className="text-muted hover:text-foreground transition-colors ml-2 shrink-0"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? 'dark' : 'light'}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Sun size={12} strokeWidth={2} /> : <Moon size={12} strokeWidth={2} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 text-foreground transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-[340px] bg-surface-tint border-l border-border-subtle shadow-2xl z-[70] flex flex-col md:hidden overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle/50 shrink-0">
                <span className="font-serif text-xl tracking-tight text-foreground">LexiAgent</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-11 h-11 -mr-3 text-muted hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex flex-col px-6 py-8 gap-8 overflow-y-auto">
                <nav className="flex flex-col gap-6">
                  {location.pathname !== '/auth' && navItems.map((item) => {
                    if (item.id === 'signin' || item.id === 'signout') return null;
                    const isActive = item.type === 'link' && location.pathname === item.path;
                    const className = "text-[11px] font-sans tracking-[0.2em] uppercase transition-colors duration-300 text-left w-full py-1 " + (isActive ? "text-foreground font-medium" : "text-muted hover:text-foreground");
                    
                    return (
                      <button 
                        key={item.id} 
                        onClick={() => handleMobileNav(item.action, item.path)} 
                        className={className}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                <div className="w-full h-px bg-border-subtle/50 my-1"></div>

                <div className="flex flex-col gap-5">
                  <span className="text-[9px] font-sans tracking-[0.25em] uppercase text-subtle font-medium">Appearance</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans tracking-[0.15em] uppercase text-muted">Theme</span>
                    <button 
                      onClick={toggleDarkMode}
                      className="flex items-center gap-2 text-[10px] font-sans tracking-widest uppercase text-foreground border border-border-subtle px-3 py-1.5 rounded-md hover:bg-background transition-colors shadow-sm"
                    >
                      {isDark ? <Sun size={12} strokeWidth={1.5} /> : <Moon size={12} strokeWidth={1.5} />}
                      {isDark ? 'Light' : 'Dark'}
                    </button>
                  </div>
                </div>

                <div className="w-full h-px bg-border-subtle/50 my-1"></div>

                <div className="flex flex-col gap-5">
                  <span className="text-[9px] font-sans tracking-[0.25em] uppercase text-subtle font-medium">Session</span>
                  {session ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-surface border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                          {session.user?.user_metadata?.avatar_url ? (
                            <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} strokeWidth={1.5} className="text-muted" />
                          )}
                        </div>
                        <span className="text-sm font-serif text-foreground truncate block min-w-0 flex-1">
                          {session.user?.user_metadata?.full_name || session.user?.email || 'User'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleMobileNav(async () => { await signOut(); navigate('/auth'); })}
                        className="text-[11px] font-sans tracking-[0.2em] uppercase text-left w-full py-1 text-muted hover:text-foreground"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-surface border border-border-subtle flex items-center justify-center shrink-0">
                          <User size={14} strokeWidth={1.5} className="text-muted" />
                        </div>
                        <span className="text-sm font-serif text-foreground">Guest User</span>
                      </div>
                      <button 
                        onClick={() => handleMobileNav(undefined, '/auth')}
                        className="text-[11px] font-sans tracking-[0.2em] uppercase text-left w-full py-1 text-foreground font-medium"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-full flex flex-col relative z-10 pt-20 sm:pt-24 md:pt-32">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} className="w-full max-w-full flex-1 flex flex-col min-w-0" initial="initial" animate="animate" exit="exit" variants={{
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] } },
            exit: { opacity: 0, y: -4, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] } }
          }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <HistoryDrawer />
    </div>
  );
};
