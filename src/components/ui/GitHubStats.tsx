"use client";
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import ContributionCalendar from './ContributionCalendar';
import { useInView } from '@/hooks/useInView';

// ── Types ──
interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
  name: string;
  bio: string;
}

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string; url: string };
  created_at: string;
  payload: {
    ref?: string;
    ref_type?: string;
    action?: string;
    commits?: { message: string; sha: string }[];
    pages?: { page_name: string; action: string; title: string }[];
    issue?: { title: string; number: number };
    pull_request?: { title: string; number: number };
    comment?: { body: string };
    forkee?: { full_name: string };
    release?: { tag_name: string; name: string };
  };
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}

// ── Helpers ──
function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${weeks}w ago`;
}

function getEventInfo(event: GitHubEvent): { label: string; icon: React.ReactNode; detail: string } {
  const { type, payload } = event;

  switch (type) {
    case 'PushEvent': {
      const count = payload.commits?.length ?? 0;
      const branch = payload.ref?.replace('refs/heads/', '') ?? 'main';
      return {
        label: 'Pushed to',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        ),
        detail: `${count} commit${count !== 1 ? 's' : ''} to ${branch}`,
      };
    }
    case 'CreateEvent':
      return {
        label: 'Created',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        ),
        detail: `${payload.ref_type ?? 'resource'} ${payload.ref ?? ''}`,
      };
    case 'DeleteEvent':
      return {
        label: 'Deleted',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        detail: `${payload.ref_type ?? 'resource'} ${payload.ref ?? ''}`,
      };
    case 'WatchEvent':
      return {
        label: payload.action === 'started' ? 'Starred' : 'Watched',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
        detail: payload.action === 'started' ? 'Added to stars' : 'Started watching',
      };
    case 'ForkEvent':
      return {
        label: 'Forked',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v12a3 3 0 003 3h3m6-12a3 3 0 00-3 3h3m0 0a3 3 0 00-3-3m0 0a3 3 0 003 3m-3 9a3 3 0 003 3m0 0a3 3 0 003-3" />
          </svg>
        ),
        detail: `Forked to ${payload.forkee?.full_name ?? 'fork'}`,
      };
    case 'IssuesEvent':
      return {
        label: `Issue ${payload.action ?? 'updated'}`,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        detail: `#${payload.issue?.number ?? ''} ${payload.issue?.title ?? ''}`.trim(),
      };
    case 'PullRequestEvent':
      return {
        label: `PR ${payload.action ?? 'updated'}`,
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        ),
        detail: `#${payload.pull_request?.number ?? ''} ${payload.pull_request?.title ?? ''}`.trim(),
      };
    case 'IssueCommentEvent':
      return {
        label: 'Commented',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        detail: `#${payload.issue?.number ?? ''} comment`,
      };
    case 'ReleaseEvent':
      return {
        label: 'Released',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
        detail: payload.release?.tag_name ?? payload.release?.name ?? '',
      };
    case 'GollumEvent': {
      const page = payload.pages?.[0];
      return {
        label: 'Wiki',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
        detail: page ? `${page.action} ${page.page_name}` : 'Updated',
      };
    }
    default:
      return {
        label: type.replace('Event', ''),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        detail: '',
      };
  }
}

// Calculate streak from contribution data
function calculateStreak(contributions: { date: string; count: number }[]): StreakData {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Current streak: count backwards from today
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = new Date(sorted[i].date);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1 && sorted[i].count > 0) {
      currentStreak++;
    } else if (diffDays > 1) {
      break;
    }
  }

  // Longest streak
  for (const day of sorted) {
    if (day.count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const totalContributions = contributions.reduce((sum, d) => sum + d.count, 0);

  return { currentStreak, longestStreak, totalContributions };
}

// ── Animations ──
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInVariants: Variants = {
  hidden: { opacity: 0, x: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ── Skeleton Loader ──
const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <div className="group relative bg-neutral-950/70 backdrop-blur-xl border border-cyan-900/30 rounded-xl p-5 flex flex-col items-center text-center cursor-default overflow-hidden">
      <div className="w-10 h-10 rounded-lg bg-cyan-900/20 animate-pulse mb-3" />
      <div className="h-8 w-16 bg-neutral-800 rounded animate-pulse mb-1" />
      <div className="h-3 w-20 bg-neutral-800/60 rounded animate-pulse" />
    </div>
  );
});

