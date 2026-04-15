/**
 * Tests for DOM utility functions in helpers.ts
 * Uses jsdom environment (default for Jest with Next.js)
 */

import { getScrollProgress, isElementInView } from '@/utils/helpers';

describe('getScrollProgress', () => {
  it('returns 0 for null element', () => {
    expect(getScrollProgress(null)).toBe(0);
  });

  it('returns a value clamped between 0 and 1', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({
        top: 500,
        bottom: 600,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    // With window.innerHeight = 768 (jsdom default) and top = 500
    // progress = 1 - 500/768 = ~0.35
    const progress = getScrollProgress(el);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(1);
  });

  it('returns 1 when element top is 0 (fully scrolled into view)', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({
        top: 0,
        bottom: 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    const progress = getScrollProgress(el);
    expect(progress).toBe(1);
  });

  it('returns 0 when element is far below viewport', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({
        top: 9999,
        bottom: 10099,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    const progress = getScrollProgress(el);
    expect(progress).toBe(0);
  });
});

describe('isElementInView', () => {
  it('returns false for null element', () => {
    expect(isElementInView(null)).toBe(false);
  });

  it('returns true when element is within viewport', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({
        top: 100,
        bottom: 200,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    // jsdom innerHeight defaults to 768 — element top (100) <= 768 and bottom (200) >= 0
    expect(isElementInView(el)).toBe(true);
  });

  it('returns false when element is below viewport', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({
        top: 9999,
        bottom: 10099,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    expect(isElementInView(el)).toBe(false);
  });

  it('returns false when element is above viewport (negative bottom)', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({
        top: -200,
        bottom: -50,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    expect(isElementInView(el)).toBe(false);
  });

  it('respects the threshold parameter', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({
        top: 760, // Just inside 768px viewport
        bottom: 860,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
      }),
    });

    // Without threshold: top (760) <= 768 → in view
    expect(isElementInView(el, 0)).toBe(true);
    // With threshold of 100: top + 100 = 860 > 768 → not in view
    expect(isElementInView(el, 100)).toBe(false);
  });
});
