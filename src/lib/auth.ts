const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': '1',
};

export const login = async (email: string, password: string): Promise<unknown> => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail ?? '');
  }
  return res.json();
};

export const register = async (
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<unknown> => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ email, password, password_confirmation: passwordConfirmation }),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail ?? '');
  }
  return res.json();
};