// ── Streak Card (interactive, no external images) ──
const StreakCard = memo(function StreakCard({ streak, loading }: { streak: StreakData | null; loading: boolean }) {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  if (loading) {
    return (
      <motion.div
        variants={fadeInVariants}
        className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 flex flex-col"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Streak</h3>
        </div>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-16 w-24 bg-neutral-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-neutral-800/60 rounded animate-pulse" />
        </div>
      </motion.div>
    );
  }

  const stats = [
    { key: 'current', label: 'Current Streak', value: streak?.currentStreak ?? 0, icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
    { key: 'longest', label: 'Longest Streak', value: streak?.longestStreak ?? 0, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { key: 'total', label: 'Total Contributions', value: streak?.totalContributions ?? 0, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ];

  return (
    <motion.div
      variants={fadeInVariants}
      whileHover={{
        borderColor: '#22d3ee66',
        boxShadow: '0 0 40px rgba(34,211,238,0.08)',
      }}
      className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Streak</h3>
      </div>

      <div className="flex flex-col gap-2">
        {stats.map((stat) => (
          <motion.div
            key={stat.key}
            className="relative rounded-xl p-4 cursor-default overflow-hidden"
            style={{
              background: hoveredStat === stat.key ? 'rgba(34,211,238,0.05)' : 'rgba(6,182,212,0.03)',
              border: `1px solid ${hoveredStat === stat.key ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.08)'}`,
            }}
            whileHover={{
              scale: 1.02,
              background: 'rgba(34,211,238,0.08)',
              borderColor: '#22d3ee40',
            }}
            onHoverStart={() => setHoveredStat(stat.key)}
            onHoverEnd={() => setHoveredStat(null)}
            transition={{ duration: 0.2 }}
          >
            {/* Hover glow effect */}
            {hoveredStat === stat.key && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'radial-gradient(circle at center, rgba(34,211,238,0.1) 0%, transparent 70%)',
                }}
              />
            )}

            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mb-0.5">
                  {stat.label}
                </div>
                <motion.div
                  className="text-2xl font-black text-cyan-400"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                  animate={{
                    scale: hoveredStat === stat.key ? 1.05 : 1,
                    textShadow: hoveredStat === stat.key ? '0 0 20px rgba(34,211,238,0.4)' : 'none',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {stat.value.toLocaleString()}
                </motion.div>
              </div>
              {hoveredStat === stat.key && (
                <motion.div
                  className="flex-shrink-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

// ── Main Component ──
const GitHubStats = memo(function GitHubStats() {
  const { ref: sectionRef, isInView } = useInView({ rootMargin: '200px', once: true });

  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const contributionDataRef = useRef<{ date: string; count: number }[]>([]);

  // Fetch user data from GitHub REST API
  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;

    async function fetchUserData() {
      try {
        const res = await fetch('https://api.github.com/users/2241812');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: GitHubUser = await res.json();
        if (cancelled) return;
        setUserData(data);
      } catch (err) {
        console.error('Failed to fetch GitHub user:', err);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    fetchUserData();
    return () => { cancelled = true; };
  }, [isInView]);

  // Fetch activity events
  const fetchActivity = useCallback(async () => {
    try {
      setActivityError(false);
      const res = await fetch(
        'https://api.github.com/users/2241812/events/public?per_page=5',
        {
          headers: { Accept: 'application/vnd.github.v3+json' },
        }
      );
      if (!res.ok) throw new Error('API error');
      const data: GitHubEvent[] = await res.json();
      setEvents(data);
      setLastUpdated(new Date());
    } catch {
      setActivityError(true);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInView) return;
    fetchActivity();
    const interval = setInterval(fetchActivity, 300_000);
    return () => clearInterval(interval);
  }, [fetchActivity, isInView]);

  // Calculate streak from contribution calendar data
  const onContributionDataLoaded = useCallback((data: { date: string; count: number }[]) => {
    contributionDataRef.current = data;
    const streakData = calculateStreak(data);
    setStreak(streakData);
    setStreakLoading(false);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="github"
      className="min-h-screen flex items-center justify-center px-4 md:px-24 py-24 relative"
    >
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-5xl relative z-10"
      >
        {/* ── Section Header ── */}
        <motion.div variants={headingVariants} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              GitHub Overview
            </h2>
          </div>
          <div className="w-32 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
        </motion.div>

        {/* ── Unified Profile Card (profile + stats + streak merged) ── */}
        <motion.div
          variants={containerVariants}
          className="mb-8"
        >
          <motion.div
            variants={fadeInVariants}
            whileHover={{
              borderColor: '#22d3ee66',
              boxShadow: '0 0 40px rgba(34,211,238,0.08)',
            }}
            className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 flex flex-col"
          >
            {statsLoading ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-neutral-800 animate-pulse" />
                <div className="h-5 w-32 bg-neutral-800 rounded animate-pulse" />
                <div className="h-3 w-48 bg-neutral-800/60 rounded animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-4">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ) : userData ? (
              <div className="flex flex-col gap-4">
                {/* Centered profile image + name + bio */}
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={userData.avatar_url}
                    alt={userData.name || 'GitHub avatar'}
                    className="w-16 h-16 rounded-full border-2 border-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                  />
                  <div className="text-lg font-bold text-neutral-100" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    {userData.name || '2241812'}
                  </div>
                  {userData.bio && (
                    <p className="text-sm text-neutral-400 text-center max-w-xs">
                      {userData.bio}
                    </p>
                  )}
                </div>

                {/* Horizontal divider */}
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900/40 to-transparent" />

                {/* Two 2x2 grids side by side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Profile stats 2x2 */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Repos', value: userData.public_repos.toLocaleString(), icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
                      { label: 'Followers', value: userData.followers.toLocaleString(), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                      { label: 'Following', value: userData.following.toLocaleString(), icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
                      { label: 'Joined', value: new Date(userData.created_at).getFullYear().toString(), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        className="relative rounded-lg p-3 flex flex-col items-center text-center bg-cyan-950/20 border border-cyan-900/30 cursor-default overflow-hidden"
                        whileHover={{
                          scale: 1.04,
                          borderColor: '#22d3ee66',
                          boxShadow: '0 0 15px rgba(34,211,238,0.12)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-7 h-7 rounded-md bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                          </svg>
                        </div>
                        <motion.span
                          className="text-lg font-black text-neutral-100 tracking-tight"
                          style={{ fontFamily: 'var(--font-orbitron)' }}
                          whileHover={{ color: '#22d3ee' }}
                        >
                          {stat.value}
                        </motion.span>
                        <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-widest mt-0.5">
                          {stat.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Streak stats 2x2 */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Streak', value: `${streakLoading ? '...' : streak?.currentStreak ?? 0}`, icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
                      { label: 'Longest', value: `${streakLoading ? '...' : streak?.longestStreak ?? 0}`, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                      { label: 'Total', value: `${streakLoading ? '...' : (streak?.totalContributions ?? 0).toLocaleString()}`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                      { label: 'Avg/Day', value: streakLoading ? '...' : `${streak ? (streak.totalContributions / 365).toFixed(1) : '0'}`, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        className="relative rounded-lg p-3 flex flex-col items-center text-center bg-cyan-900/10 border border-cyan-700/30 cursor-default overflow-hidden"
                        whileHover={{
                          scale: 1.04,
                          borderColor: '#22d3ee80',
                          boxShadow: '0 0 15px rgba(34,211,238,0.18)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-7 h-7 rounded-md bg-cyan-800/40 border border-cyan-600/40 flex items-center justify-center text-cyan-300 mb-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                          </svg>
                        </div>
                        <motion.span
                          className="text-lg font-black text-cyan-300 tracking-tight"
                          style={{ fontFamily: 'var(--font-orbitron)' }}
                          whileHover={{
                            color: '#67e8f9',
                            textShadow: '0 0 12px rgba(34,211,238,0.5)',
                          }}
                        >
                          {stat.value}
                        </motion.span>
                        <span className="text-[9px] text-cyan-600 font-mono uppercase tracking-widest mt-0.5">
                          {stat.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>

        {/* ── Contribution Calendar ── */}
        <motion.div
          variants={fadeInVariants}
          whileHover={{
            borderColor: '#22d3ee66',
            boxShadow: '0 0 40px rgba(34,211,238,0.08)',
          }}
          className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Contribution Activity</h3>
          </div>
          <ContributionCalendar username="2241812" onDataLoaded={onContributionDataLoaded} />
        </motion.div>

        {/* ── Recent Activity Feed ── */}
        <motion.div
          variants={containerVariants}
          className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-6 md:p-8"
        >
          <motion.div
            variants={headingVariants}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                Recent Activity
              </h3>
            </div>
            {lastUpdated && (
              <span className="text-[10px] text-neutral-600 font-mono">
                synced {getRelativeTime(lastUpdated.toISOString())}
              </span>
            )}
          </motion.div>

          {activityLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-neutral-900/60 border border-cyan-900/20 animate-pulse"
                />
              ))}
            </div>
          )}

          {!activityLoading && activityError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <svg className="w-8 h-8 mx-auto mb-3 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-neutral-600 font-mono text-sm mb-3">Unable to fetch GitHub activity</p>
              <button
                onClick={fetchActivity}
                className="px-4 py-2 text-xs font-mono text-cyan-400 border border-cyan-800/50 rounded-lg hover:bg-cyan-900/20 hover:border-cyan-600/50 transition-all duration-300 cursor-pointer"
              >
                Retry
              </button>
            </motion.div>
          )}

          {!activityLoading && !activityError && events.length > 0 && (
            <motion.div variants={containerVariants} className="space-y-2">
              {events.map((event) => {
                const info = getEventInfo(event);
                return (
                  <motion.a
                    key={event.id}
                    href={`https://github.com/${event.repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={slideInVariants}
                    whileHover={{
                      scale: 1.01,
                      borderColor: '#22d3ee66',
                      boxShadow: '0 0 24px rgba(34,211,238,0.08)',
                    }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center gap-3 p-3 md:p-4 rounded-xl bg-cyan-950/10 border border-cyan-900/30 hover:border-cyan-500/40 transition-colors duration-300 cursor-pointer no-underline"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-900/50 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-300">
                      {info.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-[10px] md:text-xs font-mono text-cyan-500 uppercase tracking-wider">
                          {info.label}
                        </span>
                        <span className="text-neutral-700 text-[10px]">/</span>
                        <span className="text-xs md:text-sm font-medium text-neutral-200 truncate">
                          {event.repo.name}
                        </span>
                      </div>
                      {info.detail && (
                        <p className="text-[10px] md:text-xs text-neutral-500 font-mono truncate">
                          {info.detail}
                        </p>
                      )}
                    </div>

                    <span className="flex-shrink-0 text-[10px] md:text-xs text-neutral-600 font-mono whitespace-nowrap">
                      {getRelativeTime(event.created_at)}
                    </span>

                    <svg
                      className="w-3.5 h-3.5 text-neutral-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                );
              })}
            </motion.div>
          )}

          {!activityLoading && !activityError && events.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-neutral-600 font-mono text-sm"
            >
              No recent activity found
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={cardVariants} className="flex justify-end">
          <a
            href="https://github.com/2241812"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-neutral-600 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group"
          >
            View full GitHub profile
            <svg
              className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
});

export default GitHubStats;
