"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
});

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

// Word pools for different difficulties
const WORD_POOLS = {
  easy: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'being', 'having'],
  medium: ['adventure', 'algorithm', 'ambition', 'analysis', 'approach', 'balance', 'beautiful', 'behavior', 'believe', 'beneath', 'benefit', 'between', 'beyond', 'brilliant', 'business', 'capable', 'capital', 'capture', 'careful', 'category', 'certainly', 'challenge', 'change', 'character', 'choice', 'circumstance', 'clearly', 'colleague', 'collection', 'combine', 'comfortable', 'command', 'commercial', 'common', 'company', 'completely', 'complex', 'computer', 'concept', 'concern', 'conclude', 'condition', 'conference', 'confidence', 'confirm', 'conflict', 'confusion', 'connect', 'conscious', 'consequence', 'considerable', 'consider', 'consistent', 'constant', 'constitution', 'construct', 'contain', 'contemporary', 'content', 'context', 'contract', 'contribute', 'control', 'convenient', 'conversation', 'convert', 'convince', 'cooperate', 'corporate', 'correct', 'correspond', 'council', 'counter', 'country', 'couple', 'courage', 'creative', 'creature', 'credential', 'crisis', 'criterion', 'critical', 'criticism', 'culture', 'curious', 'current'],
  hard: ['aberration', 'abeyance', 'abstemious', 'acerbic', 'adamantine', 'adjudicate', 'alacrity', 'alliteration', 'ameliorate', 'anachronism', 'analogous', 'anecdote', 'annihilate', 'anomaly', 'antediluvian', 'antipathy', 'aphorism', 'apotheosis', 'appease', 'apprehend', 'approbation', 'ardor', 'auspicious', 'austere', 'authenticate', 'authoritarian', 'avarice', 'aversion', 'avid', 'axiom', 'azure', 'baneful', 'bashful', 'beatify', 'bedraggle', 'befuddle', 'beguile', 'belabor', 'beleaguer', 'belie', 'bellicose', 'belittle', 'benediction', 'beneficence', 'benevolent', 'benighted', 'benumbed', 'bequeath', 'berate', 'bereavement', 'besmirch', 'besotted', 'besmutch', 'bespeak', 'bestial', 'bestow', 'betide', 'betokened', 'betray', 'betroth', 'bewail', 'bewilder', 'bewitching'],
};

const generateTestText = (mode: 'duration' | 'words', difficulty: 'easy' | 'medium' | 'hard', value: number): string => {
  const wordPool = WORD_POOLS[difficulty];
  const targetWords = mode === 'words' ? value : Math.ceil(value * 8); // ~8 words per 60 seconds
  
  const words: string[] = [];
  for (let i = 0; i < targetWords; i++) {
    words.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
  }
  return words.join(' ');
};

