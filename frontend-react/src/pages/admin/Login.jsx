import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@wheelians.co.ke');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1>WHEEL<span>IANS</span></h1>
        <div className="tag">ADMIN · STAFF LOGIN</div>

        <label>Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" className="btn-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {error && <div className="msg err">{error}</div>}

        <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 20, textAlign: 'center', lineHeight: 1.6 }}>
          Default admin: <code style={{ color: 'var(--silver)' }}>admin@wheelians.co.ke</code><br />
          Password set in <code style={{ color: 'var(--silver)' }}>backend/.env</code>
        </p>
      </form>
    </div>
  );
}
