"use client";
import React, { useCallback, memo, useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { resumeData } from '@/data/resumeData';
import { motion, Variants, useAnimationControls } from 'framer-motion';

// ── Inline confetti burst (no dependency) ──
const fireConfetti = (() => {
  let container: HTMLDivElement | null = null;

  return () => {
    const colors = ['#22d3ee', '#06b6d4', '#0891b2', '#ffffff', '#a5f3fc'];
    const count = 30;

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

// ── Draggable Skill Pill ──
const DraggableSkillPill = memo(function DraggableSkillPill({ skill, index }: { skill: string; index: number }) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleClick = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);
  };

  return (
    <div ref={constraintsRef} className="relative inline-block">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 10px rgba(34, 211, 238, 0.1)',
          borderColor: '#22d3ee',
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.04, duration: 0.35 }}
        onClick={handleClick}
        className={`px-4 py-1.5 bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 rounded-md text-base font-mono cursor-grab select-none transition-colors duration-200 ${isFlashing ? '!bg-cyan-400 !text-neutral-950 !border-cyan-400' : ''}`}
      >
        {skill}
      </motion.div>
    </div>
  );
});

// ── Glitch Social Link ──
const GlitchSocialLink = memo(function GlitchSocialLink({ href, icon, label, value, onClick }: {
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
      className="group relative flex items-center gap-4 p-5 rounded-xl bg-neutral-950/80 border border-cyan-900/30 hover:border-cyan-400/60 cursor-pointer overflow-hidden no-underline"
    >
      {/* Matrix rain overlay on hover */}
      <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
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
      <svg className="relative ml-auto w-4 h-4 text-neutral-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.a>
  );
});

// ── Copyable Terminal Field ──
const CopyableField = memo(function CopyableField({ label, value, icon }: {
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
      className={`group relative flex items-center gap-4 p-5 rounded-xl bg-neutral-950/80 border transition-all duration-300 cursor-pointer overflow-hidden ${copied ? 'border-green-400/60 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-cyan-900/30 hover:border-cyan-400/60'}`}
    >
      <div className={`relative flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center transition-all duration-300 ${copied ? 'bg-green-900/30 border-green-800/40 text-green-400' : 'bg-cyan-900/30 border-cyan-800/40 text-cyan-400 group-hover:bg-cyan-800/50 group-hover:text-cyan-300'}`}>
        {icon}
      </div>
      <div className="relative text-left flex-1 min-w-0">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">{label}</span>
        <span className={`text-sm font-semibold transition-colors duration-300 block truncate ${copied ? 'text-green-400' : 'text-neutral-200 group-hover:text-cyan-300'}`}>
          {copied ? 'COPIED!' : value}
        </span>
      </div>
      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`relative flex-shrink-0 w-8 h-8 rounded-md border flex items-center justify-center transition-all duration-300 ${copied ? 'border-green-400/40 text-green-400 bg-green-900/20' : 'border-cyan-800/40 text-cyan-600 hover:text-cyan-400 hover:border-cyan-600/60 hover:bg-cyan-900/20'}`}
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </motion.button>
    </motion.div>
  );
});

// ── GitHub Pinned Repo Types ──
interface PinnedRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

interface UnifiedProject {
  title: string;
  description: string;
  language?: string;
  url?: string;
  stars?: number;
  forks?: number;
  source: 'resume' | 'github';
  role?: string;
}

