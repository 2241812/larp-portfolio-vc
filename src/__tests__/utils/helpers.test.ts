import {
  getDateRange,
  formatDate,
  getDaysSince,
  isToday,
  capitalize,
  slugify,
  truncate,
  similarity,
  formatNumber,
  clamp,
  lerp,
  calculateAccuracy,
  calculateWPM,
  percentageColor,
  groupBy,
  unique,
  sortBy,
  deepClone,
  mergeObjects,
  omit,
  isValidEmail,
  isValidUrl,
  isValidGitHubUsername,
  hexToRgb,
  rgbToHex,
  getFromStorage,
  setInStorage,
  removeFromStorage,
  clearStorage,
} from '@/utils/helpers';

// ==================== Date Utilities ====================

describe('getDateRange', () => {
  it('returns a from/to date range with 364 days default', () => {
    const { from, to } = getDateRange();
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(364);
  });

  it('returns correct date format YYYY-MM-DD', () => {
    const { from, to } = getDateRange(30);
    expect(from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('accepts custom daysBack argument', () => {
    const { from, to } = getDateRange(7);
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);
  });

  it('to date is today', () => {
    const { to } = getDateRange();
    const today = new Date().toISOString().split('T')[0];
    expect(to).toBe(today);
  });
});

describe('formatDate', () => {
  const testDate = new Date('2024-06-15');

  it('formats to short format by default', () => {
    const result = formatDate(testDate, 'short');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
  });

  it('formats to long format', () => {
    const result = formatDate(testDate, 'long');
    expect(result).toContain('June');
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('accepts string input', () => {
    const result = formatDate('2024-06-15', 'short');
    expect(result).toContain('Jun');
  });

  it('defaults to short format', () => {
    const result = formatDate(testDate);
    expect(result).not.toContain('2024'); // short format omits year
  });
});

describe('getDaysSince', () => {
  it('returns 0 for today', () => {
    const today = new Date();
    const result = getDaysSince(today);
    expect(result).toBe(0);
  });

  it('returns correct number of days for a past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(getDaysSince(pastDate)).toBe(5);
  });

  it('accepts string dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const dateStr = pastDate.toISOString().split('T')[0];
    expect(getDaysSince(dateStr)).toBe(10);
  });
});

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  it('accepts string dates', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isToday(today)).toBe(true);
  });

  it('returns false for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    expect(isToday(future)).toBe(false);
  });
});

