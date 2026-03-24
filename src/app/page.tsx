"use client";
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { motion } from 'framer-motion';
import Scene from '@/components/3d/Scene';
import TopBar from '@/components/ui/TopBar';
import Sections from '@/components/ui/Sections';
import GitHubStats from '@/components/ui/GitHubStats';
import MatrixRain from '@/components/ui/MatrixRain';
import ParticleBurst, { ParticleBurstRef } from '@/components/ui/ParticleBurst';
import { resumeData } from '@/data/resumeData';

type FloatingLetter = { id: string; char: string; startX: number; startY: number; rot: number; floatDelay: number; };
type DebrisLetterData = FloatingLetter & { startLeft: string; driftX: number; driftY: number; driftRot: number; scale: number; duration: number; };

const VALID_COMMANDS = ['about me', 'experience', 'skills', 'projects', 'contact'];
const HINT_PHRASES = ["'about me'", "'python'", "'skills'", "'docker'", "'contact'"];

const MAX_DEBRIS = 30;

// Memoized debris letter component
const DebrisLetterItem = memo(function DebrisLetterItem({ item }: { item: DebrisLetterData }) {
  return (
    <motion.div
      key={item.id}
      className="absolute flex items-center justify-center font-mono font-black text-cyan-900/60"
      initial={{ left: item.startLeft, top: '35vh', rotate: 0, opacity: 1, scale: 1 }}
      animate={{
        left: `calc(${item.startLeft} + ${item.driftX}vw)`,
        top: `calc(35vh + ${item.driftY}vh)`,
        rotate: item.driftRot,
        opacity: [0.8, 0.1, 0.4],
        scale: item.scale
      }}
      transition={{
        duration: item.duration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "linear"
      }}
      style={{
        fontSize: '8rem',
        filter: `blur(${item.scale < 0.6 ? 8 : 3}px)`
      }}
    >
      {item.char === ' ' ? "\u00A0" : item.char}
    </motion.div>
  );
});

// Memoized floating letter component
const FloatingLetter = memo(function FloatingLetter({ 
  letter, 
  index, 
  isAssembling, 
  isError, 
  totalLetters 
}: { 
  letter: FloatingLetter; 
  index: number; 
  isAssembling: boolean; 
  isError: boolean;
  totalLetters: number;
}) {
  const isSpace = letter.char === ' ';
  const letterSpacing = 40;
  const totalWidth = totalLetters * letterSpacing;
  const startLeft = `calc(50vw - ${totalWidth / 2}px + ${index * letterSpacing}px)`;
  const startTop = '35vh';

  return (
    <div 
      key={letter.id} 
      className="absolute transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-center w-10 h-10" 
      style={{ 
        left: isAssembling ? startLeft : `${letter.startX}vw`, 
        top: isAssembling ? startTop : `${letter.startY}vh`, 
        opacity: isAssembling ? 1 : 0.15, 
        scale: isAssembling ? 1 : 1.5 
      }}
    >
      <div 
        className={`font-mono font-bold transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isAssembling ? "" : "animate-float-bob"}`} 
        style={{ 
          animationDelay: `${letter.floatDelay}s`, 
          transform: isAssembling ? `rotate(0deg)` : `rotate(${letter.rot}deg)`, 
          color: isAssembling ? (isError ? '#ef4444' : '#22d3ee') : '#0891b2', 
          textShadow: isAssembling ? (isError ? '0 0 30px rgba(239, 68, 68, 0.8)' : '0 0 30px rgba(34, 211, 238, 0.8)') : 'none', 
          fontSize: isAssembling ? '4rem' : '8rem' 
        }}
      >
        {isSpace ? "\u00A0" : letter.char}
      </div>
    </div>
  );
});

