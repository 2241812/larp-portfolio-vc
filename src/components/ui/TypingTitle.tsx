"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypingTitleProps {
  roles?: string[];
  className?: string;
}

const TypingTitle: React.FC<TypingTitleProps> = ({ 
  roles = ['AI Development Intern', 'Game Dev Intern', 'DevOps Intern'],
  className = '' 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef({ isTyping: true, displayedIndex: 0 });

  const currentRole = roles[currentRoleIndex];
  const fullText = `computer science student | ${currentRole}`;

  useEffect(() => {
    const state = stateRef.current;

    if (!state.isTyping) {
      // Pause after typing, then switch role
      timerRef.current = setTimeout(() => {
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        state.displayedIndex = 0;
        state.isTyping = true;
        setDisplayedText('');
      }, 2000); // 2 second pause before next role

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    // Typing effect
    if (state.displayedIndex < fullText.length) {
      timerRef.current = setTimeout(() => {
        state.displayedIndex += 1;
        setDisplayedText(fullText.slice(0, state.displayedIndex));
      }, 40); // Typing speed

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (state.isTyping) {
      // Finished typing
      state.isTyping = false;
    }
  }, [displayedText, currentRoleIndex, fullText, roles.length]);

  return (
    <div className={`inline-block ${className}`}>
      <span 
        style={{ fontFamily: 'var(--font-rajdhani)' }}
        className="text-sm sm:text-base md:text-lg font-semibold text-cyan-400"
      >
        {displayedText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="ml-0.5 text-cyan-400"
        >
          |
        </motion.span>
      </span>
    </div>
  );
};

export default TypingTitle;
