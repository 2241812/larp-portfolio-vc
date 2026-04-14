"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTitleProps {
  titles?: string[];
  className?: string;
}

const titles = [
  'AI Development Intern',
  'Game Dev Intern',
  'DevOps Intern',
];

const GlitchTitle: React.FC<GlitchTitleProps> = ({ titles: customTitles, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayTitles = customTitles || titles;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayTitles.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [displayTitles.length]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Glitch effect with animated text */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Main text */}
        <span className="relative inline-block">
          {displayTitles[currentIndex]}
        </span>

        {/* Glitch effect layers */}
        <motion.span
          className="absolute left-0 top-0 text-cyan-400/80 pointer-events-none font-orbitron"
          style={{ clip: 'rect(0px, 900px, 0px, 0px)' }}
          animate={{
            clip: [
              'rect(0px, 900px, 60px, 0px)',
              'rect(0px, 900px, 0px, 0px)',
            ],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          {displayTitles[currentIndex]}
        </motion.span>

        {/* Second glitch layer */}
        <motion.span
          className="absolute left-1 top-1 text-purple-500/60 pointer-events-none font-orbitron"
          style={{ clip: 'rect(0px, 900px, 0px, 0px)' }}
          animate={{
            clip: [
              'rect(20px, 900px, 40px, 0px)',
              'rect(0px, 900px, 0px, 0px)',
            ],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 0.05,
          }}
        >
          {displayTitles[currentIndex]}
        </motion.span>
      </motion.div>

      {/* Indicator dots */}
      <div className="flex gap-1 justify-center mt-2">
        {displayTitles.map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-1 rounded-full transition-all ${
              idx === currentIndex ? 'bg-cyan-400 w-3' : 'bg-neutral-700 w-1'
            }`}
            animate={{
              boxShadow:
                idx === currentIndex
                  ? '0 0 8px rgba(34, 211, 238, 0.6)'
                  : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GlitchTitle;
