import React, { useState, useEffect } from 'react';
import { getAllAttendance, getAllTodayAttendance } from '../../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '../../hooks/useToast';

const STATUS_BADGE = {
  PRESENT: <span className="badge badge-success">Present</span>,
  ABSENT: <span className="badge badge-danger">Absent</span>,
  HALF_DAY: <span className="badge badge-warning">Half Day</span>,
  ON_LEAVE: <span className="badge badge-purple">On Leave</span>,
  WORK_FROM_HOME: <span className="badge badge-info">WFH</span>,
};

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('today');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { showToast, ToastComponent } = useToast();

  useEffect(() => { fetchRecords(); }, [view]);

  const fetchRecords = () => {
    setLoading(true);
    const promise = view === 'today'
      ? getAllTodayAttendance()
      : getAllAttendance(startDate, endDate);

    promise
      .then(res => setRecords(res.data))
      .catch(() => showToast('Failed to load attendance', 'error'))
      .finally(() => setLoading(false));
  };

  const handleFilter = () => {
    setLoading(true);
    getAllAttendance(startDate, endDate)
      .then(res => setRecords(res.data))
      .catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      {ToastComponent}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Records</h1>
          <p className="page-sub">Track check-ins and working hours for your team</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${view === 'today' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('today')}>
            Today
          </button>
          <button className={`btn ${view === 'range' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('range')}>
            Date Range
          </button>
        </div>
      </div>

      {view === 'range' && (
        <div className="card mb-6">
          <div className="card-body">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">From</label>
                <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">To</label>
                <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={handleFilter}>Apply Filter</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ paddingBottom: '12px' }}>
          <span className="card-title">
            {view === 'today' ? `Today — ${format(new Date(), 'd MMMM yyyy')}` : `${startDate} to ${endDate}`}
          </span>
          <span className="badge badge-gray">{records.length} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><div className="empty-text">Loading...</div></div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-text">No attendance records found</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Developer</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{a.userName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{format(new Date(a.date), 'd MMM yyyy')}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--success)', fontWeight: 500 }}>
                        {a.checkIn ? format(new Date(a.checkIn), 'hh:mm a') : <span style={{ color: 'var(--text-light)' }}>–</span>}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {a.checkOut ? format(new Date(a.checkOut), 'hh:mm a') : <span style={{ color: 'var(--text-light)' }}>–</span>}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {a.workingHours || <span style={{ color: 'var(--text-light)' }}>In progress</span>}
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
