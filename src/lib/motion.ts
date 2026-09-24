import type { Variants } from 'framer-motion';

export const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0]; // Refined editorial ease

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: EASE, when: "beforeChildren", staggerChildren: 0.05 } 
  },
  exit: { 
    opacity: 0, 
    y: -4, 
    transition: { duration: 0.25, ease: EASE } 
  }
};

export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.02 }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: EASE } 
  }
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 4 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: EASE } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: 2, 
    transition: { duration: 0.2, ease: EASE } 
  }
};

export const drawerVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { type: 'spring', damping: 26, stiffness: 220 }
  },
  exit: { 
    opacity: 0, 
    x: -20, 
    transition: { duration: 0.25, ease: EASE }
  }
};

export const chatMessageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.35, ease: EASE } 
  }
};

export const errorShake: Variants = {
  animate: {
    x: [0, -3, 3, -2, 2, 0],
    transition: { duration: 0.4, ease: "easeInOut" }
  }
};
