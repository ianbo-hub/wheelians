import { useState } from 'react';

const links = [
  { href: '#inventory', label: 'INVENTORY' },
  { href: '#about', label: 'ABOUT' },
  { href: '#locations', label: 'LOCATIONS' },
  { href: '#finance', label: 'FINANCE' },
  { href: '#faq', label: 'FAQ' },
  { href: '#sell', label: 'SELL YOUR CAR' },
  { href: '#contact', label: 'CONTACT' },
];

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollTo = (e, href) => {
    e.preventDefault();
    setDrawerOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className="nav">
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <svg viewBox="0 0 28 28" width="22" height="22" style={{ marginRight: 6, verticalAlign: 'middle' }}><circle cx="14" cy="14" r="13" fill="none" stroke="var(--silver)" strokeWidth="2"/><circle cx="14" cy="14" r="7" fill="none" stroke="var(--silver)" strokeWidth="1.5"/><circle cx="14" cy="14" r="2" fill="var(--silver)"/><line x1="14" y1="1" x2="14" y2="7" stroke="var(--silver)" strokeWidth="1.5"/><line x1="14" y1="21" x2="14" y2="27" stroke="var(--silver)" strokeWidth="1.5"/><line x1="1" y1="14" x2="7" y2="14" stroke="var(--silver)" strokeWidth="1.5"/><line x1="21" y1="14" x2="27" y2="14" stroke="var(--silver)" strokeWidth="1.5"/></svg>
          WHEEL<span>IANS</span>
        </a>
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)}>{l.label}</a>
          ))}
          <a href="/admin" style={{ marginLeft: 12, color: 'var(--silver-dim)' }}>ADMIN</a>
        </div>
        <button className="hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`mobile-drawer${drawerOpen ? ' open' : ''}`}>
        <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)}>{l.label}</a>
        ))}
        <a href="/admin" style={{ marginTop: 20, color: 'var(--silver-dim)' }}>ADMIN</a>
      </div>
    </>
  );
}