export default function Home() {
  const [isSettled, setIsSettled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [letters, setLetters] = useState<FloatingLetter[]>([]);
  const [debris, setDebris] = useState<DebrisLetterData[]>([]);
  const [isAssembling, setIsAssembling] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [hintText, setHintText] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [isDeletingHint, setIsDeletingHint] = useState(false);

  const burstRef = useRef<ParticleBurstRef>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lettersRef = useRef<FloatingLetter[]>([]);

  // Keep letters ref in sync
  useEffect(() => {
    lettersRef.current = letters;
  }, [letters]);

  const playClick = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 800 + Math.random() * 400;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch { /* audio context may not be available */ }
  }, []);

  // Loading progress - optimize with RAF instead of setInterval
  useEffect(() => {
    const duration = 2500;
    const startTime = Date.now();
    let animId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setLoadProgress(progress);
      if (progress < 100) {
        animId = requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setIsSettled(true);
        }, 400);
      }
    };

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Lock body scroll while loading
  useEffect(() => {
    if (isLoading) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      const scrollY = parseInt(document.body.style.top || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (scrollY) window.scrollTo(0, Math.abs(scrollY));
    }
    return () => {
      const scrollY = parseInt(document.body.style.top || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (scrollY) window.scrollTo(0, Math.abs(scrollY));
    };
  }, [isLoading]);

  // Hint text typing animation
  useEffect(() => {
    if (inputValue.length > 0 || isAssembling || isError) {
      setHintText("");
      return;
    }
    const timeout = setTimeout(() => {
      const currentPhrase = `Try typing ${HINT_PHRASES[hintIndex]}...`;
      if (!isDeletingHint) {
        setHintText(currentPhrase.substring(0, hintText.length + 1));
        if (hintText.length === currentPhrase.length) {
          setTimeout(() => setIsDeletingHint(true), 2500);
        }
      } else {
        setHintText(currentPhrase.substring(0, hintText.length - 1));
        if (hintText === '') {
          setIsDeletingHint(false);
          setHintIndex((prev) => (prev + 1) % HINT_PHRASES.length);
        }
      }
    }, isDeletingHint ? 20 : 60);
    return () => clearTimeout(timeout);
  }, [hintText, isDeletingHint, hintIndex, inputValue, isAssembling, isError]);

  const findSectionForKeyword = useCallback((keyword: string): string | null => {
    const lowerKw = keyword.toLowerCase().trim();
    if (!lowerKw) return null;
    if (VALID_COMMANDS.includes(lowerKw)) return lowerKw;

    const inProgramming = resumeData.skills.programming.some(s => s.toLowerCase().includes(lowerKw));
    const inFrameworks = resumeData.skills.frameworks.some(s => s.toLowerCase().includes(lowerKw));
    if (inProgramming || inFrameworks) return 'skills';

    const inProjects = resumeData.projects.some(p => p.title.toLowerCase().includes(lowerKw) || p.description.toLowerCase().includes(lowerKw) || p.role.toLowerCase().includes(lowerKw));
    if (inProjects) return 'projects';

    if (resumeData.personalInfo.title.toLowerCase().includes(lowerKw)) return 'about me';

    return null; 
  }, []);

  const executeCommand = useCallback((cmd: string) => {
    if (!cmd) return;
    setIsAssembling(true);
    
    const targetSection = findSectionForKeyword(cmd);
    const currentLetters = lettersRef.current;

    setTimeout(() => {
      const letterSpacing = 40;
      const totalWidth = currentLetters.length * letterSpacing;
      
      const newDebris = currentLetters.map((l, index) => {
        const startLeft = `calc(50vw - ${totalWidth / 2}px + ${index * letterSpacing}px)`;
        return {
          ...l,
          startLeft,
          driftX: (Math.random() - 0.5) * 60,
          driftY: (Math.random() - 0.5) * 80,
          driftRot: (Math.random() - 0.5) * 720,
          scale: Math.random() * 0.6 + 0.3,
          duration: Math.random() * 30 + 30
        };
      });

      setDebris(prev => [...prev, ...newDebris].slice(-MAX_DEBRIS));
      setLetters([]);
      setIsAssembling(false);
      
      if (targetSection) {
        setInputValue("");
        burstRef.current?.burst();
        document.getElementById(targetSection)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setIsError(true);
        setInputValue("COMMAND NOT FOUND");
        setTimeout(() => {
          setIsError(false);
          setInputValue("");
        }, 1500);
      }
    }, 2000);
  }, [findSectionForKeyword]);

  // Keyboard handler with proper cleanup
  useEffect(() => {
    if (!isSettled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAssembling || isError) return;
      
      if (e.code === 'Space') e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'a') e.preventDefault();
        return;
      }
      
      if (e.key === 'Backspace') {
        playClick();
        setInputValue(prev => prev.slice(0, -1));
        setLetters(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault(); 
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        executeCommand(inputValue);
      } else if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
        if (e.key === ' ') e.preventDefault();
        playClick();

        setInputValue(prev => prev + e.key);
        setLetters(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          char: e.key, startX: Math.random() * 80 + 10, startY: Math.random() * 60 + 10, rot: Math.random() * 90 - 45, floatDelay: Math.random() * -5
        }]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettled, isAssembling, isError, inputValue, playClick, executeCommand]);

  // Memoize debris list to prevent re-renders
  const debrisElements = useMemo(() => 
    debris.map((item) => (
      <DebrisLetterItem key={item.id} item={item} />
    )),
    [debris]
  );

  // Memoize floating letters
  const letterElements = useMemo(() =>
    letters.map((letter, index) => (
      <FloatingLetter 
        key={letter.id} 
        letter={letter} 
        index={index} 
        isAssembling={isAssembling}
        isError={isError}
        totalLetters={letters.length}
      />
    )),
    [letters, isAssembling, isError]
  );

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }} enabled={!isLoading}>
      <main
        className="relative bg-neutral-950 font-sans select-none text-neutral-300 overflow-hidden"
        style={isLoading ? { pointerEvents: 'none', overflow: 'hidden', height: '100vh' } : undefined}
      >
        {/* Background layers */}
        <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-50" />
        <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black pointer-events-none" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0" />

        <MatrixRain />
        
        {/* Debris particles - limited count */}
        {debris.length > 0 && (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
            {debrisElements}
          </div>
        )}

        {/* Floating typing letters */}
        {letters.length > 0 && (
          <div className="fixed inset-0 z-0 pointer-events-none">
            {letterElements}
          </div>
        )}

        {/* 3D Scene */}
        <Scene isSettled={isSettled} />
        
        {/* UI */}
        <TopBar isSettled={isSettled} />

        <div className="relative z-20 flex flex-col w-full">
          <section id="home" className="min-h-screen flex flex-col items-center justify-start pt-32 pointer-events-none">
            
            <div className={`text-center space-y-2 transition-all duration-1000 pointer-events-auto ${isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
              
              <div className="relative flex justify-center items-center mt-4 mb-8 w-full max-w-[90vw]">
                <motion.h1 
                  className="relative text-[8vw] md:text-8xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500/50 drop-shadow-[0_0_40px_rgba(34,211,238,0.5)] whitespace-nowrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isSettled ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  {resumeData.personalInfo.name}
                </motion.h1>
              </div>

              <motion.div 
                className="w-64 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-8"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={isSettled ? { scaleX: 1, opacity: 1 } : {}}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />

              <motion.p 
                initial={{ opacity: 0, letterSpacing: "0em" }}
                animate={isSettled ? { opacity: 1, letterSpacing: "0.4em" } : {}}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="text-sm md:text-lg text-cyan-400 uppercase font-medium tracking-[0.4em] mb-8"
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                {resumeData.personalInfo.title}
              </motion.p>
              
              <div className="mt-16 flex flex-col items-center">
                <motion.p 
                  className={`text-xs tracking-[0.3em] uppercase mb-6 h-5 transition-colors duration-300 ${isError ? 'text-red-500' : 'text-neutral-500'}`}
                  initial={{ opacity: 0 }}
                  animate={isSettled ? { opacity: 1 } : {}}
                  transition={{ delay: 0.8 }}
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  {isError ? "ERROR: COMMAND NOT FOUND" : (inputValue || isAssembling ? "SYSTEM READY" : hintText)}
                </motion.p>
                <div 
                  className={`w-80 md:w-96 h-14 border bg-neutral-950/90 backdrop-blur-xl rounded-lg flex items-center px-5 transition-all duration-500 ${isAssembling && !isError ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isError ? 'border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.3)]' : 'border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)]'}`}
                >
                  <span className={`font-mono text-lg mr-4 ${isError ? 'text-red-500' : 'text-cyan-400'}`}>{">"}</span>
                  <span className={`font-mono text-base tracking-wider flex-1 ${isError ? 'text-red-400' : 'text-neutral-100'}`}>{inputValue}</span>
                  <span 
                    className={`font-mono ml-2 ${isError ? 'text-red-500' : 'text-cyan-400'}`}
                  >
                    ▋
                  </span>
                </div>
              </div>
            </div>
            
          </section>

          <GitHubStats />
          <Sections />
        </div>

        <div className={`fixed bottom-0 left-0 h-1 bg-cyan-500 transition-opacity duration-1000 z-50 ${isSettled ? 'opacity-0' : 'opacity-100'}`} style={{ width: `${loadProgress}%` }} />

        <ParticleBurst ref={burstRef} />
      </main>
    </ReactLenis>
  );
}
