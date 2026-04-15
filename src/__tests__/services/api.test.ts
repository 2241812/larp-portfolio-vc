import { fetchWithRetry } from '@/services/api';

// Mock global fetch
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchWithRetry', () => {
  it('returns data on a successful response', async () => {
    const mockData = { foo: 'bar' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchWithRetry('https://example.com/api', { retries: 0 });
    expect(result.ok).toBe(true);
    expect(result.data).toEqual(mockData);
    expect(result.status).toBe(200);
  });

  it('returns an error response on HTTP error status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({}),
    });

    const result = await fetchWithRetry('https://example.com/api', { retries: 0 });
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('404');
  });

  it('retries on network failure', async () => {
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ success: true }),
      });

    const result = await fetchWithRetry('https://example.com/api', {
      retries: 1,
      retryDelay: 0,
    });

    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('stops retrying after max retries and returns error', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const result = await fetchWithRetry('https://example.com/api', {
      retries: 2,
      retryDelay: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('sends the correct HTTP method', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      statusText: 'Created',
      json: () => Promise.resolve({}),
    });

    await fetchWithRetry('https://example.com/api', {
      method: 'POST',
      body: { name: 'test' },
      retries: 0,
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('serialises body as JSON', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    });

    await fetchWithRetry('https://example.com/api', {
      method: 'POST',
      body: { key: 'value' },
      retries: 0,
    });

    const calledWith = (fetch as jest.Mock).mock.calls[0][1];
    expect(calledWith.body).toBe(JSON.stringify({ key: 'value' }));
  });

  it('includes custom headers', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
    });

    await fetchWithRetry('https://example.com/api', {
      headers: { Authorization: 'Bearer token123' },
      retries: 0,
    });

    const calledWith = (fetch as jest.Mock).mock.calls[0][1];
    expect(calledWith.headers).toMatchObject({ Authorization: 'Bearer token123' });
  });

  it('returns error when all retries are exhausted', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const result = await fetchWithRetry('https://example.com/api', {
      retries: 0,
      retryDelay: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.status).toBe(0);
  });
});
