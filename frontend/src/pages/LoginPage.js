import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/dev/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') { setEmail('admin@company.com'); setPassword('admin123'); }
    else { setEmail('dev1@company.com'); setPassword('dev123'); }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-icon">📋</div>
          <span className="login-logo-text">AttendanceIQ</span>
        </div>

        <h2 className="login-heading">Welcome back</h2>
        <p className="login-sub">Sign in to track your team's attendance</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '12px' }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '4px', borderRadius: '10px' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="login-hint">
          <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Demo Accounts</strong><br />
          <span style={{ cursor: 'pointer', color: '#a5b4fc' }} onClick={() => fillDemo('admin')}>
            👑 Admin: admin@company.com / admin123
          </span><br />
          <span style={{ cursor: 'pointer', color: '#a5b4fc' }} onClick={() => fillDemo('dev')}>
            💻 Developer: dev1@company.com / dev123
          </span><br />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>Click to auto-fill credentials</span>
        </div>
      </div>
    </div>
  );
}
