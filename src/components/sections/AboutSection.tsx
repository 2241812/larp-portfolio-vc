"use client";
import React, { memo, useState } from 'react';
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
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePos({ x: x * 10, y: y * 10 });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePos({ x: 0, y: 0 });
  };
  return (
    <section id="about" className="min-h-screen flex items-center justify-center px-8 md:px-12 relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="w-full max-w-6xl relative z-10 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left Content */}
        <div>
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
            <p className="text-base md:text-lg leading-relaxed text-neutral-400 font-light">
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
            value={resumeData.personalInfo.email}
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
        </div>

        {/* Right Image */}
        <motion.div
          variants={cardVariants}
          className="flex items-center justify-center"
          onMouseEnter={() => setIsHovering(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative w-full max-w-sm">
            {/* Animated Border Glow */}
            <motion.div 
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/20 via-cyan-400/5 to-transparent blur-2xl"
              animate={isHovering ? {
                opacity: [0.3, 0.6, 0.3],
              } : { opacity: 0.2 }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Parallax Container */}
            <motion.div
              className="relative"
              animate={{
                rotateX: isHovering ? mousePos.y : 0,
                rotateY: isHovering ? -mousePos.x : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 60 }}
              style={{ perspective: 1000 }}
            >
              {/* Image container */}
              <motion.div 
                className="relative rounded-xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid rgba(34, 211, 238, 0.3)', boxShadow: '0 0 25px rgba(34, 211, 238, 0.1)' }}
                whileHover={{ 
                  borderColor: 'rgba(34, 211, 238, 0.8)',
                  boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  src="/profile.jpg"
                  alt="Narciso"
                  className="w-full h-auto object-cover aspect-square"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4 }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* Animated Decorative Corners */}
              <motion.div 
                className="absolute -top-2 -left-2 rounded-tl-lg"
                style={{ width: 32, height: 32, borderTop: '2px solid rgba(34, 211, 238, 0.4)', borderLeft: '2px solid rgba(34, 211, 238, 0.4)' }}
                animate={isHovering ? { 
                  borderColor: 'rgba(34, 211, 238, 0.8)',
                  width: 12,
                  height: 12
                } : { 
                  borderColor: 'rgba(34, 211, 238, 0.4)',
                  width: 32,
                  height: 32
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div 
                className="absolute -top-2 -right-2 rounded-tr-lg"
                style={{ width: 32, height: 32, borderTop: '2px solid rgba(34, 211, 238, 0.4)', borderRight: '2px solid rgba(34, 211, 238, 0.4)' }}
                animate={isHovering ? { 
                  borderColor: 'rgba(34, 211, 238, 0.8)',
                  width: 12,
                  height: 12
                } : { 
                  borderColor: 'rgba(34, 211, 238, 0.4)',
                  width: 32,
                  height: 32
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div 
                className="absolute -bottom-2 -left-2 rounded-bl-lg"
                style={{ width: 32, height: 32, borderBottom: '2px solid rgba(34, 211, 238, 0.4)', borderLeft: '2px solid rgba(34, 211, 238, 0.4)' }}
                animate={isHovering ? { 
                  borderColor: 'rgba(34, 211, 238, 0.8)',
                  width: 12,
                  height: 12
                } : { 
                  borderColor: 'rgba(34, 211, 238, 0.4)',
                  width: 32,
                  height: 32
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div 
                className="absolute -bottom-2 -right-2 rounded-br-lg"
                style={{ width: 32, height: 32, borderBottom: '2px solid rgba(34, 211, 238, 0.4)', borderRight: '2px solid rgba(34, 211, 238, 0.4)' }}
                animate={isHovering ? { 
                  borderColor: 'rgba(34, 211, 238, 0.8)',
                  width: 12,
                  height: 12
                } : { 
                  borderColor: 'rgba(34, 211, 238, 0.4)',
                  width: 32,
                  height: 32
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Center Pulse Ring on Hover */}
            {isHovering && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ border: '2px solid rgba(34, 211, 238, 0.2)' }}
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
});

export default AboutSection;
