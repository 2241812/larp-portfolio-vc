"use client";
import React from 'react';
import Image from 'next/image';

interface TopBarProps {
  isSettled: boolean;
}

export default function TopBar({ isSettled }: TopBarProps) {
  const navItems = ['about me', 'experience', 'skills', 'projects', 'contact'];

  const scrollToSection = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ease-in-out px-6 md:px-12 ${
        isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}
    >
      <div className="w-full h-20 border-b border-cyan-900/40 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => scrollToSection('home')}
        >
          <Image 
            src="/logo.jpg" 
            alt="Portfolio Logo" 
            width={48} 
            height={48} 
            className="rounded-lg border border-cyan-800 shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] group-hover:border-cyan-400"
          />
        </div>

        <nav className="flex space-x-6">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className="group relative px-1 py-1 font-mono text-xs md:text-sm tracking-widest uppercase text-neutral-400 transition-colors duration-300 hover:text-cyan-400 cursor-pointer"
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