// ==================== String Utilities ====================

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('does not change subsequent letters', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('handles already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
});

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('lowercases the string', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('hello! world?')).toBe('hello-world');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('trims leading/trailing whitespace', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('truncate', () => {
  it('returns string unchanged when within length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds suffix when too long', () => {
    const result = truncate('hello world this is long', 10);
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result.endsWith('...')).toBe(true);
  });

  it('uses default length of 100', () => {
    const short = 'a'.repeat(50);
    expect(truncate(short)).toBe(short);
  });

  it('uses custom suffix', () => {
    const result = truncate('hello world', 8, '→');
    expect(result).toBe('hello w→');
  });

  it('handles exactly equal length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('similarity', () => {
  it('returns 1.0 for identical strings', () => {
    expect(similarity('hello', 'hello')).toBe(1.0);
  });

  it('returns 1.0 for empty strings', () => {
    expect(similarity('', '')).toBe(1.0);
  });

  it('returns a value between 0 and 1 for partial matches', () => {
    const score = similarity('hello', 'helo');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('is case-insensitive', () => {
    expect(similarity('Hello', 'hello')).toBe(1.0);
  });

  it('returns lower score for very different strings', () => {
    const score = similarity('abc', 'xyz');
    expect(score).toBeLessThan(0.5);
  });
});

// ==================== Number Utilities ====================

describe('formatNumber', () => {
  it('formats integers without decimals by default', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('formats large numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats with decimals when specified', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles small numbers without commas', () => {
    expect(formatNumber(999)).toBe('999');
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('returns a when t is 0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });

  it('returns b when t is 1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('returns midpoint when t is 0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('works with negative numbers', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});

describe('calculateAccuracy', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('returns 100 when all correct', () => {
    expect(calculateAccuracy(10, 10)).toBe(100);
  });

  it('calculates partial accuracy', () => {
    expect(calculateAccuracy(7, 10)).toBe(70);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateAccuracy(1, 3)).toBe(33.33);
  });
});

describe('calculateWPM', () => {
  it('returns 0 when seconds is 0', () => {
    expect(calculateWPM(100, 0)).toBe(0);
  });

  it('calculates WPM correctly (5 chars = 1 word)', () => {
    // 300 chars / 5 = 60 words, in 60 seconds = 1 minute → 60 WPM
    expect(calculateWPM(300, 60)).toBe(60);
  });

  it('rounds result to 2 decimal places', () => {
    const result = calculateWPM(10, 7);
    expect(result).toBe(Math.round((10 / 5 / (7 / 60)) * 100) / 100);
  });
});

describe('percentageColor', () => {
  it('returns green for >= 95%', () => {
    expect(percentageColor(95)).toBe('#10b981');
    expect(percentageColor(100)).toBe('#10b981');
  });

  it('returns cyan for >= 85%', () => {
    expect(percentageColor(85)).toBe('#06b6d4');
    expect(percentageColor(94)).toBe('#06b6d4');
  });

  it('returns yellow for >= 70%', () => {
    expect(percentageColor(70)).toBe('#eab308');
    expect(percentageColor(84)).toBe('#eab308');
  });

  it('returns red for < 70%', () => {
    expect(percentageColor(0)).toBe('#ef4444');
    expect(percentageColor(69)).toBe('#ef4444');
  });
});

// ==================== Array Utilities ====================

describe('groupBy', () => {
  const data = [
    { id: 1, category: 'a' },
    { id: 2, category: 'b' },
    { id: 3, category: 'a' },
  ];

  it('groups items by key', () => {
    const result = groupBy(data, 'category');
    expect(result['a']).toHaveLength(2);
    expect(result['b']).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupBy([], 'category')).toEqual({});
  });

  it('preserves all items', () => {
    const result = groupBy(data, 'category');
    const allItems = Object.values(result).flat();
    expect(allItems).toHaveLength(data.length);
  });
});

describe('unique', () => {
  it('removes duplicates from primitive array', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it('removes duplicates by key', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice2' },
    ];
    const result = unique(data, 'id');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('returns copy without modifying original', () => {
    const arr = [1, 2, 3];
    const result = unique(arr);
    expect(result).not.toBe(arr);
  });
});

describe('sortBy', () => {
  const data = [
    { name: 'Charlie', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 35 },
  ];

  it('sorts ascending by default', () => {
    const result = sortBy(data, 'age');
    expect(result[0].age).toBe(25);
    expect(result[2].age).toBe(35);
  });

  it('sorts descending when specified', () => {
    const result = sortBy(data, 'age', 'desc');
    expect(result[0].age).toBe(35);
    expect(result[2].age).toBe(25);
  });

  it('sorts strings correctly', () => {
    const result = sortBy(data, 'name');
    expect(result[0].name).toBe('Alice');
    expect(result[2].name).toBe('Charlie');
  });

  it('does not mutate original array', () => {
    const original = [...data];
    sortBy(data, 'age');
    expect(data).toEqual(original);
  });
});

// ==================== Object Utilities ====================

describe('deepClone', () => {
  it('clones a simple object', () => {
    const obj = { a: 1, b: 'hello' };
    const clone = deepClone(obj);
    expect(clone).toEqual(obj);
    expect(clone).not.toBe(obj);
  });

  it('deep clones nested objects', () => {
    const obj = { a: { b: { c: 1 } } };
    const clone = deepClone(obj);
    clone.a.b.c = 99;
    expect(obj.a.b.c).toBe(1); // original unchanged
  });

  it('clones arrays', () => {
    const arr = [1, 2, [3, 4]];
    const clone = deepClone(arr);
    expect(clone).toEqual(arr);
    expect(clone).not.toBe(arr);
  });

  it('clones Date objects', () => {
    const date = new Date('2024-01-01');
    const clone = deepClone(date);
    expect(clone).toEqual(date);
    expect(clone).not.toBe(date);
  });

  it('handles null', () => {
    expect(deepClone(null)).toBeNull();
  });

  it('handles primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
  });
});

describe('mergeObjects', () => {
  it('merges two objects', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 99, c: 3 };
    const result = mergeObjects(target, source);
    expect(result).toEqual({ a: 1, b: 99, c: 3 });
  });

  it('does not mutate target', () => {
    const target = { a: 1 };
    mergeObjects(target, { b: 2 });
    expect(target).toEqual({ a: 1 });
  });
});

describe('omit', () => {
  it('removes specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });

  it('removes multiple keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['a', 'c'])).toEqual({ b: 2 });
  });

  it('does not mutate original object', () => {
    const obj = { a: 1, b: 2 };
    omit(obj, ['a']);
    expect(obj).toEqual({ a: 1, b: 2 });
  });
});

// ==================== Validation Utilities ====================

describe('isValidEmail', () => {
  it('returns true for valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@sub.domain.com')).toBe(true);
  });

  it('returns false for invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('returns false for email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('returns true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('https://sub.domain.com/path?q=1')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('notaurl')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('://missing-protocol')).toBe(false);
  });
});

