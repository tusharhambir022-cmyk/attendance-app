import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OFFICE_LAT = 18.560416;
const OFFICE_LNG = 73.808324;
const ALLOWED_RADIUS_METERS = 300;

function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const isAdmin = email.toLowerCase() === 'admin@company.com' ||
                    email.toLowerCase().includes('admin');

    if (!isAdmin) {
      setLocationLoading(true);
      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('GPS not supported'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude } = position.coords;
        const distance = getDistanceInMeters(
          latitude, longitude,
          OFFICE_LAT, OFFICE_LNG
        );

        setLocationLoading(false);

        if (distance > ALLOWED_RADIUS_METERS) {
          setError(
            `You are ${Math.round(distance)} meters away from office. You must be within ${ALLOWED_RADIUS_METERS} meters of office to login.`
          );
          return;
        }
      } catch (geoError) {
        setLocationLoading(false);
        if (geoError.code === 1) {
          setError('Location access denied. Please allow location permission to login.');
        } else {
          setError('Unable to detect location. Please enable GPS and try again.');
        }
        return;
      }
    }

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

        <div style={{
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '16px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '12.5px'
        }}>
          📍 Developers must be at office to login
        </div>

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
            <div style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '12px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || locationLoading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '15px',
              marginTop: '4px',
              borderRadius: '10px'
            }}
          >
            {locationLoading ? '📍 Checking location...' : loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/*<div className="login-hint">*/}
        {/*  <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Demo Accounts</strong><br />*/}
        {/*  <span style={{ cursor: 'pointer', color: '#a5b4fc' }} onClick={() => fillDemo('admin')}>*/}
        {/*   */}
        {/*  </span><br />*/}
        {/*  <span style={{ cursor: 'pointer', color: '#a5b4fc' }} onClick={() => fillDemo('dev')}>*/}
        {/*    */}
        {/*  </span><br />*/}
        {/*  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'block' }}>*/}
        {/*    Click to auto-fill credentials*/}
        {/*  </span>*/}
        {/*</div>*/}
      </div>
    </div>
  );
}