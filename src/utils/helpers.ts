/**
 * Common Utility Functions
 * Reusable helpers for date, string, number, and DOM manipulation
 */

// ==================== Date Utilities ====================
export function getDateRange(daysBack: number = 364) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysBack);
  
  return {
    from: startDate.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0],
  };
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  return dateObj.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric' 
  });
}

export function getDaysSince(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - target.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isToday(date: Date | string): boolean {
  const target = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    target.getDate() === today.getDate() &&
    target.getMonth() === today.getMonth() &&
    target.getFullYear() === today.getFullYear()
  );
}

// ==================== String Utilities ====================
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function truncate(str: string, length: number = 100, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

export function similarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getLevenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getLevenshteinDistance(s1: string, s2: string): number {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// ==================== Number Utilities ====================
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100 * 100) / 100;
}

export function calculateWPM(chars: number, seconds: number): number {
  const words = chars / 5;
  const minutes = seconds / 60;
  return minutes > 0 ? Math.round(words / minutes * 100) / 100 : 0;
}

export function percentageColor(percentage: number): string {
  if (percentage >= 95) return '#10b981'; // green
  if (percentage >= 85) return '#06b6d4'; // cyan
  if (percentage >= 70) return '#eab308'; // yellow
  return '#ef4444'; // red
}

// ==================== Array Utilities ====================
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) return [...new Set(array)];
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ==================== Object Utilities ====================
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

export function mergeObjects<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

export function omit<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): Partial<T> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

// ==================== DOM Utilities ====================
export function getScrollProgress(element: HTMLElement | null): number {
  if (!element) return 0;
  
  const rect = element.getBoundingClientRect();
  const viewHeight = window.innerHeight;
  const progress = 1 - rect.top / viewHeight;
  
  return clamp(progress, 0, 1);
}

export function isElementInView(element: HTMLElement | null, threshold: number = 0): boolean {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top + threshold <= window.innerHeight &&
    rect.bottom - threshold >= 0
  );
}

export function smoothScroll(target: HTMLElement | string, duration: number = 1000): void {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  const startY = window.scrollY;
  const endY = element.getBoundingClientRect().top + window.scrollY;
  const startTime = performance.now();
  
  const scroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollY = startY + (endY - startY) * easeInOutCubic(progress);
    
    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  };
  
  requestAnimationFrame(scroll);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ==================== Local Storage Utilities ====================
export function getFromStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue ?? null;
  } catch (error) {
    console.error(`[Storage] Error reading key "${key}":`, error);
    return defaultValue ?? null;
  }
}

export function setInStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Error writing key "${key}":`, error);
    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[Storage] Error removing key "${key}":`, error);
    return false;
  }
}

export function clearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('[Storage] Error clearing storage:', error);
    return false;
  }
}

// ==================== Validation Utilities ====================
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidGitHubUsername(username: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i.test(username);
}

// ==================== Color Utilities ====================
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export default {
  // Date
  getDateRange,
  formatDate,
  getDaysSince,
  isToday,
  // String
  capitalize,
  slugify,
  truncate,
  similarity,
  // Number
  formatNumber,
  clamp,
  lerp,
  calculateAccuracy,
  calculateWPM,
  percentageColor,
  // Array
  groupBy,
  unique,
  sortBy,
  // Object
  deepClone,
  mergeObjects,
  omit,
  // DOM
  getScrollProgress,
  isElementInView,
  smoothScroll,
  // Storage
  getFromStorage,
  setInStorage,
  removeFromStorage,
  clearStorage,
  // Validation
  isValidEmail,
  isValidUrl,
  isValidGitHubUsername,
  // Color
  hexToRgb,
  rgbToHex,
};
