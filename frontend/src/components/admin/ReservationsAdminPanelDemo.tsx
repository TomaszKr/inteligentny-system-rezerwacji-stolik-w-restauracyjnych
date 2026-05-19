import React, { useState, useEffect } from 'react';

const ReservationsAdminPanelDemo = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = getToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/admin/reservations', {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required. Please log in.');
          } else if (response.status === 403) {
            setError('Access denied. Admin privileges required.');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return;
        }

        const data = await response.json();
        setReservations(data);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Failed to fetch reservations. Please check your connection and authentication.');
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchReservations();
    }
  }, []);

  if (loading) return <div className="admin-panel-loading">Loading reservations...</div>;
  if (error) return <div className="admin-panel-error">Error: {error}</div>;

  return (
    <div className="admin-reservations-panel">
      <h2>Admin Reservations Panel</h2>
      <p>Total reservations: {reservations.length}</p>
      {reservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <div className="reservations-list">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="reservation-item">
              <p><strong>ID:</strong> {reservation.id}</p>
              <p><strong>User ID:</strong> {reservation.userId}</p>
              <p><strong>Table ID:</strong> {reservation.tableId}</p>
              <p><strong>Time:</strong> {new Date(reservation.reservationTime).toLocaleString()}</p>
              <p><strong>Status:</strong> {reservation.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsAdminPanelDemo;
