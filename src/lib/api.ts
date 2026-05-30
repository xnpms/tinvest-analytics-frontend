const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const camelize = (s: string): string =>
  s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const camelizeKeys = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map((item) => camelizeKeys(item));
  }

  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([k, v]) => [camelize(k), camelizeKeys(v)]),
    );
  }
  return data;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '1',
      ...init?.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (res.status === 401) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
    const isPublicPage = currentPath === '/login' || currentPath === '/register';
    const requestAborted = init?.signal instanceof AbortSignal && init.signal.aborted;
    if (!isPublicPage && !requestAborted) {
      window.location.replace('/login');
    }

    throw new ApiError(401, 'Unauthorized');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data?.detail ?? `Request failed: ${res.status}`);
  }

  return camelizeKeys(data) as T;
};
