"use client";
import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * GlitchSocialLink - Interactive social media link with glitch hover effect
 * Features: Custom callback on click, glitch animation on hover, accessible focus states
 */
export const GlitchSocialLink = memo(function GlitchSocialLink({
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
      <div
        className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        aria-hidden="true"
      >
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

      {/* Icon Container */}
      <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.3)] transition-all duration-300">
        {icon}
      </div>

      {/* Text Content */}
      <div className="relative text-left">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
          {label}
        </span>
        <motion.span
          className="text-sm font-semibold text-neutral-200 group-hover:text-cyan-300 transition-colors duration-300 block"
          animate={isGlitching ? { x: [0, -2, 2, -1, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.span>
      </div>

      {/* Arrow Icon */}
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

/**
 * CopyableField - Interactive field with copy-to-clipboard functionality
 * Features: Visual feedback on copy, fallback for older browsers, accessible buttons
 */
export const CopyableField = memo(function CopyableField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
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
      {/* Icon Container */}
      <div
        className={`relative flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-300 ${
          copied
            ? 'bg-green-900/30 border-green-800/40 text-green-400'
            : 'bg-cyan-900/30 border-cyan-800/40 text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300'
        }`}
      >
        {icon}
      </div>

      {/* Text Content */}
      <div className="relative text-left flex-1 min-w-0">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
          {label}
        </span>
        <span
          className={`text-sm font-semibold transition-colors duration-300 block truncate ${
            copied ? 'text-green-400' : 'text-neutral-200 group-hover:text-cyan-300'
          }`}
        >
          {copied ? 'COPIED!' : value}
        </span>
      </div>

      {/* Copy Button */}
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
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
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
