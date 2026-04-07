"use client";
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { containerVariants, cardVariants, headingVariants } from './shared';

const ExperienceSection = memo(function ExperienceSection() {
  return (
    <section id="experience" className="min-h-screen flex items-center justify-start px-8 md:px-12 relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full max-w-4xl relative z-10 py-12"
      >
        <motion.div variants={headingVariants} className="flex items-center gap-4 mb-12">
          <div className="w-8 h-[1px] bg-cyan-500/50" aria-hidden="true" />
          <h2 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">02. Experience</h2>
        </motion.div>
        
        <div className="space-y-12 pl-4 md:pl-12 border-l border-neutral-800/50">
          <motion.article variants={cardVariants} className="relative group">
            <div className="absolute -left-[21px] md:-left-[53px] top-1.5 w-3 h-3 rounded-full bg-neutral-950 border border-cyan-500/50 group-hover:bg-cyan-400 transition-colors duration-300" aria-hidden="true" />
            <h3 className="text-xl md:text-2xl font-medium text-neutral-100 tracking-wide">OpenCode-VSCode-Setup</h3>
            <p className="text-cyan-500/80 font-mono text-sm mt-2 mb-1">Environment Architect // Mar. 2026 – Present</p>
            <p className="text-xs text-neutral-500 font-mono mb-4 uppercase tracking-wider">Saint Louis University</p>
            <p className="text-base leading-relaxed text-neutral-400 font-light max-w-2xl">
              Engineered a Docker-based VSCode Remote Containers setup that runs an OpenCode AI development environment directly inside the terminal, with a hardened non-root container, pre-configured volumes, and .env-based API key management.
            </p>
          </motion.article>

          <motion.article variants={cardVariants} className="relative group">
            <div className="absolute -left-[21px] md:-left-[53px] top-1.5 w-3 h-3 rounded-full bg-neutral-950 border border-cyan-500/50 group-hover:bg-cyan-400 transition-colors duration-300" aria-hidden="true" />
            <h3 className="text-xl md:text-2xl font-medium text-neutral-100 tracking-wide">MultiTask_ContextSwitch</h3>
            <p className="text-cyan-500/80 font-mono text-sm mt-2 mb-1">Python Developer // Feb. 2026 – Present</p>
            <p className="text-xs text-neutral-500 font-mono mb-4 uppercase tracking-wider">Saint Louis University</p>
            <p className="text-base leading-relaxed text-neutral-400 font-light max-w-2xl">
              Developed a Python-based workflow automator that monitors web-based AI generation and uses a PyQt6 engine to manage real-time window focus and UI states between browser and local tools.
            </p>
          </motion.article>

          <motion.article variants={cardVariants} className="relative group">
            <div className="absolute -left-[21px] md:-left-[53px] top-1.5 w-3 h-3 rounded-full bg-neutral-950 border border-cyan-500/50 group-hover:bg-cyan-400 transition-colors duration-300" aria-hidden="true" />
            <h3 className="text-xl md:text-2xl font-medium text-neutral-100 tracking-wide">WebDev_Campus-Navigator_CS312</h3>
            <p className="text-cyan-500/80 font-mono text-sm mt-2 mb-1">Full-Stack Developer // Dec. 2025</p>
            <p className="text-xs text-neutral-500 font-mono mb-4 uppercase tracking-wider">Saint Louis University</p>
            <p className="text-base leading-relaxed text-neutral-400 font-light max-w-2xl">
              Designed a containerized microservices web application using Docker, Go, Node.js, and PHP to serve scalable campus navigation requests, integrating Dijkstra&apos;s algorithm as the routing engine.
            </p>
          </motion.article>
        </div>
      </motion.div>
    </section>
  );
});

export default ExperienceSection;
