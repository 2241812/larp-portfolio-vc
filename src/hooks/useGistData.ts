import useSWR from 'swr';

export interface GistData {
  id: string;
  description: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  files: {
    [key: string]: {
      filename: string;
      type: string;
      language: string;
      raw_url: string;
      size: number;
    };
  };
}

const fetcher = async <T>(url: string): Promise<T> => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  // Add GitHub token if available for higher rate limits
  if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const error = new Error('Failed to fetch gists');
    throw error;
  }
  return res.json();
};

export function useGistData(username: string, isInView: boolean) {
  const { data, error, isLoading, mutate } = useSWR<GistData[]>(
    isInView ? `https://api.github.com/users/${username}/gists` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    gists: data || [],
    isLoading,
    isError: !!error,
    error: error?.message,
    retry: () => mutate(),
  };
}
