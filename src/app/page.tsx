"use client";
import { useState, useEffect } from 'react';
import Scene from '@/components/3d/Scene';
import TopBar from '@/components/ui/TopBar';
import Sections from '@/components/ui/Sections';
import { resumeData } from '@/data/resumeData';

type FloatingLetter = { id: string; char: string; startX: number; startY: number; startXEnd: number; startYEnd: number; rot: number; floatDelay: number; scale: number; };

const VALID_COMMANDS = ['about me', 'experience', 'skills', 'projects', 'contact'];
const HINT_PHRASES = ["'about me'", "'python'", "'skills'", "'docker'", "'contact'"];

export default function Home() {
  const [isSettled, setIsSettled] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [letters, setLetters] = useState<FloatingLetter[]>([]);
  const [isAssembling, setIsAssembling] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [hintText, setHintText] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [isDeletingHint, setIsDeletingHint] = useState(false);

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
      const currentPhrase = `Try typing ${HINT_PHRASES[hintIndex]}...`;
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
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'a') e.preventDefault();
        return;
      }
      if (e.key === 'Backspace') {
        setInputValue(prev => prev.slice(0, -1));
        setLetters(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        executeCommand(inputValue);
      } else if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
        setInputValue(prev => prev + e.key);
        setLetters(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          char: e.key, 
          startX: Math.random() * 70 + 15, 
          startY: Math.random() * 50 + 25, 
          startXEnd: 50 + (prev.length - 2.5) * 4,
          startYEnd: 35,
          rot: (Math.random() - 0.5) * 60, 
          floatDelay: Math.random() * -3,
          scale: 0.8 + Math.random() * 0.4
        }]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettled, isAssembling, isError, inputValue]);

  return (
    <main className="relative bg-neutral-950 font-sans select-none text-neutral-300">
      <div className="fixed inset-0 z-0 bg-grid pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyan-600/15 blur-[140px] rounded-[100%] pointer-events-none z-0" />
      <Scene isSettled={isSettled} />
      <TopBar isSettled={isSettled} />

      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {letters.map((letter, index) => {
          const isSpace = letter.char === ' ';
          const targetX = letter.startXEnd + (index * 0);
          
          return (
            <div 
              key={letter.id} 
              className="absolute flex items-center justify-center will-change-transform"
              style={{ 
                left: isAssembling ? `${targetX}vw` : `${letter.startX}vw`, 
                top: isAssembling ? `${letter.startYEnd}vh` : `${letter.startY}vh`, 
                opacity: isAssembling ? 1 : 0.12,
                transform: `scale(${isAssembling ? 1 : letter.scale})`,
                transition: 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <div 
                className={`font-mono font-bold ${!isAssembling ? "animate-float-bob" : ""}`}
                style={{ 
                  animationDelay: `${letter.floatDelay}s`, 
                  transform: isAssembling ? `rotate(0deg)` : `rotate(${letter.rot}deg)`,
                  color: isAssembling ? (isError ? '#ef4444' : '#22d3ee') : '#0891b2', 
                  textShadow: isAssembling 
                    ? (isError ? '0 0 40px rgba(239, 68, 68, 0.9)' : '0 0 40px rgba(34, 211, 238, 0.9)') 
                    : '0 0 20px rgba(8, 145, 178, 0.5)', 
                  fontSize: isAssembling ? '3.5rem' : '6rem',
                  transition: 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {isSpace ? "\u00A0" : letter.char}
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col w-full">
        <section id="home" className="min-h-screen flex flex-col items-center justify-start pt-32 pointer-events-none">
          <div className={`text-center space-y-6 transition-all duration-1000 pointer-events-auto ${isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-neutral-100 tracking-tight uppercase break-words max-w-[90vw] bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              {resumeData.personalInfo.name}
            </h1>
            <p className="text-lg md:text-2xl text-cyan-400 tracking-[0.3em] uppercase font-medium">{resumeData.personalInfo.title}</p>
              <div className="mt-12 flex flex-col items-center">
              <p className={`text-xs tracking-[0.3em] uppercase mb-4 h-5 font-mono ${isError ? 'text-red-500' : 'text-neutral-500'}`}>
                {isError ? "COMMAND NOT FOUND" : (inputValue || isAssembling ? "READY" : hintText)}
              </p>
              <div 
                className={`w-80 md:w-96 h-12 border bg-neutral-900/60 backdrop-blur-md rounded-lg flex items-center px-4 transition-all duration-300 ${isAssembling && !isError ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isError ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-neutral-700/50 shadow-[0_0_30px_rgba(34,211,238,0.15)]'}`}
              >
                <span className={`font-mono mr-2 select-none ${isError ? 'text-red-500' : 'text-cyan-400'}`}>›</span>
                <span className={`font-mono flex-1 overflow-hidden ${isError ? 'text-red-400' : 'text-neutral-100'}`}>{inputValue}</span>
                <span className={`font-mono animate-pulse ${isError ? 'text-red-500' : 'text-cyan-400/60'}`}>▋</span>
              </div>
            </div>
          </div>
        </section>

        <Sections />
      </div>

      <div 
        className={`fixed bottom-0 left-0 h-[3px] bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 transition-all duration-500 z-50 ${isSettled ? 'opacity-0' : 'opacity-100'}`} 
        style={{ 
          width: `${loadProgress}%`,
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)'
        }} 
      />
    </main>
  );
}