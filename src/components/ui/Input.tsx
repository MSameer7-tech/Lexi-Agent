import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, icon, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <motion.div 
        className={cn(
          "relative flex items-center w-full rounded-md bg-surface border transition-colors duration-300",
          isFocused ? "border-foreground shadow-subtle" : "border-border-subtle",
          containerClassName
        )}
        animate={{ scale: isFocused ? 1.01 : 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {icon && (
          <div className={cn(
            "absolute left-4 flex items-center justify-center transition-colors duration-300",
            isFocused ? "text-foreground" : "text-muted"
          )}>
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full bg-transparent px-4 py-2 text-base text-foreground placeholder:text-subtle focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            icon ? "pl-12" : "",
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </motion.div>
    );
  }
);

Input.displayName = 'Input';
