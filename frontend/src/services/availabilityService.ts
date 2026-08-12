const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface AvailableTable {
  id: number;
  tableNumber: number;
  capacity: number;
}

export interface AvailabilityQuery {
  restaurantId: number;
  reservationTime: string; // ISO 8601
  guests: number;
}

/**
 * Pobiera dostępne stoliki dla podanych kryteriów (publiczny endpoint).
 */
export const fetchAvailableTables = async (
  query: AvailabilityQuery,
): Promise<AvailableTable[]> => {
  const params = new URLSearchParams({
    restaurantId: String(query.restaurantId),
    reservationTime: query.reservationTime,
    guests: String(query.guests),
  });

  const response = await fetch(`${API_BASE_URL}/tables/availability?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania dostępności (HTTP ${response.status})`);
  }

  return response.json();
};
