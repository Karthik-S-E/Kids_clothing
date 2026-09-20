/**
 * Hook for managing Add-to-Bag micro-interaction
 * Shows thumbnail animation flying to cart icon
 */
import { useState, useCallback } from 'react';

interface UseAddToBagAnimationProps {
  onAddToBag?: () => void;
}

export const useAddToBagAnimation = ({ onAddToBag }: UseAddToBagAnimationProps = {}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);

  const triggerAnimation = useCallback((imageUrl: string) => {
    setThumbnailImage(imageUrl);
    setIsAnimating(true);

    // Trigger the actual add to bag callback
    if (onAddToBag) {
      onAddToBag();
    }

    // Reset animation state after it completes (400ms)
    setTimeout(() => {
      setIsAnimating(false);
      setThumbnailImage(null);
    }, 400);
  }, [onAddToBag]);

  return {
    isAnimating,
    thumbnailImage,
    triggerAnimation,
  };
};