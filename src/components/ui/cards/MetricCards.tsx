"use client";
import React, { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedCounter - Animates numeric values incrementally
 * Used for displaying stats, durations, counts with smooth animations
 */
export const AnimatedCounter = memo(function AnimatedCounter({
  value,
  suffix = '',
  duration = 1000,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = value / (duration / 30);
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
});

/**
 * StatCard - Displays statistics with icon, label, and animated value
 * Commonly used for KPIs, metrics, and quick data display
 */
export const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  suffix,
  delay = 0,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className="p-4 rounded-lg bg-neutral-900/60 border border-cyan-900/30 hover:border-cyan-400/60 transition-all duration-300 text-center cursor-pointer"
    >
      <div className="flex justify-center mb-2 text-cyan-400">{icon}</div>
      <div className="text-2xl font-bold text-cyan-400 font-mono mb-1">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest">
        {label}
      </div>
    </motion.div>
  );
});

/**
 * AchievementBadge - Displays achievement/milestone with icon, title, and description
 * Used for highlighting accomplishments and key features
 */
export const AchievementBadge = memo(function AchievementBadge({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="p-4 rounded-xl bg-neutral-900/60 border border-cyan-900/30 hover:border-cyan-400/60 transition-all duration-300"
    >
      <div className="text-cyan-400 mb-2 text-xl">{icon}</div>
      <h4 className="text-sm font-semibold text-neutral-200 mb-1">{title}</h4>
      <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
    </motion.div>
  );
});

/**
 * TechStackItem - Displays a single tech category with count
 * Used for showing skill inventory, framework counts, etc.
 */
export const TechStackItem = memo(function TechStackItem({
  name,
  count,
  delay = 0,
  onClick,
}: {
  name: string;
  count: number;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(34,211,238,0.2)' }}
      onClick={onClick}
      className="p-3 rounded-lg bg-gradient-to-br from-cyan-900/20 to-neutral-900/40 border border-cyan-900/30 hover:border-cyan-400/60 transition-all duration-300 text-center cursor-pointer"
    >
      <div className="text-lg font-bold text-cyan-400 font-mono">{count}</div>
      <div className="text-xs text-neutral-400 uppercase tracking-widest font-mono">
        {name}
      </div>
    </motion.div>
  );
});
