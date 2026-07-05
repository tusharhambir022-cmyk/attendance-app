import React, { useState, useEffect, useCallback } from 'react';
import { applyLeave, getMyLeaves, getLeaveBalance } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { format, isSameMonth, parseISO } from 'date-fns';
 
// ==============================
// INDIAN PUBLIC HOLIDAYS 2025-2026
// ==============================
const INDIAN_HOLIDAYS = [
  // 2025
  { date: '2025-01-26', name: "Republic Day" },
  { date: '2025-03-14', name: "Holi" },
  { date: '2025-04-14', name: "Dr. Ambedkar Jayanti" },
  { date: '2025-04-18', name: "Good Friday" },
  { date: '2025-05-01', name: "Maharashtra Day" },
  { date: '2025-08-15', name: "Independence Day" },
  { date: '2025-08-27', name: "Ganesh Chaturthi" },
  { date: '2025-10-02', name: "Gandhi Jayanti" },
  { date: '2025-10-02', name: "Dussehra" },
  { date: '2025-10-20', name: "Diwali" },
  { date: '2025-10-21', name: "Diwali" },
  { date: '2025-11-05', name: "Guru Nanak Jayanti" },
  { date: '2025-12-25', name: "Christmas" },
  // 2026
  { date: '2026-01-01', name: "New Year" },
  { date: '2026-01-26', name: "Republic Day" },
  { date: '2026-03-03', name: "Holi" },
  { date: '2026-04-03', name: "Good Friday" },
  { date: '2026-04-14', name: "Dr. Ambedkar Jayanti" },
  { date: '2026-05-01', name: "Maharashtra Day" },
  { date: '2026-08-15', name: "Independence Day" },
  { date: '2026-10-02', name: "Gandhi Jayanti" },
  { date: '2026-10-19', name: "Dussehra" },
  { date: '2026-11-08', name: "Diwali" },
  { date: '2026-11-09', name: "Diwali" },
  { date: '2026-11-24', name: "Guru Nanak Jayanti" },
  { date: '2026-12-25', name: "Christmas" },
];
 
const MONTHLY_LEAVE_LIMIT = 1; // 1 leave per month
const DAILY_SALARY_DEDUCTION = 500; // ₹500 per day deducted (change as needed)
 
const STATUS_BADGE = {
  PENDING: <span className="badge badge-warning">⏳ Pending</span>,
  APPROVED: <span className="badge badge-success">✅ Approved</span>,
  REJECTED: <span className="badge badge-danger">❌ Rejected</span>,
};
 
function HolidayCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
 
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
 
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
 
  const holidaysThisMonth = INDIAN_HOLIDAYS.filter(h => {
    const d = parseISO(h.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
 
  const holidayDates = holidaysThisMonth.map(h => parseISO(h.date).getDate());
 
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
 
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
 
  const today = new Date();
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSunday = (dayIndex) => (dayIndex % 7) === 0;
 
  return (
    <div className="card mb-6">
      <div className="card-header">
        <span className="card-title">🗓️ Holiday Calendar</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={prevMonth}>←</button>
          <span style={{ fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button className="btn btn-outline btn-sm" onClick={nextMonth}>→</button>
        </div>
      </div>
      <div className="card-body">
        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: i === 0 ? '#ef4444' : 'var(--text-muted)', padding: '4px' }}>
              {d}
            </div>
          ))}
        </div>
 
        {/* Calendar days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} />;
            const isHoliday = holidayDates.includes(day);
            const isSun = (index % 7) === 0;
            const holiday = holidaysThisMonth.find(h => parseISO(h.date).getDate() === day);
 
            return (
              <div
                key={day}
                title={holiday ? holiday.name : isSun ? 'Sunday' : ''}
                style={{
                  textAlign: 'center',
                  padding: '6px 4px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: isToday(day) ? 700 : 400,
                  background: isHoliday ? '#fee2e2' : isToday(day) ? 'var(--primary)' : isSun ? '#fff1f1' : 'transparent',
                  color: isHoliday ? '#dc2626' : isToday(day) ? 'white' : isSun ? '#ef4444' : 'var(--text)',
                  border: isToday(day) ? '2px solid var(--primary)' : isHoliday ? '1px solid #fecaca' : '1px solid transparent',
                  cursor: (isHoliday || isSun) ? 'help' : 'default',
                  position: 'relative',
                }}
              >
                {day}
                {isHoliday && <div style={{ fontSize: '6px', color: '#dc2626', lineHeight: 1, marginTop: '1px' }}>●</div>}
              </div>
            );
          })}
        </div>
 
        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '14px', height: '14px', background: '#fee2e2', borderRadius: '3px', border: '1px solid #fecaca' }} />
            Public Holiday
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '14px', height: '14px', background: '#fff1f1', borderRadius: '3px' }} />
            Sunday
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '14px', height: '14px', background: 'var(--primary)', borderRadius: '3px' }} />
            Today
          </div>
        </div>
 
        {/* Holidays list this month */}
        {holidaysThisMonth.length > 0 && (
          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Holidays this month:
            </div>
            {holidaysThisMonth.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12.5px', marginBottom: '4px' }}>
                <span style={{ color: '#dc2626', fontWeight: 500 }}>{format(parseISO(h.date), 'd MMM')}</span>
                <span style={{ color: 'var(--text-muted)' }}>{h.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
function LeaveBalanceCard({ balance, leavesThisMonth }) {
  if (!balance) return null;
  const totalUsed = (balance.sickLeaveUsed || 0) + (balance.casualLeaveUsed || 0) + (balance.paidLeaveUsed || 0);
  const totalDeduction = totalUsed * DAILY_SALARY_DEDUCTION;
  const remainingThisMonth = Math.max(0, MONTHLY_LEAVE_LIMIT - leavesThisMonth);
 
  return (
    <div className="card mb-6">
      <div className="card-header"><span className="card-title">📊 Leave Balance & Rules</span></div>
      <div className="card-body">
 
        {/* Monthly limit warning */}
        <div style={{
          background: remainingThisMonth === 0 ? '#fee2e2' : '#f0fdf4',
          border: `1px solid ${remainingThisMonth === 0 ? '#fecaca' : '#bbf7d0'}`,
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>{remainingThisMonth === 0 ? '🚫' : '✅'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: remainingThisMonth === 0 ? '#dc2626' : '#166534' }}>
              {remainingThisMonth === 0
                ? 'No leaves remaining this month!'
                : `${remainingThisMonth} leave remaining this month`}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Monthly limit: {MONTHLY_LEAVE_LIMIT} day | Used: {leavesThisMonth} day
            </div>
          </div>
        </div>
 
        {/* Salary deduction info */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <div style={{ fontWeight: 600, fontSize: '13px', color: '#92400e', marginBottom: '4px' }}>
            💰 Salary Deduction Policy
          </div>
          <div style={{ fontSize: '12.5px', color: '#78350f' }}>
            ₹{DAILY_SALARY_DEDUCTION.toLocaleString()} deducted per leave day taken
          </div>
          {totalUsed > 0 && (
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', marginTop: '6px' }}>
              Total deducted this year: ₹{totalDeduction.toLocaleString()} ({totalUsed} days)
            </div>
          )}
        </div>
 
        {/* Leave stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: '🤒 Sick', used: balance.sickLeaveUsed, total: balance.sickLeaveTotal, color: '#ef4444' },
            { label: '☕ Casual', used: balance.casualLeaveUsed, total: balance.casualLeaveTotal, color: '#f59e0b' },
            { label: '💰 Paid', used: balance.paidLeaveUsed, total: balance.paidLeaveTotal, color: '#10b981' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--surface-2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '16px', marginBottom: '2px' }}>{item.label.split(' ')[0]}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label.slice(3)}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: item.color }}>{item.total - item.used}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>{item.used} used</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 
export default function DevLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ leaveType: 'SICK_LEAVE', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();
 
  const fetchData = useCallback(() => {
    Promise.all([getMyLeaves(), getLeaveBalance()])
      .then(([leavesRes, balanceRes]) => {
        setLeaves(leavesRes.data);
        setBalance(balanceRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
 
  useEffect(() => { fetchData(); }, [fetchData]);
 
  // Count approved/pending leaves this month
  const leavesThisMonth = leaves.filter(l => {
    if (l.status === 'REJECTED') return false;
    return isSameMonth(parseISO(l.startDate), new Date());
  }).length;
 
  // Check if selected dates have holidays
  const getHolidaysInRange = () => {
    if (!form.startDate || !form.endDate) return [];
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    return INDIAN_HOLIDAYS.filter(h => {
      const d = parseISO(h.date);
      return d >= start && d <= end;
    });
  };
 
  const totalDays = form.startDate && form.endDate
    ? Math.max(0, Math.floor((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)
    : 0;
 
  const holidaysInRange = getHolidaysInRange();
  const workingDays = totalDays - holidaysInRange.length;
  const deductionAmount = workingDays * DAILY_SALARY_DEDUCTION;
 
  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) { showToast('Please select dates', 'error'); return; }
 
    // Check monthly limit
    if (leavesThisMonth >= MONTHLY_LEAVE_LIMIT) {
      showToast(`You have already used your ${MONTHLY_LEAVE_LIMIT} leave for this month!`, 'error');
      return;
    }
 
    // Check if date is a holiday
    const startHoliday = INDIAN_HOLIDAYS.find(h => h.date === form.startDate);
    if (startHoliday) {
      showToast(`${startHoliday.name} is already a public holiday! No need to apply leave.`, 'error');
      return;
    }
 
    setSubmitting(true);
    try {
      await applyLeave(form);
      showToast(`Leave applied! ₹${deductionAmount.toLocaleString()} will be deducted from salary.`);
      setShowModal(false);
      setForm({ leaveType: 'SICK_LEAVE', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to apply leave', 'error');
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div>
      {ToastComponent}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leaves</h1>
          <p className="page-sub">Apply and track your leave requests</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (leavesThisMonth >= MONTHLY_LEAVE_LIMIT) {
              showToast(`Monthly limit reached! Only ${MONTHLY_LEAVE_LIMIT} leave allowed per month.`, 'error');
              return;
            }
            setShowModal(true);
          }}
        >
          + Apply for Leave
        </button>
      </div>
 
      {/* Holiday Calendar */}
      <HolidayCalendar />
 
      {/* Leave Balance */}
      <LeaveBalanceCard balance={balance} leavesThisMonth={leavesThisMonth} />
 
      {/* Leave History */}
      <div className="card">
        <div className="card-header" style={{ paddingBottom: '12px' }}>
          <span className="card-title">My Leave History</span>
          <span className="badge badge-gray">{leaves.length} requests</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><div className="empty-text">Loading...</div></div>
          ) : leaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌴</div>
              <div className="empty-text">No leave requests yet!</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Deduction</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id}>
                      <td><span className="badge badge-purple">{l.leaveType?.replace(/_/g, ' ')}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{format(parseISO(l.startDate), 'd MMM yyyy')}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{format(parseISO(l.endDate), 'd MMM yyyy')}</td>
                      <td style={{ fontWeight: 700 }}>{l.totalDays}</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>
                        {l.status === 'APPROVED' ? `₹${(l.totalDays * DAILY_SALARY_DEDUCTION).toLocaleString()}` : '–'}
                      </td>
                      <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {l.reason}
                      </td>
                      <td>{STATUS_BADGE[l.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
 
      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <span className="modal-title">Apply for Leave</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
 
            {/* Monthly limit info */}
            <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px' }}>
              📋 Monthly limit: <strong>{MONTHLY_LEAVE_LIMIT} day/month</strong> · Used: <strong>{leavesThisMonth}</strong> · Remaining: <strong style={{ color: leavesThisMonth >= MONTHLY_LEAVE_LIMIT ? '#dc2626' : '#10b981' }}>{Math.max(0, MONTHLY_LEAVE_LIMIT - leavesThisMonth)}</strong>
            </div>
 
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select className="form-control" value={form.leaveType}
                  onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                  <option value="SICK_LEAVE">🤒 Sick Leave</option>
                  <option value="CASUAL_LEAVE">☕ Casual Leave</option>
                  <option value="PAID_LEAVE">💰 Paid Leave</option>
                </select>
              </div>
 
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input type="date" className="form-control" value={form.startDate}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input type="date" className="form-control" value={form.endDate}
                    min={form.startDate || format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
 
              {/* Date summary */}
              {totalDays > 0 && (
                <div style={{ background: 'var(--primary-light)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px' }}>
                  <div>📅 Total days: <strong>{totalDays}</strong></div>
                  {holidaysInRange.length > 0 && (
                    <div style={{ color: '#dc2626', marginTop: '4px' }}>
                      🎉 Holidays included: {holidaysInRange.map(h => h.name).join(', ')} (not counted)
                    </div>
                  )}
                  <div style={{ marginTop: '4px' }}>Working days: <strong>{workingDays}</strong></div>
                  <div style={{ color: '#dc2626', fontWeight: 600, marginTop: '4px' }}>
                    💰 Salary deduction: ₹{deductionAmount.toLocaleString()}
                  </div>
                </div>
              )}
 
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea className="form-control" rows={3}
                  placeholder="Briefly explain your reason..."
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  required style={{ resize: 'vertical' }} />
              </div>
 
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || workingDays === 0}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}