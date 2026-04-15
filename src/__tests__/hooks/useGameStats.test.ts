/**
 * Tests for useGameStats hook
 * Tests achievement tracking, score recording, and reset functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useGameStats } from '@/hooks/useGameStats';
import { Achievement, GameDifficulty } from '@/constants/gameConstants';

// An in-memory store backing the localStorage replacement.
const mockStore: Record<string, string> = {};

const storageMock: Storage = {
  getItem: (key: string) => mockStore[key] ?? null,
  setItem: (key: string, value: string) => { mockStore[key] = value; },
  removeItem: (key: string) => { delete mockStore[key]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); },
  get length() { return Object.keys(mockStore).length; },
  key: (_i: number) => null,
};

// Replace the global localStorage so that compiled hook modules see our mock.
// @ts-ignore
global.localStorage = storageMock;
try {
  Object.defineProperty(window, 'localStorage', {
    value: storageMock, writable: true, configurable: true,
  });
} catch { /* already locked – global override is sufficient */ }

// Flush any pending React effect microtasks from the PREVIOUS test before
// clearing the store, so they land in (and are cleared from) the store.
afterEach(async () => {
  await act(async () => {});
  storageMock.clear();
});

describe('useGameStats', () => {
  it('initializes with default stats', () => {
    const { result } = renderHook(() => useGameStats());
    expect(result.current.stats.totalGamesPlayed).toBe(0);
    expect(result.current.stats.achievementsEarned).toEqual([]);
    expect(result.current.stats.highestCombo).toBe(0);
    expect(result.current.newAchievements).toEqual([]);
  });

  it('loads persisted stats from localStorage on mount', () => {
    const savedStats = {
      totalGamesPlayed: 5,
      bestScores: { easy: 0, medium: 0, hard: 0, insane: 0 },
      highestCombo: 10,
      achievementsEarned: [],
      lastGameScore: 100,
      totalPointsEarned: 500,
      averageScore: 100,
      perfectGamesStreak: 0,
    };
    storageMock.setItem('contribution-game-stats', JSON.stringify(savedStats));
    const { result } = renderHook(() => useGameStats());
    expect(result.current.stats.totalGamesPlayed).toBe(5);
    expect(result.current.stats.highestCombo).toBe(10);
  });

  describe('recordGameResult', () => {
    it('increments totalGamesPlayed', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(50, 3, GameDifficulty.Easy, 60000); });
      expect(result.current.stats.totalGamesPlayed).toBe(1);
    });

    it('updates lastGameScore', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(75, 5, GameDifficulty.Easy, 60000); });
      expect(result.current.stats.lastGameScore).toBe(75);
    });

    it('updates bestScores for the difficulty', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(100, 5, GameDifficulty.Medium, 60000); });
      expect(result.current.stats.bestScores[GameDifficulty.Medium]).toBe(100);
    });

    it('does not lower best score within a single session', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(200, 5, GameDifficulty.Medium, 60000); });
      act(() => { result.current.recordGameResult(50, 3, GameDifficulty.Medium, 60000); });
      expect(result.current.stats.bestScores[GameDifficulty.Medium]).toBe(200);
    });

    it('updates highestCombo', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(50, 25, GameDifficulty.Easy, 60000); });
      expect(result.current.stats.highestCombo).toBe(25);
    });

    it('calculates averageScore correctly after two games', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(100, 5, GameDifficulty.Easy, 60000); });
      act(() => { result.current.recordGameResult(200, 5, GameDifficulty.Easy, 60000); });
      expect(result.current.stats.averageScore).toBe(150);
    });

    it('earns FirstBlood achievement when score >= 10', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(10, 0, GameDifficulty.Easy, 60000); });
      expect(result.current.stats.achievementsEarned).toContain(Achievement.FirstBlood);
    });

    it('does not earn FirstBlood when score < 10', () => {
      const { result } = renderHook(() => useGameStats());
      // Capture state before; score=9 should not add FirstBlood
      const before = result.current.stats.achievementsEarned.filter(
        a => a === Achievement.FirstBlood
      ).length;
      act(() => { result.current.recordGameResult(9, 0, GameDifficulty.Easy, 60000); });
      const after = result.current.stats.achievementsEarned.filter(
        a => a === Achievement.FirstBlood
      ).length;
      expect(after).toBe(before);
    });

    it('earns ComboMaster achievement when combo >= 50', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(100, 50, GameDifficulty.Easy, 60000); });
      expect(result.current.stats.achievementsEarned).toContain(Achievement.ComboMaster);
    });

    it('earns PerfectWeek achievement when combo >= 7', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(100, 7, GameDifficulty.Easy, 60000); });
      expect(result.current.stats.achievementsEarned).toContain(Achievement.PerfectWeek);
    });

    it('earns ThousandPoints achievement when score >= 1000', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(1000, 0, GameDifficulty.Easy, 60000); });
      expect(result.current.stats.achievementsEarned).toContain(Achievement.ThousandPoints);
    });

    it('earns SpeedRunner achievement on Hard difficulty under 30s', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(50, 0, GameDifficulty.Hard, 25000); });
      expect(result.current.stats.achievementsEarned).toContain(Achievement.SpeedRunner);
    });

    it('does not earn SpeedRunner when time >= 30s on Hard', () => {
      const { result } = renderHook(() => useGameStats());
      const before = result.current.stats.achievementsEarned.filter(
        a => a === Achievement.SpeedRunner
      ).length;
      act(() => { result.current.recordGameResult(50, 0, GameDifficulty.Hard, 30000); });
      const after = result.current.stats.achievementsEarned.filter(
        a => a === Achievement.SpeedRunner
      ).length;
      expect(after).toBe(before);
    });

    it('does not earn SpeedRunner on Easy difficulty even when fast', () => {
      const { result } = renderHook(() => useGameStats());
      const before = result.current.stats.achievementsEarned.filter(
        a => a === Achievement.SpeedRunner
      ).length;
      act(() => { result.current.recordGameResult(50, 0, GameDifficulty.Easy, 10000); });
      const after = result.current.stats.achievementsEarned.filter(
        a => a === Achievement.SpeedRunner
      ).length;
      expect(after).toBe(before);
    });

    it('earns GoldenStreak after 5 consecutive best-score games over 100', () => {
      const { result } = renderHook(() => useGameStats());
      // Use scores guaranteed to beat any state that could have leaked from
      // other tests (max score elsewhere is ~1000, so start at 10001).
      for (let i = 1; i <= 5; i++) {
        act(() => {
          result.current.recordGameResult(10000 + i * 100, 0, GameDifficulty.Easy, 60000);
        });
      }
      expect(result.current.stats.achievementsEarned).toContain(Achievement.GoldenStreak);
    });

    it('earns ModeMastery when all 4 difficulties have best scores', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(100, 0, GameDifficulty.Easy, 60000); });
      act(() => { result.current.recordGameResult(100, 0, GameDifficulty.Medium, 60000); });
      act(() => { result.current.recordGameResult(100, 0, GameDifficulty.Hard, 60000); });
      act(() => { result.current.recordGameResult(100, 0, GameDifficulty.Insane, 60000); });
      expect(result.current.stats.achievementsEarned).toContain(Achievement.ModeMastery);
    });

    it('does not duplicate achievements on repeated games', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.recordGameResult(10, 0, GameDifficulty.Easy, 60000); });
      act(() => { result.current.recordGameResult(10, 0, GameDifficulty.Easy, 60000); });
      const count = result.current.stats.achievementsEarned.filter(
        a => a === Achievement.FirstBlood
      ).length;
      expect(count).toBe(1);
    });
  });

  describe('resetStats', () => {
    it('resets totalGamesPlayed and averageScore to 0', async () => {
      const { result } = renderHook(() => useGameStats());
      await act(async () => { result.current.recordGameResult(500, 20, GameDifficulty.Easy, 60000); });
      await act(async () => { result.current.resetStats(); });
      expect(result.current.stats.totalGamesPlayed).toBe(0);
      expect(result.current.stats.averageScore).toBe(0);
    });
  });

  describe('clearNewAchievements', () => {
    it('returns empty newAchievements array after clearing', () => {
      const { result } = renderHook(() => useGameStats());
      act(() => { result.current.clearNewAchievements(); });
      expect(result.current.newAchievements).toEqual([]);
    });
  });
});
