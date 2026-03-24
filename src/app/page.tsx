"use client";
import { useState, useEffect } from 'react';
import Scene from '@/components/3d/Scene';
import TopBar from '@/components/ui/TopBar';
import Sections from '@/components/ui/Sections';
import { resumeData } from '@/data/resumeData';

type FloatingLetter = { id: string; char: string; startX: number; startY: number; rot: number; floatDelay: number; };

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
          char: e.key, startX: Math.random() * 80 + 10, startY: Math.random() * 60 + 10, rot: Math.random() * 90 - 45, floatDelay: Math.random() * -5
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

      <div className="fixed inset-0 z-50 pointer-events-none">
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

      <div className="relative z-10 flex flex-col w-full">
        <section id="home" className="min-h-screen flex flex-col items-center justify-start pt-32 pointer-events-none">
          <div className={`text-center space-y-4 transition-all duration-1000 pointer-events-auto ${isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
            <h1 className="text-5xl md:text-7xl font-black text-neutral-200 tracking-tighter uppercase">{resumeData.personalInfo.name}</h1>
            <p className="text-xl md:text-2xl text-cyan-400 tracking-widest uppercase font-semibold">{resumeData.personalInfo.title}</p>
            <div className="mt-12 flex flex-col items-center">
              <p className={`text-sm tracking-widest uppercase mb-3 h-5 ${isError ? 'text-red-500' : 'text-neutral-500'}`}>
                {isError ? "Error" : (inputValue || isAssembling ? "System Ready." : hintText)}
              </p>
              <div className={`w-96 h-12 border bg-neutral-900/80 backdrop-blur-sm rounded-md flex items-center px-4 shadow-2xl transition-all duration-500 ${isAssembling && !isError ? 'opacity-0' : 'opacity-100'} ${isError ? 'border-red-500 shadow-red-900/40' : 'border-neutral-800 shadow-cyan-900/40'}`}>
                <span className={`font-mono mr-2 ${isError ? 'text-red-500' : 'text-cyan-400'}`}>{">"}</span>
                <span className={`font-mono ${isError ? 'text-red-400' : 'text-neutral-200'}`}>{inputValue}</span>
                <span className={`font-mono animate-blink ${isError ? 'text-red-500' : 'text-neutral-400'}`}>_</span>
              </div>
            </div>
          </div>
        </section>

        <Sections />
      </div>

      <div className={`fixed bottom-0 left-0 h-1 bg-cyan-500 transition-opacity duration-1000 z-50 ${isSettled ? 'opacity-0' : 'opacity-100'}`} style={{ width: `${loadProgress}%` }} />
    </main>
  );
}