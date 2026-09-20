/**
 * Hook for managing scroll-based header condensation
 * Header condenses when scroll past 50px
 */
import { useState, useEffect } from 'react';

export const useScrollState = (threshold: number = 50) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Initial check
    handleScroll();

    // Add scroll listener with passive for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isScrolled;
};