// ── Skill-to-Project Mapping ──
const SKILL_KEYWORD_MAP: Record<string, string[]> = {
  'Python': ['python', 'pyqt6', 'automator', 'contextswitch'],
  'Go': ['go', 'golang', 'microservices'],
  'JavaScript (ES6+)': ['javascript', 'node.js', 'node', 'web'],
  'Node.js': ['node.js', 'node', 'javascript', 'express'],
  'PHP': ['php'],
  'C++': ['c++', 'computer vision', 'opencv'],
  'C#': ['c#', 'unity', 'ar foundation'],
  'Java': ['java'],
  'HTML': ['html', 'web', 'frontend'],
  'CSS': ['css', 'tailwind', 'styling'],
  'Docker': ['docker', 'container', 'containerized'],
  'Docker Compose': ['docker compose', 'docker-compose'],
  'VSCode Remote Containers': ['remote containers', 'devcontainer'],
  'CI/CD Pipelines': ['ci/cd', 'pipeline', 'deploy'],
  'Git/GitHub': ['git', 'github'],
  'PyQt6': ['pyqt6', 'qt', 'desktop'],
  'Unity 3D': ['unity', 'unity 3d', 'ar'],
  'AR Foundation': ['ar foundation', 'augmented reality', 'ar'],
  'AI Frameworks': ['ai', 'cnn', 'model', 'computer vision'],
  'OpenCode': ['opencode', 'ai development'],
};

