'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { GameDifficulty, DIFFICULTY_SETTINGS, Achievement } from '@/constants/gameConstants';
import { GameStats } from '@/hooks/useGameStats';

interface GameModeDialogProps {
  isOpen: boolean;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
  onClose: () => void;
  stats: GameStats;
  achievements: Achievement[];
}

const GameModeDialog = memo(function GameModeDialog({
  isOpen,
  onSelectDifficulty,
  onClose,
  stats,
  achievements,
}: GameModeDialogProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-neutral-900 border border-cyan-500 rounded-lg p-6 max-w-md w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Solo Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-800">
          <button className="px-4 py-2 text-sm text-cyan-400 border-b-2 border-cyan-400 font-medium">
            Select Mode
          </button>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-3 mb-6">
          {Object.entries(DIFFICULTY_SETTINGS).map(([difficulty, settings]) => {
            const bestScore = stats.bestScores[difficulty as GameDifficulty] || 0;
            const isNew = bestScore === 0;

            return (
              <motion.button
                key={difficulty}
                className={`w-full p-3 rounded-lg border-2 font-mono text-sm transition-all ${
                  settings.borderColor
                } hover:brightness-110`}
                onClick={() => {
                  onSelectDifficulty(difficulty as GameDifficulty);
                  onClose();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-left font-bold text-neutral-100">{settings.label}</div>
                    <div className="text-xs text-neutral-500 text-left">
                      Speed: {(settings.baseSpeed * 100).toFixed(0)}% | Multiplier: {settings.pointMultiplier}x
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${isNew ? 'text-neutral-600' : 'text-cyan-400'}`}>
                      {bestScore || '-'}
                    </div>
                    {isNew && <div className="text-[10px] text-neutral-600">Locked</div>}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-neutral-800/40 rounded-lg p-4 mb-6 border border-neutral-700">
          <div className="text-xs text-neutral-500 font-mono mb-3">LIFETIME STATS</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-neutral-500">Games</div>
              <div className="text-cyan-400 font-bold">{stats.totalGamesPlayed}</div>
            </div>
            <div>
              <div className="text-neutral-500">Avg Score</div>
              <div className="text-cyan-400 font-bold">{stats.averageScore}</div>
            </div>
            <div>
              <div className="text-neutral-500">Total Points</div>
              <div className="text-cyan-400 font-bold">{stats.totalPointsEarned}</div>
            </div>
            <div>
              <div className="text-neutral-500">Best Combo</div>
              <div className="text-cyan-400 font-bold">{stats.highestCombo}x</div>
            </div>
          </div>
        </div>

        {/* Achievements Preview */}
        {achievements.length > 0 && (
          <div className="bg-neutral-800/40 rounded-lg p-4 mb-6 border border-neutral-700">
            <div className="text-xs text-neutral-500 font-mono mb-3">
              ACHIEVEMENTS ({achievements.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {achievements.slice(0, 5).map((ach) => (
                <div
                  key={ach}
                  className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center text-lg hover:bg-neutral-600 transition-colors"
                  title={ach}
                >
                  {/* Achievement icons would go here */}
                  ✓
                </div>
              ))}
              {achievements.length > 5 && (
                <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center text-xs font-bold text-cyan-400">
                  +{achievements.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSelectDifficulty(GameDifficulty.Medium);
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-bold text-white transition-colors"
          >
            Quick Start
          </button>
        </div>

        {/* Keyboard Hints */}
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <div className="text-[10px] text-neutral-600 font-mono space-y-1">
            <div>Press <span className="text-cyan-400">1-4</span> for difficulty</div>
            <div>Press <span className="text-cyan-400">SPACE</span> to start</div>
            <div>Press <span className="text-cyan-400">ESC</span> to quit</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default GameModeDialog;
