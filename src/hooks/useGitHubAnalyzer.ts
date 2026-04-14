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
  'PyQt6': 'Framework',
  'AR Foundation': 'Framework',
  
  // Infrastructure & Containerization
  'Docker': 'Infrastructure',
  'Docker Compose': 'Infrastructure',
  'Kubernetes': 'Infrastructure',
  'Containerization': 'Infrastructure',
  'Container': 'Infrastructure',
  'Podman': 'Infrastructure',
  'AWS': 'Infrastructure',
  'GCP': 'Infrastructure',
  'Azure': 'Infrastructure',
  'CI/CD': 'Infrastructure',
  'Jenkins': 'Infrastructure',
  'GitHub Actions': 'Infrastructure',
  'GitLab CI': 'Infrastructure',
  
  // Tools
  'Git': 'Tool',
  'GitHub': 'Tool',
  'GitLab': 'Tool',
  'Webpack': 'Tool',
  'Vite': 'Tool',
  'Babel': 'Tool',
  'VSCode': 'Tool',
  'Visual Studio': 'Tool',
  'GraphQL': 'Tool',
  'REST': 'Tool',
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
    // Frontend frameworks
    /react|vue|angular|next\.?js|svelte/gi,
    // Backend frameworks
    /express|django|flask|fastapi|spring|rails|laravel/gi,
    // Containerization & Infrastructure (comprehensive)
    /docker|kubernetes|k8s|podman|container|docker[- ]compose|containerd/gi,
    /aws|gcp|google cloud|azure|cloud platform/gi,
    /ci[\/\-]?cd|jenkins|github actions|gitlab ci|circleci|travis/gi,
    // Databases
    /mongodb|postgresql|mysql|redis|elasticsearch|dynamodb|firestore/gi,
    // Other tools
    /typescript|python|java|go|rust|graphql|rest api|microservice/gi,
  ];

  patterns.forEach((pattern) => {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        // Normalize common variations
        let normalized = match.toLowerCase();
        
        // Normalize multi-word terms
        if (normalized.includes('docker compose') || normalized.includes('docker-compose')) {
          normalized = 'Docker Compose';
        } else if (normalized.includes('github action')) {
          normalized = 'GitHub Actions';
        } else if (normalized.includes('gitlab ci')) {
          normalized = 'GitLab CI';
        } else if (normalized.includes('google cloud')) {
          normalized = 'GCP';
        } else if (normalized.includes('ci/cd') || normalized.includes('ci-cd')) {
          normalized = 'CI/CD';
        } else if (normalized === 'k8s') {
          normalized = 'Kubernetes';
        } else if (normalized.includes('microservice')) {
          normalized = 'Microservices';
        } else if (normalized.includes('rest api') || normalized === 'rest') {
          normalized = 'REST';
        } else {
          // Capitalize first letter
          normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
        }
        
        if (normalized && normalized.length > 1) {
          keywords.add(normalized);
        }
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
