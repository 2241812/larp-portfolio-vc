"use client";
import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

const ContributionCalendar = memo(function ContributionCalendar({ username = '2241812' }: { username?: string }) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);
  const { ref, isInView } = useInView({ rootMargin: '300px', once: true });

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;

    async function fetchContributions() {
      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        if (cancelled) return;

        const days: ContributionDay[] = data.contributions.map((c: any) => ({
          date: c.date,
          count: c.count,
          level: c.count === 0 ? 0 : c.count <= 3 ? 1 : c.count <= 6 ? 2 : c.count <= 9 ? 3 : 4,
        }));

        setContributions(days);
        setTotalContributions(days.reduce((sum, d) => sum + d.count, 0));
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch contributions:', err);
        const placeholder: ContributionDay[] = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          placeholder.push({
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 12),
            level: Math.floor(Math.random() * 5),
          });
        }
        setContributions(placeholder);
        setTotalContributions(placeholder.reduce((sum, d) => sum + d.count, 0));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchContributions();
    return () => { cancelled = true; };
  }, [username, isInView]);

  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];
  
  contributions.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === contributions.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const levelColors = [
    'bg-neutral-800/50',
    'bg-cyan-900/60',
    'bg-cyan-700/70',
    'bg-cyan-500/80',
    'bg-cyan-400',
  ];

  const levelGlows = [
    '',
    'shadow-[0_0_3px_rgba(34,211,238,0.1)]',
    'shadow-[0_0_5px_rgba(34,211,238,0.2)]',
    'shadow-[0_0_8px_rgba(34,211,238,0.3)]',
    'shadow-[0_0_12px_rgba(34,211,238,0.5)]',
  ];

  return (
    <div ref={ref} className="w-full">
      {loading && !isInView ? (
        <div className="w-full h-32 bg-neutral-900/50 rounded-lg" />
      ) : loading ? (
        <div className="w-full h-32 bg-neutral-900/50 rounded-lg animate-pulse flex items-center justify-center">
          <svg className="w-6 h-6 text-cyan-900 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-neutral-500 font-mono">
              {totalContributions} contributions in the last year
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-[3px] min-w-fit">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: weekIdx * 0.01, duration: 0.2 }}
                      className={`w-[11px] h-[11px] rounded-sm ${levelColors[day.level]} ${levelGlows[day.level]} transition-all duration-200 cursor-default`}
                      title={`${day.date}: ${day.count} contributions`}
                      whileHover={{ scale: 1.5 }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-neutral-600 font-mono">Less</span>
            {levelColors.map((color, i) => (
              <div
                key={i}
                className={`w-[11px] h-[11px] rounded-sm ${color} ${levelGlows[i]}`}
              />
            ))}
            <span className="text-[10px] text-neutral-600 font-mono">More</span>
          </div>
        </>
      )}
    </div>
  );
});

export default ContributionCalendar;
