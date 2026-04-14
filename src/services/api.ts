/**
 * API Service Layer
 * Centralized HTTP client with retry logic, timeout handling, and error management
 */

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  useProxy?: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: Error;
  status: number;
  ok: boolean;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

/**
 * Exponential backoff delay calculation
 */
function getBackoffDelay(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
}

/**
 * Generic fetch wrapper with retry logic and timeout
 */
export async function fetchWithRetry<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = createTimeoutController(timeout);

      const response = await Promise.race([
        fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && { origin: window.location.origin }),
            ...headers,
          },
          signal: controller.signal,
          body: body ? JSON.stringify(body) : undefined,
          mode: 'cors' as RequestMode,
          credentials: 'omit',
        }),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
        ok: true,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (lastError instanceof TypeError && lastError.message === 'Request timeout') {
        if (attempt < retries) {
          const delay = getBackoffDelay(attempt, retryDelay);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Retry on network errors and timeouts
      if (attempt < retries && (lastError.message.includes('Failed to fetch') || lastError.message === 'Request timeout')) {
        const delay = getBackoffDelay(attempt, retryDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  return {
    error: lastError || new Error('Request failed after retries'),
    status: 0,
    ok: false,
  };
}

/**
 * GitHub Contributions API
 */
export async function fetchGitHubContributions(
  username: string,
  fromDate: string,
  toDate: string
): Promise<{ contributions: Array<{ date: string; count: number }> }> {
  const url = `https://github-contributions-api.jogruber.de/v4/${username}?from=${fromDate}&to=${toDate}`;
  
  console.log(`[API] Fetching contributions for ${username} from ${fromDate} to ${toDate}`);
  
  try {
    const response = await fetchWithRetry<{ contributions: Array<{ date: string; count: number }> }>(url, {
      timeout: 15000,
      retries: 3,
      retryDelay: 1000,
    });

    if (!response.ok) {
      console.error('[API] Failed to fetch contributions:', response.error?.message);
      throw response.error || new Error('Failed to fetch contributions');
    }

    return response.data as { contributions: Array<{ date: string; count: number }> };
  } catch (error) {
    console.error('[API] Error fetching contributions:', error instanceof Error ? error.message : 'Unknown error');
    // Return empty contributions array on error - component will show placeholder
    return { contributions: [] };
  }
}

/**
 * Internal GitHub API with SWR pattern
 */
export async function fetchGitHubStats(username: string) {
  const url = `/api/github-stats?username=${username}`;
  
  console.log(`[API] Fetching GitHub stats for ${username}`);
  
  const response = await fetchWithRetry(url, {
    timeout: 10000,
    retries: 2,
    retryDelay: 500,
  });

  if (!response.ok) {
    console.error('[API] Failed to fetch GitHub stats:', response.error?.message);
    throw response.error || new Error('Failed to fetch GitHub stats');
  }

  return response.data;
}

/**
 * Custom fetch with error logging
 */
export async function apiFetch<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  try {
    const response = await fetchWithRetry<T>(url, options);
    
    if (!response.ok) {
      console.error(`[API] Request failed: ${url}`, response.error);
      throw response.error;
    }

    return response.data as T;
  } catch (error) {
    console.error(`[API] Error fetching from ${url}:`, error);
    throw error;
  }
}

export default {
  fetch: apiFetch,
  fetchWithRetry,
  fetchGitHubContributions,
  fetchGitHubStats,
};
