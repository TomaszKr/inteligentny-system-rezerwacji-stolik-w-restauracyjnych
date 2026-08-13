import React, { useEffect, useMemo, useState } from 'react';
import {
  AdminTable, AdminRestaurant, listTables, listRestaurants,
  createTable, updateTable, updateTableStatus, deleteTable, createRestaurant,
} from '../../services/tablesAdminService';
import { useToast } from '../ui/Toast';
import { IcTable, IcUsers, IcCheck, IcX, IcSparkle, IcMapPin, IcPhone, IcMail } from '../ui/icons';

const isFree = (s?: string) => (s || 'wolny') === 'wolny';

const TablesManager: React.FC = () => {
  const toast = useToast();
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // formularz dodawania
  const [newNo, setNewNo] = useState('');
  const [newCap, setNewCap] = useState(4);
  const [adding, setAdding] = useState(false);

  // edycja inline
  const [editId, setEditId] = useState<number | null>(null);
  const [editNo, setEditNo] = useState(0);
  const [editCap, setEditCap] = useState(0);

  // tworzenie restauracji
  const [showNewRest, setShowNewRest] = useState(false);
  const [newRest, setNewRest] = useState({ name: '', address: '', phone: '', email: '' });
  const [creatingRest, setCreatingRest] = useState(false);

  const loadRestaurants = async () => {
    try {
      const rs = await listRestaurants();
      setRestaurants(rs);
      if (rs.length && restaurantId == null) setRestaurantId(rs[0].id);
      else if (!rs.length) setRestaurantId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd pobierania restauracji');
    }
  };

  const loadTables = async (rid: number | null) => {
    setLoading(true); setError(null);
    try {
      setTables(await listTables(rid ?? undefined));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd pobierania stolików');
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRestaurants(); }, []);
  useEffect(() => { loadTables(restaurantId); /* eslint-disable-next-line */ }, [restaurantId]);

  const stats = useMemo(() => {
    const seats = tables.reduce((s, t) => s + (t.capacity || 0), 0);
    const free = tables.filter((t) => isFree(t.status)).length;
    return { count: tables.length, seats, free, occupied: tables.length - free };
  }, [tables]);

  const suggestedNo = useMemo(
    () => String((tables.reduce((m, t) => Math.max(m, t.tableNumber), 0) || 0) + 1),
    [tables],
  );

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restaurantId == null) { toast.push('Najpierw utwórz restaurację.', 'error'); return; }
    setAdding(true);
    try {
      const no = Number(newNo || suggestedNo);
      await createTable({ tableNumber: no, capacity: newCap, restaurantId });
      toast.push(`Dodano stolik nr ${no}.`, 'success');
      setNewNo('');
      loadTables(restaurantId);
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Nie udało się dodać stolika.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async (t: AdminTable) => {
    setBusyId(t.id);
    try {
      await updateTableStatus(t.id, isFree(t.status) ? 'zajęty' : 'wolny');
      loadTables(restaurantId);
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Nie udało się zmienić statusu.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const addRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRest(true);
    try {
      const r = await createRestaurant(newRest);
      toast.push(`Utworzono restaurację „${newRest.name}".`, 'success');
      setNewRest({ name: '', address: '', phone: '', email: '' });
      setShowNewRest(false);
      await loadRestaurants();
      if (r?.id) setRestaurantId(r.id);
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Nie udało się utworzyć restauracji.', 'error');
    } finally {
      setCreatingRest(false);
    }
  };

  const setRest = (k: keyof typeof newRest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewRest((r) => ({ ...r, [k]: e.target.value }));

  const startEdit = (t: AdminTable) => { setEditId(t.id); setEditNo(t.tableNumber); setEditCap(t.capacity); };
  const saveEdit = async (id: number) => {
    setBusyId(id);
    try {
      await updateTable(id, { tableNumber: editNo, capacity: editCap });
      toast.push('Zapisano zmiany.', 'success');
      setEditId(null);
      loadTables(restaurantId);
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Nie udało się zapisać.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (t: AdminTable) => {
    if (!window.confirm(`Usunąć stolik nr ${t.tableNumber}? Tej operacji nie można cofnąć.`)) return;
    setBusyId(t.id);
    try {
      await deleteTable(t.id);
      toast.push(`Usunięto stolik nr ${t.tableNumber}.`, 'success');
      loadTables(restaurantId);
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Nie udało się usunąć stolika.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack" style={{ gap: 16 }}>
      {/* Restauracje */}
      <div className="rest-bar">
        <div className="row between wrap" style={{ gap: 12 }}>
          {restaurants.length > 0 ? (
            <div className="field" style={{ maxWidth: 340, flex: 1, minWidth: 200 }}>
              <label className="label"><IcMapPin size={14} /> Restauracja</label>
              <select className="select" value={restaurantId ?? ''} onChange={(e) => setRestaurantId(Number(e.target.value))}>
                {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>Nie masz jeszcze żadnej restauracji. Utwórz pierwszą, aby dodawać stoliki.</p>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowNewRest((v) => !v)}>
            {showNewRest ? 'Anuluj' : '+ Nowa restauracja'}
          </button>
        </div>

        {(showNewRest || restaurants.length === 0) && (
          <form className="rest-form animate-in" onSubmit={addRestaurant}>
            <div className="field"><label className="label">Nazwa</label>
              <div className="input-group"><IcSparkle className="input-icon" size={18} /><input className="input" value={newRest.name} onChange={setRest('name')} required placeholder="AURA Restaurant" /></div>
            </div>
            <div className="field"><label className="label">Adres</label>
              <div className="input-group"><IcMapPin className="input-icon" size={18} /><input className="input" value={newRest.address} onChange={setRest('address')} required placeholder="ul. Złota 1, Centrum" /></div>
            </div>
            <div className="field"><label className="label">Telefon</label>
              <div className="input-group"><IcPhone className="input-icon" size={18} /><input className="input" type="tel" value={newRest.phone} onChange={setRest('phone')} required placeholder="+48 22 123 45 67" /></div>
            </div>
            <div className="field"><label className="label">E-mail</label>
              <div className="input-group"><IcMail className="input-icon" size={18} /><input className="input" type="email" value={newRest.email} onChange={setRest('email')} required placeholder="kontakt@aura.pl" /></div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={creatingRest}>{creatingRest ? 'Tworzę…' : 'Utwórz restaurację'}</button>
          </form>
        )}
      </div>

      {restaurantId == null ? null : (
      <>
      <div className="stat-grid">
        <div className="stat-card"><span className="stat-ic"><IcTable size={20} /></span><div><div className="stat-value">{stats.count}</div><div className="stat-label">Stolików</div></div></div>
        <div className="stat-card"><span className="stat-ic"><IcUsers size={20} /></span><div><div className="stat-value">{stats.seats}</div><div className="stat-label">Miejsc łącznie</div></div></div>
        <div className="stat-card"><span className="stat-ic"><IcCheck size={20} /></span><div><div className="stat-value">{stats.free}</div><div className="stat-label">Wolnych</div></div></div>
        <div className="stat-card"><span className="stat-ic"><IcX size={20} /></span><div><div className="stat-value">{stats.occupied}</div><div className="stat-label">Zajętych</div></div></div>
      </div>

      {/* Dodawanie */}
      <form className="add-table-bar" onSubmit={add}>
        <div className="field">
          <label className="label">Numer</label>
          <input className="input" inputMode="numeric" value={newNo} onChange={(e) => setNewNo(e.target.value)} placeholder={suggestedNo} />
        </div>
        <div className="field">
          <label className="label">Miejsca</label>
          <div className="stepper">
            <button type="button" onClick={() => setNewCap((c) => Math.max(1, c - 1))} disabled={newCap <= 1} aria-label="Mniej">−</button>
            <span className="val">{newCap}</span>
            <button type="button" onClick={() => setNewCap((c) => Math.min(20, c + 1))} disabled={newCap >= 20} aria-label="Więcej">+</button>
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={adding || restaurantId == null}>
          {adding ? 'Dodaję…' : 'Dodaj stolik'}
        </button>
      </form>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {loading ? (
        <div className="table-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 18 }} />)}</div>
      ) : tables.length === 0 ? (
        <div className="empty-state"><div className="empty-ic"><IcSparkle size={26} /></div><h3>Brak stolików</h3><p className="muted">Dodaj pierwszy stolik formularzem powyżej.</p></div>
      ) : (
        <div className="table-grid">
          {tables.slice().sort((a, b) => a.tableNumber - b.tableNumber).map((t) => (
            <div key={t.id} className={`mgmt-table ${isFree(t.status) ? '' : 'is-occupied'}`}>
              {editId === t.id ? (
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <div className="field grow"><label className="label">Nr</label><input className="input" type="number" min={1} value={editNo} onChange={(e) => setEditNo(Number(e.target.value))} /></div>
                    <div className="field grow"><label className="label">Miejsca</label><input className="input" type="number" min={1} value={editCap} onChange={(e) => setEditCap(Number(e.target.value))} /></div>
                  </div>
                  <div className="row between">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Anuluj</button>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(t.id)} disabled={busyId === t.id}><IcCheck size={15} /> Zapisz</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row between">
                    <span className="table-card-ic"><IcTable size={20} /></span>
                    <span className={`badge ${isFree(t.status) ? 'badge-success' : 'badge-danger'} badge-dot`}>{isFree(t.status) ? 'Wolny' : 'Zajęty'}</span>
                  </div>
                  <div className="mgmt-no">Stolik {t.tableNumber}</div>
                  <div className="mgmt-cap"><IcUsers size={14} /> {t.capacity} miejsc</div>
                  <div className="mgmt-actions">
                    <button className="btn btn-solid btn-sm" onClick={() => toggleStatus(t)} disabled={busyId === t.id}>{isFree(t.status) ? 'Oznacz zajęty' : 'Oznacz wolny'}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(t)} aria-label="Edytuj">Edytuj</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(t)} disabled={busyId === t.id} aria-label="Usuń"><IcX size={15} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default TablesManager;
