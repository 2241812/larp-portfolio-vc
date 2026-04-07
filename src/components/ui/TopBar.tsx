"use client";
import React, { useCallback, memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  isSettled: boolean;
}

// Navigation items with display labels and corresponding section IDs
const navConfig = [
  { label: 'about me', id: 'about' },
  { label: 'experience', id: 'experience' },
  { label: 'skills', id: 'skills' },
  { label: 'projects', id: 'projects' },
  { label: 'contact', id: 'contact' },
];

const TopBar = memo(function TopBar({ isSettled }: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const scrollToSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    
    // Small delay to allow mobile menu to close first
    requestAnimationFrame(() => {
      if (id === 'home') {
        // Use Lenis scroll if available, fallback to native
        const lenis = (window as unknown as { lenis?: { scrollTo: (target: number, options?: { duration?: number }) => void } }).lenis;
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        const element = document.getElementById(id);
        if (element) {
          const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: { offset?: number; duration?: number }) => void } }).lenis;
          if (lenis) {
            lenis.scrollTo(element, { offset: -80, duration: 1.2 });
          } else {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ease-in-out px-6 md:px-12 ${
          isSettled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="w-full h-20 border-b border-cyan-900/40 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => scrollToSection('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && scrollToSection('home')}
            aria-label="Go to home"
          >
            <Image 
              src="/logo.jpg" 
              alt="Portfolio Logo" 
              width={48} 
              height={48} 
              className="rounded-lg border border-cyan-800 shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] group-hover:border-cyan-400"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6" aria-label="Main navigation">
            {navConfig.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="group relative px-1 py-1 font-mono text-xs md:text-sm tracking-widest uppercase text-neutral-400 transition-colors duration-300 hover:text-cyan-400 cursor-pointer focus:outline-none focus:text-cyan-400"
              >
                <span className="absolute -left-4 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 text-cyan-500" aria-hidden="true">
                  {">"}
                </span>
                {item.label}
                <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-cyan-400 scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100 transition-transform duration-300 origin-left shadow-[0_0_8px_rgba(34,211,238,0.8)]" aria-hidden="true" />
              </button>
            ))}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <motion.span
                className="w-full h-0.5 bg-current rounded-full origin-center"
                animate={mobileMenuOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-full h-0.5 bg-current rounded-full"
                animate={mobileMenuOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-full h-0.5 bg-current rounded-full origin-center"
                animate={mobileMenuOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-neutral-950/90 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu Panel */}
            <motion.nav
              id="mobile-menu"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-20 right-0 bottom-0 w-full max-w-sm bg-neutral-950/95 backdrop-blur-xl border-l border-cyan-900/40 z-40 md:hidden overflow-y-auto"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col p-8 space-y-2">
                {navConfig.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    onClick={() => scrollToSection(item.id)}
                    className="group relative flex items-center gap-4 py-4 px-4 font-mono text-lg tracking-widest uppercase text-neutral-300 hover:text-cyan-400 focus:text-cyan-400 focus:outline-none transition-colors duration-300 border-b border-cyan-900/20 text-left"
                  >
                    <span className="text-cyan-500/50 text-sm font-mono" aria-hidden="true">0{index + 1}.</span>
                    <span>{item.label}</span>
                    <motion.span
                      className="ml-auto text-cyan-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity"
                      aria-hidden="true"
                    >
                      {">"}
                    </motion.span>
                  </motion.button>
                ))}

                {/* Decorative elements */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-8 mt-4 border-t border-cyan-900/30"
                >
                  <p className="text-xs font-mono text-neutral-600 text-center">
                    [ NAVIGATION INITIALIZED ]
                  </p>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

export default TopBar;
