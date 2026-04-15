import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAdmin } from '../App';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/responders', label: 'Responders', icon: '👤' },
  { to: '/emergencies', label: 'Emergencies', icon: '🚨' },
  { to: '/responses', label: 'Responses', icon: '⚡' },
  { to: '/credentials', label: 'Credentials', icon: '🛡️' },
  { to: '/consent', label: 'Consent records', icon: '📋' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/audit', label: 'Audit log', icon: '📁' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAdmin();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>P</div>
          <div>
            <div style={styles.brandName}>ProtaRes</div>
            <div style={styles.brandSub}>Admin Console</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.adminEmail}>{user?.email}</div>
          <button
            className="btn-ghost btn-sm"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{ width: '100%', marginTop: 8 }}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: 240,
    background: '#003087',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  brandLogo: {
    width: 36, height: 36,
    background: '#005EB8',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 18,
    flexShrink: 0,
  },
  brandName: { color: '#fff', fontWeight: 700, fontSize: 15 },
  brandSub: { color: 'rgba(255,255,255,0.55)', fontSize: 11 },
  nav: { padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 6,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.15s',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
  },
  navIcon: { fontSize: 14, width: 20, textAlign: 'center' },
  sidebarFooter: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  adminEmail: { color: 'rgba(255,255,255,0.55)', fontSize: 11, wordBreak: 'break-all' },
  main: { flex: 1, overflow: 'auto' },
  content: { padding: '28px 32px', maxWidth: 1400, margin: '0 auto' },
};
