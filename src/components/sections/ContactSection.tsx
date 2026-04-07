"use client";
import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { resumeData } from '@/data/resumeData';
import { containerVariants, cardVariants, headingVariants, fireConfetti } from './shared';

// ── Glitch Social Link ──
const GlitchSocialLink = memo(function GlitchSocialLink({
  href,
  icon,
  label,
  value,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const [isGlitching, setIsGlitching] = useState(false);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      onHoverStart={() => setIsGlitching(true)}
      onHoverEnd={() => setIsGlitching(false)}
      whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(34,211,238,0.2), inset 0 0 30px rgba(34,211,238,0.05)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group relative flex items-center gap-4 p-5 rounded-xl bg-neutral-950/80 border border-cyan-900/30 hover:border-cyan-400/60 cursor-pointer overflow-hidden no-underline focus:outline-none focus:ring-2 focus:ring-cyan-400"
    >
      {/* Matrix rain overlay on hover */}
      <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5" />
        {isGlitching && (
          <>
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-cyan-400/5"
              animate={{ y: [0, -10, 5, 0] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-cyan-400/3"
              animate={{ y: [0, 8, -3, 0] }}
              transition={{ duration: 0.15, repeat: Infinity }}
            />
          </>
        )}
      </div>

      <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.3)] transition-all duration-300">
        {icon}
      </div>
      <div className="relative text-left">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">{label}</span>
        <motion.span
          className="text-sm font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors duration-300 block"
          animate={isGlitching ? { x: [0, -2, 2, -1, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.span>
      </div>
      <svg
        className="relative ml-auto w-4 h-4 text-neutral-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.a>
  );
});

// ── Copyable Terminal Field ──
const CopyableField = memo(function CopyableField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`group relative flex items-center gap-4 p-5 rounded-xl bg-neutral-950/80 border transition-all duration-300 cursor-pointer overflow-hidden ${
        copied ? 'border-green-400/60 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-cyan-900/30 hover:border-cyan-400/60'
      }`}
    >
      <div
        className={`relative flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-300 ${
          copied
            ? 'bg-green-900/30 border-green-800/40 text-green-400'
            : 'bg-cyan-900/30 border-cyan-800/40 text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300'
        }`}
      >
        {icon}
      </div>
      <div className="relative text-left flex-1 min-w-0">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">{label}</span>
        <span
          className={`text-sm font-semibold transition-colors duration-300 block truncate ${
            copied ? 'text-green-400' : 'text-neutral-200 group-hover:text-cyan-300'
          }`}
        >
          {copied ? 'COPIED!' : value}
        </span>
      </div>
      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={copied ? 'Copied' : `Copy ${label}`}
        className={`relative flex-shrink-0 w-8 h-8 rounded-md border flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
          copied
            ? 'border-green-400/40 text-green-400 bg-green-900/20'
            : 'border-cyan-800/40 text-cyan-600 hover:text-cyan-400 hover:border-cyan-600/60 hover:bg-cyan-900/20'
        }`}
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </motion.button>
    </motion.div>
  );
});

// ── Main Contact Section ──
const ContactSection = memo(function ContactSection() {
  const handleConfettiClick = useCallback(() => {
    fireConfetti();
  }, []);

  return (
    <section id="contact" className="min-h-screen flex items-center justify-center px-8 md:px-12 relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Terminal Window Frame */}
        <div className="bg-neutral-950/90 backdrop-blur-xl border border-cyan-900/40 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.05)]">
          {/* Terminal Title Bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900/60 border-b border-cyan-900/30">
            <div className="w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-500/80 transition-colors" aria-hidden="true" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60 hover:bg-yellow-500/80 transition-colors" aria-hidden="true" />
            <div className="w-3 h-3 rounded-full bg-green-500/60 hover:bg-green-500/80 transition-colors" aria-hidden="true" />
            <span className="ml-3 text-xs font-mono text-neutral-500">contact_protocol.sh — bash</span>
          </div>

          {/* Terminal Content */}
          <div className="p-8 md:p-10">
            <motion.h2 variants={headingVariants} className="text-2xl font-bold text-cyan-400 mb-2 tracking-wider uppercase font-mono">
              <span className="text-neutral-600" aria-hidden="true">$</span> initiate_protocol
            </motion.h2>
            <motion.p variants={cardVariants} className="text-neutral-500 text-xs font-mono mb-8">
              Establish a connection through any channel below.
            </motion.p>

            {/* Social Links Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <GlitchSocialLink
                href="https://github.com/2241812"
                onClick={handleConfettiClick}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                }
                label="GitHub"
                value="@2241812"
              />
              <GlitchSocialLink
                href={resumeData.personalInfo.linkedin}
                onClick={handleConfettiClick}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                }
                label="LinkedIn"
                value="Narciso III Javier"
              />
            </motion.div>

            {/* Copyable Fields */}
            <motion.div variants={containerVariants} className="space-y-3 mb-6">
              <CopyableField
                label="Email"
                value={resumeData.personalInfo.email}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                }
              />
              <CopyableField
                label="Phone"
                value={resumeData.personalInfo.phone}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                }
              />
            </motion.div>

            {/* Location Pill */}
            <motion.div variants={cardVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/60 border border-cyan-900/20">
              <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-xs font-mono text-neutral-500">{resumeData.personalInfo.location}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
});

export default ContactSection;
