import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  scale?: number;
}

export function ImageReveal({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-[4/5]",
  scale = 1.05,
}: ImageRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div ref={ref} className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      <motion.div
        initial={{ scale, opacity: 0 }}
        animate={isInView && isLoaded ? { scale: 1, opacity: 1 } : { scale, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full"
      >
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}
