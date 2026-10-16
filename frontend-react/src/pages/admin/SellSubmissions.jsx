import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { fmtDate, fmtKES } from '../../utils/format';
import Modal from '../../components/ui/Modal';

const STATUSES = ['pending', 'reviewing', 'offer_made', 'accepted', 'rejected', 'withdrawn'];

export default function SellSubmissions() {
  const [items, setItems] = useState([]);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    const data = await api('/api/sell-car');
    setItems(data.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id) => {
    const d = await api(`/api/sell-car/${id}`);
    setDetail(d);
  };

  const save = async () => {
    const form = document.getElementById('sell-form');
    const fd = new FormData(form);
    await api(`/api/sell-car/${detail.id}`, {
      method: 'PATCH',
      body: {
        status: fd.get('status'),
        our_offer_kes: parseInt(fd.get('our_offer_kes'), 10) || null,
        internal_notes: fd.get('internal_notes'),
      },
    });
    setDetail(null);
    load();
  };

  return (
    <>
      <div className="admin-panel">
        <div className="admin-panel-head"><h3>Sell-Your-Car Submissions</h3></div>
        <table className="admin-table">
          <thead>
            <tr><th>Customer</th><th>Car</th><th>Year</th><th>KM</th><th>Condition</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={8} className="admin-empty">No submissions.</td></tr>
            ) : (
              items.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.make} {s.model}</td>
                  <td>{s.year}</td>
                  <td>{s.km?.toLocaleString() || '—'}</td>
                  <td>{s.condition}</td>
                  <td><span className={`pill ${s.status}`}>{s.status.replace('_', ' ')}</span></td>
                  <td>{fmtDate(s.created_at)}</td>
                  <td><button className="btn-ghost btn-sm" onClick={() => openDetail(s.id)}>View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <Modal
          title={`Sell — ${detail.make} ${detail.model} (${detail.year})`}
          onClose={() => setDetail(null)}
          footer={
            <>
              <button className="btn" onClick={save}>Save</button>
              <button className="btn-ghost" onClick={() => setDetail(null)}>Cancel</button>
            </>
          }
        >
          <form id="sell-form">
            <dt>Customer</dt><dd>{detail.name}</dd>
            <dt>Phone</dt><dd>{detail.phone}</dd>
            <dt>Email</dt><dd>{detail.email}</dd>
            <dt>Car</dt><dd>{detail.make} {detail.model} — {detail.year}</dd>
            <dt>KM / Condition</dt><dd>{detail.km?.toLocaleString() || '—'} · {detail.condition}</dd>
            {detail.notes && (<><dt>Customer Notes</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{detail.notes}</dd></>)}
            <dt>Status</dt>
            <dd>
              <select className="input" name="status" defaultValue={detail.status}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </dd>
            <dt>Our Offer (KES)</dt>
            <dd><input className="input" type="number" name="our_offer_kes" defaultValue={detail.our_offer_kes || ''} /></dd>
            <dt>Internal Notes</dt>
            <dd><textarea className="input" name="internal_notes" rows="3" defaultValue={detail.internal_notes || ''} /></dd>
          </form>
        </Modal>
      )}
    </>
  );
}
