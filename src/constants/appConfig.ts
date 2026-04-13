/**
 * Application Constants
 * Centralized configuration for the entire application
 */

// ==================== API Configuration ====================
export const API_CONFIG = {
  // GitHub Contributions API
  GITHUB_CONTRIBUTIONS_API: 'https://github-contributions-api.jogruber.de/v4',
  GITHUB_API_TIMEOUT: 15000, // 15 seconds
  GITHUB_API_RETRIES: 3,
  GITHUB_API_RETRY_DELAY: 1000, // 1 second

  // Internal API
  INTERNAL_API_TIMEOUT: 10000, // 10 seconds
  INTERNAL_API_RETRIES: 2,
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  CONTRIBUTION_CACHE_DURATION: 60 * 60 * 1000, // 1 hour
};

// ==================== GitHub Configuration ====================
export const GITHUB_CONFIG = {
  DEFAULT_USERNAME: '2241812',
  CONTRIBUTIONS_DAYS_BACK: 364, // 1 year
  MAX_REPOS_PER_PAGE: 30,
};

// ==================== Game Configuration ====================
export const GAME_CONFIG = {
  // Typing Game
  TYPING_GAME_EASY_DURATION: 15, // seconds
  TYPING_GAME_MEDIUM_DURATION: 30,
  TYPING_GAME_HARD_DURATION: 60,
  TYPING_GAME_MAX_DURATION: 120,
  
  TYPING_GAME_WORD_COUNT_SMALL: 25,
  TYPING_GAME_WORD_COUNT_MEDIUM: 50,
  TYPING_GAME_WORD_COUNT_LARGE: 100,
  TYPING_GAME_WORD_COUNT_EXTRA_LARGE: 200,

  // Contribution Calendar Game
  CALENDAR_BASE_SPEED: 0.3,
  CALENDAR_MAX_SPEED: 4,
  CALENDAR_VISIBLE_WIDTH: 500,
  CALENDAR_CELL_SIZE: 16,
  CALENDAR_CELL_GAP: 4,
  CALENDAR_LEVEL_COLORS: {
    0: '#161b22', // No contributions
    1: '#0e4429', // 1-3
    2: '#006d32', // 4-6
    3: '#26a641', // 7-9
    4: '#39d353', // 10+
  },
};

// ==================== Animation Configuration ====================
export const ANIMATION_CONFIG = {
  SPRING_STIFFNESS: 400,
  SPRING_DAMPING: 60,
  SPRING_MASS: 1,
  
  TRANSITION_FAST: 0.2,
  TRANSITION_NORMAL: 0.3,
  TRANSITION_SLOW: 0.5,
  
  STAGGER_DELAY: 0.1,
};

// ==================== Color Configuration ====================
export const COLOR_CONFIG = {
  // Primary colors
  PRIMARY: '#06b6d4', // cyan
  PRIMARY_DARK: '#0891b2',
  PRIMARY_LIGHT: '#22d3ee',
  
  // Background colors
  BACKGROUND: '#09090b', // neutral-950
  BACKGROUND_SECONDARY: '#18181b', // neutral-900
  BACKGROUND_TERTIARY: '#27272a', // neutral-800
  
  // Text colors
  TEXT_PRIMARY: '#f5f5f5', // neutral-100
  TEXT_SECONDARY: '#a1a1a1', // neutral-400
  TEXT_TERTIARY: '#71717a', // neutral-500
  
  // Status colors
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  
  // Accent colors
  ACCENT_CYAN: '#06b6d4',
  ACCENT_GREEN: '#10b981',
  ACCENT_YELLOW: '#eab308',
  ACCENT_RED: '#ef4444',
};

// ==================== Keyboard Shortcuts ====================
export const KEYBOARD_SHORTCUTS = {
  // Typing Game
  RESTART_KEY_1: 'Tab',
  RESTART_KEY_2: 'Enter',
  QUIT_KEY: 'Escape',
  FOCUS_INPUT: 'Shift',
};

// ==================== Local Storage Keys ====================
export const STORAGE_KEYS = {
  // Game stats
  GAME_STATS: 'game_stats',
  TYPING_STATS: 'typing_game_stats',
  CALENDAR_STATS: 'calendar_game_stats',
  
  // User preferences
  THEME: 'theme_preference',
  SOUND_ENABLED: 'sound_enabled',
  
  // Cache
  GITHUB_CONTRIBUTIONS_CACHE: 'github_contributions_cache',
  GITHUB_STATS_CACHE: 'github_stats_cache',
};

// ==================== Validation Rules ====================
export const VALIDATION_RULES = {
  // Email
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MIN_LENGTH: 5,
  EMAIL_MAX_LENGTH: 254,
  
  // Username
  USERNAME_MIN_LENGTH: 1,
  USERNAME_MAX_LENGTH: 39,
  USERNAME_REGEX: /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i,
  
  // URL
  URL_REGEX: /^https?:\/\/.+/i,
  
  // Password (if ever needed)
  PASSWORD_MIN_LENGTH: 8,
};

// ==================== Notification Settings ====================
export const NOTIFICATION_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  TOAST_POSITION: 'bottom-right' as const,
  DEFAULT_Z_INDEX: 9999,
};

// ==================== Breakpoints ====================
export const BREAKPOINTS = {
  MOBILE: 640, // sm
  TABLET: 768, // md
  DESKTOP: 1024, // lg
  WIDE: 1280, // xl
  ULTRA_WIDE: 1536, // 2xl
};

// ==================== Spacing ====================
export const SPACING = {
  XS: '0.25rem', // 4px
  SM: '0.5rem', // 8px
  MD: '1rem', // 16px
  LG: '1.5rem', // 24px
  XL: '2rem', // 32px
  '2XL': '3rem', // 48px
  '3XL': '4rem', // 64px
};

// ==================== Font Sizes ====================
export const FONT_SIZES = {
  XS: '0.75rem', // 12px
  SM: '0.875rem', // 14px
  BASE: '1rem', // 16px
  LG: '1.125rem', // 18px
  XL: '1.25rem', // 20px
  '2XL': '1.5rem', // 24px
  '3XL': '1.875rem', // 30px
  '4XL': '2.25rem', // 36px
};

// ==================== Z-Index Scale ====================
export const Z_INDEX = {
  HIDDEN: -1,
  BASE: 0,
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
};

// ==================== Development Configuration ====================
export const DEV_CONFIG = {
  DEBUG: process.env.NODE_ENV === 'development',
  LOG_API_CALLS: false,
  LOG_COMPONENT_RENDERS: false,
  MOCK_API: false,
};

// ==================== Feature Flags ====================
export const FEATURES = {
  TYPING_GAME_ENABLED: true,
  CALENDAR_GAME_ENABLED: true,
  CHATBOT_ENABLED: true,
  GITHUB_INTEGRATION_ENABLED: true,
};

export default {
  API_CONFIG,
  GITHUB_CONFIG,
  GAME_CONFIG,
  ANIMATION_CONFIG,
  COLOR_CONFIG,
  KEYBOARD_SHORTCUTS,
  STORAGE_KEYS,
  VALIDATION_RULES,
  NOTIFICATION_CONFIG,
  BREAKPOINTS,
  SPACING,
  FONT_SIZES,
  Z_INDEX,
  DEV_CONFIG,
  FEATURES,
};
