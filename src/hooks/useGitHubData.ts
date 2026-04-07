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

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
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
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
    }
  );

  return {
    pinnedRepos: data || [],
    isLoading,
    isError: !!error,
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
