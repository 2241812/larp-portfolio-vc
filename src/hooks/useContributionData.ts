import { useState, useEffect } from 'react';
import { useInView } from './useInView';

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

const calculateLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
};

export const useContributionData = (username: string = '2241812') => {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);
  const { ref: sectionRef, isInView } = useInView({ rootMargin: '300px', once: true });

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;

    const fetchContributions = async () => {
      try {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setDate(today.getDate() - 364);
        const toDate = today.toISOString().split('T')[0];
        const fromDate = oneYearAgo.toISOString().split('T')[0];
        
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?from=${fromDate}&to=${toDate}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        if (cancelled) return;

        const days: ContributionDay[] = data.contributions.map((c: { date: string; count: number }) => ({
          date: c.date,
          count: c.count,
          level: calculateLevel(c.count),
        }));

        setContributions(days);
        setTotalContributions(days.reduce((sum, d) => sum + d.count, 0));
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch contributions:', err);
        
        // Placeholder data
        const placeholder: ContributionDay[] = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const count = Math.floor(Math.random() * 12);
          placeholder.push({
            date: date.toISOString().split('T')[0],
            count,
            level: calculateLevel(count),
          });
        }
        setContributions(placeholder);
        setTotalContributions(placeholder.reduce((sum, d) => sum + d.count, 0));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContributions();
    return () => { cancelled = true; };
  }, [username, isInView]);

  return { contributions, loading, totalContributions, sectionRef };
};
