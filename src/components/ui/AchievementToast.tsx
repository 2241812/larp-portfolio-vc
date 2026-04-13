'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, ACHIEVEMENTS } from '@/constants/gameConstants';

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

const AchievementToast = memo(function AchievementToast({
  achievements,
  onDismiss,
}: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievements.map((achievement, idx) => {
        const data = ACHIEVEMENTS[achievement];
        if (!data) return null;

        return (
          <motion.div
            key={achievement}
            className="fixed bottom-20 right-6 z-40"
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: idx * 0.15 },
            }}
            exit={{ opacity: 0, x: 100 }}
            onAnimationComplete={() => {
              // Auto-dismiss after 3.5 seconds
              setTimeout(() => {
                onDismiss();
              }, 3500 - idx * 150);
            }}
          >
            <div className="bg-gradient-to-r from-purple-900/90 to-cyan-900/90 border border-purple-500 rounded-lg px-4 py-3 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{data.icon}</div>
                <div>
                  <div className="text-sm font-bold text-cyan-400">{data.label}</div>
                  <div className="text-xs text-neutral-400">{data.description}</div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
});

export default AchievementToast;
