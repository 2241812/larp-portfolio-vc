/**
 * Additional tests for api.ts functions:
 * - fetchGitHubContributions
 * - fetchGitHubStats
 * - apiFetch
 */

import { fetchGitHubContributions, fetchGitHubStats, apiFetch } from '@/services/api';

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchGitHubContributions', () => {
  it('returns contribution data on success', async () => {
    const mockContributions = {
      contributions: [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 3 },
      ],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockContributions),
    });

    const result = await fetchGitHubContributions('testuser', '2024-01-01', '2024-12-31');
    expect(result.contributions).toHaveLength(2);
    expect(result.contributions[0].date).toBe('2024-01-01');
  });

  it('returns empty contributions on fetch failure', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await fetchGitHubContributions('testuser', '2024-01-01', '2024-12-31');
    expect(result.contributions).toEqual([]);
  });

  it('returns empty contributions when response is not ok', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    });

    const result = await fetchGitHubContributions('testuser', '2024-01-01', '2024-12-31');
    expect(result.contributions).toEqual([]);
  });

  it('calls the correct contributions API URL', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ contributions: [] }),
    });

    await fetchGitHubContributions('myuser', '2024-01-01', '2024-12-31');

    const calledUrl = (fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('myuser');
    expect(calledUrl).toContain('2024-01-01');
    expect(calledUrl).toContain('2024-12-31');
  });
});

describe('fetchGitHubStats', () => {
  it('returns stats data on success', async () => {
    const mockStats = { repos: 42, stars: 100 };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockStats),
    });

    const result = await fetchGitHubStats('testuser');
    expect(result).toEqual(mockStats);
  });

  it('throws an error when response is not ok', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({}),
    });

    await expect(fetchGitHubStats('unknownuser')).rejects.toThrow();
  });

  it('calls the internal stats API with the correct username', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    });

    await fetchGitHubStats('myuser');
    const calledUrl = (fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('myuser');
    expect(calledUrl).toContain('github-stats');
  });
});

describe('apiFetch', () => {
  it('returns data on success', async () => {
    const mockData = { message: 'hello' };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockData),
    });

    const result = await apiFetch<{ message: string }>('https://api.example.com/data', {
      retries: 0,
    });
    expect(result).toEqual(mockData);
  });

  it('throws when request fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    });

    await expect(
      apiFetch('https://api.example.com/data', { retries: 0 })
    ).rejects.toBeDefined();
  });

  it('throws on network error', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(
      apiFetch('https://api.example.com/data', { retries: 0 })
    ).rejects.toBeDefined();
  });
});
