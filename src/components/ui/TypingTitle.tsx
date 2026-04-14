"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypingTitleProps {
  jobTitles?: string[];
  className?: string;
}

const TypingTitle: React.FC<TypingTitleProps> = ({ 
  jobTitles = ['AI Development Intern', 'Game Dev Intern', 'DevOps Intern'],
  className = '' 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef({ displayedIndex: 0, isDeleting: false });

  const currentTitle = jobTitles[currentTitleIndex];

  useEffect(() => {
    const state = stateRef.current;
    const fullText = currentTitle;

    if (!state.isDeleting) {
      // Typing effect
      if (state.displayedIndex < fullText.length) {
        timerRef.current = setTimeout(() => {
          state.displayedIndex += 1;
          setDisplayedText(fullText.slice(0, state.displayedIndex));
        }, 50); // Typing speed
      } else {
        // Finished typing, pause before deleting
        timerRef.current = setTimeout(() => {
          state.isDeleting = true;
        }, 2000); // Pause for 2 seconds
      }
    } else {
      // Deleting effect
      if (state.displayedIndex > 0) {
        timerRef.current = setTimeout(() => {
          state.displayedIndex -= 1;
          setDisplayedText(fullText.slice(0, state.displayedIndex));
        }, 30); // Deleting speed
      } else {
        // Move to next title
        state.isDeleting = false;
        setCurrentTitleIndex((prev) => (prev + 1) % jobTitles.length);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedText, currentTitleIndex, jobTitles]);

  return (
    <div className={`inline-block ${className}`}>
      <span 
        style={{ fontFamily: 'var(--font-rajdhani)' }}
        className="text-base sm:text-lg md:text-2xl font-semibold text-cyan-400 uppercase"
      >
        Computer Science Student {' '}
        <span className="text-cyan-400">|</span>
        {' '}
        {displayedText}
        {displayedText.length > 0 && (
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
