"use client";
import { useState, useEffect } from 'react';
import Scene from '@/components/3d/Scene';
import { resumeData } from '@/data/resumeData';

export default function Home() {
  const [isSettled, setIsSettled] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    // Cinematic 2.5-second loading sequence
    const duration = 2500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      setLoadProgress(progress);

      // When the bar hits 100%, stop the timer and settle the keyboard
      if (progress === 100) {
        clearInterval(interval);
        setIsSettled(true);
      }
    }, 16); // Runs at roughly 60 frames per second for a buttery smooth line

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen bg-neutral-950 overflow-hidden font-sans">
      
      {/* 2D HTML LAYER */}
      <div 
        className={`absolute inset-0 z-0 flex flex-col items-center justify-start pt-32 transition-all duration-1000 ease-in-out ${
          isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-neutral-200 tracking-tighter uppercase">
            {resumeData.personalInfo.name}
          </h1>
          <p className="text-xl md:text-2xl text-red-500 tracking-widest uppercase font-semibold">
            {resumeData.personalInfo.title}
          </p>
          
          <div className="mt-12 flex flex-col items-center animate-pulse">
            <p className="text-neutral-500 text-sm tracking-widest uppercase mb-3">
              System Ready. Type to search portfolio...
            </p>
            <div className="w-96 h-12 border border-neutral-800 bg-neutral-900/50 rounded-md flex items-center px-4 shadow-xl">
              <span className="text-red-500 font-mono mr-2">{">"}</span>
              <span className="text-neutral-400 font-mono animate-blink">_</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D CANVAS LAYER */}
      <Scene isSettled={isSettled} />

      {/* 🟥 THE LOADING BAR */}
      <div 
        className={`absolute bottom-0 left-0 h-1 bg-red-500 transition-opacity duration-1000 z-50 ${
          isSettled ? 'opacity-0' : 'opacity-100'
        }`} 
        style={{ width: `${loadProgress}%` }} 
      />
      
    </main>
  );
}