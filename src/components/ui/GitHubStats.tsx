"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';

// ── Types ──
interface StatData {
  label: string;
  value: string;
  icon: string;
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

// ── Image URLs ──
const STATS_IMG = 'https://github-readme-stats.vercel.app/api?username=2241812&theme=tokyonight&show_icons=true&hide_border=true';
const STREAK_IMG = 'https://github-streak-stats.herokuapp.com/?user=2241812&theme=tokyo-night&hide_border=true';
const ACTIVITY_GRAPH = 'https://github-readme-activity-graph.vercel.app/graph?username=2241812&theme=tokyo-night&hide_border=true';

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
function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-900/80 border border-cyan-900/20 rounded-xl flex items-center justify-center ${className}`}>
      <svg className="w-8 h-8 text-cyan-900/40 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

// ── Embed Image with loading/error states ──
function EmbedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={`bg-neutral-900/60 border border-red-900/30 rounded-xl flex flex-col items-center justify-center p-6 ${className}`}>
        <svg className="w-8 h-8 text-neutral-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span className="text-xs text-neutral-600 font-mono">{alt} unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!loaded && <ImageSkeleton className={className} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'} ${className}`}
      />
    </div>
  );
}

// ── Main Component ──
export default function GitHubStats() {
  const [stats, setStats] = useState<StatData[]>([
    { label: 'Public Repos', value: '...', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { label: 'Followers', value: '...', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Following', value: '...', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { label: 'Member Since', value: '...', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]);

  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch user stats
  useEffect(() => {
    async function fetchGitHubStats() {
      try {
        const res = await fetch('https://api.github.com/users/2241812');
        const data = await res.json();
        const memberSince = new Date(data.created_at).getFullYear();

        setStats([
          { label: 'Public Repos', value: String(data.public_repos || 0), icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
          { label: 'Followers', value: String(data.followers || 0), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'Following', value: String(data.following || 0), icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
          { label: 'Member Since', value: String(memberSince), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        ]);
      } catch (err) {
        console.error('Failed to fetch GitHub stats:', err);
      }
    }
    fetchGitHubStats();
  }, []);

  // Fetch activity events
  const fetchActivity = useCallback(async () => {
    try {
      setActivityError(false);
      const res = await fetch(
        'https://api.github.com/users/2241812/events/public?per_page=5',
        {
          headers: { Accept: 'application/vnd.github.v3+json' },
          next: { revalidate: 60 },
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
    fetchActivity();
    const interval = setInterval(fetchActivity, 60_000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  return (
    <section
      id="github"
      className="min-h-screen flex items-center justify-start px-4 md:px-24 py-24 relative overflow-hidden"
    >
      {/* Background watermark */}
      <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
        <h2
          className="text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900/20 to-transparent tracking-tighter uppercase whitespace-nowrap"
          style={{ WebkitTextStroke: '2px rgba(34,211,238,0.05)' }}
        >
          GITHUB
        </h2>
      </div>

      {/* Neon glow accent */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

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
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-30" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              GitHub Overview
            </h2>
          </div>
          <div className="w-32 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
        </motion.div>

        {/* ── Stat Cards Row ── */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                borderColor: 'rgba(34,211,238,0.5)',
                boxShadow: '0 0 30px rgba(34,211,238,0.15)',
              }}
              transition={{ duration: 0.25 }}
              className="group relative bg-neutral-950/70 backdrop-blur-xl border border-cyan-900/30 rounded-xl p-5 flex flex-col items-center text-center cursor-default overflow-hidden"
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-500/40 to-transparent" />
                <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-cyan-500/40 to-transparent" />
              </div>

              <div className="w-10 h-10 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-3 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <span className="text-2xl md:text-3xl font-black text-neutral-100 tracking-tight" style={{ fontFamily: 'var(--font-orbitron)' }}>
                {stat.value}
              </span>
              <span className="text-[10px] md:text-xs text-neutral-500 font-mono uppercase tracking-widest mt-1">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Two-column layout: Stats + Streak ── */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {/* GitHub Stats Card */}
          <motion.div
            variants={fadeInVariants}
            whileHover={{
              borderColor: 'rgba(34,211,238,0.4)',
              boxShadow: '0 0 40px rgba(34,211,238,0.08)',
            }}
            className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Stats</h3>
            </div>
            <EmbedImage
              src={STATS_IMG}
              alt="GitHub Stats"
              className="w-full rounded-lg"
            />
          </motion.div>

          {/* GitHub Streak Card */}
          <motion.div
            variants={fadeInVariants}
            whileHover={{
              borderColor: 'rgba(34,211,238,0.4)',
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
            <EmbedImage
              src={STREAK_IMG}
              alt="GitHub Streak"
              className="w-full rounded-lg"
            />
          </motion.div>
        </motion.div>

        {/* ── Full-width Contribution Graph ── */}
        <motion.div
          variants={fadeInVariants}
          whileHover={{
            borderColor: 'rgba(34,211,238,0.4)',
            boxShadow: '0 0 40px rgba(34,211,238,0.08)',
          }}
          className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Contribution Activity</h3>
          </div>
          <EmbedImage
            src={ACTIVITY_GRAPH}
            alt="Contribution Activity Graph"
            className="w-full rounded-lg"
          />
        </motion.div>

        {/* ── Recent Activity Feed ── */}
        <motion.div
          variants={containerVariants}
          className="bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/30 rounded-2xl p-5 md:p-8 mb-8"
        >
          {/* Feed header */}
          <motion.div
            variants={headingVariants}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-30" />
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

          {/* Loading skeletons */}
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

          {/* Error state */}
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

          {/* Event cards */}
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
                      borderColor: 'rgba(34,211,238,0.4)',
                      boxShadow: '0 0 24px rgba(34,211,238,0.08)',
                    }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center gap-3 p-3 md:p-4 rounded-xl bg-cyan-950/10 border border-cyan-900/30 hover:border-cyan-500/40 transition-colors duration-300 cursor-pointer no-underline"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-900/50 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-300">
                      {info.icon}
                    </div>

                    {/* Content */}
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

                    {/* Timestamp */}
                    <span className="flex-shrink-0 text-[10px] md:text-xs text-neutral-600 font-mono whitespace-nowrap">
                      {getRelativeTime(event.created_at)}
                    </span>

                    {/* Arrow */}
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

          {/* Empty state */}
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

        {/* ── Footer link ── */}
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
}
