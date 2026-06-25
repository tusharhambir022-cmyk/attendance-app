import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { format } from 'date-fns';

const adminNav = [
  { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/admin/developers', icon: '👥', label: 'Developers' },
  { path: '/admin/attendance', icon: '📅', label: 'Attendance' },
  { path: '/admin/leaves', icon: '🌴', label: 'Leave Requests' },
];

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/developers': 'Manage Developers',
  '/admin/attendance': 'Attendance Records',
  '/admin/leaves': 'Leave Requests',
};

export default function AdminLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Admin Panel';

  return (
    <div className="app-layout">
      <Sidebar navItems={adminNav} />
      <div className="main-content">
        <header className="top-header">
          <span className="header-title">{title}</span>
          <span className="header-date">📅 {format(new Date(), 'EEEE, d MMMM yyyy')}</span>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
