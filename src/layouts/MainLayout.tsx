import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookA, Clock, Settings, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { HistoryDrawer } from '../components/history/HistoryDrawer';
import { useHistoryStore } from '../store/historyStore';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const { setDrawerOpen } = useHistoryStore();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const navItems = [
    { type: 'button', action: () => setDrawerOpen(true), label: 'History', icon: Clock, id: 'history' },
    { type: 'link', path: '/settings', label: 'Settings', icon: Settings, id: 'settings' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      <header className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center bg-foreground text-background transition-transform group-hover:rotate-6 rounded-[4px]">
            <BookA size={16} strokeWidth={2} />
          </div>
          <span className="font-serif text-2xl tracking-tight text-foreground">LexiAgent</span>
        </Link>
        
        <nav className="flex items-center gap-6 md:gap-8">
          {navItems.map((item) => {
            const isActive = item.type === 'link' && location.pathname === item.path;
            
            const content = (
              <>
                <span className="hidden sm:inline">{item.label}</span>
                <item.icon size={18} className="sm:hidden" />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 left-0 right-0 h-[1px] bg-foreground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            );

            const className = cn(
              "relative text-sm font-medium tracking-wide uppercase transition-colors hover:text-foreground",
              isActive ? "text-foreground" : "text-muted"
            );

            if (item.type === 'button') {
              return (
                <button key={item.id} onClick={item.action} className={className}>
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.id} to={item.path!} className={className}>
                {content}
              </Link>
            );
          })}
          
          <div className="w-[1px] h-4 bg-border-strong mx-2 hidden sm:block"></div>
          
          <button 
            onClick={toggleDarkMode}
            className="text-muted hover:text-foreground transition-colors p-2 -ml-2"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </header>

      <main className="flex-1 w-full flex flex-col pt-24 md:pt-32">
        <Outlet />
      </main>

      <HistoryDrawer />
    </div>
  );
};
