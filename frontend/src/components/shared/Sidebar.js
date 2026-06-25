import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ navItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">📋</div>
        <div>
          <div className="logo-text">AttendanceIQ</div>
          <div className="logo-sub">{user?.role === 'ADMIN' ? 'Admin Panel' : 'Developer'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role?.toLowerCase()}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
