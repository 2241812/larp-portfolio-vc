"use client";
import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeData } from '@/data/resumeData';
import { useInView } from '@/hooks/useInView';
import { useGitHubAnalyzer } from '@/hooks/useGitHubAnalyzer';
import { mergeSkillsWithGitHub, type EnhancedSkill } from '@/utils/skillsAnalyzer';
import {
  containerVariants,
  cardVariants,
  headingVariants,
  langColors,
  SKILL_KEYWORD_MAP,
  type PinnedRepo,
  type UnifiedProject,
} from './shared';

// ── Skills List Component ──
const SkillsList = memo(function SkillsList({
  activeSkill,
  setActiveSkill,
  enhancedSkills,
  isLoadingGitHub,
}: {
  activeSkill: string | null;
  setActiveSkill: (skill: string | null) => void;
  enhancedSkills: Record<string, EnhancedSkill[]>;
  isLoadingGitHub: boolean;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {Object.entries(enhancedSkills).map(([category, skills]) => (
        <div key={category}>
          <h4 className="text-xs sm:text-sm font-bold text-neutral-400 mb-2 sm:mb-3 uppercase tracking-widest border-b border-cyan-900/50 pb-2">
            {category}
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group" aria-label={`${category} skills`}>
            {skills.map((skill, i) => {
              const isActive = activeSkill === skill.name;
              return (
                <motion.button
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSkill(isActive ? null : skill.name)}
                  aria-pressed={isActive}
                  className={`relative px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-mono rounded-md border transition-all duration-300 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-neutral-950 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:border-cyan-500/50 hover:text-cyan-300'
                  }`}
                >
                  <span>{skill.name}</span>
                  {/* Endorsement badge */}
                  {skill.verified && skill.endorsements !== undefined && skill.endorsements > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="ml-1 sm:ml-2 inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      title={`Found in ${skill.endorsements} repository(ies)`}
                    >
                      <span className="w-1 h-1 rounded-full bg-cyan-400" aria-hidden="true" />
                      {skill.endorsements}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
      {isLoadingGitHub && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-[10px] font-mono text-neutral-600 text-center py-4"
        >
          [ analyzing github repositories... ]
        </motion.div>
      )}
    </div>
  );
});

// ── Project Result Card ──
const ProjectResultCard = memo(function ProjectResultCard({
  project,
  index,
}: {
  project: UnifiedProject;
  index: number;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold text-neutral-100 font-mono group-hover:text-cyan-300 transition-colors">
          {project.title}
        </h4>
        <span
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
            project.source === 'github' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {project.source === 'github' ? 'GH' : 'LOCAL'}
        </span>
      </div>
      <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">{project.description}</p>
      <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-neutral-500">
        {project.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: langColors[project.language] || '#22d3ee' }}
              aria-hidden="true"
            />
            {project.language}
          </span>
        )}
        {project.stars !== undefined && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span className="sr-only">Stars:</span>
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
      initial={{ opacity: 0, y: 10, borderColor: 'rgba(8, 145, 178, 0.2)' }}
      animate={{ opacity: 1, y: 0, borderColor: 'rgba(8, 145, 178, 0.2)' }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(34, 211, 238, 0.4)' }}
      className="group block p-3 sm:p-4 bg-neutral-950/60 border rounded-lg transition-all duration-300 no-underline focus:outline-none focus:ring-2 focus:ring-cyan-400"
    >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, borderColor: 'rgba(8, 145, 178, 0.2)' }}
      animate={{ opacity: 1, y: 0, borderColor: 'rgba(8, 145, 178, 0.2)' }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(34, 211, 238, 0.4)' }}
      className="group block p-3 sm:p-4 bg-neutral-950/60 border rounded-lg transition-all duration-300"
    >
      {content}
    </motion.div>
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
        const matches = allProjects.filter((project) => {
          const searchable = `${project.title} ${project.description} ${project.language || ''} ${project.role || ''}`.toLowerCase();
          return keywords.some((kw) => searchable.includes(kw.toLowerCase()));
        });

        if (matches.length > 0) return matches;

        return pinnedRepos
          .filter((repo) => {
            const searchable = `${repo.name} ${repo.description} ${repo.language || ''}`.toLowerCase();
            return keywords.some((kw) => searchable.includes(kw.toLowerCase()));
          })
          .map((repo) => ({
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
    <div className="relative min-h-[350] sm:min-h-[400px] bg-neutral-900/30 border border-cyan-900/20 rounded-xl p-4 sm:p-6 overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-cyan-900/20">
        <span className="text-cyan-400 text-lg leading-none">—</span>
        <span className="text-[11px] sm:text-xs font-mono text-neutral-500 truncate">
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
            className="space-y-4 max-h-[400px] overflow-y-auto pr-2 thin-scrollbar"
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

// ── Main Skills Section ──
interface SkillsSectionProps {
  allProjects: UnifiedProject[];
  pinnedRepos: PinnedRepo[];
}

const SkillsSection = memo(function SkillsSection({ allProjects, pinnedRepos }: SkillsSectionProps) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const { ref: sectionRef, isInView } = useInView({ rootMargin: '200px', once: false });

  // Fetch and analyze GitHub repos
  const { analysis, isLoading: isLoadingGitHub } = useGitHubAnalyzer('2241812', isInView);

  // Merge GitHub-analyzed skills with hardcoded skills
  const enhancedSkills = useMemo(() => {
    if (!analysis) {
      // Fallback to hardcoded skills if GitHub analysis not available
      return {
        'Programming & Web': resumeData.skills.programming.map(name => ({
          name,
          category: 'Programming & Web' as const,
          description: (resumeData.skillDescriptions as Record<string, string>)?.[name] || '',
        })),
        'Infrastructure & Tooling': (resumeData.skills.infrastructure || []).map(name => ({
          name,
          category: 'Infrastructure & Tooling' as const,
          description: (resumeData.skillDescriptions as Record<string, string>)?.[name] || '',
        })),
        'Frameworks & Libraries': resumeData.skills.frameworks.map(name => ({
          name,
          category: 'Frameworks & Libraries' as const,
          description: (resumeData.skillDescriptions as Record<string, string>)?.[name] || '',
        })),
        'Core Competencies': (resumeData.skills.coreCompetencies || []).map(name => ({
          name,
          category: 'Core Competencies' as const,
          description: (resumeData.skillDescriptions as Record<string, string>)?.[name] || '',
        })),
      };
    }

    return mergeSkillsWithGitHub(analysis.skills);
  }, [analysis]);

  return (
    <section ref={sectionRef} id="skills" className="min-h-screen flex items-center justify-start px-4 sm:px-8 md:px-12 relative py-20 sm:py-0">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="w-full max-w-5xl relative z-10 py-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
          <motion.div variants={headingVariants} className="flex items-center gap-4">
            <div className="w-6 sm:w-8 h-[1px] bg-cyan-500/50" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-mono text-cyan-400 tracking-widest uppercase">04. Skills & Expertise</h2>
          </motion.div>
          <motion.p variants={cardVariants} className="text-[10px] sm:text-xs font-mono text-neutral-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            [ SELECT SKILL TO FILTER PROJECTS ]
            {analysis && (
              <span className="text-cyan-400">
                {analysis.skills.length} skills detected
              </span>
            )}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-8">
          <SkillsList
            activeSkill={activeSkill}
            setActiveSkill={setActiveSkill}
            enhancedSkills={enhancedSkills}
            isLoadingGitHub={isLoadingGitHub}
          />
          <RelatedProjectsPanel activeSkill={activeSkill} allProjects={allProjects} pinnedRepos={pinnedRepos} />
        </div>
      </motion.div>
    </section>
  );
});

export default SkillsSection;
