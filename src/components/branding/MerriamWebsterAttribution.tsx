import React from 'react';

export const MerriamWebsterAttribution: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <a 
        href="https://www.merriam-webster.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Dictionary data provided by Merriam-Webster"
        className="flex flex-col items-center gap-2 group opacity-80 hover:opacity-100 transition-opacity"
      >
        <span className="font-sans text-[8px] sm:text-[9px] uppercase tracking-widest text-subtle font-medium group-hover:text-muted transition-colors text-center">
          Dictionary & Thesaurus Data by
        </span>
        
        {/* Dark mode logo */}
        <img 
          src="/mw-logo-dark.png" 
          alt="Merriam-Webster Logo" 
          className="hidden dark:block h-[40px] sm:h-[50px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Light mode logo */}
        <img 
          src="/mw-logo-light.png" 
          alt="Merriam-Webster Logo" 
          className="block dark:hidden h-[40px] sm:h-[50px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </a>
    </div>
  );
};
