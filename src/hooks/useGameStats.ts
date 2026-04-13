/**
 * Hook for persisting game statistics and achievements to localStorage
 * Tracks high scores per difficulty, achievements earned, and game history
 */

import { useEffect, useCallback, useState } from 'react';
import { Achievement, GameDifficulty, ACHIEVEMENTS } from '@/constants/gameConstants';

export interface GameStats {
  totalGamesPlayed: number;
  bestScores: Record<GameDifficulty, number>;
  highestCombo: number;
  achievementsEarned: Achievement[];
  lastGameScore: number;
  totalPointsEarned: number;
  averageScore: number;
  perfectGamesStreak: number;
}

const DEFAULT_STATS: GameStats = {
  totalGamesPlayed: 0,
  bestScores: {
    [GameDifficulty.Easy]: 0,
    [GameDifficulty.Medium]: 0,
    [GameDifficulty.Hard]: 0,
    [GameDifficulty.Insane]: 0,
  },
  highestCombo: 0,
  achievementsEarned: [],
  lastGameScore: 0,
  totalPointsEarned: 0,
  averageScore: 0,
  perfectGamesStreak: 0,
};

const STATS_KEY = 'contribution-game-stats';

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) {
        setStats(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load game stats:', err);
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (err) {
      console.error('Failed to save game stats:', err);
    }
  }, [stats]);

  const recordGameResult = useCallback(
    (score: number, combo: number, difficulty: GameDifficulty, gameTime: number) => {
      setStats((prev) => {
        const newStats = { ...prev };
        const isBestScore = score > (newStats.bestScores[difficulty] || 0);

        // Update best score for this difficulty
        if (isBestScore) {
          newStats.bestScores[difficulty] = score;
        }

        // Update highest combo
        if (combo > newStats.highestCombo) {
          newStats.highestCombo = combo;
        }

        // Update game counts and averages
        newStats.totalGamesPlayed += 1;
        newStats.lastGameScore = score;
        newStats.totalPointsEarned += score;
        newStats.averageScore = Math.floor(
          newStats.totalPointsEarned / newStats.totalGamesPlayed
        );

        // Check for new achievements
        const earnedThisGame: Achievement[] = [];

        if (score >= 10 && !newStats.achievementsEarned.includes(Achievement.FirstBlood)) {
          newStats.achievementsEarned.push(Achievement.FirstBlood);
          earnedThisGame.push(Achievement.FirstBlood);
        }

        if (
          combo >= 50 &&
          !newStats.achievementsEarned.includes(Achievement.ComboMaster)
        ) {
          newStats.achievementsEarned.push(Achievement.ComboMaster);
          earnedThisGame.push(Achievement.ComboMaster);
        }

        if (
          difficulty === GameDifficulty.Hard &&
          gameTime < 30000 &&
          !newStats.achievementsEarned.includes(Achievement.SpeedRunner)
        ) {
          newStats.achievementsEarned.push(Achievement.SpeedRunner);
          earnedThisGame.push(Achievement.SpeedRunner);
        }

        if (combo >= 7 && !newStats.achievementsEarned.includes(Achievement.PerfectWeek)) {
          newStats.achievementsEarned.push(Achievement.PerfectWeek);
          earnedThisGame.push(Achievement.PerfectWeek);
        }

        if (
          score >= 1000 &&
          !newStats.achievementsEarned.includes(Achievement.ThousandPoints)
        ) {
          newStats.achievementsEarned.push(Achievement.ThousandPoints);
          earnedThisGame.push(Achievement.ThousandPoints);
        }

        // Track perfect games streak
        if (isBestScore && score > 100) {
          newStats.perfectGamesStreak += 1;
          if (
            newStats.perfectGamesStreak >= 5 &&
            !newStats.achievementsEarned.includes(Achievement.GoldenStreak)
          ) {
            newStats.achievementsEarned.push(Achievement.GoldenStreak);
            earnedThisGame.push(Achievement.GoldenStreak);
          }
        } else {
          newStats.perfectGamesStreak = 0;
        }

        // Check mode mastery
        const modesWithBestScores = Object.values(newStats.bestScores).filter(
          (score) => score > 0
        ).length;
        if (
          modesWithBestScores >= 4 &&
          !newStats.achievementsEarned.includes(Achievement.ModeMastery)
        ) {
          newStats.achievementsEarned.push(Achievement.ModeMastery);
          earnedThisGame.push(Achievement.ModeMastery);
        }

        setNewAchievements(earnedThisGame);
        return newStats;
      });
    },
    []
  );

  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    try {
      localStorage.removeItem(STATS_KEY);
    } catch (err) {
      console.error('Failed to reset stats:', err);
    }
  }, []);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    stats,
    recordGameResult,
    resetStats,
    newAchievements,
    clearNewAchievements,
  };
}
