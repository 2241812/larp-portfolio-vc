"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
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

      const timeElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const wordsTyped = input.trim().split(/\s+/).filter(w => w.length > 0).length;
      const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;

      const correctChars = input.split('').filter((char, i) => char === testText[i]).length;
      const totalChars = input.length;
      const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

      setStats({
        wpm: Math.max(0, wpm),
        accuracy,
        charsTyped: totalChars,
        correctChars,
        wordsTyped,
        timeElapsed,
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, input, testText, isFinished]);

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
    }
  }, [isActive, onKeyPress]);

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

  const handleReset = () => {
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
  };

  const progress = (input.length / testText.length) * 100;

  // Split text into words for display and scrolling
  const words = testText.split(' ');
  const inputWords = input.split(' ');

  return (
    <div className="w-full h-screen bg-neutral-950 flex flex-col overflow-hidden">
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
      <div className="flex-1 flex items-center justify-center px-8 md:px-24 py-12 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="w-full max-w-4xl text-3xl md:text-5xl font-mono leading-relaxed text-neutral-600 overflow-y-auto transition-transform duration-75"
          style={{
            transform: `translateY(-${Math.max(0, inputWords.length - 2) * 2}rem)`,
          }}
        >
          {words.map((word, wordIdx) => {
            const inputWord = inputWords[wordIdx] || '';
            const isCurrentWord = wordIdx === inputWords.length - 1 && input.length > 0 && !input.endsWith(' ');
            const isTypedWord = wordIdx < inputWords.length - 1 || (wordIdx === inputWords.length - 1 && input.endsWith(' '));

            return (
              <motion.span
                key={wordIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`transition-all duration-75 ${
                  isCurrentWord
                    ? ''
                    : isTypedWord
                    ? 'text-cyan-300'
                    : 'text-neutral-600'
                }`}
              >
                {word.split('').map((char, charIdx) => {
                  const globalCharIdx = words.slice(0, wordIdx).join(' ').length + (wordIdx > 0 ? 1 : 0) + charIdx;
                  const inputChar = input[globalCharIdx] || '';
                  const isCorrect = inputChar === char;
                  const isCurrent = globalCharIdx === input.length;

                  return (
                    <span
                      key={charIdx}
                      className={`transition-all duration-75 ${
                        isCurrent
                          ? 'bg-cyan-500/40 text-cyan-100 font-semibold border-b-2 border-cyan-400 animate-pulse'
                          : word.length > charIdx && inputChar
                          ? isCorrect
                            ? 'text-cyan-300'
                            : 'text-red-400 bg-red-950/30'
                          : 'text-neutral-600'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
                {wordIdx < words.length - 1 && <span className="text-neutral-600"> </span>}
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
                  onClick={() => window.history.back()}
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
          className="text-center text-xs MD:text-sm text-neutral-600 font-mono pb-6"
        >
          Click to focus • Start typing to begin
        </motion.div>
      )}
    </div>
  );
});

export default TypingGame;




