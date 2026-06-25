import React, { useState, useEffect } from 'react';
import { getAllDevelopers, getPendingLeaves, getAllTodayAttendance } from '../../services/api';
import { format } from 'date-fns';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '20' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color }}>{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [developers, setDevelopers] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllDevelopers(), getPendingLeaves(), getAllTodayAttendance()])
      .then(([devRes, leaveRes, attRes]) => {
        setDevelopers(devRes.data);
        setPendingLeaves(leaveRes.data);
        setTodayAttendance(attRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const presentToday = todayAttendance.filter(a => a.checkIn).length;
  const activeDevs = developers.filter(d => d.active).length;

  const getStatusBadge = (a) => {
    if (a.checkOut) return <span className="badge badge-success">✅ Checked Out</span>;
    if (a.checkIn) return <span className="badge badge-info">🟢 Working</span>;
    return <span className="badge badge-gray">–</span>;
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'} 👋</h1>
          <p className="page-sub">Here's what's happening with your team today</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="👥" label="Total Developers" value={activeDevs} sub={`${developers.length} registered`} color="#6366f1" />
        <StatCard icon="✅" label="Present Today" value={presentToday} sub={`${activeDevs - presentToday} absent / not checked in`} color="#10b981" />
        <StatCard icon="🌴" label="Pending Leaves" value={pendingLeaves.length} sub="Awaiting your review" color="#f59e0b" />
        <StatCard icon="📅" label="Today's Date" value={format(new Date(), 'd MMM')} sub={format(new Date(), 'yyyy, EEEE')} color="#0ea5e9" />
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Today's Attendance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Attendance</span>
            <span className="badge badge-info">{todayAttendance.length} checked in</span>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            {todayAttendance.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📭</div><div className="empty-text">No one has checked in yet</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Developer</th><th>Check In</th><th>Status</th></tr></thead>
                  <tbody>
                    {todayAttendance.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500 }}>{a.userName}</td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          {a.checkIn ? format(new Date(a.checkIn), 'hh:mm a') : '–'}
                        </td>
                        <td>{getStatusBadge(a)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending Leave Requests</span>
            {pendingLeaves.length > 0 && <span className="badge badge-warning">{pendingLeaves.length} pending</span>}
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            {pendingLeaves.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🎉</div><div className="empty-text">No pending leave requests</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Developer</th><th>Type</th><th>Days</th></tr></thead>
                  <tbody>
                    {pendingLeaves.slice(0, 6).map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 500 }}>{l.userName}</td>
                        <td>
                          <span className="badge badge-purple">
                            {l.leaveType?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{l.totalDays}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Developers Overview */}
      <div className="card">
        <div className="card-header" style={{ paddingBottom: '12px' }}>
          <span className="card-title">Developers Overview</span>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Leaves This Year</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {developers.map(dev => (
                  <tr key={dev.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#6366f1', flexShrink: 0 }}>
                          {dev.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{dev.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{dev.email}</td>
                    <td>{dev.department || '–'}</td>
                    <td><strong>{dev.totalLeavesThisYear || 0}</strong> days</td>
                    <td>
                      <span className={`badge ${dev.active ? 'badge-success' : 'badge-danger'}`}>
                        {dev.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
