/**
 * Centralized TypeScript Types and Interfaces
 * Used across the entire application for type safety and consistency
 */

// ==================== GitHub & Contributions ====================
export interface GitHubContribution {
  date: string;
  count: number;
}

export interface ContributionDay extends GitHubContribution {
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubRepository {
  id: number;
  name: string;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
}

export interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubStats {
  contributions: number;
  repositories: number;
  languages: Record<string, number>;
}

// ==================== Typing Game ====================
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameType = 'duration' | 'words';

export interface GameSettings {
  type: GameType;
  duration?: number; // seconds
  wordCount?: number;
  difficulty: GameDifficulty;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

export interface GameResult {
  id: string;
  timestamp: number;
  stats: GameStats;
  difficulty: GameDifficulty;
  type: GameType;
}

// ==================== Chatbot ====================
export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
}

export interface ConversationContext {
  messages: ChatMessage[];
  userId: string;
  startTime: number;
  lastActivityTime: number;
}

// ==================== Portfolio Content ====================
export interface SkillItem {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  category: string;
  endorsements?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  image?: string;
  featured: boolean;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  current: boolean;
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'email' | 'twitter' | 'portfolio';
  url: string;
  icon?: string;
  label: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  email: string;
  location: string;
  image?: string;
  social: SocialLink[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  about: string;
  skills: SkillItem[];
  experiences: ExperienceItem[];
  projects: Project[];
  education: {
    school: string;
    degree: string;
    field: string;
    year: number;
  }[];
}

// ==================== UI Components ====================
export interface CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface SectionProps {
  scrollProgress?: number;
  isInView?: boolean;
}

export interface AnimationConfig {
  duration: number;
  delay?: number;
  stagger?: number;
  ease?: string;
}

// ==================== API & Data Fetching ====================
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
  ok: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ==================== Notifications ====================
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Toast extends Notification {
  position: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// ==================== Achievement System ====================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface UserAchievements {
  total: number;
  unlocked: number;
  achievements: Achievement[];
}

// ==================== Keyboard Game ====================
export interface KeyboardKey {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  pressed: boolean;
}

// ==================== 3D Model ====================
export interface ModelConfig {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface ThreeJSScene {
  camera: {
    fov: number;
    aspect: number;
    near: number;
    far: number;
  };
  lighting: {
    ambient: number;
    directional: {
      color: string;
      intensity: number;
    };
  };
}

// ==================== Theme & Styling ====================
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  spacing: Record<string, string>;
  typography: Record<string, any>;
}

export interface CSSVariable {
  name: string;
  value: string;
}

// ==================== Local Storage ====================
export interface StorageKey {
  namespace: string;
  key: string;
  version?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}
