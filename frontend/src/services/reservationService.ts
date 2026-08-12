import { Reservation } from '../types/reservation';
import { authHeaders } from './authService';

// Base URL for API - should be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch all reservations from the backend
 */
export const fetchReservations = async (date?: string): Promise<Reservation[]> => {
  try {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const response = await fetch(`${API_BASE_URL}/admin/reservations${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

export interface CreateReservationPayload {
  tableId: number;
  reservationTime: string; // ISO 8601
  guests: number;
}

/**
 * Tworzy rezerwację stolika (wymaga zalogowania). Mapuje kody błędów backendu
 * na czytelne komunikaty (409 kolizja, 404 brak stolika, 401 brak sesji).
 */
export const createReservation = async (
  payload: CreateReservationPayload,
): Promise<Reservation> => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const msg =
      response.status === 409
        ? 'Ten stolik został właśnie zarezerwowany w wybranym czasie. Wybierz inny.'
        : response.status === 401
        ? 'Zaloguj się, aby dokończyć rezerwację.'
        : response.status === 404
        ? 'Wybrany stolik nie istnieje.'
        : response.status === 400
        ? 'Nieprawidłowa data lub liczba gości.'
        : `Nie udało się utworzyć rezerwacji (HTTP ${response.status}).`;
    throw new Error(msg);
  }
  return response.json();
};

/** Odwołuje własną rezerwację (status → Anulowana). */
export const cancelReservation = async (id: number): Promise<Reservation> => {
  const response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!response.ok) {
    throw new Error(`Nie udało się odwołać rezerwacji (HTTP ${response.status}).`);
  }
  return response.json();
};

/**
 * Update reservation status
 */
export const updateReservationStatus = async (
  id: number, 
  status: string
): Promise<Reservation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reservations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating reservation status:', error);
    throw error;
  }
};