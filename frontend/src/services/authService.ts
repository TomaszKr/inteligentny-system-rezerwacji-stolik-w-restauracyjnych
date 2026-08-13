const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'access_token';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const isAuthenticated = (): boolean => !!getToken();

export interface CurrentUser {
  email: string;
  role: string;
  sub: number;
}

/** Dekoduje payload JWT (bez weryfikacji podpisu — tylko do UI/gatingu). */
export const getUser = (): CurrentUser | null => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(decodeURIComponent(escape(json)));
    return { email: data.email, role: data.role, sub: data.sub };
  } catch {
    return null;
  }
};

export const isAdmin = (): boolean => {
  const u = getUser();
  return u?.role === 'admin' || u?.role === 'manager';
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/** Nagłówki z tokenem Bearer (jeśli zalogowany) dla żądań uwierzytelnionych. */
export const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (
  email: string,
  password: string,
  code?: string,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ...(code ? { code } : {}) }),
  });
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Nieprawidłowy email, hasło lub kod 2FA'
        : `Błąd logowania (HTTP ${response.status})`,
    );
  }
  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
};

/** Weryfikuje adres e-mail tokenem z linku. Zwraca true przy sukcesie. */
export const verifyEmail = async (token: string): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
  );
  if (!response.ok) {
    throw new Error(
      response.status === 400
        ? 'Link weryfikacyjny jest nieprawidłowy lub został już użyty.'
        : `Weryfikacja nie powiodła się (HTTP ${response.status}).`,
    );
  }
};

export const register = async (payload: RegisterPayload): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      response.status === 400
        ? 'Błędne dane rejestracji (sprawdź pola, hasło min. 8 znaków)'
        : `Błąd rejestracji (HTTP ${response.status})`,
    );
  }
};
