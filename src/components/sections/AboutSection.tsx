"use client";
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { resumeData } from '@/data/resumeData';
import { containerVariants, cardVariants, headingVariants } from './shared';

const AboutSection = memo(function AboutSection() {
  return (
    <section id="about me" className="min-h-screen flex items-center justify-start px-8 md:px-12 relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="w-full max-w-3xl relative z-10 py-12"
      >
        <motion.div variants={headingVariants} className="flex items-center gap-4 mb-8">
          <div className="w-8 h-[1px] bg-cyan-500/50" aria-hidden="true" />
          <h2 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">01. About Me</h2>
        </motion.div>
        
        <motion.p variants={cardVariants} className="text-lg md:text-xl leading-relaxed text-neutral-300 mb-6 font-light">
          I am a {resumeData.personalInfo.title} at {resumeData.education.university}, pursuing a {resumeData.education.degree}.
          With a GPA of {resumeData.education.gpa}, I am part of the class of {resumeData.education.classOf}.
        </motion.p>
        <motion.p variants={cardVariants} className="text-lg md:text-xl leading-relaxed text-neutral-400 font-light">
          My work focuses on scalable system architecture, containerization, and AI workflow automation—building reproducible AI development environments and multi-service web applications that are reliable and easy to extend.
        </motion.p>
      </motion.div>
    </section>
  );
});

export default AboutSection;
