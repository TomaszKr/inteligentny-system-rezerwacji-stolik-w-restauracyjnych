import React, { useMemo, useState } from 'react';
import { fetchAvailableTables, AvailableTable } from '../../services/availabilityService';
import { createReservation } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import AuthModal from '../auth/AuthModal';
import {
  IcCalendar, IcClock, IcUsers, IcTable, IcCheck, IcCheckCircle,
  IcArrowRight, IcArrowLeft, IcSparkle,
} from '../ui/icons';

const RESTAURANT_ID = 1;
const TIME_SLOTS = ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'];

const todayIso = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

const BookingWizard: React.FC = () => {
  const { authed } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(0); // 0 termin, 1 stolik, 2 potwierdzenie, 3 sukces
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);

  const [tables, setTables] = useState<AvailableTable[] | null>(null);
  const [selected, setSelected] = useState<AvailableTable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [confirmedId, setConfirmedId] = useState<number | null>(null);

  const isoTime = useMemo(() => new Date(`${date}T${time}:00`).toISOString(), [date, time]);

  const search = async () => {
    setError(null);
    setLoading(true);
    setTables(null);
    setSelected(null);
    try {
      const result = await fetchAvailableTables({ restaurantId: RESTAURANT_ID, reservationTime: isoTime, guests });
      setTables(result);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać dostępności.');
    } finally {
      setLoading(false);
    }
  };

  const goConfirm = () => selected && setStep(2);

  const confirm = async () => {
    if (!selected) return;
    if (!authed) { setAuthOpen(true); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await createReservation({ tableId: selected.id, reservationTime: isoTime, guests });
      setConfirmedId(res.id ?? null);
      toast.push('Rezerwacja potwierdzona. Do zobaczenia!', 'success');
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nie udało się utworzyć rezerwacji.';
      setError(msg);
      toast.push(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setTables(null); setSelected(null); setError(null); setConfirmedId(null);
  };

  const steps = ['Termin', 'Stolik', 'Potwierdź'];

  return (
    <div className="booking card card-pad-lg" id="booking">
      {step < 3 && (
        <div className="wizard-steps" aria-hidden="true">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`wstep ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
                <span className="wstep-dot">{i < step ? <IcCheck size={15} /> : i + 1}</span>
                <span className="wstep-label">{s}</span>
              </div>
              {i < steps.length - 1 && <span className={`wstep-line ${i < step ? 'is-done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* STEP 0 — termin i goście */}
      {step === 0 && (
        <div className="stack animate-in" style={{ gap: 22 }}>
          <div>
            <span className="eyebrow"><IcSparkle size={14} /> Rezerwacja</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px,5vw,34px)' }}>Zarezerwuj stolik</h2>
          </div>

          <div className="field">
            <label className="label"><IcUsers size={15} /> Liczba gości</label>
            <div className="row between wrap" style={{ gap: 14 }}>
              <div className="stepper">
                <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="Mniej gości">−</button>
                <span className="val">{guests}</span>
                <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} disabled={guests >= 20} aria-label="Więcej gości">+</button>
              </div>
              <div className="guest-chips">
                {[2, 4, 6, 8].map((n) => (
                  <button key={n} type="button" className={`chip ${guests === n ? 'is-active' : ''}`} onClick={() => setGuests(n)}>{n} osób</button>
                ))}
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label"><IcCalendar size={15} /> Data</label>
            <div className="input-group">
              <IcCalendar className="input-icon" size={18} />
              <input className="input" type="date" value={date} min={todayIso()} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="label"><IcClock size={15} /> Godzina</label>
            <div className="time-grid">
              {TIME_SLOTS.map((t) => (
                <button key={t} type="button" className={`chip time-chip ${time === t ? 'is-active' : ''}`} onClick={() => setTime(t)}>{t}</button>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <button className="btn btn-primary btn-lg btn-block" onClick={search} disabled={loading}>
            {loading ? 'Szukam wolnych stolików…' : 'Sprawdź dostępność'}
            {!loading && <IcArrowRight size={18} />}
          </button>
        </div>
      )}

      {/* STEP 1 — wybór stolika */}
      {step === 1 && (
        <div className="stack animate-in" style={{ gap: 18 }}>
          <div className="row between wrap">
            <div>
              <span className="eyebrow"><IcTable size={14} /> Wybierz stolik</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(22px,4.5vw,30px)' }}>Dostępne stoliki</h2>
            </div>
            <div className="booking-summary-pill">
              <span>{fmtDate(date)}</span><span className="dot">·</span><span>{time}</span><span className="dot">·</span><span>{guests} os.</span>
            </div>
          </div>

          {loading && (
            <div className="table-grid">
              {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 18 }} />)}
            </div>
          )}

          {!loading && tables && tables.length === 0 && (
            <div className="empty-state">
              <div className="empty-ic"><IcTable size={26} /></div>
              <h3>Brak wolnych stolików</h3>
              <p className="muted">Spróbuj innej godziny lub mniejszej liczby gości.</p>
              <button className="btn btn-ghost" onClick={() => setStep(0)}><IcArrowLeft size={16} /> Zmień termin</button>
            </div>
          )}

          {!loading && tables && tables.length > 0 && (
            <>
              <div className="table-grid">
                {tables.map((t) => (
                  <button key={t.id} type="button"
                    className={`table-card ${selected?.id === t.id ? 'is-selected' : ''}`}
                    onClick={() => setSelected(t)}>
                    <span className="table-card-ic"><IcTable size={22} /></span>
                    <span className="table-card-no">Stolik {t.tableNumber}</span>
                    <span className="table-card-cap"><IcUsers size={14} /> do {t.capacity} osób</span>
                    {selected?.id === t.id && <span className="table-card-check"><IcCheck size={14} /></span>}
                  </button>
                ))}
              </div>
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <div className="row between wrap" style={{ gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep(0)}><IcArrowLeft size={16} /> Wstecz</button>
                <button className="btn btn-primary" onClick={goConfirm} disabled={!selected}>
                  Dalej <IcArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2 — potwierdzenie */}
      {step === 2 && selected && (
        <div className="stack animate-in" style={{ gap: 18 }}>
          <div>
            <span className="eyebrow"><IcCheckCircle size={14} /> Ostatni krok</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(22px,4.5vw,30px)' }}>Potwierdź rezerwację</h2>
          </div>

          <div className="confirm-card">
            <div className="confirm-row"><span className="muted"><IcCalendar size={16} /> Data</span><strong>{fmtDate(date)}</strong></div>
            <hr className="divider" />
            <div className="confirm-row"><span className="muted"><IcClock size={16} /> Godzina</span><strong>{time}</strong></div>
            <hr className="divider" />
            <div className="confirm-row"><span className="muted"><IcUsers size={16} /> Goście</span><strong>{guests} osób</strong></div>
            <hr className="divider" />
            <div className="confirm-row"><span className="muted"><IcTable size={16} /> Stolik</span><strong>nr {selected.tableNumber} · do {selected.capacity} os.</strong></div>
          </div>

          {!authed && (
            <div className="alert alert-info">Zaloguj się lub załóż konto, aby potwierdzić rezerwację.</div>
          )}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <div className="row between wrap" style={{ gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}><IcArrowLeft size={16} /> Wstecz</button>
            <button className="btn btn-primary btn-lg" onClick={confirm} disabled={loading}>
              {loading ? 'Rezerwuję…' : authed ? 'Potwierdź rezerwację' : 'Zaloguj i zarezerwuj'}
              {!loading && <IcCheck size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — sukces */}
      {step === 3 && selected && (
        <div className="stack animate-in success-state" style={{ gap: 16 }}>
          <div className="success-ic"><IcCheckCircle size={44} /></div>
          <h2 className="section-title" style={{ fontSize: 'clamp(24px,5vw,34px)' }}>Do zobaczenia!</h2>
          <p className="muted">
            Twój stolik nr <strong>{selected.tableNumber}</strong> na <strong>{fmtDate(date)}</strong> o <strong>{time}</strong> ({guests} os.) jest zarezerwowany.
            {confirmedId != null && <> Numer rezerwacji: <strong>#{confirmedId}</strong>.</>}
          </p>
          <p className="faint" style={{ fontSize: 13 }}>Wysłaliśmy potwierdzenie na Twój adres e-mail.</p>
          <button className="btn btn-primary" onClick={reset}><IcSparkle size={18} /> Nowa rezerwacja</button>
        </div>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={confirm} initialMode="login" />
    </div>
  );
};

export default BookingWizard;
