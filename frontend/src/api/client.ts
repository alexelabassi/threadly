export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

let csrfToken: string | undefined;
export function resetCsrf() {
  csrfToken = undefined;
}

async function getCsrf() {
  if (!csrfToken) {
    const response = await fetch('/api/auth/csrf', { credentials: 'include', cache: 'no-store' });
    if (!response.ok)
      throw new ApiError(
        'Unable to establish a secure session. Please try again.',
        response.status,
      );
    const data: { token: string } = await response.json();
    csrfToken = data.token;
  }
  return csrfToken;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const mutating = options.method && !['GET', 'HEAD'].includes(options.method);
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (mutating) headers.set('X-CSRF-TOKEN', await getCsrf());
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { ...options, headers, credentials: 'include' });
  } catch {
    throw new ApiError('We couldn’t connect. Check your connection and try again.', 0);
  }
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      title?: string;
      errors?: Record<string, string[]>;
    } | null;
    if (response.status === 400) resetCsrf();
    throw new ApiError(
      problem?.title ||
        (response.status === 401
          ? 'Please sign in to continue.'
          : response.status === 429
            ? 'Too many attempts. Please try again shortly.'
            : 'Something went wrong. Please try again.'),
      response.status,
      problem?.errors,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
