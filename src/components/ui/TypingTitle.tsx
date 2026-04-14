"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypingTitleProps {
  jobTitles?: string[];
  className?: string;
}

const TypingTitle: React.FC<TypingTitleProps> = ({ 
  jobTitles = ['DevOps Intern', 'Game Dev Intern', 'AI Development Intern'],
  className = '' 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTitle = jobTitles[currentTitleIndex];

  useEffect(() => {
    const fullText = currentTitle;
    
    if (!isDeleting) {
      // Typing effect
      if (displayedText.length < fullText.length) {
        timerRef.current = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, 50);
      } else if (displayedText.length === fullText.length) {
        // Finished typing, pause before deleting
        timerRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      // Deleting effect
      if (displayedText.length > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30);
      } else {
        // Move to next title
        setIsDeleting(false);
        setCurrentTitleIndex((prev) => (prev + 1) % jobTitles.length);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedText, isDeleting, currentTitle, jobTitles]);

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
