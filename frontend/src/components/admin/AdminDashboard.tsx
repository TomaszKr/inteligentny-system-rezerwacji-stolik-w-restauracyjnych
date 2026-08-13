import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Reservation } from '../../types/reservation';
import { fetchReservations, updateReservationStatus } from '../../services/reservationService';
import { getToken } from '../../services/authService';
import { useToast } from '../ui/Toast';
import TablesManager from './TablesManager';
import UsersManager from './UsersManager';
import {
  IcCalendar, IcClock, IcUsers, IcUser, IcTable, IcBell, IcLayout,
  IcCheck, IcSparkle,
} from '../ui/icons';

type Tab = 'reservations' | 'calendar' | 'tables' | 'users' | 'live';

const todayIso = () => new Date().toISOString().slice(0, 10);
const timeOf = (t: Date | string) => new Date(t).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
const dateOf = (t: Date | string) => new Date(t).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

const STATUS_META: Record<string, { label: string; cls: string }> = {
  confirmed:      { label: 'Potwierdzona', cls: 'badge-success' },
  Potwierdzona:   { label: 'Potwierdzona', cls: 'badge-success' },
  'W toku':       { label: 'W toku', cls: 'badge-info' },
  Zrealizowana:   { label: 'Zrealizowana', cls: 'badge-gold' },
  Anulowana:      { label: 'Anulowana', cls: 'badge-danger' },
};
const statusBadge = (s?: string) => STATUS_META[s || 'confirmed'] || { label: s || '—', cls: 'badge' };

// Statusy ustawialne przez admina (enum backendu ReservationStatus)
const SETTABLE_STATUSES = ['W toku', 'Zrealizowana', 'Anulowana'] as const;

