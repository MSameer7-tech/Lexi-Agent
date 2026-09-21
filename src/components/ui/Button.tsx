import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong disabled:opacity-50 disabled:pointer-events-none rounded-md";
    
    const variants = {
      primary: "bg-foreground text-background hover:bg-foreground/90 shadow-subtle",
      secondary: "bg-surface-tint text-foreground border border-border-subtle hover:bg-surface shadow-subtle",
      ghost: "hover:bg-surface-tint text-muted hover:text-foreground",
      accent: "bg-accent text-accent-fg hover:brightness-95 shadow-subtle",
    };
    
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-5 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ y: 0, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
