import { motion } from "framer-motion";
import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  className?: string;
}

export function Marquee({
  children,
  direction = "left",
  speed = 20,
  className = "",
}: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        animate={{
          x: direction === "left" ? [-1000, 0] : [0, -1000],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: speed,
          ease: "linear",
        }}
        className="flex whitespace-nowrap"
      >
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}