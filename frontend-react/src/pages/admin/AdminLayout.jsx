import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/admin.css';
import Login from './Login';
import Dashboard from './Dashboard';
import InventoryManager from './InventoryManager';
import Enquiries from './Enquiries';
import SellSubmissions from './SellSubmissions';
import FinanceApps from './FinanceApps';
import TestDrives from './TestDrives';
import UserManager from './UserManager';

const VIEWS = [
  { key: 'dashboard',  label: 'Dashboard',    icon: '◫' },
  { key: 'inventory',  label: 'Inventory',    icon: '◉' },
  { key: 'enquiries',  label: 'Enquiries',    icon: '✉' },
  { key: 'sell',       label: 'Sell Requests', icon: '⇄' },
  { key: 'finance',    label: 'Finance',      icon: '$' },
  { key: 'testdrives', label: 'Test Drives',  icon: '⚑' },
  { key: 'users',      label: 'Users',        icon: '◎' },
];

export default function AdminLayout() {
  const { token, user, logout, checkSession } = useAuth();
  const [view, setView] = useState('dashboard');
  const [counts, setCounts] = useState({});

  useEffect(() => { checkSession(); }, [checkSession]);

  if (!token) return <Login />;

  const countBadge = (key) => {
    const map = { enquiries: counts.enquiries, sell: counts.sell, finance: counts.finance, testdrives: counts.td };
    const n = map[key];
    return n ? <span className="count">{n}</span> : null;
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const renderView = () => {
    switch (view) {
      case 'dashboard':  return <Dashboard counts={counts} setCounts={setCounts} />;
      case 'inventory':  return <InventoryManager />;
      case 'enquiries':  return <Enquiries />;
      case 'sell':       return <SellSubmissions />;
      case 'finance':    return <FinanceApps />;
      case 'testdrives': return <TestDrives />;
      case 'users':      return <UserManager />;
      default:           return <Dashboard counts={counts} setCounts={setCounts} />;
    }
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1>WHEEL<span>IANS</span></h1>
          <div className="tag">ADMIN CONSOLE</div>
        </div>
        <ul className="admin-nav">
          {VIEWS.map((v) => (
            <li key={v.key}>
              <a
                className={view === v.key ? 'active' : ''}
                onClick={() => setView(v.key)}
              >
                <span>{v.icon}</span> {v.label} {countBadge(v.key)}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <a onClick={() => { window.location.href = '/'; }} style={{ fontSize: 12, color: 'var(--dim)', cursor: 'pointer' }}>
            ← Back to site
          </a>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h2>{VIEWS.find((v) => v.key === view)?.label || 'Dashboard'}</h2>
          <div className="admin-user">
            <span>{user?.name}</span>
            <div className="admin-avatar">{initials}</div>
            <button className="btn-ghost btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
        {renderView()}
      </main>
    </div>
  );
}
