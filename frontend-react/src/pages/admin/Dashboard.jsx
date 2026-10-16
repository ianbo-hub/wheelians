import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { fmtDate } from '../../utils/format';

export default function Dashboard({ counts, setCounts }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.all([api('/api/admin/stats'), api('/api/admin/activity')])
      .then(([s, a]) => {
        setStats(s);
        setActivity(a.data || []);
        setCounts({
          cars: s.cars_available,
          enquiries: s.enquiries_new,
          sell: s.sell_pending,
          finance: s.finance_submitted,
          td: s.test_drives_pending,
        });
      })
      .catch(console.error);
  }, [setCounts]);

  if (!stats) return <div className="admin-empty">Loading…</div>;

  const tiles = [
    ['Inventory', stats.cars_available, `${stats.cars_sold} sold`],
    ['New enquiries', stats.enquiries_new, `${stats.enquiries_total} total`],
    ['Pending sell-car', stats.sell_pending, `${stats.sell_submissions} total`],
    ['Finance apps', stats.finance_submitted, `${stats.finance_apps} total`],
    ['Test drives', stats.test_drives_pending, 'pending'],
    ['Users', stats.users_total, ''],
  ];

  return (
    <>
      <div className="admin-stats">
        {tiles.map(([label, value, delta], i) => (
          <div key={i} className="admin-stat">
            <div className="label">{label}</div>
            <div className="value">{value}</div>
            {delta && <div className="delta">{delta}</div>}
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><h3>Recent Activity</h3></div>
        <table className="admin-table">
          <thead>
            <tr><th>Type</th><th>Name</th><th>Email</th><th>When</th></tr>
          </thead>
          <tbody>
            {activity.length === 0 ? (
              <tr><td colSpan={4} className="admin-empty">No activity yet.</td></tr>
            ) : (
              activity.map((a, i) => (
                <tr key={i}>
                  <td><span className="pill new">{a.type.replace('_', ' ')}</span></td>
                  <td>{a.name || '—'}</td>
                  <td>{a.email || '—'}</td>
                  <td>{fmtDate(a.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
