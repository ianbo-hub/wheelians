import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { fmtDate } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/ui/Modal';

const ROLES = ['admin', 'sales_rep'];

export default function UserManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    const data = await api('/api/admin/users');
    setUsers(data.data || []);
  };

  useEffect(() => { load(); }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  };

  const createUser = async () => {
    const form = document.getElementById('user-form');
    const fd = new FormData(form);
    await api('/api/admin/users', {
      method: 'POST',
      body: {
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        role: fd.get('role'),
        password: fd.get('password'),
      },
    });
    setShowNew(false);
    load();
  };

  return (
    <>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Users</h3>
          <button className="btn btn-sm" onClick={() => setShowNew(true)}>+ New Staff</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={6} className="admin-empty">No users.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td><span className={`pill ${u.role === 'admin' ? 'confirmed' : 'new'}`}>{u.role.replace('_', ' ')}</span></td>
                  <td>{fmtDate(u.created_at)}</td>
                  <td>
                    {u.id !== user?.id && (
                      <button className="btn-ghost btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal
          title="Add Staff Member"
          onClose={() => setShowNew(false)}
          footer={
            <>
              <button className="btn" onClick={() => createUser().catch((err) => alert(err.message))}>Create</button>
              <button className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
            </>
          }
        >
          <form id="user-form">
            <dt>Full Name</dt><dd><input className="input" name="name" required /></dd>
            <dt>Email</dt><dd><input className="input" type="email" name="email" required /></dd>
            <dt>Phone</dt><dd><input className="input" name="phone" /></dd>
            <dt>Role</dt>
            <dd>
              <select className="input" name="role" defaultValue="sales_rep">
                {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </dd>
            <dt>Password</dt><dd><input className="input" type="password" name="password" required minLength={6} /></dd>
          </form>
        </Modal>
      )}
    </>
  );
}
