"use client";
import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeData } from '@/data/resumeData';
import { containerVariants, cardVariants, headingVariants } from './shared';

const ExperienceSection = memo(function ExperienceSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const experiences = [
    {
      title: 'OpenCode-VSCode-Setup',
      role: 'Environment Architect',
      date: 'Mar. 2026 – Present',
      organization: 'Saint Louis University',
      description:
        'Engineered a Docker-based VSCode Remote Containers setup that runs an OpenCode AI development environment directly inside the terminal, with a hardened non-root container, pre-configured volumes, and .env-based API key management.',
      highlights: [
        'Containerized AI development environment',
        'Security hardening with non-root users',
        'API key management via .env files',
        'VSCode Remote Containers integration',
      ],
    },
    {
      title: 'MultiTask_ContextSwitch',
      role: 'Python Developer',
      date: 'Feb. 2026 – Present',
      organization: 'Saint Louis University',
      description:
        'Developed a Python-based workflow automator that monitors web-based AI generation and uses a PyQt6 engine to manage real-time window focus and UI states between browser and local tools.',
      highlights: [
        'Python automation framework',
        'PyQt6 UI management',
        'Real-time process monitoring',
        'Python focus-switching engine',
      ],
    },
    {
      title: 'WebDev_Campus-Navigator_CS312',
      role: 'Full-Stack Developer',
      date: 'Dec. 2025',
      organization: 'Saint Louis University',
      description:
        'Designed a containerized microservices web application using Docker, Go, Node.js, and PHP to serve scalable campus navigation requests, integrating Dijkstra\'s algorithm as the routing engine.',
      highlights: [
        'Microservices architecture',
        'Multi-language integration (Go, Node.js, PHP)',
        'Docker containerization',
        'Dijkstra\'s algorithm pathfinding',
      ],
    },
  ];

  const nextExperience = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length);
  };

  const prevExperience = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length);
  };

  return (
    <section id="experience" className="min-h-screen flex items-center justify-start px-8 md:px-12 relative py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full max-w-4xl relative z-10"
      >
        <motion.div variants={headingVariants} className="flex items-center gap-4 mb-12">
          <div className="w-8 h-[1px] bg-cyan-500/50" aria-hidden="true" />
          <h2 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">05. Blog Posts</h2>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-cyan-900/10 to-neutral-900/40 border border-cyan-900/30 rounded-xl p-8 md:p-10"
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-neutral-100 mb-2">
                      {experiences[currentIndex].title}
                    </h3>
                    <p className="text-cyan-400/80 font-mono text-sm mb-1">
                      {experiences[currentIndex].role}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
                      {experiences[currentIndex].organization} • {experiences[currentIndex].date}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-cyan-500/20 via-cyan-500/40 to-transparent mb-6"></div>
              </div>

              {/* Description */}
              <motion.p
                variants={cardVariants}
                className="text-base leading-relaxed text-neutral-300 mb-6 font-light"
              >
                {experiences[currentIndex].description}
              </motion.p>

              {/* Highlights */}
              <motion.div variants={containerVariants} className="grid grid-cols-2 gap-3">
                {experiences[currentIndex].highlights.map((highlight, idx) => (
                  <motion.div
                    key={idx}
                    variants={cardVariants}
                    className="flex items-start gap-2 p-3 rounded-lg bg-neutral-950/50 border border-cyan-900/20"
                  >
                    <span className="text-cyan-400 font-mono text-lg flex-shrink-0">▸</span>
                    <span className="text-sm text-neutral-400 font-light">{highlight}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <motion.button
              onClick={prevExperience}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-lg border border-cyan-900/30 hover:border-cyan-400/60 text-cyan-400 hover:text-cyan-300 transition-all duration-300 flex items-center justify-center"
              aria-label="Previous experience"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {experiences.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  whileHover={{ scale: 1.2 }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-cyan-400 w-6'
                      : 'bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  aria-label={`Go to experience ${idx + 1}`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextExperience}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-lg border border-cyan-900/30 hover:border-cyan-400/60 text-cyan-400 hover:text-cyan-300 transition-all duration-300 flex items-center justify-center"
              aria-label="Next experience"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>

          {/* Counter */}
          <div className="text-center mt-6 text-xs text-neutral-500 font-mono">
            {currentIndex + 1} / {experiences.length}
          </div>
        </div>
      </motion.div>
    </section>
  );
});

export default ExperienceSection;
