import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { fmtDate } from '../../utils/format';
import Modal from '../../components/ui/Modal';

const STATUSES = ['new', 'contacted', 'in_progress', 'closed', 'spam'];

export default function Enquiries() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    const params = filter ? `?status=${filter}` : '';
    const data = await api(`/api/enquiries${params}`);
    setItems(data.data || []);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id) => {
    const d = await api(`/api/enquiries/${id}`);
    setDetail(d);
  };

  const updateStatus = async () => {
    const form = document.getElementById('enq-form');
    const fd = new FormData(form);
    await api(`/api/enquiries/${detail.id}`, {
      method: 'PATCH',
      body: { status: fd.get('status'), internal_notes: fd.get('internal_notes') },
    });
    setDetail(null);
    load();
  };

  return (
    <>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Enquiries</h3>
          <div className="admin-filters">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Subject</th><th>Source</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="admin-empty">No enquiries.</td></tr>
            ) : (
              items.map((e) => (
                <tr key={e.id}>
                  <td>{e.first_name} {e.last_name}</td>
                  <td>{e.email}</td>
                  <td>{e.subject || '—'}</td>
                  <td>{e.source || '—'}</td>
                  <td><span className={`pill ${e.status}`}>{e.status.replace('_', ' ')}</span></td>
                  <td>{fmtDate(e.created_at)}</td>
                  <td><button className="btn-ghost btn-sm" onClick={() => openDetail(e.id)}>View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <Modal
          title={`Enquiry — ${detail.first_name} ${detail.last_name}`}
          onClose={() => setDetail(null)}
          footer={
            <>
              <button className="btn" onClick={updateStatus}>Save</button>
              <button className="btn-ghost" onClick={() => setDetail(null)}>Cancel</button>
            </>
          }
        >
          <form id="enq-form">
            <dt>Email</dt><dd>{detail.email}</dd>
            <dt>Phone</dt><dd>{detail.phone || '—'}</dd>
            <dt>Subject</dt><dd>{detail.subject || '—'}</dd>
            <dt>Message</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{detail.message}</dd>
            {detail.car && (<><dt>Car</dt><dd>{detail.car.make} {detail.car.model} ({detail.car.year})</dd></>)}
            <dt>Source</dt><dd>{detail.source || '—'}</dd>
            <dt>Status</dt>
            <dd>
              <select className="input" name="status" defaultValue={detail.status}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </dd>
            <dt>Internal Notes</dt>
            <dd><textarea className="input" name="internal_notes" rows="3" defaultValue={detail.internal_notes || ''} /></dd>
          </form>
        </Modal>
      )}
    </>
  );
}
