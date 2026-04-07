"use client";
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { containerVariants, cardVariants, headingVariants, langColors, type PinnedRepo } from './shared';

// ── Terminal Project Card ──
const TerminalProjectCard = memo(function TerminalProjectCard({ repo, index }: { repo: PinnedRepo; index: number }) {
  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      variants={cardVariants}
      whileHover={{ scale: 1.02, borderColor: '#22d3ee80' }}
      transition={{ duration: 0.25 }}
      className="group relative block p-0 bg-neutral-950/80 border border-cyan-800/30 rounded-xl hover:border-cyan-500/50 transition-all duration-300 overflow-hidden no-underline focus:outline-none focus:ring-2 focus:ring-cyan-400"
    >
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/60 border-b border-cyan-900/30">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" aria-hidden="true" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" aria-hidden="true" />
        <span className="ml-2 text-[10px] font-mono text-neutral-500 truncate">{repo.name}</span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-neutral-100 group-hover:text-cyan-300 transition-colors duration-300 font-mono">
          {repo.name}
        </h3>
        <p className="text-sm leading-relaxed text-neutral-400 mt-2 mb-4 line-clamp-3 min-h-[3rem]">
          {repo.description || 'No description provided.'}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: langColors[repo.language] || '#22d3ee' }}
                aria-hidden="true"
              />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span className="sr-only">Stars:</span>
            {repo.stars}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span className="sr-only">Forks:</span>
            {repo.forks}
          </span>
        </div>
      </div>
    </motion.a>
  );
});

// ── Loading Skeleton for Projects ──
const ProjectSkeleton = memo(function ProjectSkeleton() {
  return (
    <div className="col-span-1 md:col-span-2">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-neutral-950/80 border border-cyan-800/30 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/60 border-b border-cyan-900/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60 animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60 animate-pulse" />
          <span className="ml-2 text-[10px] font-mono text-neutral-500 animate-pulse">connecting...</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse" />
          <div className="h-3 w-full bg-neutral-800/60 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-neutral-800/60 rounded animate-pulse" />
          <div className="flex gap-4 mt-4">
            <div className="h-4 w-20 bg-neutral-800/40 rounded animate-pulse" />
            <div className="h-4 w-12 bg-neutral-800/40 rounded animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
});

// ── Main Projects Section ──
interface ProjectsSectionProps {
  pinnedRepos: PinnedRepo[];
  reposLoading: boolean;
  reposError: boolean;
  onRetry: () => void;
}

const ProjectsSection = memo(function ProjectsSection({ pinnedRepos, reposLoading, reposError, onRetry }: ProjectsSectionProps) {
  return (
    <section id="projects" className="min-h-screen flex items-center justify-start px-8 md:px-12 relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="w-full max-w-5xl relative z-10 py-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <motion.div variants={headingVariants} className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-cyan-500/50" aria-hidden="true" />
            <h2 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">04. Featured Output</h2>
          </motion.div>
          <motion.p variants={cardVariants} className="text-xs font-mono text-neutral-500">
            [ LIVE REPOSITORIES ]
          </motion.p>
        </div>

        {reposLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Loading projects">
            <ProjectSkeleton />
            <ProjectSkeleton />
          </div>
        ) : reposError ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-left py-12" role="alert">
            <div className="text-cyan-400 font-mono text-sm mb-4">[ CONNECTION FAILED ]</div>
            <button
              onClick={onRetry}
              className="px-6 py-2 text-xs font-mono uppercase tracking-wider rounded border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              RETRY
            </button>
          </motion.div>
        ) : pinnedRepos.length === 0 ? (
          <div className="text-neutral-500 font-mono text-sm">[ NO DATA ]</div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pinnedRepos.map((repo) => (
              <TerminalProjectCard key={repo.name} repo={repo} index={0} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
});

export default ProjectsSection;
