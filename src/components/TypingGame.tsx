"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Scene from '@/components/3d/Scene';

interface TypingStats {
  wpm: number;
  accuracy: number;
  charsTyped: number;
  correctChars: number;
  wordsTyped: number;
  timeElapsed: number;
}

interface TypingGameProps {
  testText: string;
  onKeyPress?: (key: string) => void;
}

const TypingGame = memo(function TypingGame({ testText, onKeyPress }: TypingGameProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [showResetFeedback, setShowResetFeedback] = useState(false);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    charsTyped: 0,
    correctChars: 0,
    wordsTyped: 0,
    timeElapsed: 0,
  });
  const [isFinished, setIsFinished] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update stats every 100ms
  useEffect(() => {
    if (!isActive || isFinished) return;

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;

      const timeElapsedSec = (Date.now() - startTimeRef.current) / 1000;
      const timeElapsedMin = timeElapsedSec / 60;
      
      let correctChars = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === testText[i]) correctChars++;
      }

      const totalChars = input.length;
      // WPM standard: (correct chars / 5) / minutes
      const wpm = timeElapsedMin > 0 ? Math.round((correctChars / 5) / timeElapsedMin) : 0;
      const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
      const wordsTyped = input.trim().split(/\s+/).filter(w => w.length > 0).length;

      setStats({
        wpm: Math.max(0, wpm),
        accuracy,
        charsTyped: totalChars,
        correctChars,
        wordsTyped,
        timeElapsed: Math.floor(timeElapsedSec),
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, input, testText, isFinished]);

  const handleReset = useCallback(() => {
    setInput('');
    setIsActive(false);
    setIsFinished(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      charsTyped: 0,
      correctChars: 0,
      wordsTyped: 0,
      timeElapsed: 0,
    });
    startTimeRef.current = null;
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = '';
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isActive && e.key !== 'Escape') {
      setIsActive(true);
      startTimeRef.current = Date.now();
    }

    // Trigger 3D keyboard animation
    if (onKeyPress) {
      onKeyPress(e.key);
    }

    // Handle escape to reset
    if (e.key === 'Escape') {
      e.preventDefault();
      handleReset();
      setShowResetFeedback(true);
      setTimeout(() => setShowResetFeedback(false), 800);
    }
  }, [isActive, onKeyPress, handleReset]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    
    // Don't allow typing past the test text
    if (newInput.length <= testText.length) {
      setInput(newInput);
      
      if (newInput.length === testText.length) {
        setIsFinished(true);
        setIsActive(false);
      }
    }
  };

  const progress = (input.length / testText.length) * 100;

  // Split text into words for display and scrolling
  const words = testText.split(' ');
  const wordStartIndices = React.useMemo(() => {
    let index = 0;
    return words.map(word => {
      const current = index;
      index += word.length + 1; // +1 for the space
      return current;
    });
  }, [words]);

  const inputWords = input.split(' ');
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Keep active word centered via scroll
  useEffect(() => {
    if (activeWordRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const offsetTop = activeWordRef.current.offsetTop;
      const halfContainer = container.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, offsetTop - halfContainer + 40), behavior: 'smooth' });
    }
  }, [inputWords.length]);

  return (
    <div className="w-full h-screen bg-neutral-950 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Scene isSettled={true} />
      </div>
      
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="pointer-events-auto flex flex-col h-full max-w-7xl mx-auto w-full">
          {/* Top Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center px-8 md:px-16 py-6 border-b border-cyan-900/20"
      >
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-1">WPM</div>
            <motion.div
              className="text-2xl md:text-3xl font-black text-cyan-400"
              style={{ fontFamily: 'var(--font-orbitron)' }}
              animate={{ scale: isActive ? 1.05 : 1 }}
            >
              {stats.wpm}
            </motion.div>
          </div>

          <div className="text-center">
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-1">ACC</div>
            <motion.div
              className={`text-2xl md:text-3xl font-black ${
                stats.accuracy >= 95
                  ? 'text-cyan-400'
                  : stats.accuracy >= 85
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              {stats.accuracy}%
            </motion.div>
          </div>

          <div className="text-center">
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-1">TIME</div>
            <motion.div
              className="text-2xl md:text-3xl font-black text-cyan-400"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              {stats.timeElapsed}s
            </motion.div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-1">PROGRESS</div>
          <motion.div
            className="text-2xl md:text-3xl font-black text-cyan-400"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            {Math.round(progress)}%
          </motion.div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="h-1 bg-neutral-900/50 border-b border-cyan-900/20"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>

      {/* Main typing area - scrolling text like monkeytype */}
      <div className="flex-1 flex items-center justify-center px-8 md:px-24 py-12 overflow-hidden relative">
        {showResetFeedback && (
          <motion.div
            initial={{ opacity: 1, scale: 1.2 }}
            animate={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="text-cyan-400 font-bold text-4xl uppercase tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">Restarted</div>
          </motion.div>
        )}
        <div
          ref={scrollContainerRef}
          className="w-full max-w-4xl text-3xl md:text-5xl font-mono leading-relaxed text-neutral-600 overflow-y-scroll overflow-x-hidden snap-y h-[70vh] no-scrollbar scroll-smooth relative"
          style={{ scrollBehavior: 'smooth', maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
        >
          {words.map((word, wordIdx) => {
            const isCurrentWord = wordIdx === inputWords.length - 1 && input.length > 0 && !input.endsWith(' ');
            const isTypedWord = wordIdx < inputWords.length - 1 || (wordIdx === inputWords.length - 1 && input.endsWith(' '));

            return (
              <motion.span
                key={wordIdx}
                ref={isCurrentWord ? activeWordRef : null}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`inline-block mb-[0.2em] transition-all duration-75 ${
                  isCurrentWord
                    ? ''
                    : isTypedWord
                    ? 'text-cyan-300'
                    : 'text-neutral-600'
                }`}
              >
                {word.split('').map((char, charIdx) => {
                  const globalCharIdx = wordStartIndices[wordIdx] + charIdx;
                  const inputChar = input[globalCharIdx];
                  const isCorrect = inputChar === char;
                  const isCurrent = globalCharIdx === input.length;

                  return (
                    <span
                      key={charIdx}
                      className={`transition-all duration-75 ${
                        isCurrent
                          ? 'bg-cyan-500/40 text-cyan-100 font-semibold border-b-2 border-cyan-400 animate-pulse'
                          : typeof inputChar !== 'undefined'
                          ? isCorrect
                            ? 'text-cyan-300 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]'
                            : 'text-red-400 bg-red-950/30'
                          : 'text-neutral-600 opacity-60'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
                {/* Visual representation of a required space */}
                {wordIdx < words.length - 1 && (
                  <span
                    className={`transition-all duration-75 ${
                      input.length === wordStartIndices[wordIdx] + word.length
                        ? 'bg-cyan-500/40 border-b-2 border-cyan-400 animate-pulse text-transparent'
                        : input.length > wordStartIndices[wordIdx] + word.length
                        ? input[wordStartIndices[wordIdx] + word.length] === ' '
                          ? 'text-transparent'
                          : 'text-red-400 bg-red-950/30'
                        : 'text-transparent'
                    }`}
                  >
                    _
                  </span>
                )}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Hidden textarea for input */}
      <textarea
        ref={inputRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
        disabled={isFinished}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-label="Typing test input"
      />

      {/* Results Modal */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-neutral-950/80 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8 text-center max-w-xl"
            >
              <h2 className="text-3xl font-bold text-cyan-400 mb-8 uppercase tracking-wider" style={{ fontFamily: 'var(--font-orbitron)' }}>
                Test Complete!
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-xs text-neutral-500 font-mono mb-2">Final WPM</div>
                  <div className="text-4xl font-black text-cyan-400" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    {stats.wpm}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-mono mb-2">Accuracy</div>
                  <div className="text-4xl font-black text-cyan-400" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    {stats.accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-mono mb-2">Time</div>
                  <div className="text-4xl font-black text-cyan-400" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    {stats.timeElapsed}s
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-mono mb-2">Characters</div>
                  <div className="text-4xl font-black text-cyan-400" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    {stats.charsTyped}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 text-sm font-mono text-cyan-400 border border-cyan-500/50 bg-cyan-900/20 rounded-lg hover:bg-cyan-900/40 hover:border-cyan-400 transition-all duration-300"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-8 py-3 text-sm font-mono text-cyan-400 border border-cyan-500/50 bg-cyan-900/20 rounded-lg hover:bg-cyan-900/40 hover:border-cyan-400 transition-all duration-300"
                >
                  Back to Portfolio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      {!isFinished && !isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs md:text-sm text-neutral-600 font-mono pb-6"
        >
          Click to focus • Start typing to begin
        </motion.div>
      )}
        </div>
      </div>
    </div>
  );
});

export default TypingGame;




