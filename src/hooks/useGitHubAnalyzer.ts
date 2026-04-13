import useSWR from 'swr';

export interface AnalyzedSkill {
  name: string;
  category: 'Language' | 'Framework' | 'Tool' | 'Infrastructure';
  endorsements: number; // Number of repos using this skill
  repos: string[];
}

export interface SkillAnalysis {
  skills: AnalyzedSkill[];
  totalRepos: number;
}

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
};

/**
 * Language to category mapping for skill classification
 */
const LANGUAGE_CATEGORY_MAP: Record<string, 'Language' | 'Framework' | 'Tool' | 'Infrastructure'> = {
  // Languages
  'Python': 'Language',
  'JavaScript': 'Language',
  'TypeScript': 'Language',
  'Java': 'Language',
  'C++': 'Language',
  'C#': 'Language',
  'Go': 'Language',
  'Rust': 'Language',
  'PHP': 'Language',
  'Ruby': 'Language',
  'HTML': 'Language',
  'CSS': 'Language',
  'SQL': 'Language',
  'Shell': 'Language',
  'Kotlin': 'Language',
  'Swift': 'Language',
  
  // Frameworks
  'React': 'Framework',
  'Vue': 'Framework',
  'Angular': 'Framework',
  'Next.js': 'Framework',
  'Express': 'Framework',
  'Django': 'Framework',
  'FastAPI': 'Framework',
  'Spring': 'Framework',
  'Flask': 'Framework',
  'Laravel': 'Framework',
  'Rails': 'Framework',
  'Unity': 'Framework',
  'Unreal': 'Framework',
  
  // Infrastructure & Tools
  'Docker': 'Infrastructure',
  'Kubernetes': 'Infrastructure',
  'AWS': 'Infrastructure',
  'GCP': 'Infrastructure',
  'Azure': 'Infrastructure',
  'Git': 'Tool',
  'GitHub': 'Tool',
  'GitLab': 'Tool',
  'Webpack': 'Tool',
  'Vite': 'Tool',
  'Babel': 'Tool',
};

/**
 * Extract skills from GitHub repository languages
 * GitHub returns languages as an object with language names as keys
 */
function extractSkillsFromLanguages(languages: Record<string, number>): AnalyzedSkill[] {
  const skillMap = new Map<string, { endorsements: number; repos: string[] }>();

  Object.entries(languages).forEach(([lang, bytes]) => {
    if (bytes === 0) return; // Skip zero-byte languages
    
    const category = LANGUAGE_CATEGORY_MAP[lang] || 'Language';
    
    if (!skillMap.has(lang)) {
      skillMap.set(lang, { endorsements: 0, repos: [] });
    }

    const skill = skillMap.get(lang)!;
    skill.endorsements += 1;
  });

  return Array.from(skillMap.entries()).map(([name, data]) => ({
    name,
    category: LANGUAGE_CATEGORY_MAP[name] || 'Language',
    endorsements: data.endorsements,
    repos: data.repos,
  }));
}

/**
 * GitHub analyzer hook - fetches all user repos and analyzes skills
 * @param username GitHub username
 * @param isInView Whether the component is in view (for lazy loading)
 */
export function useGitHubAnalyzer(username: string, isInView: boolean = true) {
  const url = isInView && username
    ? `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
    : null;

  const { data: repos, error, isLoading } = useSWR<GitHubRepo[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 2,
    }
  );

  // Analyze skills from repos
  const skillAnalysis: SkillAnalysis | null = repos
    ? analyzeRepositories(repos)
    : null;

  return {
    analysis: skillAnalysis,
    isLoading,
    error: error ? 'Failed to fetch GitHub repositories' : null,
    repos: repos || [],
  };
}

/**
 * Analyze all repositories for skills
 */
function analyzeRepositories(repos: GitHubRepo[]): SkillAnalysis {
  const skillMap = new Map<string, { category: any; endorsements: number; repos: Set<string> }>();

  repos.forEach((repo) => {
    // Skip forks by default (optional: set by env var)
    if (repo.fork) return;

    const languages = repo.language ? [repo.language] : [];
    const description = repo.description || '';

    // Extract languages
    languages.forEach((lang) => {
      if (!lang) return;

      const category = LANGUAGE_CATEGORY_MAP[lang] || 'Language';

      if (!skillMap.has(lang)) {
        skillMap.set(lang, {
          category,
          endorsements: 0,
          repos: new Set(),
        });
      }

      const skill = skillMap.get(lang)!;
      skill.endorsements += 1;
      skill.repos.add(repo.name);
    });

    // Parse description for common framework keywords
    const keywords = extractKeywordsFromDescription(description);
    keywords.forEach((keyword) => {
      const category = LANGUAGE_CATEGORY_MAP[keyword] || 'Framework';

      if (!skillMap.has(keyword)) {
        skillMap.set(keyword, {
          category,
          endorsements: 0,
          repos: new Set(),
        });
      }

      const skill = skillMap.get(keyword)!;
      skill.endorsements += 1;
      skill.repos.add(repo.name);
    });
  });

  const skills: AnalyzedSkill[] = Array.from(skillMap.entries())
    .map(([name, data]) => ({
      name,
      category: data.category,
      endorsements: data.endorsements,
      repos: Array.from(data.repos),
    }))
    .sort((a, b) => b.endorsements - a.endorsements); // Sort by endorsement count

  return {
    skills,
    totalRepos: repos.filter((r) => !r.fork).length,
  };
}

/**
 * Extract framework/tool keywords from repo description
 */
function extractKeywordsFromDescription(description: string): string[] {
  const keywords = new Set<string>();
  const descLower = description.toLowerCase();

  const patterns = [
    /react|vue|angular|next\.?js|svelte/gi,
    /express|django|flask|fastapi|spring|rails|laravel/gi,
    /docker|kubernetes|aws|gcp|azure|graphql|rest/gi,
    /typescript|javascript|python|java|go|rust/gi,
    /mongodb|postgresql|mysql|redis|elasticsearch/gi,
  ];

  patterns.forEach((pattern) => {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        // Normalize common variations
        const normalized = match
          .toLowerCase()
          .replace('next.js', 'Next.js')
          .replace('nextjs', 'Next.js');
        keywords.add(normalized.charAt(0).toUpperCase() + normalized.slice(1));
      });
    }
  });

  return Array.from(keywords);
}

/**
 * Type definitions for GitHub API
 */
interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  url: string;
  html_url: string;
  stars?: number;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
  topics?: string[];
}
