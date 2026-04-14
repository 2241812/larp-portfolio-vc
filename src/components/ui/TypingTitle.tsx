"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypingTitleProps {
  text?: string;
  className?: string;
}

const TypingTitle: React.FC<TypingTitleProps> = ({ 
  text = 'AI Development Intern',
  className = '' 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef({ displayedIndex: 0 });

  useEffect(() => {
    const state = stateRef.current;

    // Typing effect
    if (state.displayedIndex < text.length) {
      timerRef.current = setTimeout(() => {
        state.displayedIndex += 1;
        setDisplayedText(text.slice(0, state.displayedIndex));
      }, 40); // Typing speed

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [displayedText, text]);

  return (
    <div className={`inline-block ${className}`}>
      <span 
        style={{ fontFamily: 'var(--font-rajdhani)' }}
        className="text-sm sm:text-base md:text-lg font-semibold text-cyan-400"
      >
        {displayedText}
        {displayedText.length < text.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="ml-0.5 text-cyan-400"
          >
            |
          </motion.span>
        )}
      </span>
    </div>
  );
};

export default TypingTitle;
