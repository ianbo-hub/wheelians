import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { fmtDate } from '../../utils/format';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export default function TestDrives() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await api('/api/test-drives');
    setItems(data.data || []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api(`/api/test-drives/${id}`, { method: 'PATCH', body: { status } });
    load();
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head"><h3>Test Drive Bookings</h3></div>
      <table className="admin-table">
        <thead>
          <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Car</th><th>Preferred Date</th><th>Status</th><th>Booked</th></tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={7} className="admin-empty">No test drive bookings.</td></tr>
          ) : (
            items.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.email}</td>
                <td>{t.phone || '—'}</td>
                <td>{t.car ? `${t.car.make} ${t.car.model}` : '—'}</td>
                <td>{t.preferred_date ? fmtDate(t.preferred_date) : '—'}</td>
                <td>
                  <select
                    className="input"
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </td>
                <td>{fmtDate(t.created_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
