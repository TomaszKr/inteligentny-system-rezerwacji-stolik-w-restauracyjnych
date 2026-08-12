import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken, isAuthenticated } from '../../services/authService';

interface NewReservationEvent {
  id: number;
  reservationTime?: string;
  guests?: number;
}

/**
 * Powiadomienia real-time o nowych rezerwacjach (#22) dla menedżera.
 * Łączy się z bramą socket.io (przez nginx /socket.io/) z tokenem JWT.
 * Backend dopuszcza tylko role manager/admin.
 */
const ManagerNotifications: React.FC = () => {
  const [events, setEvents] = useState<NewReservationEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }
    const token = getToken();
    const socket: Socket = io(window.location.origin, {
      transports: ['polling', 'websocket'],
      extraHeaders: { Authorization: `Bearer ${token}` },
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('new-reservation', (data: NewReservationEvent) => {
      setEvents((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <section style={{ maxWidth: 720, margin: '1rem auto', padding: '1rem' }}>
      <h2>
        Powiadomienia na żywo{' '}
        <span style={{ fontSize: 12, color: connected ? '#15803d' : '#b91c1c' }}>
          ({connected ? 'połączono' : 'rozłączono'})
        </span>
      </h2>
      {events.length === 0 ? (
        <p>Brak nowych rezerwacji (nasłuchiwanie…). Wymaga roli manager/admin.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.map((e, i) => (
            <li
              key={`${e.id}-${i}`}
              style={{
                border: '1px solid #b7791f',
                borderRadius: 8,
                padding: '0.5rem 0.75rem',
                marginBottom: '0.4rem',
                background: '#fffbeb',
              }}
            >
              🔔 Nowa rezerwacja #{e.id}
              {e.guests ? ` · ${e.guests} os.` : ''}
              {e.reservationTime
                ? ` · ${new Date(e.reservationTime).toLocaleString('pl-PL')}`
                : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ManagerNotifications;
