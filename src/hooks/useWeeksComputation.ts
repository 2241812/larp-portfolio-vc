import { useMemo } from 'react';
import type { ContributionDay } from './useContributionData';

const CELL_SIZE = 14;
const DAYS_IN_YEAR = 365;

export const useWeeksComputation = (contributions: ContributionDay[]) => {
  const result = useMemo(() => {
    if (contributions.length === 0) {
      return { weeks: [], totalWidth: 0, contributionMap: new Map() };
    }

    // Build a map for quick lookup
    const contributionMap = new Map<string, number>();
    contributions.forEach(c => contributionMap.set(c.date, c.count));

    // Generate all days in the past year
    const today = new Date();
    const fullDays: ContributionDay[] = [];
    for (let i = DAYS_IN_YEAR - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = contributionMap.get(dateStr) ?? 0;
      
      fullDays.push({
        date: dateStr,
        count,
        level: count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4,
      });
    }

    // Group into weeks (7 days per week)
    const weeks: ContributionDay[][] = [];
    for (let i = 0; i < fullDays.length; i += 7) {
      const week = fullDays.slice(i, i + 7);
      // Pad week if it has fewer than 7 days
      while (week.length < 7) {
        week.push({ date: '', count: 0, level: 0 });
      }
      weeks.push(week);
    }

    const totalWidth = weeks.length * CELL_SIZE;

    return { weeks, totalWidth, contributionMap };
  }, [contributions]);

  return result;
};
