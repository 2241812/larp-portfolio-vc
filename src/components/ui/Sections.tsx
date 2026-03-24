"use client";
import React, { useCallback, memo } from 'react';
import { resumeData } from '@/data/resumeData';
import { motion, Variants } from 'framer-motion';

// ── Inline confetti burst (no dependency) ──
const fireConfetti = (() => {
  let container: HTMLDivElement | null = null;

  return () => {
    const colors = ['#22d3ee', '#06b6d4', '#0891b2', '#ffffff', '#a5f3fc'];
    const count = 30; // Reduced from 40

    // Clean up previous container
    if (container) {
      container.remove();
    }

    container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(container);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const x = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * 360;
      const delay = Math.random() * 0.3;
      const duration = 1 + Math.random() * 1;
      const drift = (Math.random() - 0.5) * 200;

      el.style.cssText = `
        position:absolute;
        top:-20px;
        left:${x}%;
        width:${size}px;
        height:${size * 0.6}px;
        background:${color};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        transform:rotate(${rotation}deg);
        opacity:1;
      `;
      container.appendChild(el);

      el.animate(
        [
          { transform: `translateY(0) translateX(0) rotate(${rotation}deg)`, opacity: 1 },
          { transform: `translateY(${window.innerHeight + 50}px) translateX(${drift}px) rotate(${rotation + 720}deg)`, opacity: 0 },
        ],
        { duration: duration * 1000, delay: delay * 1000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' }
      );
    }

    setTimeout(() => {
      if (container) {
        container.remove();
        container = null;
      }
    }, 3000);
  };
})();