const StatCard: React.FC<{ icon: React.ReactNode; value: React.ReactNode; label: string }> = ({ icon, value, label }) => (
  <div className="stat-card">
    <span className="stat-ic">{icon}</span>
    <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [calDate, setCalDate] = useState(todayIso());
  const [live, setLive] = useState<{ id: number; guests?: number; reservationTime?: string; at: string }[]>([]);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async (date?: string) => {
    setLoading(true); setError(null);
    try {
      setReservations(await fetchReservations(date));
    } catch {
      setError('Nie udało się pobrać rezerwacji. Upewnij się, że jesteś zalogowany jako administrator.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === 'calendar') load(calDate); }, [tab, calDate, load]);

  // Real-time feed (#22)
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const socket: Socket = io(window.location.origin, {
      transports: ['polling', 'websocket'],
      extraHeaders: { Authorization: `Bearer ${token}` },
    });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('new-reservation', (e: any) => {
      setLive((l) => [{ id: e.id, guests: e.guests, reservationTime: e.reservationTime, at: new Date().toLocaleTimeString('pl-PL') }, ...l].slice(0, 30));
      toast.push(`Nowa rezerwacja #${e.id}`, 'info');
      load();
    });
    return () => { socket.disconnect(); };
  }, [load, toast]);

  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter((r) => /confirm|potwierdz/i.test(r.status || 'confirmed')).length;
    const guests = reservations.reduce((s, r) => s + (r.guests || 0), 0);
    return { total, confirmed, guests };
  }, [reservations]);

  const filtered = useMemo(() => {
    if (filter === 'all') return reservations;
    return reservations.filter((r) => {
      const s = (r.status || 'confirmed').toLowerCase();
      return filter === 'confirmed' ? /confirm|potwierdz/.test(s) : /cancel|anulow/.test(s);
    });
  }, [reservations, filter]);

  const setStatus = async (id: number, status: string) => {
    try {
      await updateReservationStatus(id, status);
      toast.push('Zaktualizowano status rezerwacji.', 'success');
      load(tab === 'calendar' ? calDate : undefined);
    } catch {
      toast.push('Nie udało się zmienić statusu.', 'error');
    }
  };

  const calGroups = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    [...reservations].sort((a, b) => +new Date(a.reservationTime) - +new Date(b.reservationTime))
      .forEach((r) => {
        const h = timeOf(r.reservationTime);
        if (!map.has(h)) map.set(h, []);
        map.get(h)!.push(r);
      });
    return [...map.entries()];
  }, [reservations]);

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="row between wrap">
        <div>
          <span className="eyebrow"><IcLayout size={14} /> Panel zarządzania</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(24px,5vw,36px)' }}>Rezerwacje na żywo</h2>
        </div>
        <span className={`badge ${connected ? 'badge-success' : 'badge'} badge-dot`}>
          {connected ? 'Połączono na żywo' : 'Offline'}
        </span>
      </div>

      <div className="stat-grid">
        <StatCard icon={<IcCalendar size={20} />} value={stats.total} label="Rezerwacji" />
        <StatCard icon={<IcCheck size={20} />} value={stats.confirmed} label="Potwierdzonych" />
        <StatCard icon={<IcUsers size={20} />} value={stats.guests} label="Gości łącznie" />
        <StatCard icon={<IcBell size={20} />} value={live.length} label="Nowych (sesja)" />
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'reservations'} className={`tab ${tab === 'reservations' ? 'is-active' : ''}`} onClick={() => setTab('reservations')}><IcTable size={16} /> Rezerwacje</button>
        <button role="tab" aria-selected={tab === 'calendar'} className={`tab ${tab === 'calendar' ? 'is-active' : ''}`} onClick={() => setTab('calendar')}><IcCalendar size={16} /> Kalendarz</button>
        <button role="tab" aria-selected={tab === 'tables'} className={`tab ${tab === 'tables' ? 'is-active' : ''}`} onClick={() => setTab('tables')}><IcLayout size={16} /> Stoliki</button>
        <button role="tab" aria-selected={tab === 'users'} className={`tab ${tab === 'users' ? 'is-active' : ''}`} onClick={() => setTab('users')}><IcUsers size={16} /> Użytkownicy</button>
        <button role="tab" aria-selected={tab === 'live'} className={`tab ${tab === 'live' ? 'is-active' : ''}`} onClick={() => setTab('live')}><IcBell size={16} /> Na żywo{live.length > 0 && <span className="tab-count">{live.length}</span>}</button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* Rezerwacje */}
      {tab === 'reservations' && (
        <div className="stack" style={{ gap: 14 }}>
          <div className="row wrap" style={{ gap: 8 }}>
            {(['all', 'confirmed', 'cancelled'] as const).map((f) => (
              <button key={f} className={`chip ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'Wszystkie' : f === 'confirmed' ? 'Potwierdzone' : 'Anulowane'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="stack" style={{ gap: 10 }}>{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 16 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-ic"><IcCalendar size={26} /></div><h3>Brak rezerwacji</h3><p className="muted">Nowe rezerwacje pojawią się tutaj automatycznie.</p></div>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {filtered.map((r) => {
                const b = statusBadge(r.status);
                return (
                  <div key={r.id} className="res-row">
                    <div className="res-time"><span className="res-time-h">{timeOf(r.reservationTime)}</span><span className="res-time-d">{dateOf(r.reservationTime)}</span></div>
                    <div className="res-main">
                      <div className="res-name"><IcUser size={15} /> {r.user?.name || r.user?.email || 'Gość'}</div>
                      <div className="res-meta faint"><IcUsers size={14} /> {r.guests} os. <span className="dot">·</span> <IcTable size={14} /> stolik {r.table?.id ?? '—'} <span className="dot">·</span> #{r.id}</div>
                    </div>
                    <div className="res-actions">
                      <span className={`badge ${b.cls}`}>{b.label}</span>
                      <select
                        className="select select-sm"
                        value={SETTABLE_STATUSES.includes(r.status as any) ? (r.status as string) : ''}
                        onChange={(e) => e.target.value && setStatus(r.id, e.target.value)}
                        title="Zmień status rezerwacji"
                        aria-label={`Zmień status rezerwacji #${r.id}`}
                      >
                        <option value="" disabled>Zmień status…</option>
                        {SETTABLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Kalendarz */}
      {tab === 'calendar' && (
        <div className="stack" style={{ gap: 14 }}>
          <div className="input-group" style={{ maxWidth: 260 }}>
            <IcCalendar className="input-icon" size={18} />
            <input className="input" type="date" value={calDate} onChange={(e) => setCalDate(e.target.value)} />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 200, borderRadius: 18 }} />
          ) : calGroups.length === 0 ? (
            <div className="empty-state"><div className="empty-ic"><IcClock size={26} /></div><h3>Brak rezerwacji tego dnia</h3><p className="muted">Wybierz inny dzień z kalendarza.</p></div>
          ) : (
            <div className="timeline">
              {calGroups.map(([hour, group]) => (
                <div key={hour} className="tl-slot">
                  <div className="tl-hour"><IcClock size={14} /> {hour}</div>
                  <div className="tl-items">
                    {group.map((r) => (
                      <div key={r.id} className="tl-card">
                        <strong>{r.user?.name || r.user?.email || 'Gość'}</strong>
                        <span className="faint"><IcUsers size={13} /> {r.guests} os. · stolik {r.table?.id ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stoliki */}
      {tab === 'tables' && <TablesManager />}

      {/* Użytkownicy */}
      {tab === 'users' && <UsersManager />}

      {/* Na żywo */}
      {tab === 'live' && (
        <div className="stack" style={{ gap: 12 }}>
          <p className="muted" style={{ fontSize: 14 }}>Powiadomienia o nowych rezerwacjach pojawiają się tutaj w czasie rzeczywistym.</p>
          {live.length === 0 ? (
            <div className="empty-state"><div className="empty-ic"><IcSparkle size={26} /></div><h3>Wszystko cicho</h3><p className="muted">Czekamy na nowe rezerwacje…</p></div>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {live.map((e, i) => (
                <div key={`${e.id}-${i}`} className="live-row animate-in">
                  <span className="live-dot" />
                  <div className="grow"><strong>Nowa rezerwacja #{e.id}</strong><div className="faint" style={{ fontSize: 13 }}>{e.guests ? `${e.guests} os.` : ''} {e.reservationTime ? `· ${timeOf(e.reservationTime)}` : ''}</div></div>
                  <span className="faint" style={{ fontSize: 12 }}>{e.at}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
