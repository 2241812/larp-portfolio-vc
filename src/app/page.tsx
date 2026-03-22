"use client";
import { useState, useEffect, useRef } from 'react';
import Scene from '@/components/3d/Scene';
import TopBar from '@/components/ui/TopBar';
import ContentPanel from '@/components/ui/ContentPanel';
import { resumeData } from '@/data/resumeData';

type FloatingLetter = { id: string; char: string; startX: number; startY: number; rot: number; floatDelay: number; };

const SECTIONS = ['', 'about me', 'experience', 'skills', 'projects', 'contact'];
const VALID_COMMANDS = ['about me', 'experience', 'skills', 'projects', 'contact'];
const HINT_PHRASES = ["'about me'", "'projects'", "'skills'", "'experience'", "'contact'"];

export default function Home() {
  const [isSettled, setIsSettled] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [letters, setLetters] = useState<FloatingLetter[]>([]);
  const [isAssembling, setIsAssembling] = useState(false);
  
  const [activeSection, setActiveSection] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [hintText, setHintText] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [isDeletingHint, setIsDeletingHint] = useState(false);

  const activeSectionRef = useRef(activeSection);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

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
    if (inputValue.length > 0 || isAssembling || isTransitioning) {
      setHintText("");
      return;
    }
    
    const timeout = setTimeout(() => {
      const currentPhrase = `Try typing ${HINT_PHRASES[hintIndex]}...`;
      
      if (!isDeletingHint) {
        setHintText(currentPhrase.substring(0, hintText.length + 1));
        if (hintText === currentPhrase) {
          setTimeout(() => setIsDeletingHint(true), 2000);
        }
      } else {
        setHintText(currentPhrase.substring(0, hintText.length - 1));
        if (hintText === '') {
          setIsDeletingHint(false);
          setHintIndex((prev) => (prev + 1) % HINT_PHRASES.length);
        }
      }
    }, isDeletingHint ? 30 : 80);
    
    return () => clearTimeout(timeout);
  }, [hintText, isDeletingHint, hintIndex, inputValue, isAssembling, isTransitioning]);

  const triggerTransition = (nextSection: string) => {
    if (isTransitioning || nextSection === activeSection) return;
    setIsTransitioning(true);
    
    setTimeout(() => {
      setActiveSection(nextSection);
    }, 800);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1600);
  };

  const executeCommand = (cmd: string) => {
    if (!cmd) return;
    setIsAssembling(true);
    const normalizedCmd = cmd.toLowerCase().trim();
    const isValid = VALID_COMMANDS.includes(normalizedCmd) || normalizedCmd === "home" || normalizedCmd === "clear";

    setTimeout(() => {
      setLetters([]);
      setInputValue("");
      setIsAssembling(false);
      
      if (isValid) {
        const nextSec = (normalizedCmd === "home" || normalizedCmd === "clear") ? "" : normalizedCmd;
        triggerTransition(nextSec);
      }
    }, 2000);
  };

  const handleTopBarCommand = (cmd: string) => {
    if (isAssembling || isTransitioning) return;
    const normalizedCmd = cmd.toLowerCase().trim();
    if (normalizedCmd === 'home') {
        triggerTransition('');
        return;
    }

    setInputValue(cmd);
    const newLetters = cmd.split('').map((char, index) => ({
      id: Date.now().toString() + index + Math.random(),
      char: char, startX: Math.random() * 80 + 10, startY: Math.random() * 60 + 10, rot: Math.random() * 90 - 45, floatDelay: Math.random() * -5
    }));
    setLetters(newLetters);
    executeCommand(cmd);
  };

  useEffect(() => {
    if (!isSettled) return;

    const handleWheel = (e: WheelEvent) => {
      if (isAssembling || isTransitioning) return;
      const currentIndex = SECTIONS.indexOf(activeSectionRef.current);

      if (e.deltaY > 40 && currentIndex < SECTIONS.length - 1) {
        triggerTransition(SECTIONS[currentIndex + 1]);
      } else if (e.deltaY < -40 && currentIndex > 0) {
        triggerTransition(SECTIONS[currentIndex - 1]);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAssembling || isTransitioning) return;

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

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettled, isAssembling, isTransitioning, inputValue]);

  return (
    <main className="relative min-h-screen bg-neutral-950 overflow-hidden font-sans select-none">
      <div className="absolute inset-0 z-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyan-600/15 blur-[140px] rounded-[100%] pointer-events-none z-0" />

      <TopBar isSettled={isSettled} onCommand={handleTopBarCommand} />

      {letters.map((letter, index) => {
        const isSpace = letter.char === ' ';
        const letterSpacing = 40;
        const totalWidth = letters.length * letterSpacing;
        const startLeft = `calc(50vw - ${totalWidth / 2}px + ${index * letterSpacing}px)`;
        const startTop = `35vh`;

        return (
          <div key={letter.id} className="absolute z-10 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none flex items-center justify-center w-10 h-10" style={{ left: isAssembling ? startLeft : `${letter.startX}vw`, top: isAssembling ? startTop : `${letter.startY}vh`, opacity: isAssembling ? 1 : 0.15, scale: isAssembling ? 1 : 1.5 }}>
            <div className={`font-mono font-bold transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isAssembling ? "" : "animate-float-bob"}`} style={{ animationDelay: `${letter.floatDelay}s`, transform: isAssembling ? `rotate(0deg)` : `rotate(${letter.rot}deg)`, color: isAssembling ? '#22d3ee' : '#0891b2', textShadow: isAssembling ? '0 0 30px rgba(34, 211, 238, 0.8)' : 'none', fontSize: isAssembling ? '4rem' : '8rem' }}>
              {isSpace ? "\u00A0" : letter.char}
            </div>
          </div>
        );
      })}

      {/* HOME LAYER */}
      <div className={`absolute inset-0 z-20 flex flex-col items-center justify-start pt-32 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSettled && !activeSection && !isTransitioning ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-12 pointer-events-none'}`}>
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-neutral-200 tracking-tighter uppercase">{resumeData.personalInfo.name}</h1>
          <p className="text-xl md:text-2xl text-cyan-400 tracking-widest uppercase font-semibold">{resumeData.personalInfo.title}</p>
          <div className="mt-12 flex flex-col items-center">
            <p className="text-neutral-500 text-sm tracking-widest uppercase mb-3 h-5">
              {inputValue || isAssembling || isTransitioning ? "System Ready." : hintText}
            </p>
            <div className={`w-96 h-12 border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm rounded-md flex items-center px-4 shadow-2xl shadow-cyan-900/40 transition-opacity duration-500 ${isAssembling ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-cyan-400 font-mono mr-2">{">"}</span>
              <span className="text-neutral-200 font-mono">{inputValue}</span>
              <span className="text-neutral-400 font-mono animate-blink">_</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT LAYER */}
      <div className={`absolute right-0 top-0 bottom-0 w-full md:w-[55%] pt-32 px-8 pb-12 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeSection && !isTransitioning ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-24 pointer-events-none'}`}>
        <ContentPanel section={activeSection} />
      </div>

      {/* RIGHT ALIGNED WATERMARK */}
      <div className={`absolute top-24 right-12 md:right-24 w-1/2 flex flex-col items-end transition-all duration-700 ease-in-out pointer-events-none ${activeSection && !isTransitioning ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
          <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-800 tracking-tighter uppercase opacity-80" style={{ textShadow: '0 0 40px rgba(34,211,238,0.2)' }}>
            {activeSection}
          </h2>
      </div>

      <Scene isSettled={isSettled} activeSection={activeSection} isTransitioning={isTransitioning} />

      <div className={`absolute bottom-0 left-0 h-1 bg-cyan-500 transition-opacity duration-1000 z-50 ${isSettled ? 'opacity-0' : 'opacity-100'}`} style={{ width: `${loadProgress}%` }} />
    </main>
  );
}