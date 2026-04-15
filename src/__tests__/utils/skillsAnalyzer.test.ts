import { mergeSkillsWithGitHub, formatEndorsements } from '@/utils/skillsAnalyzer';
import type { AnalyzedSkill } from '@/hooks/useGitHubAnalyzer';

// ==================== formatEndorsements ====================

describe('formatEndorsements', () => {
  it('returns empty string for undefined', () => {
    expect(formatEndorsements(undefined)).toBe('');
  });

  it('returns empty string for 0', () => {
    expect(formatEndorsements(0)).toBe('');
  });

  it('returns "1 repo" for 1', () => {
    expect(formatEndorsements(1)).toBe('1 repo');
  });

  it('returns plural form for count > 1', () => {
    expect(formatEndorsements(2)).toBe('2 repos');
    expect(formatEndorsements(10)).toBe('10 repos');
  });
});

// ==================== mergeSkillsWithGitHub ====================

describe('mergeSkillsWithGitHub', () => {
  const emptyGitHubSkills: AnalyzedSkill[] = [];

  it('returns an object with all four categories', () => {
    const result = mergeSkillsWithGitHub(emptyGitHubSkills);
    expect(result).toHaveProperty('Programming & Web');
    expect(result).toHaveProperty('Infrastructure & Tooling');
    expect(result).toHaveProperty('Frameworks & Libraries');
    expect(result).toHaveProperty('Core Competencies');
  });

  it('populates categories from resumeData when no GitHub skills', () => {
    const result = mergeSkillsWithGitHub(emptyGitHubSkills);
    // Programming & Web should have items from resumeData.skills.programming
    expect(result['Programming & Web'].length).toBeGreaterThan(0);
    expect(result['Frameworks & Libraries'].length).toBeGreaterThan(0);
    expect(result['Infrastructure & Tooling'].length).toBeGreaterThan(0);
    expect(result['Core Competencies'].length).toBeGreaterThan(0);
  });

  it('marks skills as not verified when no GitHub data', () => {
    const result = mergeSkillsWithGitHub(emptyGitHubSkills);
    result['Programming & Web'].forEach((skill) => {
      expect(skill.verified).toBe(false);
    });
  });

  it('marks skills as verified when GitHub data is present', () => {
    const gitHubSkills: AnalyzedSkill[] = [
      { name: 'Python', category: 'Language', endorsements: 5, repos: ['repo1'] },
    ];
    const result = mergeSkillsWithGitHub(gitHubSkills);
    const pythonSkill = result['Programming & Web'].find((s) => s.name === 'Python');
    expect(pythonSkill?.verified).toBe(true);
    expect(pythonSkill?.endorsements).toBe(5);
  });

  it('adds GitHub-only skills that are not in resumeData', () => {
    const gitHubSkills: AnalyzedSkill[] = [
      { name: 'Rust', category: 'Language', endorsements: 3, repos: ['rustRepo'] },
    ];
    const result = mergeSkillsWithGitHub(gitHubSkills);
    const allSkills = Object.values(result).flat();
    const rustSkill = allSkills.find((s) => s.name === 'Rust');
    expect(rustSkill).toBeDefined();
    expect(rustSkill?.verified).toBe(true);
    expect(rustSkill?.endorsements).toBe(3);
  });

  it('places Docker in Infrastructure & Tooling via specificSkillMapping', () => {
    const gitHubSkills: AnalyzedSkill[] = [
      { name: 'Docker', category: 'Infrastructure', endorsements: 8, repos: ['dockerRepo'] },
    ];
    const result = mergeSkillsWithGitHub(gitHubSkills);
    const dockerSkill = result['Infrastructure & Tooling'].find((s) => s.name === 'Docker');
    expect(dockerSkill).toBeDefined();
    expect(dockerSkill?.endorsements).toBeGreaterThan(0);
  });

  it('places Framework-category skills in Frameworks & Libraries', () => {
    const gitHubSkills: AnalyzedSkill[] = [
      { name: 'SomeNewFramework', category: 'Framework', endorsements: 2, repos: ['repo1'] },
    ];
    const result = mergeSkillsWithGitHub(gitHubSkills);
    const frameworkSkill = result['Frameworks & Libraries'].find((s) => s.name === 'SomeNewFramework');
    expect(frameworkSkill).toBeDefined();
  });

  it('sorts skills within a category by endorsements descending', () => {
    const gitHubSkills: AnalyzedSkill[] = [
      { name: 'Python', category: 'Language', endorsements: 1, repos: [] },
      { name: 'Go', category: 'Language', endorsements: 10, repos: [] },
    ];
    const result = mergeSkillsWithGitHub(gitHubSkills);
    const progSkills = result['Programming & Web'];
    for (let i = 0; i < progSkills.length - 1; i++) {
      expect((progSkills[i].endorsements ?? 0)).toBeGreaterThanOrEqual(
        progSkills[i + 1].endorsements ?? 0
      );
    }
  });

  it('does not add duplicate skills for GitHub skills already in resumeData', () => {
    const gitHubSkills: AnalyzedSkill[] = [
      { name: 'Python', category: 'Language', endorsements: 5, repos: ['repo1'] },
      { name: 'Python', category: 'Language', endorsements: 5, repos: ['repo1'] }, // duplicate
    ];
    const result = mergeSkillsWithGitHub(gitHubSkills);
    const allSkills = Object.values(result).flat();
    const pythonCount = allSkills.filter((s) => s.name === 'Python').length;
    expect(pythonCount).toBe(1);
  });

  it('each skill has required fields', () => {
    const result = mergeSkillsWithGitHub(emptyGitHubSkills);
    Object.values(result).flat().forEach((skill) => {
      expect(skill).toHaveProperty('name');
      expect(skill).toHaveProperty('category');
      expect(typeof skill.name).toBe('string');
    });
  });
});
