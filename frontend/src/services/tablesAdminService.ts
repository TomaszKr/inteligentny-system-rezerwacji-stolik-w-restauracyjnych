import { authHeaders } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface AdminTable {
  id: number;
  tableNumber: number;
  capacity: number;
  status?: string;
}

export interface AdminRestaurant {
  id: number;
  name: string;
}

const handle = async (res: Response, fallback: string) => {
  if (!res.ok) {
    const msg =
      res.status === 401 || res.status === 403
        ? 'Brak uprawnień administratora.'
        : res.status === 404
        ? 'Nie znaleziono zasobu.'
        : res.status === 400
        ? 'Nieprawidłowe dane.'
        : `${fallback} (HTTP ${res.status}).`;
    throw new Error(msg);
  }
  return res.status === 200 || res.status === 201 ? res.json().catch(() => ({})) : {};
};

export const listRestaurants = async (): Promise<AdminRestaurant[]> => {
  const res = await fetch(`${API_BASE_URL}/admin/restaurants`, { headers: { ...authHeaders() } });
  return handle(res, 'Nie udało się pobrać restauracji');
};

export const createRestaurant = async (payload: { name: string; address: string; phone: string; email: string }): Promise<AdminRestaurant> => {
  const res = await fetch(`${API_BASE_URL}/admin/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res, 'Nie udało się utworzyć restauracji');
};

export const listTables = async (restaurantId?: number): Promise<AdminTable[]> => {
  const q = restaurantId ? `?restaurantId=${restaurantId}` : '';
  const res = await fetch(`${API_BASE_URL}/admin/tables${q}`, { headers: { ...authHeaders() } });
  return handle(res, 'Nie udało się pobrać stolików');
};

export const createTable = async (payload: { tableNumber: number; capacity: number; restaurantId: number }): Promise<AdminTable> => {
  const res = await fetch(`${API_BASE_URL}/admin/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res, 'Nie udało się utworzyć stolika');
};

export const updateTable = async (id: number, payload: { tableNumber?: number; capacity?: number }): Promise<AdminTable> => {
  const res = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res, 'Nie udało się zaktualizować stolika');
};

export const updateTableStatus = async (id: number, status: 'wolny' | 'zajęty'): Promise<AdminTable> => {
  const res = await fetch(`${API_BASE_URL}/admin/tables/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  return handle(res, 'Nie udało się zmienić statusu');
};

export const deleteTable = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/admin/tables/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  await handle(res, 'Nie udało się usunąć stolika');
};
