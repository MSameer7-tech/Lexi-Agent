import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookA, Sparkles, Clock, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dictionary', icon: Sparkles },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-subtle bg-background/80 px-6 py-5 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-foreground text-background transition-transform group-hover:rotate-3">
            <BookA size={16} />
          </div>
          <span className="font-serif text-2xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">Lexi</span>
        </Link>
        <nav className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted"
                )}
              >
                <span className="hidden sm:inline">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-6 left-0 right-0 h-px bg-foreground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-border-subtle py-10 text-center">
        <p className="font-serif text-sm text-muted italic">A study companion for the modern mind.</p>
      </footer>
    </div>
  );
};
