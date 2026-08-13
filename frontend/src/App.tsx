import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './components/ui/Toast';
import AuthModal from './components/auth/AuthModal';
import VerifyEmailPage from './components/auth/VerifyEmailPage';
import BookingWizard from './components/booking/BookingWizard';
import AdminDashboard from './components/admin/AdminDashboard';
import {
  IcSparkle, IcCalendar, IcUser, IcLayout, IcLogout, IcMoon, IcSun,
  IcClock, IcMapPin, IcStar, IcCheckCircle, IcBell, IcArrowRight, IcCompass,
} from './components/ui/icons';

type View = 'home' | 'account' | 'admin';

const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || null,
  );
  useEffect(() => {
    const root = document.documentElement;
    if (theme) { root.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }
    else root.removeAttribute('data-theme');
  }, [theme]);
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const isDark = theme ? theme === 'dark' : prefersDark;
  return { isDark, toggle: () => setTheme(isDark ? 'light' : 'dark') };
};

const Brand: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button className="brand" onClick={onClick} aria-label="AURA — strona główna">
    <span className="brand-mark"><IcSparkle size={18} /></span>
    <span className="brand-text">AURA<span className="brand-sub">restaurant</span></span>
  </button>
);

const App: React.FC = () => {
  const { authed, isAdmin, user, logout } = useAuth();
  const toast = useToast();
  const { isDark, toggle } = useTheme();
  const [view, setView] = useState<View>('home');
  const [authOpen, setAuthOpen] = useState(false);

  // Dedykowana strona weryfikacji e-mail — link z maila prowadzi na /verify-email
  // (SPA bez routera: rozgałęziamy po ścieżce). Return po hookach, by zachować
  // stałą kolejność hooków (Rules of Hooks). (#verify-email-ux)
  if (window.location.pathname === '/verify-email') {
    return <VerifyEmailPage />;
  }

  const go = (v: View) => {
    if ((v === 'admin' && !isAdmin) || (v === 'account' && !authed)) { setAuthOpen(true); return; }
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onLogout = () => { logout(); setView('home'); toast.push('Wylogowano.', 'info'); };

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Brand onClick={() => go('home')} />
          <nav className="nav-desktop hide-mobile">
            <button className={view === 'home' ? 'nav-link is-active' : 'nav-link'} onClick={() => go('home')}>Rezerwacja</button>
            <a className="nav-link" href="#experience">Doświadczenie</a>
            {authed && <button className={view === 'account' ? 'nav-link is-active' : 'nav-link'} onClick={() => go('account')}>Moje konto</button>}
            {isAdmin && <button className={view === 'admin' ? 'nav-link is-active' : 'nav-link'} onClick={() => go('admin')}>Panel</button>}
          </nav>
          <div className="header-actions">
            <button className="btn-icon btn-ghost" onClick={toggle} aria-label="Przełącz motyw" title="Motyw">
              {isDark ? <IcSun size={18} /> : <IcMoon size={18} />}
            </button>
            {authed ? (
              <div className="row" style={{ gap: 8 }}>
                <span className="user-pill hide-mobile"><IcUser size={15} /> {user?.email?.split('@')[0]}</span>
                <button className="btn btn-ghost btn-sm" onClick={onLogout}><IcLogout size={16} /> <span className="hide-mobile">Wyloguj</span></button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setAuthOpen(true)}><IcUser size={16} /> Zaloguj</button>
            )}
          </div>
        </div>
      </header>

      <main>
        {view === 'home' && (
          <>
            {/* HERO */}
            <section className="hero">
              <div className="hero-bg" aria-hidden="true" />
              <div className="container hero-inner">
                <div className="hero-copy animate-in">
                  <span className="eyebrow"><IcStar size={13} /> Restauracja premium · rezerwacje online</span>
                  <h1 className="hero-title">Zarezerwuj stolik,<br /><em>na który czekasz.</em></h1>
                  <p className="hero-lead muted">
                    Wybierz termin, sprawdź wolne stoliki w czasie rzeczywistym i potwierdź rezerwację w kilka sekund — bez telefonów i czekania.
                  </p>
                  <div className="hero-cta">
                    <a href="#booking" className="btn btn-primary btn-lg">Rezerwuj teraz <IcArrowRight size={18} /></a>
                    <a href="#experience" className="btn btn-ghost btn-lg">Poznaj lokal</a>
                  </div>
                  <div className="hero-meta">
                    <span><IcMapPin size={15} /> Centrum miasta</span>
                    <span><IcClock size={15} /> Pon–Nd · 12:00–23:00</span>
                    <span><IcStar size={15} /> 4.9 / 5 opinii</span>
                  </div>
                </div>
                <div className="hero-booking animate-in d2">
                  <BookingWizard />
                </div>
              </div>
            </section>

            {/* EXPERIENCE / features */}
            <section className="section" id="experience">
              <div className="container">
                <div className="section-head center-text">
                  <span className="eyebrow" style={{ justifyContent: 'center' }}><IcCompass size={13} /> Dlaczego AURA</span>
                  <h2 className="section-title">Doświadczenie dopięte na ostatni guzik</h2>
                  <p className="muted section-lead">Od pierwszego kliknięcia po ostatni deser — projektujemy każdy detal Twojej wizyty.</p>
                </div>
                <div className="feature-grid">
                  {[
                    { ic: <IcClock size={22} />, t: 'Rezerwacja w 30 sekund', d: 'Dostępność stolików w czasie rzeczywistym — widzisz tylko to, co naprawdę wolne.' },
                    { ic: <IcCheckCircle size={22} />, t: 'Zero pomyłek', d: 'Transakcyjne blokady stolików eliminują podwójne rezerwacje.' },
                    { ic: <IcBell size={22} />, t: 'Potwierdzenie e-mail', d: 'Natychmiastowe potwierdzenie i przypomnienie przed wizytą.' },
                    { ic: <IcStar size={22} />, t: 'Obsługa premium', d: 'Twoje preferencje zapamiętane, powitanie zawsze osobiste.' },
                  ].map((f, i) => (
                    <div key={f.t} className={`feature-card card card-hover animate-in d${i + 1}`}>
                      <span className="feature-ic">{f.ic}</span>
                      <h3 className="feature-t">{f.t}</h3>
                      <p className="muted">{f.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA band */}
            <section className="section">
              <div className="container">
                <div className="cta-band">
                  <div>
                    <h2 className="section-title" style={{ fontSize: 'clamp(24px,4.5vw,36px)' }}>Gotowy na wieczór, który zapamiętasz?</h2>
                    <p className="muted">Stół czeka. Wybierz termin i zajmij miejsce.</p>
                  </div>
                  <a href="#booking" className="btn btn-primary btn-lg">Zarezerwuj stolik <IcArrowRight size={18} /></a>
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'account' && (
          <section className="section view-pad">
            <div className="container narrow">
              <span className="eyebrow"><IcUser size={13} /> Moje konto</span>
              <h2 className="section-title">Witaj{user?.email ? `, ${user.email.split('@')[0]}` : ''}</h2>
              <div className="card card-pad-lg stack" style={{ gap: 14, marginTop: 20 }}>
                <div className="confirm-row"><span className="muted">E-mail</span><strong>{user?.email}</strong></div>
                <hr className="divider" />
                <div className="confirm-row"><span className="muted">Rola</span><span className="badge badge-gold">{user?.role}</span></div>
                <hr className="divider" />
                <button className="btn btn-primary" onClick={() => go('home')}><IcCalendar size={18} /> Nowa rezerwacja</button>
              </div>
            </div>
          </section>
        )}

        {view === 'admin' && isAdmin && (
          <section className="section view-pad">
            <div className="container"><AdminDashboard /></div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <Brand onClick={() => go('home')} />
          <p className="faint" style={{ fontSize: 13 }}>Inteligentny System Rezerwacji Stolików · zbudowany z dbałością o detal.</p>
          <div className="footer-meta faint"><span><IcMapPin size={14} /> Centrum miasta</span><span><IcClock size={14} /> 12:00–23:00</span></div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav hide-desktop" aria-label="Nawigacja">
        <button className={view === 'home' ? 'bn is-active' : 'bn'} onClick={() => go('home')}><IcCalendar size={20} /><span>Rezerwacja</span></button>
        <button className="bn" onClick={() => { setView('home'); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }}><IcCompass size={20} /><span>Lokal</span></button>
        {authed
          ? <button className={view === 'account' ? 'bn is-active' : 'bn'} onClick={() => go('account')}><IcUser size={20} /><span>Konto</span></button>
          : <button className="bn" onClick={() => setAuthOpen(true)}><IcUser size={20} /><span>Zaloguj</span></button>}
        {isAdmin && <button className={view === 'admin' ? 'bn is-active' : 'bn'} onClick={() => go('admin')}><IcLayout size={20} /><span>Panel</span></button>}
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default App;
