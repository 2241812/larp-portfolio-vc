"use client";
import { useState, useEffect, useRef } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { motion } from 'framer-motion';
import Scene from '@/components/3d/Scene';
import TopBar from '@/components/ui/TopBar';
import Sections from '@/components/ui/Sections';
import { resumeData } from '@/data/resumeData';

type FloatingLetter = { id: string; char: string; startX: number; startY: number; rot: number; floatDelay: number; };
type DebrisLetter = FloatingLetter & { startLeft: string; driftX: number; driftY: number; driftRot: number; scale: number; duration: number; };

const VALID_COMMANDS = ['about me', 'experience', 'skills', 'projects', 'contact'];
const HINT_PHRASES = ["Try typing 'about me'", "Try typing 'skills'", "Try typing 'projects'", "Try typing 'experience'", "Try typing 'contact'"];

export default function Home() {
  const [isSettled, setIsSettled] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [letters, setLetters] = useState<FloatingLetter[]>([]);
  const [debris, setDebris] = useState<DebrisLetter[]>([]);
  const [isAssembling, setIsAssembling] = useState(false);
  const [isError, setIsError] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [isTypingName, setIsTypingName] = useState(true);
  
  const [hintText, setHintText] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [isDeletingHint, setIsDeletingHint] = useState(false);

  // Keyboard bounce state
  const [isBouncing, setIsBouncing] = useState(false);
  const bounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const fullName = resumeData.personalInfo.name;
  
  // Trigger keyboard bounce
  const triggerBounce = () => {
    setIsBouncing(true);
    if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
    bounceTimeoutRef.current = setTimeout(() => setIsBouncing(false), 250);
  };
  
  useEffect(() => {
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index <= fullName.length) {
        setTypedName(fullName.slice(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTypingName(false);
        setTimeout(() => setIsSettled(true), 500);
      }
    }, 120);
    return () => clearInterval(typeInterval);
  }, [fullName]);

  useEffect(() => {
    const duration = 2500;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setLoadProgress(progress);
      if (progress === 100) {
        clearInterval(interval);
        setIsSettled(true);
      }
    }, 16); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inputValue.length > 0 || isAssembling || isError) {
      setHintText("");
      return;
    }
    const timeout = setTimeout(() => {
      const currentPhrase = `${HINT_PHRASES[hintIndex]}...`;
      if (!isDeletingHint) {
        setHintText(currentPhrase.substring(0, hintText.length + 1));
        if (hintText === currentPhrase) setTimeout(() => setIsDeletingHint(true), 2000);
      } else {
        setHintText(currentPhrase.substring(0, hintText.length - 1));
        if (hintText === '') {
          setIsDeletingHint(false);
          setHintIndex((prev) => (prev + 1) % HINT_PHRASES.length);
        }
      }
    }, isDeletingHint ? 30 : 80);
    return () => clearTimeout(timeout);
  }, [hintText, isDeletingHint, hintIndex, inputValue, isAssembling, isError]);

  const findSectionForKeyword = (keyword: string): string | null => {
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
  };

  const executeCommand = (cmd: string) => {
    if (!cmd) return;
    setIsAssembling(true);
    
    const targetSection = findSectionForKeyword(cmd);

    setTimeout(() => {
      const letterSpacing = 40;
      const totalWidth = letters.length * letterSpacing;
      
      const newDebris = letters.map((l, index) => {
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

      setDebris(prev => [...prev, ...newDebris].slice(-50));
      setLetters([]);
      setIsAssembling(false);
      
      if (targetSection) {
        setInputValue("");
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
  };

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
        setInputValue(prev => prev.slice(0, -1));
        setLetters(prev => prev.slice(0, -1));
        triggerBounce();
      } else if (e.key === 'Enter') {
        e.preventDefault(); 
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        executeCommand(inputValue);
        triggerBounce();
      } else if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
        if (e.key === ' ') e.preventDefault(); 
        
        setInputValue(prev => prev + e.key);
        setLetters(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          char: e.key, startX: Math.random() * 80 + 10, startY: Math.random() * 60 + 10, rot: Math.random() * 90 - 45, floatDelay: Math.random() * -5
        }]);
        triggerBounce();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettled, isAssembling, isError, inputValue]);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <main className="relative bg-black font-sans select-none text-neutral-300 scanlines">
        
        {/* --- LAYER 1: DEEP BACKGROUND (z-0) --- */}
        <div className="fixed inset-0 z-0 bg-grid pointer-events-none" />
        <div className="fixed inset-0 z-0 bg-cyber-radial pointer-events-none" />
        
        {/* Faint horizontal scan lines */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34, 211, 238, 0.15) 3px, rgba(34, 211, 238, 0.15) 4px)',
          }}
        />
        
        {/* The Vanta.js Style Debris Asteroids */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
          {debris.map((item) => (
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
          ))}
        </div>

        {/* The Active Floating Typing Letters */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {letters.map((letter, index) => {
            const isSpace = letter.char === ' ';
            const letterSpacing = 40;
            const totalWidth = letters.length * letterSpacing;
            const startLeft = `calc(50vw - ${totalWidth / 2}px + ${index * letterSpacing}px)`;
            const startTop = `35vh`;

            return (
              <div key={letter.id} className="absolute transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-center w-10 h-10" style={{ left: isAssembling ? startLeft : `${letter.startX}vw`, top: isAssembling ? startTop : `${letter.startY}vh`, opacity: isAssembling ? 1 : 0.15, scale: isAssembling ? 1 : 1.5 }}>
                <div className={`font-mono font-bold transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isAssembling ? "" : "animate-float-bob"}`} style={{ animationDelay: `${letter.floatDelay}s`, transform: isAssembling ? `rotate(0deg)` : `rotate(${letter.rot}deg)`, color: isAssembling ? (isError ? '#ef4444' : '#22d3ee') : '#0891b2', textShadow: isAssembling ? (isError ? '0 0 30px rgba(239, 68, 68, 0.8)' : '0 0 30px rgba(34, 211, 238, 0.8)') : 'none', fontSize: isAssembling ? '4rem' : '8rem' }}>
                  {isSpace ? "\u00A0" : letter.char}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- LAYER 2: 3D KEYBOARD SCENE (z-10) --- */}
        {/* Keyboard positioned at bottom center with 3D isometric transform */}
        <div className={`fixed bottom-0 left-0 right-0 z-10 pointer-events-none flex items-end justify-center h-[55vh] transition-all duration-700 ${isSettled ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-full">
            <div className={`w-full h-full ${isBouncing ? 'keyboard-bounce' : ''}`}>
              <Scene isSettled={isSettled} />
            </div>
          </div>
        </div>
        
        {/* --- LAYER 3: UI CONTENT (z-20 & z-50) --- */}
        <TopBar isSettled={isSettled} />

        <div className="relative z-20 flex flex-col w-full">
          <section id="home" className="min-h-screen flex flex-col items-center justify-start pt-24 md:pt-32 pointer-events-none">
            
            {/* Hero text with 3D isometric perspective to match keyboard */}
            <div className={`hero-3d-container w-full transition-all duration-1000 pointer-events-auto ${isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
              <div className="hero-3d-text flex flex-col items-center text-center space-y-2">
                
                <div className="relative flex justify-center items-center mt-2 mb-6 w-full max-w-[90vw]">
                  {/* Cyberpunk glow layer */}
                  <motion.h1 
                    className="absolute text-[7vw] md:text-6xl font-black text-cyan-400 blur-[30px] opacity-80 tracking-tighter uppercase select-none pointer-events-none mix-blend-screen"
                    style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
                    animate={{ opacity: isTypingName ? [0.4, 0.8, 0.4] : 0.8 }}
                    transition={{ duration: 2, repeat: isTypingName ? Infinity : 0, ease: "easeInOut" }}
                  >
                    {typedName}
                  </motion.h1>
                  {/* Main cyberpunk text */}
                  <motion.h1 
                    className="relative text-[7vw] md:text-6xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]"
                    style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: isTypingName ? 0 : 1, scale: isTypingName ? 0.9 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {typedName}
                    {isTypingName && (
                      <motion.span 
                        className="inline-block w-1 h-[0.6em] bg-cyan-400 ml-1 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </motion.h1>
                </div>

                {/* Glitch accent line */}
                <motion.div 
                  className="w-64 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-6"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isSettled ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
                
                <motion.p 
                  initial={{ opacity: 0, letterSpacing: "0em", y: 10 }}
                  animate={isSettled ? { opacity: 1, letterSpacing: "0.3em", y: 0 } : {}}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  className="text-sm md:text-lg text-cyan-400 uppercase font-medium tracking-[0.3em] text-center"
                  style={{ fontFamily: 'var(--font-rajdhani), sans-serif', fontWeight: 600 }}
                >
                  {resumeData.personalInfo.title}
                </motion.p>
                
                {/* Input field positioned above keyboard area */}
                <motion.div 
                  className="mt-16 md:mt-20 flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isSettled ? 1 : 0, y: isSettled ? 0 : 20 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <p className={`text-xs tracking-[0.3em] uppercase mb-4 h-5 transition-colors duration-300 ${isError ? 'text-red-500' : 'text-cyan-600/70'}`}
                    style={{ fontFamily: 'var(--font-rajdhani), sans-serif' }}
                  >
                    {isError ? "ERROR: COMMAND NOT FOUND" : (inputValue || isAssembling ? "SYSTEM READY" : hintText)}
                  </p>
                  <motion.div 
                    className={`w-80 md:w-96 h-14 border bg-black/90 backdrop-blur-xl rounded-lg flex items-center px-5 transition-all duration-500 ${isAssembling && !isError ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isError ? 'border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)]'}`}
                    whileHover={{ boxShadow: '0 0 50px rgba(34,211,238,0.3)', borderColor: 'rgba(34,211,238,0.5)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className={`font-mono text-lg mr-3 ${isError ? 'text-red-500' : 'text-cyan-400'}`}>{">"}</span>
                    <span className={`font-mono text-base tracking-wider flex-1 ${isError ? 'text-red-400' : 'text-neutral-100'}`}>{inputValue}</span>
                    <span className={`font-mono animate-pulse ml-1 ${isError ? 'text-red-500' : 'text-cyan-400'}`}>▋</span>
                  </motion.div>
                </motion.div>
              </div>
            </div>
            
          </section>

          <Sections />
        </div>

        {/* Loading progress bar */}
        <motion.div 
          className="fixed bottom-0 left-0 h-[3px] bg-gradient-to-r from-cyan-900 via-cyan-400 to-cyan-600 z-50"
          animate={{ opacity: isSettled ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: `${loadProgress}%`, boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)' }}
        />
      </main>
    </ReactLenis>
  );
}
