import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={cn("prose max-w-none", className)}>
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-8 tracking-tight font-normal" {...props} />,
          h2: ({node, ...props}) => <h2 className="font-sans text-xl md:text-2xl text-foreground mt-8 mb-4 font-medium tracking-tight uppercase text-xs" {...props} />,
          h3: ({node, ...props}) => <h3 className="font-serif text-2xl md:text-3xl text-foreground mt-8 mb-4 font-normal" {...props} />,
          p: ({node, ...props}) => <p className="font-sans text-fg-base text-lg mb-6 leading-relaxed" {...props} />,
          strong: ({node, ...props}) => <strong className="font-serif font-medium text-foreground text-2xl" {...props} />,
          em: ({node, ...props}) => <em className="font-serif italic text-muted text-xl" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-6 text-fg-base space-y-2 font-sans text-lg" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-6 text-fg-base space-y-2 font-sans text-lg" {...props} />,
          li: ({node, ...props}) => <li className="" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-[1px] border-border-strong pl-6 py-1 my-8" {...props}>
              <div className="font-serif italic text-muted text-2xl leading-relaxed" {...props} />
            </blockquote>
          ),
          a: ({node, ...props}) => <a className="text-foreground underline decoration-1 underline-offset-4 hover:text-muted transition-colors" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
