"use client";
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { resumeData } from '@/data/resumeData';
import { containerVariants, cardVariants, headingVariants } from './shared';

// ── Social Card Component ──
const SocialCard = memo(function SocialCard({
  icon,
  label,
  value,
  href,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  delay?: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, borderColor: 'rgba(34, 211, 238, 0.6)' }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-3 rounded-lg font-mono text-sm border transition-all duration-300 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-neutral-950 bg-neutral-900/50 text-neutral-300 border-neutral-800 hover:border-cyan-500/50 hover:text-cyan-300"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div className="text-left">
          <div className="text-xs uppercase tracking-widest text-neutral-500">{label}</div>
          <div className="text-sm font-semibold text-neutral-200">{value}</div>
        </div>
      </div>
    </motion.a>
  );
});

const AboutSection = memo(function AboutSection() {
  return (
    <section id="about" className="min-h-screen flex items-center justify-start px-8 md:px-12 relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="w-full max-w-4xl relative z-10 py-12"
      >
        <motion.div variants={headingVariants} className="flex items-center gap-4 mb-8">
          <div className="w-8 h-[1px] bg-cyan-500/50" aria-hidden="true" />
          <h2 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">01. About Me</h2>
        </motion.div>
        
        <motion.div variants={cardVariants} className="mb-10">
          <h3 className="text-2xl md:text-3xl font-bold text-neutral-100 mb-2">
            {resumeData.personalInfo.name}
          </h3>
          <p className="text-lg text-cyan-400/80 font-mono mb-6">
            AI Development Intern | Full-Stack Engineer
          </p>
          <p className="text-base md:text-lg leading-relaxed text-neutral-400 font-light max-w-3xl">
            Computer Science student at Saint Louis University focusing on scalable system architecture, containerization, and AI workflow automation. I enjoy building reproducible AI development environments and multi-service applications that feel reliable and easy to extend.
          </p>
        </motion.div>

        {/* Social Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
          <SocialCard
            icon="🐙"
            label="GitHub"
            value="@2241812"
            href="https://github.com/2241812"
            delay={0}
          />
          <SocialCard
            icon="💼"
            label="LinkedIn"
            value="Narciso III"
            href={resumeData.personalInfo.linkedin}
            delay={0.1}
          />
          <SocialCard
            icon="📧"
            label="Email"
            value="Get in Touch"
            href={`mailto:${resumeData.personalInfo.email}`}
            delay={0.2}
          />
          <SocialCard
            icon="📍"
            label="Location"
            value={resumeData.personalInfo.location}
            href="#"
            delay={0.3}
          />
        </motion.div>
      </motion.div>
    </section>
  );
});

export default AboutSection;
