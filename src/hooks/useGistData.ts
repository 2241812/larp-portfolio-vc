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
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
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
    }
  );

  return {
    gists: data || [],
    isLoading,
    isError: !!error,
    retry: () => mutate(),
  };
}
