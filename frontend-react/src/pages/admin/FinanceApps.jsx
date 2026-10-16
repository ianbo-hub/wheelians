import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { fmtDate, fmtKES } from '../../utils/format';

const STATUSES = ['submitted', 'reviewing', 'approved', 'rejected', 'disbursed'];

export default function FinanceApps() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await api('/api/finance/applications');
    setItems(data.data || []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api(`/api/finance/applications/${id}`, { method: 'PATCH', body: { status } });
    load();
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head"><h3>Finance Applications</h3></div>
      <table className="admin-table">
        <thead>
          <tr><th>Applicant</th><th>Email</th><th>Phone</th><th>Car</th><th>Amount</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={7} className="admin-empty">No finance applications.</td></tr>
          ) : (
            items.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td>{f.phone || '—'}</td>
                <td>{f.car ? `${f.car.make} ${f.car.model}` : '—'}</td>
                <td>{f.amount_kes ? fmtKES(f.amount_kes) : '—'}</td>
                <td>
                  <select
                    className="input"
                    value={f.status}
                    onChange={(e) => updateStatus(f.id, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>{fmtDate(f.created_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
