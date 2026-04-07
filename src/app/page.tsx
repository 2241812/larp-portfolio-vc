"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ReactLenis } from '@studio-freight/react-lenis';
import { motion, AnimatePresence } from 'framer-motion';
import Scene from '@/components/3d/Scene';
import TopBar from '@/components/ui/TopBar';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Sections from '@/components/ui/Sections';
import GitHubStats from '@/components/ui/GitHubStats';
import MatrixRain from '@/components/ui/MatrixRain';
import ParticleBurst, { ParticleBurstRef } from '@/components/ui/ParticleBurst';
import { resumeData } from '@/data/resumeData';
import profilePhoto from '../../assets/placeholder.png';

export default function Home() {
  const [loadingPhase, setLoadingPhase] = useState<'typing' | 'finished' | 'settled'>('typing');
  const [loadProgress, setLoadProgress] = useState(0);
  const burstRef = useRef<ParticleBurstRef>(null);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (loadingPhase !== 'typing') {
      setLoadProgress(100);
      return;
    }
    
    const duration = 3000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setLoadProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, intervalTime);

    const timer = setTimeout(() => {
      setLoadingPhase('finished');
      setTimeout(() => {
        setLoadingPhase('settled');
      }, 800); 
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [loadingPhase]);

  useEffect(() => {
    if (loadingPhase !== 'settled') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [loadingPhase]);

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-neutral-950 focus:rounded-md focus:font-mono focus:text-sm focus:font-bold"
      >
        Skip to main content
      </a>
      
      <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-50" aria-hidden="true" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black pointer-events-none" aria-hidden="true" />
      
      {/* Matrix rain effect - hidden from screen readers and respects reduced motion */}
      {!prefersReducedMotion && <MatrixRain />}
      
      {loadingPhase !== 'settled' && (
        <div className="fixed inset-0 z-30 pointer-events-none" aria-hidden="true">
          <ErrorBoundary fallback={<div className="w-full h-full bg-neutral-950" />}>
            <Scene isSettled={false} />
          </ErrorBoundary>
        </div>
      )}

      <AnimatePresence>
        {loadingPhase !== 'settled' && (
          <>
            <motion.div 
              key="loading-top"
              initial={{ y: 0 }}
              exit={{ y: '-100vh', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
              className="fixed top-0 left-0 w-full h-1/2 bg-neutral-950/80 backdrop-blur-md z-40 flex items-end justify-center pb-8 border-b border-cyan-500/20"
            />
            <motion.div 
              key="loading-bottom"
              initial={{ y: 0 }}
              exit={{ y: '100vh', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
              className="fixed bottom-0 left-0 w-full h-1/2 bg-neutral-950/80 backdrop-blur-md z-40 flex items-start justify-center pt-8 border-t border-cyan-500/20"
            >
              <div className="flex flex-col items-center gap-4 mt-24">
                <div className="relative font-mono text-3xl md:text-5xl font-black tracking-widest text-neutral-800">
                  LOADING...
                  <div 
                    className="absolute top-0 left-0 overflow-hidden text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] whitespace-nowrap"
                    style={{ width: `${loadProgress}%` }}
                  >
                    LOADING...
                  </div>
                </div>
                {loadingPhase === 'finished' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-cyan-300 font-mono text-sm tracking-[0.5em] uppercase font-bold"
                  >
                    LOADING FINISHED
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {loadingPhase === 'settled' && (
        <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }} autoRaf={true}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative font-sans text-neutral-300 min-h-screen z-10"
          >
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0" aria-hidden="true" />
            
            <TopBar isSettled={true} />

            <main id="main-content" className="relative z-20 flex flex-col w-full" role="main">
              <section id="home" className="min-h-[100vh] flex flex-col items-center justify-center py-32 pointer-events-none">
                <div className="pointer-events-auto w-full max-w-5xl flex flex-col items-center gap-24 px-6 mt-20">
                  
                  <div className="flex flex-col items-center gap-8 w-full">
                    <motion.h1 
                      className="text-[10vw] md:text-[7rem] lg:text-[9rem] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-700 drop-shadow-[0_0_40px_rgba(34,211,238,0.3)] whitespace-nowrap text-center leading-none"
                      initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.9 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                      style={{ fontFamily: 'var(--font-orbitron)' }}
                    >
                      {resumeData.personalInfo.name}
                    </motion.h1>

                    <motion.p 
                      initial={{ opacity: 0, letterSpacing: "0em" }}
                      animate={{ opacity: 1, letterSpacing: "0.5em" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                      className="text-sm md:text-xl text-cyan-400 uppercase font-semibold text-center"
                      style={{ fontFamily: 'var(--font-rajdhani)' }}
                    >
                      {resumeData.personalInfo.title}
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 1.2 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-4xl"
                  >
                    <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-cyan-500/20 shadow-[0_0_60px_rgba(34,211,238,0.1)] bg-neutral-900/40 flex-shrink-0">
                      <Image
                        src={profilePhoto}
                        alt={resumeData.personalInfo.name}
                        fill
                        sizes="256px"
                        priority
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                      <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-light">
                        Computer Science student at Saint Louis University focusing on scalable system architecture,
                        containerization, and AI workflow automation. I enjoy building reproducible AI development environments
                        and multi-service applications that feel reliable and easy to extend.
                      </p>
                    </div>
                  </motion.div>
                  
                </div>
              </section>

              <GitHubStats />
              <Sections />
            </main>
            <ParticleBurst ref={burstRef} />
          </motion.div>
        </ReactLenis>
      )}
    </>
  );
}
