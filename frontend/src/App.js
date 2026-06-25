import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDevelopers from './pages/admin/AdminDevelopers';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminLeaves from './pages/admin/AdminLeaves';
import DevLayout from './pages/developer/DevLayout';
import DevDashboard from './pages/developer/DevDashboard';
import DevAttendance from './pages/developer/DevAttendance';
import DevLeaves from './pages/developer/DevLeaves';
import './index.css';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#6366f1', fontSize:'16px' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/dev/dashboard" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="developers" element={<AdminDevelopers />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="leaves" element={<AdminLeaves />} />
          </Route>

          {/* Developer Routes */}
          <Route path="/dev" element={
            <ProtectedRoute role="DEVELOPER"><DevLayout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<DevDashboard />} />
            <Route path="attendance" element={<DevAttendance />} />
            <Route path="leaves" element={<DevLeaves />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
