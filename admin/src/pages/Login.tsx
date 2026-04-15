import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('chisom.ezeanyanwu@protares.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('/');
  };

  return (
    <div style={styles.root}>
      <div className="card" style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logo}>P</div>
          <div>
            <div style={styles.appName}>ProtaRes</div>
            <div style={styles.appSub}>Admin Console</div>
          </div>
        </div>

        <h1 style={styles.heading}>Sign in</h1>
        <p style={styles.sub}>NHS DTAC-aligned emergency response platform</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 15 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--pale-grey)',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 420, padding: 40 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 },
  logo: {
    width: 44, height: 44, borderRadius: 10,
    background: 'var(--nhs-blue)',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 22,
  },
  appName: { fontWeight: 700, fontSize: 17, color: 'var(--nhs-blue)' },
  appSub: { fontSize: 12, color: 'var(--grey3)' },
  heading: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  sub: { fontSize: 13, color: 'var(--grey3)', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--grey2)' },
  error: {
    background: '#f8d7da', border: '1px solid #f5c6cb',
    color: '#721c24', borderRadius: 4, padding: '10px 14px', fontSize: 13,
  },
};