// ── Skills List Component ──
const SkillsList = memo(function SkillsList({ activeSkill, setActiveSkill }: {
  activeSkill: string | null;
  setActiveSkill: (skill: string | null) => void;
}) {
  const allSkills = [
    ...resumeData.skills.programming,
    ...(resumeData.skills.infrastructure || []),
    ...resumeData.skills.frameworks,
    ...(resumeData.skills.coreCompetencies || []),
  ];

  const categoryMap: Record<string, string[]> = {
    'Programming & Web': resumeData.skills.programming,
    ...(resumeData.skills.infrastructure ? { 'Infrastructure & Tooling': resumeData.skills.infrastructure } : {}),
    'Frameworks & Libraries': resumeData.skills.frameworks,
    ...(resumeData.skills.coreCompetencies ? { 'Core Competencies': resumeData.skills.coreCompetencies } : {}),
  };

  return (
    <div className="space-y-6">
      {Object.entries(categoryMap).map(([category, skills]) => (
        <div key={category}>
          <h4 className="text-sm font-bold text-neutral-400 mb-3 uppercase tracking-widest border-b border-cyan-900/50 pb-2">
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => {
              const isActive = activeSkill === skill;
              return (
                <motion.button
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSkill(isActive ? null : skill)}
                  className={`px-3 py-1.5 text-sm font-mono rounded-md border transition-all duration-300 cursor-pointer select-none ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:border-cyan-500/50 hover:text-cyan-300'
                  }`}
                >
                  {skill}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

// ── Related Projects Panel Component ──
const RelatedProjectsPanel = memo(function RelatedProjectsPanel({
  activeSkill,
  allProjects,
  pinnedRepos,
}: {
  activeSkill: string | null;
  allProjects: UnifiedProject[];
  pinnedRepos: PinnedRepo[];
}) {
  const relatedProjects = activeSkill
    ? (() => {
        const keywords = SKILL_KEYWORD_MAP[activeSkill] || [activeSkill.toLowerCase()];
        const matches = allProjects.filter(project => {
          const searchable = `${project.title} ${project.description} ${project.language || ''} ${project.role || ''}`.toLowerCase();
          return keywords.some(kw => searchable.includes(kw.toLowerCase()));
        });

        if (matches.length > 0) return matches;

        return pinnedRepos.filter(repo => {
          const searchable = `${repo.name} ${repo.description} ${repo.language || ''}`.toLowerCase();
          return keywords.some(kw => searchable.includes(kw.toLowerCase()));
        }).map(repo => ({
          title: repo.name,
          description: repo.description,
          language: repo.language,
          url: repo.url,
          stars: repo.stars,
          forks: repo.forks,
          source: 'github' as const,
        }));
      })()
    : [];

  return (
    <div className="relative min-h-[400px] bg-neutral-900/30 border border-cyan-900/20 rounded-xl p-6 overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-900/20">
        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
        <span className="text-xs font-mono text-neutral-500">
          {activeSkill ? `query_results — ${activeSkill}` : 'awaiting_selection'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!activeSkill ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-64"
          >
            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs font-mono text-neutral-600 text-center"
            >
              [ SELECT A DATABANK TO VIEW RELATED PROTOCOLS ]
            </motion.p>
          </motion.div>
        ) : relatedProjects.length === 0 ? (
          <motion.div
            key="no-match"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-64"
          >
            <p className="text-xs font-mono text-neutral-600 text-center">
              [ NO RELATED PROTOCOLS FOUND FOR &quot;{activeSkill}&quot; ]
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeSkill}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 max-h-[400px] overflow-y-auto pr-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            {relatedProjects.map((project, idx) => (
              <ProjectResultCard key={project.title + idx} project={project} index={idx} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ── Project Result Card ──
const ProjectResultCard = memo(function ProjectResultCard({ project, index }: {
  project: UnifiedProject;
  index: number;
}) {
  const langColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    PHP: '#4F5D95',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Dockerfile: '#384d54',
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold text-neutral-100 font-mono group-hover:text-cyan-300 transition-colors">
          {project.title}
        </h4>
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
          project.source === 'github' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-neutral-800 text-neutral-400'
        }`}>
          {project.source === 'github' ? 'GH' : 'LOCAL'}
        </span>
      </div>
      <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
        {project.description}
      </p>
      <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-neutral-500">
        {project.language && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[project.language] || '#22d3ee' }} />
            {project.language}
          </span>
        )}
        {project.stars !== undefined && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {project.stars}
          </span>
        )}
      </div>
    </>
  );

  if (project.url) {
    return (
      <motion.a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, borderColor: '#22d3ee60' }}
        className="group block p-4 bg-neutral-950/60 border border-cyan-900/20 rounded-lg hover:border-cyan-500/40 transition-all duration-300 no-underline"
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, borderColor: '#22d3ee60' }}
      className="group block p-4 bg-neutral-950/60 border border-cyan-900/20 rounded-lg hover:border-cyan-500/40 transition-all duration-300"
    >
      {content}
    </motion.div>
  );
});

// ── Terminal Project Card ──
const TerminalProjectCard = memo(function TerminalProjectCard({ repo, index }: { repo: PinnedRepo; index: number }) {
  const langColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    PHP: '#4F5D95',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Dockerfile: '#384d54',
  };

  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      variants={cardVariants}
      whileHover={{ scale: 1.02, borderColor: '#22d3ee80' }}
      transition={{ duration: 0.25 }}
      className="group relative block p-0 bg-neutral-950/80 border border-cyan-800/30 rounded-xl hover:border-cyan-500/50 transition-all duration-300 overflow-hidden no-underline"
    >
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/60 border-b border-cyan-900/30">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 text-[10px] font-mono text-neutral-500 truncate">{repo.name}</span>
      </div>

      <div className="p-5">
        <h4 className="text-lg font-bold text-neutral-100 group-hover:text-cyan-300 transition-colors duration-300 font-mono">
          {repo.name}
        </h4>
        <p className="text-sm leading-relaxed text-neutral-400 mt-2 mb-4 line-clamp-3 min-h-[3rem]">
          {repo.description || 'No description provided.'}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColors[repo.language] || '#22d3ee' }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {repo.stars}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-neutral-950/80 border border-cyan-800/30 rounded-xl overflow-hidden"
      >
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

// ── Main Sections Component ──
const Sections = memo(function Sections() {
  const handleConfettiClick = useCallback(() => {
    fireConfetti();
  }, []);

  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  // GitHub pinned repos state
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [reposError, setReposError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Unified project data from resume + GitHub
  const allProjects: UnifiedProject[] = useMemo(() => [
    ...resumeData.projects.map(p => ({
      title: p.title,
      description: p.description,
      url: p.link,
      source: 'resume' as const,
      role: p.role,
    })),
    ...pinnedRepos.map(r => ({
      title: r.name,
      description: r.description,
      language: r.language,
      url: r.url,
      stars: r.stars,
      forks: r.forks,
      source: 'github' as const,
    })),
  ], [pinnedRepos]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPinnedRepos() {
      try {
        setReposError(false);
        const res = await fetch(`https://pinned.berrysauce.dev/get/2241812`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data: PinnedRepo[] = await res.json();
        if (cancelled) return;
        setPinnedRepos(data);
      } catch {
        if (cancelled) return;
        setReposError(true);
        console.error('Failed to fetch pinned repos');
      } finally {
        if (!cancelled) setReposLoading(false);
      }
    }

    fetchPinnedRepos();
    return () => { cancelled = true; };
  }, [retryCount]);

  const handleRetry = () => {
    setReposLoading(true);
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="relative z-10 flex flex-col w-full pointer-events-none [&>section]:pointer-events-auto max-w-5xl mx-auto">

      {/* ──────────── ABOUT ME ──────────── */}
      <section id="about me" className="min-h-screen flex items-center justify-start px-8 md:px-12 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="w-full max-w-3xl relative z-10 py-12"
        >
          <motion.div variants={headingVariants} className="flex items-center gap-4 mb-8">
            <div className="w-8 h-[1px] bg-cyan-500/50" />
            <h3 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">01. About Me</h3>
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

      {/* ──────────── EXPERIENCE ──────────── */}
      <section id="experience" className="min-h-screen flex items-center justify-start px-8 md:px-12 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full max-w-4xl relative z-10 py-12"
        >
          <motion.div variants={headingVariants} className="flex items-center gap-4 mb-12">
            <div className="w-8 h-[1px] bg-cyan-500/50" />
            <h3 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">02. Experience</h3>
          </motion.div>
          
          <div className="space-y-12 pl-4 md:pl-12 border-l border-neutral-800/50">
            <motion.div variants={cardVariants} className="relative group">
              <div className="absolute -left-[21px] md:-left-[53px] top-1.5 w-3 h-3 rounded-full bg-neutral-950 border border-cyan-500/50 group-hover:bg-cyan-400 transition-colors duration-300" />
              <h4 className="text-xl md:text-2xl font-medium text-neutral-100 tracking-wide">OpenCode-VSCode-Setup</h4>
              <p className="text-cyan-500/80 font-mono text-sm mt-2 mb-1">Environment Architect // Mar. 2026 – Present</p>
              <p className="text-xs text-neutral-500 font-mono mb-4 uppercase tracking-wider">Saint Louis University</p>
              <p className="text-base leading-relaxed text-neutral-400 font-light max-w-2xl">
                Engineered a Docker-based VSCode Remote Containers setup that runs an OpenCode AI development environment directly inside the terminal, with a hardened non-root container, pre-configured volumes, and .env-based API key management.
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="relative group">
              <div className="absolute -left-[21px] md:-left-[53px] top-1.5 w-3 h-3 rounded-full bg-neutral-950 border border-cyan-500/50 group-hover:bg-cyan-400 transition-colors duration-300" />
              <h4 className="text-xl md:text-2xl font-medium text-neutral-100 tracking-wide">MultiTask_ContextSwitch</h4>
              <p className="text-cyan-500/80 font-mono text-sm mt-2 mb-1">Python Developer // Feb. 2026 – Present</p>
              <p className="text-xs text-neutral-500 font-mono mb-4 uppercase tracking-wider">Saint Louis University</p>
              <p className="text-base leading-relaxed text-neutral-400 font-light max-w-2xl">
                Developed a Python-based workflow automator that monitors web-based AI generation and uses a PyQt6 engine to manage real-time window focus and UI states between browser and local tools.
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="relative group">
              <div className="absolute -left-[21px] md:-left-[53px] top-1.5 w-3 h-3 rounded-full bg-neutral-950 border border-cyan-500/50 group-hover:bg-cyan-400 transition-colors duration-300" />
              <h4 className="text-xl md:text-2xl font-medium text-neutral-100 tracking-wide">WebDev_Campus-Navigator_CS312</h4>
              <p className="text-cyan-500/80 font-mono text-sm mt-2 mb-1">Full-Stack Developer // Dec. 2025</p>
              <p className="text-xs text-neutral-500 font-mono mb-4 uppercase tracking-wider">Saint Louis University</p>
              <p className="text-base leading-relaxed text-neutral-400 font-light max-w-2xl">
                Designed a containerized microservices web application using Docker, Go, Node.js, and PHP to serve scalable campus navigation requests, integrating Dijkstra&apos;s algorithm as the routing engine.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ──────────── SKILLS ──────────── */}
      <section id="skills" className="min-h-screen flex items-center justify-start px-8 md:px-12 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="w-full max-w-5xl relative z-10 py-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <motion.div variants={headingVariants} className="flex items-center gap-4">
              <div className="w-8 h-[1px] bg-cyan-500/50" />
              <h3 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">03. Skills</h3>
            </motion.div>
            <motion.p variants={cardVariants} className="text-xs font-mono text-neutral-500">
              [ SELECT SKILL TO FILTER PROJECTS ]
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
            <SkillsList activeSkill={activeSkill} setActiveSkill={setActiveSkill} />
            <RelatedProjectsPanel
              activeSkill={activeSkill}
              allProjects={allProjects}
              pinnedRepos={pinnedRepos}
            />
          </div>
        </motion.div>
      </section>

      {/* ──────────── PROJECTS ──────────── */}
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
              <div className="w-8 h-[1px] bg-cyan-500/50" />
              <h3 className="text-2xl font-mono text-cyan-400 tracking-widest uppercase">04. Featured Output</h3>
            </motion.div>
            <motion.p variants={cardVariants} className="text-xs font-mono text-neutral-500">
              [ LIVE REPOSITORIES ]
            </motion.p>
          </div>

          {reposLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProjectSkeleton />
              <ProjectSkeleton />
            </div>
          ) : reposError ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-left py-12">
              <div className="text-cyan-400 font-mono text-sm mb-4">[ CONNECTION FAILED ]</div>
              <button onClick={handleRetry} className="px-6 py-2 text-xs font-mono uppercase tracking-wider rounded border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/10 transition-colors cursor-pointer">
                RETRY
              </button>
            </motion.div>
          ) : pinnedRepos.length === 0 ? (
            <div className="text-neutral-500 font-mono text-sm">[ NO DATA ]</div>
          ) : (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pinnedRepos.map((repo, idx) => (
                <TerminalProjectCard key={repo.name} repo={repo} index={idx} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ──────────── CONTACT ──────────── */}
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
              <div className="w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-500/80 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60 hover:bg-yellow-500/80 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-green-500/60 hover:bg-green-500/80 transition-colors" />
              <span className="ml-3 text-xs font-mono text-neutral-500">contact_protocol.sh — bash</span>
            </div>

            {/* Terminal Content */}
            <div className="p-8 md:p-10">
              <motion.h3 variants={headingVariants} className="text-2xl font-bold text-cyan-400 mb-2 tracking-wider uppercase font-mono">
                <span className="text-neutral-600">$</span> initiate_protocol
              </motion.h3>
              <motion.p variants={cardVariants} className="text-neutral-500 text-xs font-mono mb-8">Establish a connection through any channel below.</motion.p>

              {/* Social Links Grid */}
              <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <GlitchSocialLink
                  href="https://github.com/2241812"
                  onClick={handleConfettiClick}
                  icon={
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  }
                />
                <CopyableField
                  label="Phone"
                  value={resumeData.personalInfo.phone}
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  }
                />
              </motion.div>

              {/* Location Pill */}
              <motion.div variants={cardVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/60 border border-cyan-900/20">
                <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-xs font-mono text-neutral-500">{resumeData.personalInfo.location}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
});

export default Sections;