const TypingGame = memo(function TypingGame({ testText: initialTestText, onKeyPress }: TypingGameProps) {
  const router = useRouter();
  
  // Settings state
  const [mode, setMode] = useState<'duration' | 'words'>('duration');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [duration, setDuration] = useState(30);
  const [wordCount, setWordCount] = useState(50);
  const [testText, setTestText] = useState(initialTestText);
  
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
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
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingBoxRef = useRef<HTMLDivElement>(null);

  // Focus input when welcome screen is dismissed
  useEffect(() => {
    if (!showWelcome && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showWelcome]);

  // Ensure input stays focused when test is active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

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

      // Auto-finish when duration time is exceeded
      if (mode === 'duration' && timeElapsedSec >= duration) {
        setIsFinished(true);
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, input, testText, isFinished, mode, duration]);

  // Scroll to active word
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeWord = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeWord) {
        const offset = (activeWord as HTMLElement).offsetTop;
        const containerHeight = scrollContainerRef.current.clientHeight;
        scrollContainerRef.current.scrollTo({
          top: Math.max(0, offset - containerHeight / 2),
          behavior: 'smooth',
        });
      }
    }
  }, [input]);

  const handleReset = useCallback(() => {
    setInput('');
    setIsActive(false);
    setIsFinished(false);
    setShowSettings(true);
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
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, []);

  const tabPressedRef = useRef(false);

  const startTestWithSettings = useCallback(() => {
    const newTestText = generateTestText(mode, difficulty, mode === 'duration' ? duration : wordCount);
    setTestText(newTestText);
    setInput('');
    setIsActive(false);
    setIsFinished(false);
    startTimeRef.current = null;
    // Scroll to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode, difficulty, duration, wordCount]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab+Enter to restart
    if (e.key === 'Tab') {
      e.preventDefault();
      tabPressedRef.current = true;
      return;
    }

    if (e.key === 'Enter' && tabPressedRef.current) {
      e.preventDefault();
      tabPressedRef.current = false;
      handleReset();
      return;
    }

    // Reset tab flag if any other key is pressed
    if (e.key !== 'Tab') {
      tabPressedRef.current = false;
    }

    // Prevent typing beyond test text length
    if (!isActive && inputRef.current && inputRef.current.value.length >= testText.length) {
      e.preventDefault();
      return;
    }

    // Start typing on first keypress (but not for control keys)
    if (!isActive && !['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(e.key)) {
      setIsActive(true);
      startTimeRef.current = Date.now();
    }

    if (onKeyPress) {
      onKeyPress(e.key);
    }
  }, [isActive, onKeyPress, handleReset, testText.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;

    // Prevent input longer than test text
    if (newInput.length > testText.length) {
      if (inputRef.current) {
        inputRef.current.value = input;
      }
      return;
    }

    setInput(newInput);

    // Auto-complete when all text is typed
    if (newInput.length === testText.length && newInput === testText) {
      setIsFinished(true);
      setIsActive(false);
    }
  };

  const handleBoxClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputBlur = () => {
    // If test is active, immediately refocus to keep input active
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const progress = (input.length / testText.length) * 100;

  // Split text for display
  const words = testText.split(' ');
  const inputWords = input.split(' ');

  return (
    <div className="w-full h-screen bg-neutral-950 flex overflow-hidden relative">
      {/* 3D Background Scene - Full screen backdrop */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <Scene isSettled={true} />
      </div>

      {/* Welcome Screen */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center space-y-8"
            >
              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-black uppercase tracking-widest text-cyan-400" style={{ fontFamily: 'var(--font-orbitron)' }}>
                  Type Test
                </h1>
                <p className="text-sm md:text-base text-neutral-400 font-mono">
                  Master your typing speed and accuracy
                </p>
              </div>

              {/* Start Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowWelcome(false);
                  setShowSettings(true);
                }}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-neutral-950 font-black text-lg md:text-xl uppercase tracking-widest rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300"
              >
                Start Test
              </motion.button>

              {/* Instructions */}
              <div className="text-left max-w-md mx-auto space-y-2 text-xs md:text-sm text-neutral-400 font-mono">
                <p className="flex items-center gap-2">
                  <span className="text-cyan-400">→</span> Configure your test settings
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-cyan-400">→</span> Choose difficulty and duration
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-cyan-400">→</span> Type as fast as you can
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-yellow-400">→</span> Press Tab + Enter to restart
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Configuration Modal */}
      <AnimatePresence>
        {showSettings && !showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-md bg-gradient-to-br from-neutral-900/95 to-neutral-950/95 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-orbitron)' }}>
                  Configure Test
                </h2>
                <p className="text-xs text-neutral-500">Customize your typing challenge</p>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider block mb-3">Test Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('duration')}
                    className={`py-2.5 px-3 rounded-lg font-mono text-xs transition-all ${
                      mode === 'duration'
                        ? 'bg-cyan-400 border border-cyan-400 text-neutral-950 font-semibold'
                        : 'bg-neutral-900/50 border border-cyan-400/20 text-neutral-400 hover:text-cyan-400'
                    }`}
                  >
                    Duration
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('words')}
                    className={`py-2.5 px-3 rounded-lg font-mono text-xs transition-all ${
                      mode === 'words'
                        ? 'bg-cyan-400 border border-cyan-400 text-neutral-950 font-semibold'
                        : 'bg-neutral-900/50 border border-cyan-400/20 text-neutral-400 hover:text-cyan-400'
                    }`}
                  >
                    Words
                  </motion.button>
                </div>
              </div>

              {/* Duration/Words Value */}
              <div>
                <label className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider block mb-2">
                  {mode === 'duration' ? 'Duration (seconds)' : 'Word Count'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={mode === 'duration' ? 15 : 10}
                    max={mode === 'duration' ? 300 : 500}
                    step={mode === 'duration' ? 5 : 10}
                    value={mode === 'duration' ? duration : wordCount}
                    onChange={(e) => {
                      if (mode === 'duration') {
                        setDuration(parseInt(e.target.value));
                      } else {
                        setWordCount(parseInt(e.target.value));
                      }
                    }}
                    className="flex-1 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="bg-cyan-400/10 border border-cyan-400/20 rounded px-3 py-1.5 text-sm font-mono text-cyan-300 min-w-[60px] text-center">
                    {mode === 'duration' ? `${duration}s` : `${wordCount}w`}
                  </div>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider block mb-3">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <motion.button
                      key={diff}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-2 rounded text-[10px] md:text-xs font-mono font-bold capitalize transition-all ${
                        difficulty === diff
                          ? 'bg-cyan-400 border border-cyan-400 text-neutral-950 font-semibold'
                          : 'bg-neutral-900/50 border border-cyan-400/20 text-neutral-400 hover:text-cyan-400'
                      }`}
                    >
                      {diff}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    startTestWithSettings();
                    setShowSettings(false);
                  }}
                  className="flex-1 py-2.5 px-4 bg-cyan-400 text-neutral-950 rounded-lg font-bold font-mono text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all font-semibold"
                >
                  Begin Test
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowWelcome(true)}
                  className="py-2.5 px-4 text-cyan-400/70 border border-cyan-400/20 rounded-lg font-mono text-xs uppercase tracking-wider hover:text-cyan-400 hover:border-cyan-400/40 transition-all"
                >
                  Back
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Sidebar - Settings Menu */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: !showWelcome && !showSettings ? 1 : 0, x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-56 border-r border-cyan-900/30 bg-neutral-950/40 backdrop-blur-sm flex flex-col p-4 overflow-y-auto"
        style={{ display: (!showWelcome && !showSettings) ? 'flex' : 'none' }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Settings
          </h2>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider block mb-2">Type</label>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setMode('duration')}
              className={`py-1.5 px-3 rounded-md font-mono text-xs transition-all ${
                mode === 'duration'
                  ? 'bg-cyan-400/20 border border-cyan-400/60 text-cyan-300'
                  : 'bg-neutral-900/50 border border-cyan-400/20 text-neutral-400 hover:text-cyan-400'
              }`}
            >
              Duration
            </button>
            <button
              onClick={() => setMode('words')}
              className={`py-1.5 px-3 rounded-md font-mono text-xs transition-all ${
                mode === 'words'
                  ? 'bg-cyan-400/20 border border-cyan-400/60 text-cyan-300'
                  : 'bg-neutral-900/50 border border-cyan-400/20 text-neutral-400 hover:text-cyan-400'
              }`}
            >
              Words
            </button>
          </div>
        </div>

        {/* Duration/Words Selection */}
        <div className="mb-6">
          <label className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider block mb-2">
            {mode === 'duration' ? 'Seconds' : 'Words'}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {mode === 'duration' ? (
              <>
                {[15, 30, 60, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setDuration(sec)}
                    className={`py-1 px-2 rounded text-[10px] font-mono font-bold transition-all ${
                      duration === sec
                        ? 'bg-cyan-400/20 border border-cyan-400/60 text-cyan-300'
                        : 'bg-neutral-900/50 border border-cyan-400/20 text-neutral-400 hover:text-cyan-400'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </>
            ) : (
              <>
                {[25, 50, 100, 200].map((wc) => (
                  <button
                    key={wc}
                    onClick={() => setWordCount(wc)}
                    className={`py-1 px-2 rounded text-[10px] font-mono font-bold transition-all ${
                      wordCount === wc
                        ? 'bg-cyan-400/20 border border-cyan-400/60 text-cyan-300'
                        : 'bg-neutral-900/50 border border-cyan-400/20 text-neutral-400 hover:text-cyan-400'
                    }`}
                  >
                    {wc}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <label className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider block mb-2">Difficulty</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff as 'easy' | 'medium' | 'hard')}
                className={`py-1 px-2 rounded text-[10px] font-mono font-bold capitalize transition-all ${
                  difficulty === diff
                    ? 'bg-cyan-400/20 border border-cyan-400/60 text-cyan-300'
                    : 'bg-neutral-900/50 border border-cyan-400/20 text-neutral-400 hover:text-cyan-400'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Start/Reset Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startTestWithSettings}
          className="w-full py-2 px-3 mt-auto mb-3 bg-cyan-400 text-neutral-950 rounded-md font-bold font-mono text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all duration-300"
        >
          New Test
        </motion.button>

        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push('/')}
          className="w-full py-2 px-3 text-cyan-400/70 border border-cyan-400/20 rounded-md font-mono text-xs uppercase tracking-wider hover:text-cyan-400 hover:border-cyan-400/40 transition-all"
        >
          Back
        </motion.button>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden" style={{ display: (!showWelcome && !showSettings) ? 'flex' : 'none' }}>
        {/* Top Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between px-6 md:px-8 py-3 border-b border-cyan-900/30 bg-neutral-950/40 backdrop-blur-sm"
        >
          <h1 className="text-lg font-bold tracking-widest uppercase text-cyan-400" style={{ fontFamily: 'var(--font-orbitron)' }}>
            {/* typing challenge */}
          </h1>
          <div className="w-16" />
        </motion.div>

        {/* Main Content Scroll Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-6 relative overflow-hidden">
          {/* Instructions - Top Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute top-6 right-6 max-w-xs"
          >
            <div className="bg-neutral-900/80 border border-cyan-400/20 rounded-lg p-3 text-xs font-mono space-y-1">
              <div className="text-cyan-400 font-bold mb-1.5">HOW TO USE:</div>
              <p className="text-neutral-400 text-[10px]">
                1. <span className="text-cyan-300">Click or type</span> to start
              </p>
              <p className="text-neutral-400 text-[10px]">
                2. <span className="text-cyan-300">Type the text</span> above
              </p>
              <p className="text-neutral-400 text-[10px]">
                3. <span className="text-yellow-400">Tab + Enter</span> to restart
              </p>
            </div>
          </motion.div>

          {/* Stats Display - Above Text Box */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-3xl mb-4 px-4"
          >
            <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
              <div className="flex items-baseline gap-1.5">
                <div className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">WPM</div>
                <motion.div
                  className="text-xl md:text-2xl font-black text-cyan-400"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                  key={stats.wpm}
                >
                  {stats.wpm}
                </motion.div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <div className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">Accuracy</div>
                <motion.div
                  className={`text-xl md:text-2xl font-black ${
                    stats.accuracy >= 98
                      ? 'text-green-400'
                      : stats.accuracy >= 95
                      ? 'text-cyan-400'
                      : stats.accuracy >= 85
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                  key={stats.accuracy}
                >
                  {stats.accuracy}%
                </motion.div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <div className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">
                  {mode === 'duration' ? 'Time Left' : 'Time'}
                </div>
                <motion.div
                  className={`text-xl md:text-2xl font-black ${
                    mode === 'duration' && duration - stats.timeElapsed <= 5
                      ? 'text-red-400'
                      : 'text-neutral-300'
                  }`}
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                  key={stats.timeElapsed}
                >
                  {mode === 'duration' ? Math.max(0, duration - stats.timeElapsed) : stats.timeElapsed}
                  <span className="text-xs text-neutral-500">s</span>
                </motion.div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <div className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">Progress</div>
                <motion.div
                  className="text-xl md:text-2xl font-black text-cyan-300"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  {Math.round(progress)}%
                </motion.div>
              </div>
            </div>
          </motion.div>



          {/* Typing Text Box - Centered, Hovering with space for keyboard below */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            ref={typingBoxRef}
            onClick={handleBoxClick}
            className="relative w-full max-w-4xl cursor-text group"
          >
            {/* Box Background */}
            <div className="bg-gradient-to-b from-neutral-900/80 to-neutral-950/80 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 shadow-2xl shadow-cyan-400/5 hover:border-cyan-400/40 transition-all duration-300">
              {/* Visual indicator when not active */}
              {!isActive && !isFinished && (
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl border border-cyan-400/20 pointer-events-none"
                />
              )}

              {/* Text Display Container */}
              <div
                ref={scrollContainerRef}
                className="h-48 md:h-56 overflow-y-auto overflow-x-hidden text-3xl md:text-4xl font-mono leading-relaxed text-neutral-600 pb-4 px-2"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
                  scrollBehavior: 'smooth',
                }}
              >
                {words.map((word, wordIdx) => {
                  const isCurrentWord =
                    wordIdx === inputWords.length - 1 && input.length > 0 && !input.endsWith(' ');

                  return (
                    <motion.span
                      key={wordIdx}
                      data-active={isCurrentWord}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`inline-block mr-2 transition-all duration-75 ${
                        wordIdx < inputWords.length - 1
                          ? 'text-cyan-200'
                          : isCurrentWord
                          ? 'text-cyan-100 font-semibold'
                          : 'text-neutral-600'
                      }`}
                    >
                      {word.split('').map((char, charIdx) => {
                        let globalCharIdx = 0;
                        for (let i = 0; i < wordIdx; i++) {
                          globalCharIdx += words[i].length + 1;
                        }
                        globalCharIdx += charIdx;

                        const inputChar = input[globalCharIdx];
                        const isCorrect = inputChar === char;
                        const isCurrent = globalCharIdx === input.length;

                        return (
                          <span
                            key={charIdx}
                            className={`transition-all duration-75 ${
                              isCurrent
                                ? 'bg-cyan-500/60 text-cyan-50 border-b-2 border-cyan-300 animate-pulse font-semibold'
                                : typeof inputChar !== 'undefined'
                                ? isCorrect
                                  ? 'text-cyan-300 drop-shadow-[0_0_3px_rgba(34,211,238,0.4)]'
                                  : 'text-red-400 bg-red-950/40 font-semibold'
                                : 'text-neutral-600'
                            }`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </motion.span>
                  );
                })}
              </div>

              {/* Click to start indicator */}
              {!isActive && !isFinished && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-sm font-mono text-cyan-400/60 mt-4"
                >
                  Click here or start typing to begin...
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Spacer for 3D Keyboard - Creates visual separation */}
          <div className="w-full h-4 md:h-6" />

          {/* 3D Keyboard Model - Below the text box with space, responsive height */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-5xl h-64 md:h-96 flex-shrink-0 pointer-events-none"
          >
            <Scene isSettled={true} />
          </motion.div>
        </div>
      </div>

      {/* Hidden Input - Invisible but functional */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        placeholder=""
        tabIndex={0}
        className="fixed top-0 left-0 opacity-0 w-px h-px pointer-events-auto -z-10 border-none outline-none"
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={handleReset}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-neutral-900/95 via-neutral-950/95 to-black/95 backdrop-blur-2xl border border-cyan-400/20 rounded-2xl p-8 md:p-12 text-center w-full max-w-2xl shadow-2xl shadow-cyan-400/10"
            >
              {/* Success Indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full bg-cyan-400/10 border-2 border-cyan-400/40 flex items-center justify-center"
              >
                <span className="text-3xl md:text-4xl">✓</span>
              </motion.div>

              <h2
                className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2 uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                Test Complete!
              </h2>
              <p className="text-neutral-500 text-sm mb-8">Here are your results</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-cyan-500/5 border border-cyan-400/20 rounded-lg p-4"
                >
                  <div className="text-[11px] text-neutral-600 font-mono uppercase tracking-wider mb-2">
                    Final WPM
                  </div>
                  <div
                    className="text-2xl md:text-3xl font-black text-cyan-400"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    {stats.wpm}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className={`bg-opacity-5 border rounded-lg p-4 ${
                    stats.accuracy >= 98
                      ? 'bg-green-500 border-green-400/20'
                      : stats.accuracy >= 95
                      ? 'bg-cyan-500 border-cyan-400/20'
                      : stats.accuracy >= 85
                      ? 'bg-yellow-500 border-yellow-400/20'
                      : 'bg-red-500 border-red-400/20'
                  }`}
                >
                  <div className="text-[11px] text-neutral-600 font-mono uppercase tracking-wider mb-2">
                    Accuracy
                  </div>
                  <div
                    className={`text-2xl md:text-3xl font-black ${
                      stats.accuracy >= 98
                        ? 'text-green-400'
                        : stats.accuracy >= 95
                        ? 'text-cyan-400'
                        : stats.accuracy >= 85
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    {stats.accuracy}%
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-4"
                >
                  <div className="text-[11px] text-neutral-600 font-mono uppercase tracking-wider mb-2">
                    Time
                  </div>
                  <div
                    className="text-2xl md:text-3xl font-black text-neutral-300"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    {stats.timeElapsed}
                    <span className="text-lg text-neutral-500">s</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-4"
                >
                  <div className="text-[11px] text-neutral-600 font-mono uppercase tracking-wider mb-2">
                    Characters
                  </div>
                  <div
                    className="text-2xl md:text-3xl font-black text-neutral-300"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    {stats.charsTyped}
                  </div>
                </motion.div>
              </div>

              {/* Additional Stats */}
              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg p-4 mb-8 space-y-2 text-left">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Correct Characters:</span>
                  <span className="text-cyan-300 font-mono">
                    {stats.correctChars} / {stats.charsTyped}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Words Typed:</span>
                  <span className="text-neutral-300 font-mono">{stats.wordsTyped}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-2 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="px-6 py-2 text-xs md:text-sm font-mono font-semibold text-neutral-950 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-all duration-300 shadow-lg shadow-cyan-400/20"
                >
                  Try Again
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/')}
                  className="px-6 py-2 text-xs md:text-sm font-mono font-semibold text-cyan-400 border border-cyan-400/40 rounded-md hover:bg-cyan-400/10 transition-all duration-300"
                >
                  Back to Portfolio
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TypingGame;




