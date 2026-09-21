import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Clock, Settings, Moon, Sun } from 'lucide-react';
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
      {/* MINIMAL NAVBAR */}
      <header className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-8 md:px-12 md:py-10 bg-transparent">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 bg-foreground text-bg-base rounded-[1px]">
            <BookOpen size={12} strokeWidth={2} />
          </div>
          <span className="font-serif text-lg font-medium tracking-wide text-foreground">LexiAgent</span>
        </div>
        
        {/* Right: Navigation */}
        <nav className="flex items-center gap-6 sm:gap-10">
          {navItems.map((item) => {
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
            {isDark ? <Sun size={12} strokeWidth={2} /> : <Moon size={12} strokeWidth={2} />}
          </button>
        </nav>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full flex flex-col relative z-10 pt-20">
        <Outlet />
      </main>

      <HistoryDrawer />
    </div>
  );
};
