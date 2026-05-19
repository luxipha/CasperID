import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout } from './fetchWithTimeout';

describe('fetchWithTimeout', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns response on successful fetch', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    const response = await fetchWithTimeout('https://api.test.com/data', {}, 5000);
    expect(response.status).toBe(200);
  });

  it('calls fetch with correct url and options', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    await fetchWithTimeout('https://api.test.com/data', { method: 'POST' }, 5000);
    expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/data', expect.objectContaining({
      method: 'POST',
      signal: expect.any(AbortSignal),
    }));
  });
});
