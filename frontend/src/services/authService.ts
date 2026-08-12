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

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/** Nagłówki z tokenem Bearer (jeśli zalogowany) dla żądań uwierzytelnionych. */
export const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (email: string, password: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Nieprawidłowy email lub hasło'
        : `Błąd logowania (HTTP ${response.status})`,
    );
  }
  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
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
