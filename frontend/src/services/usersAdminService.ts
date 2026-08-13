import { authHeaders } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type Role = 'user' | 'manager' | 'admin';

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lockedUntil?: string | null;
  failedLoginAttempts?: number;
}

export const listUsers = async (): Promise<AdminUser[]> => {
  const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: { ...authHeaders() } });
  if (!res.ok) {
    throw new Error(res.status === 401 || res.status === 403 ? 'Brak uprawnień administratora.' : `Nie udało się pobrać użytkowników (HTTP ${res.status}).`);
  }
  return res.json();
};

/** Zmiana roli. Mapuje reguły biznesowe backendu (#65) na czytelne komunikaty. */
export const updateUserRole = async (id: number, role: Role): Promise<AdminUser> => {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.message || ''; } catch { /* ignore */ }
    const msg =
      res.status === 403
        ? detail || 'Nie możesz odebrać własnego uprawnienia administratora.'
        : res.status === 409
        ? detail || 'W systemie musi pozostać co najmniej jeden administrator.'
        : res.status === 404
        ? 'Użytkownik nie istnieje.'
        : detail || `Nie udało się zmienić roli (HTTP ${res.status}).`;
    throw new Error(msg);
  }
  return res.json();
};
