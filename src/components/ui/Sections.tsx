"use client";
import React from 'react';
import { resumeData } from '@/data/resumeData';
import { motion, Variants } from 'framer-motion';

export default function Sections() {
  // Container variant for staggered children
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  // Individual card / child variant
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Simple reveal for the section heading text
  const headingVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="relative z-10 flex flex-col w-full pointer-events-none [&>section]:pointer-events-auto">

      {/* ──────────── ABOUT ME ──────────── */}
      <section id="about me" className="min-h-screen flex items-center justify-end px-8 md:px-24 relative overflow-hidden">
        <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
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
        <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
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
        <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
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
        <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
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
        <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[8rem] md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900/15 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '1px rgba(34,211,238,0.03)' }}>CONTACT</h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full max-w-xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)] text-center"
        >
          <motion.h3 variants={headingVariants} className="text-3xl font-bold text-cyan-400 mb-6 tracking-wider uppercase">Initiate Protocol</motion.h3>
          <div className="space-y-6 font-mono text-lg">
            <motion.p variants={cardVariants}><span className="text-neutral-500 block text-sm mb-1">Email</span> <a href={`mailto:${resumeData.personalInfo.email}`} className="text-cyan-400 hover:underline">{resumeData.personalInfo.email}</a></motion.p>
            <motion.p variants={cardVariants}><span className="text-neutral-500 block text-sm mb-1">Location</span> {resumeData.personalInfo.location}</motion.p>
            <motion.p variants={cardVariants}><span className="text-neutral-500 block text-sm mb-1">LinkedIn</span> <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Profile Link</a></motion.p>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
