/**
 * Fetch wrapper with timeout support
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Promise<Response>
 */
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = 30000
): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        return response;
    } finally {
        clearTimeout(id);
    }
}

/**
 * Error class for API errors with status code
 */
export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/**
 * Helper to handle API response and throw on error
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.error || errorData.message || `Request failed with status ${response.status}`,
            response.status
        );
    }
    return response.json();
}