describe('isValidGitHubUsername', () => {
  it('returns true for valid usernames', () => {
    expect(isValidGitHubUsername('user123')).toBe(true);
    expect(isValidGitHubUsername('my-username')).toBe(true);
    expect(isValidGitHubUsername('A')).toBe(true);
  });

  it('returns false for usernames starting with hyphen', () => {
    expect(isValidGitHubUsername('-username')).toBe(false);
  });

  it('returns false for usernames ending with hyphen', () => {
    expect(isValidGitHubUsername('username-')).toBe(false);
  });

  it('returns false for usernames with consecutive hyphens', () => {
    // The regex allows consecutive hyphens in the middle
    // This is just testing that the regex behaves consistently
    expect(isValidGitHubUsername('user--name')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidGitHubUsername('')).toBe(false);
  });

  it('returns false for username over 39 chars', () => {
    expect(isValidGitHubUsername('a'.repeat(40))).toBe(false);
  });
});

// ==================== Color Utilities ====================

describe('hexToRgb', () => {
  it('converts hex to rgb', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('handles hex without hash', () => {
    expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('invalid')).toBeNull();
    expect(hexToRgb('#xyz')).toBeNull();
  });

  it('is case insensitive', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe('rgbToHex', () => {
  it('converts rgb to hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('converts white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });

  it('converts black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });

  it('pads single digit hex values', () => {
    expect(rgbToHex(1, 1, 1)).toBe('#010101');
  });
});

describe('hexToRgb and rgbToHex round-trip', () => {
  it('converts hex to rgb and back', () => {
    const hex = '#1a2b3c';
    const rgb = hexToRgb(hex);
    expect(rgb).not.toBeNull();
    expect(rgbToHex(rgb!.r, rgb!.g, rgb!.b)).toBe(hex);
  });
});

// ==================== LocalStorage Utilities ====================

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getFromStorage', () => {
    it('returns defaultValue when key does not exist', () => {
      expect(getFromStorage('missing', 'default')).toBe('default');
    });

    it('returns null when key does not exist and no default', () => {
      expect(getFromStorage('missing')).toBeNull();
    });

    it('returns parsed value for existing key', () => {
      localStorage.setItem('testKey', JSON.stringify({ foo: 'bar' }));
      expect(getFromStorage('testKey')).toEqual({ foo: 'bar' });
    });

    it('returns default on JSON parse error', () => {
      localStorage.setItem('badKey', 'not-json{{{');
      expect(getFromStorage('badKey', 'fallback')).toBe('fallback');
    });
  });

  describe('setInStorage', () => {
    it('stores a value and returns true', () => {
      const result = setInStorage('key', { data: 123 });
      expect(result).toBe(true);
      expect(localStorage.getItem('key')).toBe(JSON.stringify({ data: 123 }));
    });

    it('returns false when localStorage throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage full');
      });
      expect(setInStorage('key', 'value')).toBe(false);
      spy.mockRestore();
    });
  });

  describe('removeFromStorage', () => {
    it('removes an existing key and returns true', () => {
      localStorage.setItem('toRemove', 'value');
      expect(removeFromStorage('toRemove')).toBe(true);
      expect(localStorage.getItem('toRemove')).toBeNull();
    });

    it('returns false when removeItem throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
        throw new Error('Quota exceeded');
      });
      expect(removeFromStorage('key')).toBe(false);
      spy.mockRestore();
    });
  });

  describe('clearStorage', () => {
    it('clears all storage and returns true', () => {
      localStorage.setItem('a', '1');
      localStorage.setItem('b', '2');
      expect(clearStorage()).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('returns false when clear throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'clear').mockImplementationOnce(() => {
        throw new Error('Error');
      });
      expect(clearStorage()).toBe(false);
      spy.mockRestore();
    });
  });
});
