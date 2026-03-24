"use client";
import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

// ── Stat card data ──
interface StatData {
  label: string;
  value: string;
  icon: string;
}

// ── Image URLs ──
const STATS_IMG = 'https://github-readme-stats.vercel.app/api?username=2241812&theme=tokyonight&show_icons=true&hide_border=true';
const STREAK_IMG = 'https://github-streak-stats.herokuapp.com/?user=2241812&theme=tokyo-night&hide_border=true';
const ACTIVITY_GRAPH = 'https://github-readme-activity-graph.vercel.app/graph?username=2241812&theme=tokyo-night&hide_border=true';

// ── Animations ──
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ── Skeleton Loader ──
function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-900/80 border border-cyan-900/20 rounded-xl flex items-center justify-center ${className}`}>
      <svg className="w-8 h-8 text-cyan-900/40 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

// ── Embed Image with loading/error states ──
function EmbedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={`bg-neutral-900/60 border border-red-900/30 rounded-xl flex flex-col items-center justify-center p-6 ${className}`}>
        <svg className="w-8 h-8 text-neutral-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span className="text-xs text-neutral-600 font-mono">{alt} unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!loaded && <ImageSkeleton className={className} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'} ${className}`}
      />
    </div>
  );
}

// ── Main Component ──
export default function GitHubStats() {
  const [stats, setStats] = useState<StatData[]>([
    { label: 'Public Repos', value: '...', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { label: 'Followers', value: '...', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Following', value: '...', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { label: 'Member Since', value: '...', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]);

  useEffect(() => {
    async function fetchGitHubStats() {
      try {
        const res = await fetch('https://api.github.com/users/2241812');
        const data = await res.json();
        const memberSince = new Date(data.created_at).getFullYear();
        
        setStats([
          { label: 'Public Repos', value: String(data.public_repos || 0), icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
          { label: 'Followers', value: String(data.followers || 0), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'Following', value: String(data.following || 0), icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
          { label: 'Member Since', value: String(memberSince), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        ]);
      } catch (err) {
        console.error('Failed to fetch GitHub stats:', err);
      }
    }
    fetchGitHubStats();
  }, []);

  return (
    <section
      id="github"
      className="min-h-screen flex items-center justify-start px-4 md:px-24 py-24 relative overflow-hidden"
    >
      {/* Background watermark */}
      <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
        <h2
          className="text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900/20 to-transparent tracking-tighter uppercase whitespace-nowrap"
          style={{ WebkitTextStroke: '2px rgba(34,211,238,0.05)' }}
        >
          GITHUB
        </h2>
      </div>

      {/* Neon glow accent */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-5xl relative z-10"
      >
        {/* Section Header */}
        <motion.div variants={headingVariants} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-30" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              GitHub Overview
            </h2>
          </div>
          <div className="w-32 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
        </motion.div>

        {/* Stat Cards Row */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                borderColor: 'rgba(34,211,238,0.5)',
                boxShadow: '0 0 30px rgba(34,211,238,0.15)',
              }}
              transition={{ duration: 0.25 }}
              className="group relative bg-neutral-950/70 backdrop-blur-xl border border-cyan-900/30 rounded-xl p-5 flex flex-col items-center text-center cursor-default overflow-hidden"
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-500/40 to-transparent" />
                <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-cyan-500/40 to-transparent" />
              </div>

              <div className="w-10 h-10 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-3 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <span className="text-2xl md:text-3xl font-black text-neutral-100 tracking-tight" style={{ fontFamily: 'var(--font-orbitron)' }}>
                {stat.value}
              </span>
              <span className="text-[10px] md:text-xs text-neutral-500 font-mono uppercase tracking-widest mt-1">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Two-column layout: Stats + Streak */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {/* GitHub Stats Card */}
          <motion.div
            variants={fadeInVariants}
            whileHover={{
              borderColor: 'rgba(34,211,238,0.4)',
              boxShadow: '0 0 40px rgba(34,211,238,0.08)',
            }}
            className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Stats</h3>
            </div>
            <EmbedImage
              src={STATS_IMG}
              alt="GitHub Stats"
              className="w-full rounded-lg"
            />
          </motion.div>

          {/* GitHub Streak Card */}
          <motion.div
            variants={fadeInVariants}
            whileHover={{
              borderColor: 'rgba(34,211,238,0.4)',
              boxShadow: '0 0 40px rgba(34,211,238,0.08)',
            }}
            className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Streak</h3>
            </div>
            <EmbedImage
              src={STREAK_IMG}
              alt="GitHub Streak"
              className="w-full rounded-lg"
            />
          </motion.div>
        </motion.div>

        {/* Full-width Contribution Graph */}
        <motion.div
          variants={fadeInVariants}
          whileHover={{
            borderColor: 'rgba(34,211,238,0.4)',
            boxShadow: '0 0 40px rgba(34,211,238,0.08)',
          }}
          className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Contribution Activity</h3>
          </div>
          <EmbedImage
            src={ACTIVITY_GRAPH}
            alt="Contribution Activity Graph"
            className="w-full rounded-lg"
          />
        </motion.div>

        {/* Link to full profile */}
        <motion.div variants={cardVariants} className="flex justify-end">
          <a
            href="https://github.com/2241812"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-neutral-600 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group"
          >
            View full GitHub profile
            <svg
              className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