// ── Animations ──
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Sections = memo(function Sections() {
  const handleConfettiClick = useCallback(() => {
    fireConfetti();
  }, []);

  return (
    <div className="relative z-10 flex flex-col w-full pointer-events-none [&>section]:pointer-events-auto">

      {/* ──────────── ABOUT ME ──────────── */}
      <section id="about me" className="min-h-screen flex items-center justify-end px-8 md:px-24 relative overflow-hidden">
        <div className="absolute left-[5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[8rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900/15 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '1px rgba(34,211,238,0.03)' }}>ABOUT ME</h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="w-full max-w-2xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <motion.h3 variants={headingVariants} className="text-3xl font-bold text-cyan-400 mb-6 tracking-wider uppercase">About Me</motion.h3>
          <motion.p variants={cardVariants} className="text-lg leading-relaxed mb-4">
            I am a {resumeData.personalInfo.title} currently studying at {resumeData.education.university}.
            With a GPA of {resumeData.education.gpa}, I am part of the class of {resumeData.education.classOf}.
          </motion.p>
          <motion.p variants={cardVariants} className="text-lg leading-relaxed">
            I focus on automation and scalable software solutions. I have a demonstrated ability to manage end-to-end technical projects, from AI-integrated tools to multi-service architectures.
          </motion.p>
        </motion.div>
      </section>

      {/* ──────────── EXPERIENCE ──────────── */}
      <section id="experience" className="min-h-screen flex items-center justify-start px-8 md:px-24 relative overflow-hidden">
        <div className="absolute right-[5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[8rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-900/15 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '1px rgba(34,211,238,0.03)' }}>EXPERIENCE</h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full max-w-3xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <motion.h3 variants={headingVariants} className="text-3xl font-bold text-cyan-400 mb-8 tracking-wider uppercase">Experience & Roles</motion.h3>
          <div className="space-y-8">
            {resumeData.projects.slice(0, 2).map((proj, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="border-l-2 border-cyan-800 pl-6 hover:border-cyan-400 transition-colors"
              >
                <h4 className="text-xl font-bold text-neutral-100">{proj.title}</h4>
                <p className="text-cyan-500 font-mono text-sm mt-1 mb-3">{proj.role}</p>
                <p className="text-base leading-relaxed text-neutral-400">{proj.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ──────────── SKILLS ──────────── */}
      <section id="skills" className="min-h-screen flex items-center justify-end px-8 md:px-24 relative overflow-hidden">
        <div className="absolute left-[5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[8rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900/15 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '1px rgba(34,211,238,0.03)' }}>SKILLS</h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="w-full max-w-2xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <motion.h3 variants={headingVariants} className="text-3xl font-bold text-cyan-400 mb-8 tracking-wider uppercase">Technical Skills</motion.h3>

          <motion.div variants={cardVariants} className="mb-8">
            <h4 className="text-lg font-bold text-neutral-400 mb-4 uppercase tracking-widest border-b border-cyan-900/50 pb-2">Programming & Web</h4>
            <div className="flex flex-wrap gap-3">
              {resumeData.skills.programming.map((skill, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="px-3 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 rounded-md text-sm font-mono"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={cardVariants}>
            <h4 className="text-lg font-bold text-neutral-400 mb-4 uppercase tracking-widest border-b border-cyan-900/50 pb-2">Frameworks & Tools</h4>
            <div className="flex flex-wrap gap-3">
              {resumeData.skills.frameworks.map((skill, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="px-3 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 rounded-md text-sm font-mono"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ──────────── PROJECTS ──────────── */}
      <section id="projects" className="min-h-screen flex items-center justify-start px-8 md:px-24 relative overflow-hidden">
        <div className="absolute right-[5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[8rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-900/15 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '1px rgba(34,211,238,0.03)' }}>PROJECTS</h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="w-full max-w-3xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <motion.h3 variants={headingVariants} className="text-3xl font-bold text-cyan-400 mb-8 tracking-wider uppercase">Featured Projects</motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumeData.projects.map((proj, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ scale: 1.03, borderColor: "rgba(34,211,238,0.5)" }}
                transition={{ duration: 0.25 }}
                className="p-6 bg-cyan-950/20 border border-cyan-800/30 rounded-xl hover:border-cyan-500/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xl font-bold text-neutral-100">{proj.title}</h4>
                  <p className="text-cyan-500 font-mono text-xs mt-1 mb-3">{proj.role}</p>
                  <p className="text-sm leading-relaxed text-neutral-400 mb-4 line-clamp-3">{proj.description}</p>
                </div>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 text-xs font-mono uppercase tracking-widest">
                    View Repository {">"}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ──────────── CONTACT ──────────── */}
      <section id="contact" className="min-h-screen flex items-center justify-end px-8 md:px-24 relative overflow-hidden">
        <div className="absolute left-[5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[8rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900/15 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '1px rgba(34,211,238,0.03)' }}>CONTACT</h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full max-w-xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)] text-center"
        >
          <motion.h3 variants={headingVariants} className="text-3xl font-bold text-cyan-400 mb-4 tracking-wider uppercase">Initiate Protocol</motion.h3>
          <motion.p variants={cardVariants} className="text-neutral-500 text-sm font-mono mb-8">Establish a connection through any channel below.</motion.p>

          {/* Social Buttons Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GitHub */}
            <motion.a
              variants={cardVariants}
              href="https://github.com/2241812"
              target="_blank"
              rel="noreferrer"
              onClick={handleConfettiClick}
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(34,211,238,0.2), inset 0 0 30px rgba(34,211,238,0.05)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="group relative flex items-center gap-4 p-5 rounded-xl bg-neutral-950/80 border border-cyan-900/30 hover:border-cyan-400/60 cursor-pointer overflow-hidden no-underline"
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10" />
              <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.3)] transition-all duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div className="relative text-left">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">GitHub</span>
                <span className="text-sm font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors duration-300">@2241812</span>
              </div>
              <svg className="relative ml-auto w-4 h-4 text-neutral-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              variants={cardVariants}
              href={resumeData.personalInfo.linkedin}
              target="_blank"
              rel="noreferrer"
              onClick={handleConfettiClick}
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(34,211,238,0.2), inset 0 0 30px rgba(34,211,238,0.05)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="group relative flex items-center gap-4 p-5 rounded-xl bg-neutral-950/80 border border-cyan-900/30 hover:border-cyan-400/60 cursor-pointer overflow-hidden no-underline"
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10" />
              <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.3)] transition-all duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div className="relative text-left">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">LinkedIn</span>
                <span className="text-sm font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors duration-300">Narciso III Javier</span>
              </div>
              <svg className="relative ml-auto w-4 h-4 text-neutral-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>

            {/* Email */}
            <motion.a
              variants={cardVariants}
              href={`mailto:${resumeData.personalInfo.email}`}
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(34,211,238,0.2), inset 0 0 30px rgba(34,211,238,0.05)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="group relative flex items-center gap-4 p-5 rounded-xl bg-neutral-950/80 border border-cyan-900/30 hover:border-cyan-400/60 cursor-pointer overflow-hidden no-underline"
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10" />
              <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.3)] transition-all duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="relative text-left">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Email</span>
                <span className="text-sm font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors duration-300">{resumeData.personalInfo.email}</span>
              </div>
              <svg className="relative ml-auto w-4 h-4 text-neutral-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>

            {/* Phone */}
            <motion.a
              variants={cardVariants}
              href={`tel:${resumeData.personalInfo.phone}`}
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(34,211,238,0.2), inset 0 0 30px rgba(34,211,238,0.05)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="group relative flex items-center gap-4 p-5 rounded-xl bg-neutral-950/80 border border-cyan-900/30 hover:border-cyan-400/60 cursor-pointer overflow-hidden no-underline"
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10" />
              <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.3)] transition-all duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div className="relative text-left">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Phone</span>
                <span className="text-sm font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors duration-300">{resumeData.personalInfo.phone}</span>
              </div>
              <svg className="relative ml-auto w-4 h-4 text-neutral-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Location pill */}
          <motion.div variants={cardVariants} className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-950/60 border border-cyan-900/20">
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-xs font-mono text-neutral-500">{resumeData.personalInfo.location}</span>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
});

export default Sections;
