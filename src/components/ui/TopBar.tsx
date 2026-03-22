"use client";
import React from 'react';
import Image from 'next/image';

interface TopBarProps {
  isSettled: boolean;
}

export default function TopBar({ isSettled }: TopBarProps) {
  const navItems = ['about me', 'experience', 'skills', 'projects', 'contact'];

  return (
    <header 
      className={`absolute top-0 left-0 w-full z-50 transition-all duration-1000 ease-in-out px-6 md:px-12 ${
        isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}
    >
      <div className="w-full h-20 border-b border-cyan-900/40 bg-neutral-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image 
            src="/logo.png" 
            alt="Portfolio Logo" 
            width={48} 
            height={48} 
            className="rounded-lg border border-cyan-800 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
          />
        </div>

        <nav className="flex space-x-6">
          {navItems.map((item) => (
            <button
              key={item}
              className="group relative px-1 py-1 font-mono text-xs md:text-sm tracking-widest uppercase text-neutral-400 transition-colors duration-300 hover:text-cyan-400"
            >
              <span className="absolute -left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-cyan-500">
                {">"}
              </span>
              {item}
              <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}