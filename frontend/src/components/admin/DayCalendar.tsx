import React, { useState, useEffect, useCallback } from 'react';
import { Reservation } from '../../types/reservation';
import { fetchReservations } from '../../services/reservationService';

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Kalendarz rezerwacji na wybrany dzień (#17) — menedżer widzi wszystkie
 * rezerwacje danego dnia pogrupowane wg godziny. Wymaga zalogowanego admina.
 */
const DayCalendar: React.FC = () => {
  const [date, setDate] = useState(todayIso());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (day: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReservations(day);
      setReservations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Nie udało się pobrać rezerwacji (zaloguj się jako admin). ${err.message}`
          : 'Nieznany błąd',
      );
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  // Grupowanie wg godziny (HH:00)
  const byHour = reservations.reduce<Record<string, Reservation[]>>((acc, r) => {
    const hour = new Date(r.reservationTime).getHours().toString().padStart(2, '0') + ':00';
    (acc[hour] ||= []).push(r);
    return acc;
  }, {});
  const hours = Object.keys(byHour).sort();

  return (
    <section style={{ maxWidth: 720, margin: '1rem auto', padding: '1rem' }}>
      <h2>Kalendarz rezerwacji (dzień)</h2>
      <label>
        Dzień:{' '}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      {loading && <p>Ładowanie…</p>}
      {error && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        reservations.length === 0 ? (
          <p>Brak rezerwacji na ten dzień.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {hours.map((hour) => (
              <div key={hour}>
                <h3 style={{ borderBottom: '1px solid #d1d5db' }}>{hour}</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {byHour[hour].map((r) => (
                    <li
                      key={r.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '0.5rem 0.75rem',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <strong>
                        {new Date(r.reservationTime).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>{' '}
                      — {r.guests} os.
                      {r.table ? ` · stolik #${(r.table as any).tableNumber ?? r.table.id}` : ''}
                      {r.user ? ` · ${(r.user as any).firstName ?? ''} ${(r.user as any).lastName ?? ''} (${r.user.email})` : ''}
                      {r.status ? ` · ${r.status}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
};

export default DayCalendar;
