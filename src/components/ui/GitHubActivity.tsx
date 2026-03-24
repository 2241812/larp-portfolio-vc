"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';

// ── Types ──
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
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, x: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ── Component ──
export default function GitHubActivity() {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      setError(false);
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
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 60 seconds
  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 60_000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  return (
    <section
      id="activity"
      className="min-h-screen flex items-center justify-start px-8 md:px-24 relative overflow-hidden"
    >
      {/* Background watermark */}
      <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
        <h2
          className="text-[10rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-l from-cyan-900/20 to-transparent tracking-tighter uppercase whitespace-nowrap"
          style={{ WebkitTextStroke: '2px rgba(34,211,238,0.05)' }}
        >
          GITHUB
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="w-full max-w-3xl bg-neutral-950/60 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-8 md:p-12 relative z-10 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
      >
        {/* Header */}
        <motion.div
          variants={headingVariants}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-30" />
            </div>
            <h3 className="text-3xl font-bold text-cyan-400 tracking-wider uppercase">
              Recent Activity
            </h3>
          </div>
          {lastUpdated && (
            <span className="text-xs text-neutral-600 font-mono">
              synced {getRelativeTime(lastUpdated.toISOString())}
            </span>
          )}
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-neutral-900/60 border border-cyan-900/20 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-neutral-600 font-mono text-sm mb-3">
              <svg
                className="w-8 h-8 mx-auto mb-3 text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              Unable to fetch GitHub activity
            </div>
            <button
              onClick={fetchActivity}
              className="mt-2 px-4 py-2 text-xs font-mono text-cyan-400 border border-cyan-800/50 rounded-lg hover:bg-cyan-900/20 hover:border-cyan-600/50 transition-all duration-300 cursor-pointer"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Event cards */}
        {!loading && !error && events.length > 0 && (
          <motion.div variants={containerVariants} className="space-y-3">
            {events.map((event, idx) => {
              const info = getEventInfo(event);
              return (
                <motion.a
                  key={event.id}
                  href={`https://github.com/${event.repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.02,
                    borderColor: 'rgba(34,211,238,0.5)',
                    boxShadow: '0 0 30px rgba(34,211,238,0.1)',
                  }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-cyan-950/10 border border-cyan-900/30 hover:border-cyan-500/40 transition-colors duration-300 cursor-pointer no-underline"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-900/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-900/50 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-300">
                    {info.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-mono text-cyan-500 uppercase tracking-wider">
                        {info.label}
                      </span>
                      <span className="text-neutral-700 text-xs">/</span>
                      <span className="text-sm font-medium text-neutral-200 truncate">
                        {event.repo.name}
                      </span>
                    </div>
                    {info.detail && (
                      <p className="text-xs text-neutral-500 font-mono truncate">
                        {info.detail}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs text-neutral-600 font-mono whitespace-nowrap">
                      {getRelativeTime(event.created_at)}
                    </span>
                  </div>

                  {/* Hover arrow */}
                  <svg
                    className="w-4 h-4 text-neutral-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.a>
              );
            })}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-neutral-600 font-mono text-sm"
          >
            No recent activity found
          </motion.div>
        )}

        {/* Footer link */}
        {!loading && !error && events.length > 0 && (
          <motion.div
            variants={cardVariants}
            className="mt-6 pt-4 border-t border-cyan-900/30 flex justify-end"
          >
            <a
              href="https://github.com/2241812"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-neutral-600 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group"
            >
              View all activity
              <svg
                className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
