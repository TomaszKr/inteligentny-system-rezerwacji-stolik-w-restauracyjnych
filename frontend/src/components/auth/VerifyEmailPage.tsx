import React, { useEffect, useRef, useState } from 'react';
import { verifyEmail } from '../../services/authService';
import { IcSparkle, IcCheckCircle, IcX, IcMail, IcArrowRight } from '../ui/icons';

type Status = 'loading' | 'success' | 'error';

/**
 * Dedykowana strona weryfikacji e-mail (Wariant 2). Link z maila prowadzi tu
 * (/verify-email?token=…). Strona sama woła API i renderuje wynik w UI —
 * użytkownik nie ogląda surowej odpowiedzi API.
 */
const VerifyEmailPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  // Gwarancja pojedynczego wywołania (token jest jednorazowy; StrictMode w dev
  // odpala efekt dwukrotnie — bez tego drugie wywołanie zwróciłoby błąd).
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      setMessage('Brak tokenu w linku. Otwórz link bezpośrednio z wiadomości e-mail.');
      return;
    }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: Error) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, []);

  return (
    <main className="verify-page">
      <div className="container narrow">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <span className="brand-mark"><IcSparkle size={18} /></span>
          <span className="brand-text">AURA<span className="brand-sub">restaurant</span></span>
        </div>

        <div className="card card-pad-lg center-text stack" style={{ gap: 16, alignItems: 'center' }}>
          {status === 'loading' && (
            <>
              <span className="verify-ic verify-ic-neutral"><IcMail size={30} /></span>
              <h1 className="section-title" style={{ fontSize: 'clamp(22px,4vw,30px)' }}>Weryfikujemy Twój e-mail…</h1>
              <p className="muted">Chwila cierpliwości, potwierdzamy Twój adres.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="verify-ic verify-ic-ok"><IcCheckCircle size={32} /></span>
              <h1 className="section-title" style={{ fontSize: 'clamp(22px,4vw,30px)' }}>E-mail potwierdzony!</h1>
              <p className="muted">Twoje konto jest aktywne. Możesz się już zalogować i zarezerwować stolik.</p>
              <a href="/" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
                Przejdź do logowania <IcArrowRight size={18} />
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <span className="verify-ic verify-ic-err"><IcX size={30} /></span>
              <h1 className="section-title" style={{ fontSize: 'clamp(22px,4vw,30px)' }}>Weryfikacja nieudana</h1>
              <p className="muted">{message}</p>
              <a href="/" className="btn btn-ghost btn-lg" style={{ marginTop: 8 }}>
                Wróć na stronę główną
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default VerifyEmailPage;
