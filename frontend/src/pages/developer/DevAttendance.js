import React, { useState, useEffect } from 'react';
import { getMyAttendance, getMyMonthSummary } from '../../services/api';
import { format, startOfMonth } from 'date-fns';
import { useToast } from '../../hooks/useToast';
import { formatIST } from '../../services/timeUtils';

const STATUS_BADGE = {
  PRESENT: <span className="badge badge-success">✅ Present</span>,
  ABSENT: <span className="badge badge-danger">❌ Absent</span>,
  HALF_DAY: <span className="badge badge-warning">🔆 Half Day</span>,
  ON_LEAVE: <span className="badge badge-purple">🌴 On Leave</span>,
  WORK_FROM_HOME: <span className="badge badge-info">🏠 WFH</span>,
};

export default function DevAttendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [end, setEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { showToast, ToastComponent } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    Promise.all([getMyAttendance(start, end), getMyMonthSummary(month, year)])
      .then(([attRes, sumRes]) => {
        setRecords(attRes.data);
        setSummary(sumRes.data);
      })
      .catch(() => showToast('Failed to load attendance', 'error'))
      .finally(() => setLoading(false));
  };

  const handleFilter = () => {
    setLoading(true);
    getMyAttendance(start, end)
      .then(res => setRecords(res.data))
      .catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      {ToastComponent}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-sub">Your attendance history and working hours (IST)</p>
        </div>
      </div>

      {summary && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Present', value: summary.presentDays, color: '#10b981', bg: '#d1fae5', icon: '✅' },
            { label: 'Absent', value: summary.absentDays, color: '#ef4444', bg: '#fee2e2', icon: '❌' },
            { label: 'Half Days', value: summary.halfDays, color: '#f59e0b', bg: '#fef3c7', icon: '🔆' },
            { label: 'Hours Logged', value: `${Math.floor((summary.totalWorkingMinutes || 0) / 60)}h`, color: '#6366f1', bg: '#e0e7ff', icon: '⏱️' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '20px' }}>{s.icon}</span></div>
              <div>
                <div className="stat-label">{s.label} (This Month)</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mb-6">
        <div className="card-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From</label>
              <input type="date" className="form-control" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To</label>
              <input type="date" className="form-control" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleFilter}>Filter</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ paddingBottom: '12px' }}>
          <span className="card-title">Attendance Records</span>
          <span className="badge badge-gray">{records.length} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><div className="empty-text">Loading...</div></div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-text">No records in selected period</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Check In (IST)</th>
                    <th>Check Out (IST)</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{format(new Date(a.date), 'd MMM yyyy')}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{format(new Date(a.date), 'EEE')}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--success)', fontWeight: 500 }}>
                        {a.checkIn ? formatIST(a.checkIn) : <span style={{ color: 'var(--text-light)' }}>–</span>}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {a.checkOut ? formatIST(a.checkOut) : <span style={{ color: 'var(--text-light)' }}>–</span>}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {a.workingHours || <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>–</span>}
                      </td>
                      <td>{STATUS_BADGE[a.status] || <span className="badge badge-gray">{a.status}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}