import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookA, Clock, Settings, Moon, Sun } from 'lucide-react';
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
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      {/* MINIMAL NAVBAR */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 bg-background/95 backdrop-blur-sm border-b border-border-subtle/10 transition-all duration-300">
        
        {/* Left: Brand */}
        <Link to="/" onClick={() => setActiveSession(null)} className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-foreground text-background transition-transform group-hover:rotate-6">
            <BookA size={16} strokeWidth={2} />
          </div>
          <span className="font-serif text-2xl tracking-tight text-foreground">LexiAgent</span>
        </Link>
        
        {/* Right: Navigation */}
        <nav className="flex items-center gap-6 sm:gap-10">
          {location.pathname !== '/auth' && navItems.map((item) => {
            const isActive = item.type === 'link' && location.pathname === item.path;
            const className = "text-[10px] font-sans tracking-widest uppercase transition-colors duration-300 hover:text-foreground " + (isActive ? "text-foreground font-medium" : "text-muted");

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
            className="text-muted hover:text-foreground transition-colors ml-2"
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
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full flex flex-col relative z-10 pt-24 md:pt-28">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} className="w-full flex-1 flex flex-col" initial="initial" animate="animate" exit="exit" variants={{
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
