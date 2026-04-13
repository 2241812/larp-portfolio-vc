import { AnalyzedSkill } from '@/hooks/useGitHubAnalyzer';
import { resumeData } from '@/data/resumeData';

export interface EnhancedSkill {
  name: string;
  category: 'Programming & Web' | 'Infrastructure & Tooling' | 'Frameworks & Libraries' | 'Core Competencies';
  endorsements?: number; // From GitHub repos
  description?: string;
  verified?: boolean; // Has GitHub evidence
}

/**
 * Merge GitHub-analyzed skills with hardcoded resume skills
 * Prioritizes resume data structure but enriches with GitHub analysis
 */
export function mergeSkillsWithGitHub(gitHubSkills: AnalyzedSkill[]): Record<string, EnhancedSkill[]> {
  const enhancedSkills: Record<string, EnhancedSkill[]> = {
    'Programming & Web': [],
    'Infrastructure & Tooling': [],
    'Frameworks & Libraries': [],
    'Core Competencies': [],
  };

  // First, add all hardcoded skills with descriptions
  const categoryMap: Record<string, string[]> = {
    'Programming & Web': resumeData.skills.programming,
    'Infrastructure & Tooling': resumeData.skills.infrastructure || [],
    'Frameworks & Libraries': resumeData.skills.frameworks,
    'Core Competencies': resumeData.skills.coreCompetencies || [],
  };

  // Map to track which GitHub skills we've already processed
  const processedGitHubSkills = new Set<string>();

  Object.entries(categoryMap).forEach(([category, skills]) => {
    skills.forEach((skillName) => {
      // Find GitHub data for this skill
      const gitHubData = gitHubSkills.find(
        (gs) => gs.name.toLowerCase() === skillName.toLowerCase()
      );

      enhancedSkills[category as keyof typeof enhancedSkills].push({
        name: skillName,
        category: category as any,
        endorsements: gitHubData?.endorsements || 0,
        description: (resumeData.skillDescriptions as Record<string, string>)?.[skillName] || '',
        verified: !!gitHubData, // Has GitHub evidence
      });

      if (gitHubData) {
        processedGitHubSkills.add(gitHubData.name);
      }
    });
  });

  // Add any GitHub-only skills (not in hardcoded list)
  // Map GitHub categories to resume categories
  const categoryMapping: Record<string, string> = {
    Language: 'Programming & Web',
    Framework: 'Frameworks & Libraries',
    Tool: 'Infrastructure & Tooling',
    Infrastructure: 'Infrastructure & Tooling',
  };

  gitHubSkills.forEach((gitHubSkill) => {
    if (!processedGitHubSkills.has(gitHubSkill.name)) {
      const targetCategory = categoryMapping[gitHubSkill.category] || 'Programming & Web';
      const categoryKey = targetCategory as keyof typeof enhancedSkills;

      enhancedSkills[categoryKey].push({
        name: gitHubSkill.name,
        category: targetCategory as any,
        endorsements: gitHubSkill.endorsements,
        description: `Detected from ${gitHubSkill.endorsements} repository(ies)`,
        verified: true,
      });
    }
  });

  // Sort skills within each category by endorsements (descending)
  Object.keys(enhancedSkills).forEach((category) => {
    enhancedSkills[category].sort((a, b) => {
      const endorsementsA = a.endorsements || 0;
      const endorsementsB = b.endorsements || 0;
      return endorsementsB - endorsementsA;
    });
  });

  return enhancedSkills;
}

/**
 * Format endorsement count for display
 */
export function formatEndorsements(count: number | undefined): string {
  if (!count) return '';
  if (count === 1) return '1 repo';
  return `${count} repos`;
}
