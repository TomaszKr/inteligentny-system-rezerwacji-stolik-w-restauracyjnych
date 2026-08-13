import React, { useEffect, useMemo, useState } from 'react';
import { AdminUser, Role, listUsers, updateUserRole } from '../../services/usersAdminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { IcUser, IcUsers, IcMail, IcLock, IcCheck, IcSparkle } from '../ui/icons';

const ROLE_LABEL: Record<Role, string> = { user: 'Klient', manager: 'Menedżer', admin: 'Administrator' };
const ROLE_BADGE: Record<Role, string> = { user: 'badge', manager: 'badge-info', admin: 'badge-gold' };
const isLocked = (u: AdminUser) => !!u.lockedUntil && new Date(u.lockedUntil) > new Date();

const UsersManager: React.FC = () => {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      setUsers(await listUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd pobierania użytkowników');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    managers: users.filter((u) => u.role === 'manager').length,
    unverified: users.filter((u) => u.emailVerified === false).length,
  }), [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q));
  }, [users, query]);

  const changeRole = async (u: AdminUser, role: Role) => {
    if (role === u.role) return;
    setBusyId(u.id);
    try {
      await updateUserRole(u.id, role);
      toast.push(`Nadano rolę „${ROLE_LABEL[role]}" — ${u.email}.`, 'success');
      load();
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Nie udało się zmienić roli.', 'error');
      load(); // przywróć stan z serwera (select mógł się zmienić optymistycznie)
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="stat-grid">
        <div className="stat-card"><span className="stat-ic"><IcUsers size={20} /></span><div><div className="stat-value">{stats.total}</div><div className="stat-label">Użytkowników</div></div></div>
        <div className="stat-card"><span className="stat-ic"><IcSparkle size={20} /></span><div><div className="stat-value">{stats.admins}</div><div className="stat-label">Administratorów</div></div></div>
        <div className="stat-card"><span className="stat-ic"><IcUser size={20} /></span><div><div className="stat-value">{stats.managers}</div><div className="stat-label">Menedżerów</div></div></div>
        <div className="stat-card"><span className="stat-ic"><IcMail size={20} /></span><div><div className="stat-value">{stats.unverified}</div><div className="stat-label">Niezweryfik.</div></div></div>
      </div>

      <div className="input-group" style={{ maxWidth: 340 }}>
        <IcUser className="input-icon" size={18} />
        <input className="input" placeholder="Szukaj po nazwisku lub e-mailu…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {loading ? (
        <div className="stack" style={{ gap: 10 }}>{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 84, borderRadius: 16 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-ic"><IcUsers size={26} /></div><h3>Brak użytkowników</h3><p className="muted">Nikt jeszcze nie pasuje do wyszukiwania.</p></div>
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {filtered.map((u) => {
            const mine = me?.sub === u.id;
            return (
              <div key={u.id} className="user-row">
                <span className="user-avatar" aria-hidden="true">{(u.firstName?.[0] || u.email[0] || '?').toUpperCase()}</span>
                <div className="user-main">
                  <div className="user-name">
                    {u.firstName} {u.lastName}
                    {mine && <span className="badge badge-gold" style={{ marginLeft: 8 }}>To Ty</span>}
                  </div>
                  <div className="user-mail faint">{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
                  <div className="user-badges">
                    <span className={`badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                    {u.emailVerified === false
                      ? <span className="badge badge-warn">E-mail niezweryfikowany</span>
                      : <span className="badge badge-success badge-dot">E-mail OK</span>}
                    {u.twoFactorEnabled && <span className="badge badge-info badge-dot">2FA</span>}
                    {isLocked(u) && <span className="badge badge-danger"><IcLock size={12} /> Zablokowany</span>}
                  </div>
                </div>
                <div className="user-actions">
                  <label className="label" style={{ fontSize: 11 }}>Rola</label>
                  <select
                    className="select select-sm"
                    value={u.role}
                    disabled={busyId === u.id || mine}
                    title={mine ? 'Nie możesz zmienić własnej roli' : 'Zmień rolę'}
                    onChange={(e) => changeRole(u, e.target.value as Role)}
                  >
                    <option value="user">Klient</option>
                    <option value="manager">Menedżer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UsersManager;
