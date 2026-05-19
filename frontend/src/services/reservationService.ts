import { Reservation } from '../types/reservation';

// Base URL for API - should be configured via environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/**
 * Fetch all reservations from the backend
 */
export const fetchReservations = async (): Promise<Reservation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reservations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
        // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
        // Add auth token if needed
        // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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