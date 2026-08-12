import React, { useState } from 'react';
import {
  login,
  register,
  logout,
  isAuthenticated,
} from '../../services/authService';

type Mode = 'login' | 'register';

/**
 * Panel uwierzytelniania (#19) — rejestracja i logowanie.
 * Token JWT jest zapisywany w localStorage i używany przez usługi API.
 */
const AuthPanel: React.FC = () => {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === 'register') {
        await register({ email, password, firstName, lastName, phone });
        setInfo('Konto utworzone. Możesz się zalogować.');
        setMode('login');
      } else {
        await login(email, password);
        setAuthed(true);
        setInfo('Zalogowano.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    setAuthed(false);
    setInfo('Wylogowano.');
  };

  if (authed) {
    return (
      <section style={{ maxWidth: 640, margin: '1rem auto', padding: '1rem' }}>
        <h2>Konto</h2>
        <p>Jesteś zalogowany.</p>
        <button type="button" onClick={handleLogout}>
          Wyloguj
        </button>
        {info && <p>{info}</p>}
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 640, margin: '1rem auto', padding: '1rem' }}>
      <h2>{mode === 'login' ? 'Logowanie' : 'Rejestracja'}</h2>
      <div style={{ marginBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setMode('login')}
          disabled={mode === 'login'}
        >
          Logowanie
        </button>{' '}
        <button
          type="button"
          onClick={() => setMode('register')}
          disabled={mode === 'register'}
        >
          Rejestracja
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem' }}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Hasło:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        {mode === 'register' && (
          <>
            <label>
              Imię:
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label>
              Nazwisko:
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
            <label>
              Telefon:
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>
          </>
        )}

        <button type="submit" disabled={busy}>
          {busy ? 'Proszę czekać…' : mode === 'login' ? 'Zaloguj' : 'Zarejestruj'}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}
      {info && <p style={{ color: '#15803d' }}>{info}</p>}
    </section>
  );
};

export default AuthPanel;
