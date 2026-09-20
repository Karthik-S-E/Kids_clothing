/**
 * Motion System Utilities for Kandamma Kids
 * 
 * Performance-optimized animation utilities with GPU acceleration
 * Strict adherence to transform/opacity only animations
 */

// Reduced motion detection
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Mobile viewport detection for ambient loops
export const isMobileViewport = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth < 1024;
};

// Check if ambient animations should be enabled
export const shouldAnimateAmbient = () => {
  return !isMobileViewport() && !prefersReducedMotion();
};

// Animation variants for Framer Motion with GPU acceleration
export const motionVariants = {
  // Staggered container for list items
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  // Item fade in with slide up (GPU accelerated)
  fadeInUp: {
    hidden: { 
      opacity: 0, 
      y: 20,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }
    },
  },

  // Item fade in with slide from left
  fadeInLeft: {
    hidden: { 
      opacity: 0, 
      x: -30,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }
    },
  },

  // Item fade in with slide from right
  fadeInRight: {
    hidden: { 
      opacity: 0, 
      x: 30,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }
    },
  },

  // Scale in with bounce
  scaleInBounce: {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 300,
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 300,
      }
    },
  },

  // Drawer slide from right
  drawerSlide: {
    hidden: { 
      x: '100%',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }
    },
    visible: { 
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }
    },
  },

  // Backdrop fade
  backdropFade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
  },

  // Image zoom on hover
  imageZoom: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
  },

  // Heart pulse
  heartPulse: {
    rest: { scale: 1 },
    tap: { 
      scale: [1, 1.3, 1],
      transition: { duration: 0.3 }
    },
  },

  // Badge bump
  badgeBump: {
    rest: { scale: 1 },
    active: { 
      scale: [1, 1.3, 1],
      transition: { duration: 0.2 }
    },
  },
};

// Natural easing curve for smooth animations
export const naturalEasing = [0.4, 0.0, 0.2, 1];

// Animation durations (in seconds)
export const durations = {
  micro: 0.15,    // Micro-interactions (hovers, taps)
  fast: 0.2,      // Quick transitions
  medium: 0.3,    // Section reveals
  slow: 0.5,      // Drawers, modals
  section: 0.4,   // Section transitions
};

// Helper to get animation props based on reduced motion preference
export const getAnimationProps = (props: any) => {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.01 },
    };
  }
  return props;
};

// Safe animation duration helper
export const getSafeDuration = (duration: number) => {
  return prefersReducedMotion() ? 0.01 : duration;
};

// Safe transition helper
export const getSafeTransition = (transition: any) => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return transition;
};



// Touch target size helper (48px minimum)
export const touchTargetStyles = {
  minWidth: '48px',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// GPU acceleration helper class
export const gpuAccelerated = {
  transform: 'translateZ(0)',
  willChange: 'transform',
};

// Stagger delay helpers
export const staggerDelays = [0, 0.1, 0.2, 0.3, 0.4, 0.5] as const;