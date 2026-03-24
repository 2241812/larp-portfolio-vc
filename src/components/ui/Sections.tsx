"use client";
import React from 'react';
import { resumeData } from '@/data/resumeData';
import { motion, Variants } from 'framer-motion'; // <-- Import Variants here

export default function Sections() {
  // Explicitly tell TypeScript this is a Variants object
  const revealVariants: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <div className="relative z-10 flex flex-col w-full pointer-events-none [&>section]:pointer-events-auto">
      
      <section id="about me" className="min-h-screen flex items-center justify-end px-8 md:px-24 relative overflow-hidden">
        <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900/20 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '2px rgba(34,211,238,0.05)' }}>ABOUT ME</h2>
        </div>
        <motion.div 
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full max-w-2xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 tracking-wider uppercase">About Me</h3>
          <p className="text-lg leading-relaxed mb-4">
            I am a {resumeData.personalInfo.title} currently studying at {resumeData.education.university}. 
            With a GPA of {resumeData.education.gpa}, I am part of the class of {resumeData.education.classOf}.
          </p>
          <p className="text-lg leading-relaxed">
            I focus on automation and scalable software solutions. I have a demonstrated ability to manage end-to-end technical projects, from AI-integrated tools to multi-service architectures.
          </p>
        </motion.div>
      </section>

      <section id="experience" className="min-h-screen flex items-center justify-start px-8 md:px-24 relative overflow-hidden">
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-900/20 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '2px rgba(34,211,238,0.05)' }}>EXPERIENCE</h2>
        </div>
        <motion.div 
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full max-w-3xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <h3 className="text-3xl font-bold text-cyan-400 mb-8 tracking-wider uppercase">Experience & Roles</h3>
          <div className="space-y-8">
            {resumeData.projects.slice(0, 2).map((proj, idx) => (
              <div key={idx} className="border-l-2 border-cyan-800 pl-6 hover:border-cyan-400 transition-colors">
                <h4 className="text-xl font-bold text-neutral-100">{proj.title}</h4>
                <p className="text-cyan-500 font-mono text-sm mt-1 mb-3">{proj.role}</p>
                <p className="text-base leading-relaxed text-neutral-400">{proj.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="skills" className="min-h-screen flex items-center justify-end px-8 md:px-24 relative overflow-hidden">
        <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900/20 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '2px rgba(34,211,238,0.05)' }}>SKILLS</h2>
        </div>
        <motion.div 
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full max-w-2xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <h3 className="text-3xl font-bold text-cyan-400 mb-8 tracking-wider uppercase">Technical Skills</h3>
          <div className="mb-8">
            <h4 className="text-lg font-bold text-neutral-400 mb-4 uppercase tracking-widest border-b border-cyan-900/50 pb-2">Programming & Web</h4>
            <div className="flex flex-wrap gap-3">
              {resumeData.skills.programming.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 rounded-md text-sm font-mono">{skill}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-neutral-400 mb-4 uppercase tracking-widest border-b border-cyan-900/50 pb-2">Frameworks & Tools</h4>
            <div className="flex flex-wrap gap-3">
              {resumeData.skills.frameworks.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 rounded-md text-sm font-mono">{skill}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="projects" className="min-h-screen flex items-center justify-start px-8 md:px-24 relative overflow-hidden">
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-900/20 to-transparent tracking-tighter uppercase whitespace-nowrap" style={{ WebkitTextStroke: '2px rgba(34,211,238,0.05)' }}>PROJECTS</h2>
        </div>
        <motion.div 
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full max-w-3xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
        >
          <h3 className="text-3xl font-bold text-cyan-400 mb-8 tracking-wider uppercase">Featured Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="p-6 bg-cyan-950/20 border border-cyan-800/30 rounded-xl hover:border-cyan-500/50 transition-colors flex flex-col justify-between">
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
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="contact" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <h2 className="text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-900/20 to-transparent tracking-tighter uppercase text-center" style={{ WebkitTextStroke: '2px rgba(34,211,238,0.05)' }}>CONTACT</h2>
        </div>
        <motion.div 
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="w-full max-w-xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)] text-center"
        >
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 tracking-wider uppercase">Initiate Protocol</h3>
          <div className="space-y-6 font-mono text-lg">
            <p><span className="text-neutral-500 block text-sm mb-1">Email</span> <a href={`mailto:${resumeData.personalInfo.email}`} className="text-cyan-400 hover:underline">{resumeData.personalInfo.email}</a></p>
            <p><span className="text-neutral-500 block text-sm mb-1">Location</span> {resumeData.personalInfo.location}</p>
            <p><span className="text-neutral-500 block text-sm mb-1">LinkedIn</span> <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Profile Link</a></p>
          </div>
        </motion.div>
      </section>

    </div>
  );
}