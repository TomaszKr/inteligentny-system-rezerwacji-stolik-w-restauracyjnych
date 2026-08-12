import React, { useState } from 'react';
import {
  fetchAvailableTables,
  AvailableTable,
} from '../../services/availabilityService';

/**
 * Formularz wyszukiwania dostępnych stolików w wybranym terminie (#13).
 * Klient nie musi dzwonić do lokalu — sprawdza dostępność online.
 */
const AvailabilitySearch: React.FC = () => {
  const [restaurantId, setRestaurantId] = useState(1);
  const [reservationTime, setReservationTime] = useState('');
  const [guests, setGuests] = useState(2);

  const [tables, setTables] = useState<AvailableTable[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTables(null);

    if (!reservationTime) {
      setError('Wybierz datę i godzinę rezerwacji.');
      return;
    }
    // datetime-local → ISO 8601 (UTC)
    const isoTime = new Date(reservationTime).toISOString();

    setLoading(true);
    try {
      const result = await fetchAvailableTables({
        restaurantId,
        reservationTime: isoTime,
        guests,
      });
      setTables(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ maxWidth: 640, margin: '1rem auto', padding: '1rem' }}>
      <h2>Sprawdź dostępne stoliki</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          Restauracja (ID):
          <input
            type="number"
            min={1}
            value={restaurantId}
            onChange={(e) => setRestaurantId(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Termin:
          <input
            type="datetime-local"
            value={reservationTime}
            onChange={(e) => setReservationTime(e.target.value)}
            required
          />
        </label>
        <label>
          Liczba gości:
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Szukam…' : 'Szukaj dostępnych stolików'}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {tables !== null && !error && (
        <div style={{ marginTop: '1rem' }}>
          {tables.length === 0 ? (
            <p>Brak dostępnych stolików dla wybranych kryteriów.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tables.map((t) => (
                <li
                  key={t.id}
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Stolik nr {t.tableNumber} — {t.capacity} miejsc
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

export default AvailabilitySearch;
