import React, { useState, useEffect, useCallback } from 'react';
import { checkIn, checkOut, getTodayAttendance, getMyMonthSummary, getLeaveBalance, getMyLeaves } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { formatIST } from '../../services/timeUtils';

// ==============================
// OFFICE LOCATION - Parihar Chowk, Aundh, Pune
// ==============================
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

async function checkOfficeLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS not supported on this device'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistanceInMeters(
          latitude, longitude,
          OFFICE_LAT, OFFICE_LNG
        );
        if (distance <= ALLOWED_RADIUS_METERS) {
          resolve({ allowed: true, distance: Math.round(distance) });
        } else {
          resolve({ allowed: false, distance: Math.round(distance) });
        }
      },
      (error) => {
        if (error.code === 1) {
          reject(new Error('Location permission denied. Please allow location to check in.'));
        } else {
          reject(new Error('Unable to get location. Please enable GPS and try again.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

function LeaveBalanceBar({ label, used, total, color }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div className="leave-balance-bar">
      <div className="leave-balance-label">
        <span>{label}</span>
        <span style={{ color: pct > 80 ? 'var(--danger)' : 'var(--text-muted)' }}>{used} / {total} days</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: pct + '%', background: color }} />
      </div>
    </div>
  );
}

export default function DevDashboard() {
  const { user } = useAuth();
  const [today, setToday] = useState(null);
  const [summary, setSummary] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [locationChecking, setLocationChecking] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(() => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    Promise.all([
      getTodayAttendance(),
      getMyMonthSummary(month, year),
      getLeaveBalance(),
      getMyLeaves(),
    ]).then(([todayRes, summaryRes, balanceRes, leavesRes]) => {
      setToday(todayRes.data);
      setSummary(summaryRes.data);
      setBalance(balanceRes.data);
      setRecentLeaves(leavesRes.data?.slice(0, 4) || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckIn = async () => {
    setLocationChecking(true);
    try {
      const location = await checkOfficeLocation();
      setLocationChecking(false);

      if (!location.allowed) {
        showToast(
          `❌ You are ${location.distance}m away from office. Must be within ${ALLOWED_RADIUS_METERS}m to check in.`,
          'error'
        );
        return;
      }

      setActionLoading(true);
      await checkIn();
      showToast('✅ Checked in! Have a productive day 🚀');
      fetchData();
    } catch (err) {
      setLocationChecking(false);
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLocationChecking(true);
    try {
      const location = await checkOfficeLocation();
      setLocationChecking(false);

      if (!location.allowed) {
        showToast(
          `❌ You are ${location.distance}m away from office. Must be within ${ALLOWED_RADIUS_METERS}m to check out.`,
          'error'
        );
        return;
      }

      setActionLoading(true);
      await checkOut();
      showToast('👋 Checked out! See you tomorrow');
      fetchData();
    } catch (err) {
      setLocationChecking(false);
      showToast(err.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isCheckedIn = today?.checkIn && !today?.checkOut;
  const isCheckedOut = today?.checkIn && today?.checkOut;
  const isButtonLoading = actionLoading || locationChecking;

  const LEAVE_STATUS_BADGE = {
    PENDING: <span className="badge badge-warning">Pending</span>,
    APPROVED: <span className="badge badge-success">Approved</span>,
    REJECTED: <span className="badge badge-danger">Rejected</span>,
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading your dashboard...</div>;

  return (
    <div>
      {ToastComponent}

      <div className="page-header">
        <div>
          <h1 className="page-title">Hey {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
      </div>

      {/* CHECK-IN CARD */}
      <div className="checkin-card">
        <div>
          <div className="checkin-date">{format(new Date(), 'EEEE, MMMM d')}</div>
          <div className="checkin-time">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="checkin-status">
            {isCheckedOut
              ? `✅ Worked ${today.workingHours || 'today'} · Checked out at ${formatIST(today.checkOut)}`
              : isCheckedIn
              ? `🟢 Checked in at ${formatIST(today.checkIn)} · You're on the clock`
              : '⚪ Not checked in yet today'}
          </div>
          {!isCheckedOut && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
              📍 Check in/out requires office location (300m radius)
            </div>
          )}
        </div>

        {isCheckedOut ? (
          <button className="btn-checkin" disabled>Done for Today ✅</button>
        ) : isCheckedIn ? (
          <button className="btn-checkin check-out" onClick={handleCheckOut} disabled={isButtonLoading}>
            {locationChecking ? '📍 Checking...' : actionLoading ? '...' : 'Check Out →'}
          </button>
        ) : (
          <button className="btn-checkin check-in" onClick={handleCheckIn} disabled={isButtonLoading}>
            {locationChecking ? '📍 Checking...' : actionLoading ? '...' : 'Check In →'}
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}><span style={{ fontSize: '20px' }}>✅</span></div>
          <div>
            <div className="stat-label">Present This Month</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{summary?.presentDays ?? 0}</div>
            <div className="stat-sub">days</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}><span style={{ fontSize: '20px' }}>🌴</span></div>
          <div>
            <div className="stat-label">Leaves This Year</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>
              {(balance?.sickLeaveUsed || 0) + (balance?.casualLeaveUsed || 0) + (balance?.paidLeaveUsed || 0)}
            </div>
            <div className="stat-sub">of 42 total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}><span style={{ fontSize: '20px' }}>⏱️</span></div>
          <div>
            <div className="stat-label">Hours This Month</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              {summary ? Math.floor((summary.totalWorkingMinutes || 0) / 60) : 0}
            </div>
            <div className="stat-sub">hours logged</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}><span style={{ fontSize: '20px' }}>📊</span></div>
          <div>
            <div className="stat-label">Absent This Month</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{summary?.absentDays ?? 0}</div>
            <div className="stat-sub">days</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {balance && (
          <div className="card">
            <div className="card-header"><span className="card-title">Leave Balance {new Date().getFullYear()}</span></div>
            <div className="card-body">
              <LeaveBalanceBar label="🤒 Sick Leave" used={balance.sickLeaveUsed} total={balance.sickLeaveTotal} color="#ef4444" />
              <LeaveBalanceBar label="☕ Casual Leave" used={balance.casualLeaveUsed} total={balance.casualLeaveTotal} color="#f59e0b" />
              <LeaveBalanceBar label="💰 Paid Leave" used={balance.paidLeaveUsed} total={balance.paidLeaveTotal} color="#10b981" />
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header"><span className="card-title">Recent Leave Requests</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentLeaves.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🌴</div><div className="empty-text">No leave requests yet</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Type</th><th>Days</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentLeaves.map(l => (
                      <tr key={l.id}>
                        <td><span style={{ fontSize: '13px' }}>{l.leaveType?.replace(/_/g, ' ')}</span></td>
                        <td style={{ fontWeight: 600 }}>{l.totalDays}d</td>
                        <td>{LEAVE_STATUS_BADGE[l.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}