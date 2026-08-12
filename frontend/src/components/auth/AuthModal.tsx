import React, { useState } from 'react';
import { login, register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import { IcMail, IcLock, IcUser, IcPhone, IcSparkle, IcArrowRight } from '../ui/icons';

type Mode = 'login' | 'register';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: Mode;
}

const AuthModal: React.FC<Props> = ({ open, onClose, onSuccess, initialMode = 'login' }) => {
  const { refresh } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', code: '' });
  const [show2fa, setShow2fa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'register') {
        await register({
          email: form.email, password: form.password,
          firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        });
        toast.push('Konto utworzone. Możesz się zalogować.', 'success');
        setMode('login');
      } else {
        await login(form.email, form.password, form.code || undefined);
        refresh();
        toast.push('Witaj z powrotem.', 'success');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(msg);
      if (/2fa|kod/i.test(msg)) setShow2fa(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="auth-title">
      <div className="auth-head">
        <span className="eyebrow"><IcSparkle size={14} /> AURA</span>
        <h2 id="auth-title" className="auth-title">
          {mode === 'login' ? 'Zaloguj się' : 'Dołącz do nas'}
        </h2>
        <p className="muted auth-sub">
          {mode === 'login'
            ? 'Wróć do swoich rezerwacji i przywilejów gościa.'
            : 'Załóż konto, aby rezerwować stolik w kilka sekund.'}
        </p>
      </div>

      <div className="seg">
        <button className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')} type="button">Logowanie</button>
        <button className={mode === 'register' ? 'is-active' : ''} onClick={() => setMode('register')} type="button">Rejestracja</button>
      </div>

      <form onSubmit={submit} className="stack" style={{ gap: 14 }}>
        {mode === 'register' && (
          <div className="two-col">
            <div className="field">
              <label className="label">Imię</label>
              <div className="input-group">
                <IcUser className="input-icon" size={18} />
                <input className="input" value={form.firstName} onChange={set('firstName')} required autoComplete="given-name" />
              </div>
            </div>
            <div className="field">
              <label className="label">Nazwisko</label>
              <div className="input-group">
                <IcUser className="input-icon" size={18} />
                <input className="input" value={form.lastName} onChange={set('lastName')} required autoComplete="family-name" />
              </div>
            </div>
          </div>
        )}

        <div className="field">
          <label className="label">Adres e-mail</label>
          <div className="input-group">
            <IcMail className="input-icon" size={18} />
            <input className="input" type="email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="jan@example.com" />
          </div>
        </div>

        <div className="field">
          <label className="label">Hasło</label>
          <div className="input-group">
            <IcLock className="input-icon" size={18} />
            <input className="input" type="password" value={form.password} onChange={set('password')} minLength={8} required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'register' ? 'min. 8 znaków, litera i cyfra' : '••••••••'} />
          </div>
        </div>

        {mode === 'register' && (
          <div className="field">
            <label className="label">Telefon</label>
            <div className="input-group">
              <IcPhone className="input-icon" size={18} />
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} required autoComplete="tel" placeholder="+48 600 000 000" />
            </div>
          </div>
        )}

        {mode === 'login' && show2fa && (
          <div className="field animate-in">
            <label className="label">Kod 2FA (jeśli włączony)</label>
            <input className="input" inputMode="numeric" value={form.code} onChange={set('code')} placeholder="6-cyfrowy kod" maxLength={6} />
          </div>
        )}

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
          {busy ? 'Proszę czekać…' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
          {!busy && <IcArrowRight size={18} />}
        </button>

        {mode === 'login' && !show2fa && (
          <button type="button" className="link-btn" onClick={() => setShow2fa(true)}>Masz włączone 2FA? Wpisz kod</button>
        )}
      </form>
    </Modal>
  );
};

export default AuthModal;
