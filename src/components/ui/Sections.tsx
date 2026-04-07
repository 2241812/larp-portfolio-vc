"use client";
import React, { memo, useMemo } from 'react';
import { resumeData } from '@/data/resumeData';
import { usePinnedRepos } from '@/hooks/useGitHubData';
import GitHubStats from '@/components/ui/GitHubStats';
import {
  AboutSection,
  ExperienceSection,
  SkillsSection,
  ProjectsSection,
  ContactSection,
  FooterSection,
  type UnifiedProject,
} from '@/components/sections';

// ── Main Sections Component ──
const Sections = memo(function Sections() {
  // GitHub pinned repos with SWR - automatic caching and revalidation
  const { pinnedRepos, isLoading, isError, retry } = usePinnedRepos('2241812');

  // Unified project data from resume + GitHub
  const allProjects: UnifiedProject[] = useMemo(
    () => [
      ...resumeData.projects.map((p) => ({
        title: p.title,
        description: p.description,
        url: p.link,
        source: 'resume' as const,
        role: p.role,
      })),
      ...pinnedRepos.map((r) => ({
        title: r.name,
        description: r.description,
        language: r.language,
        url: r.url,
        stars: r.stars,
        forks: r.forks,
        source: 'github' as const,
      })),
    ],
    [pinnedRepos]
  );

  return (
    <>
      <div className="relative z-10 flex flex-col w-full pointer-events-none [&>section]:pointer-events-auto max-w-5xl mx-auto">
        <AboutSection />
        <GitHubStats />
        <ProjectsSection pinnedRepos={pinnedRepos} reposLoading={isLoading} reposError={isError} onRetry={retry} />
        <SkillsSection allProjects={allProjects} pinnedRepos={pinnedRepos} />
        <ExperienceSection />
        <ContactSection />
      </div>
      <div className="w-full pointer-events-none [&>footer]:pointer-events-auto">
        <FooterSection />
      </div>
    </>
  );
});

export default Sections;
