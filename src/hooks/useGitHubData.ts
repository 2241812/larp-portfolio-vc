import useSWR from 'swr';

export interface PinnedRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
  };
  created_at: string;
  payload?: {
    commits?: Array<{
      message: string;
    }>;
    action?: string;
    ref_type?: string;
  };
}

const CACHE_KEY = 'pinned_repos_cache';
const CACHE_EXPIRY_KEY = 'pinned_repos_cache_expiry';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Get cached data if available
function getCachedData(username: string): PinnedRepo[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${username}`);
    const expiry = localStorage.getItem(`${CACHE_EXPIRY_KEY}_${username}`);
    
    if (cached && expiry && Date.now() < parseInt(expiry)) {
      return JSON.parse(cached);
    }
    
    // Clear expired cache
    localStorage.removeItem(`${CACHE_KEY}_${username}`);
    localStorage.removeItem(`${CACHE_EXPIRY_KEY}_${username}`);
  } catch (e) {
    // Silently fail on localStorage access
  }
  return null;
}

// Store data in cache
function setCachedData(username: string, data: PinnedRepo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_KEY}_${username}`, JSON.stringify(data));
    localStorage.setItem(`${CACHE_EXPIRY_KEY}_${username}`, String(Date.now() + CACHE_DURATION_MS));
  } catch (e) {
    // Silently fail on localStorage access
  }
}

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  
  // Handle rate limiting with exponential backoff
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 1 minute
    throw new Error(`Rate limited: ${res.status}. Wait ${waitTime}ms`);
  }
  
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
};

export function usePinnedRepos(username: string) {
  const { data, error, isLoading, mutate } = useSWR<PinnedRepo[]>(
    `https://pinned.berrysauce.dev/get/${username}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - reduced request frequency
      errorRetryInterval: 30000, // 30 seconds between retries
      errorRetryCount: 5, // More retries with longer intervals
      onError: (error) => {
        // Log rate limit errors for debugging
        if (error?.message?.includes('Rate limited')) {
          console.warn('GitHub pinned repos API rate limited. Using cached data.');
        }
      },
    }
  );

  // Use cached data as fallback if API fails
  const cachedData = data || getCachedData(username);
  
  // Store successful responses in cache
  if (data && data.length > 0) {
    setCachedData(username, data);
  }

  return {
    pinnedRepos: cachedData || [],
    isLoading,
    isError: !!error && !cachedData, // Only show error if no cached data
    retry: () => mutate(),
  };
}

export function useGitHubActivity(username: string, isInView: boolean) {
  const { data, error, isLoading } = useSWR<GitHubEvent[]>(
    isInView ? `https://api.github.com/users/${username}/events/public?per_page=5` : null,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 2,
    }
  );

  return {
    events: data || [],
    isLoading,
    isError: !!error,
  };
}

export function useGitHubUser(username: string, isInView: boolean) {
  const { data, error, isLoading } = useSWR<{
    public_repos: number;
    followers: number;
    following: number;
  }>(
    isInView ? `https://api.github.com/users/${username}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 2,
    }
  );

  return {
    user: data,
    isLoading,
    isError: !!error,
  };
}

export function useGitHubContributions(username: string, isInView: boolean) {
  const { data, error, isLoading } = useSWR<{
    total: Record<string, number>;
    contributions: Array<{ date: string; count: number; level: number }>;
  }>(
    isInView ? `https://github-contributions-api.jogruber.de/v4/${username}?y=last` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 2,
    }
  );

  return {
    contributions: data,
    isLoading,
    isError: !!error,
  };
}
