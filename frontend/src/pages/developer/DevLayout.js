import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { format } from 'date-fns';

const devNav = [
  { path: '/dev/dashboard', icon: '🏠', label: 'My Dashboard' },
  { path: '/dev/attendance', icon: '📅', label: 'My Attendance' },
  { path: '/dev/leaves', icon: '🌴', label: 'My Leaves' },
];

const pageTitles = {
  '/dev/dashboard': 'My Dashboard',
  '/dev/attendance': 'My Attendance',
  '/dev/leaves': 'Leave Requests',
};

export default function DevLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      <Sidebar navItems={devNav} />
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
