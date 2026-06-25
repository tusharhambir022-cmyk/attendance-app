import React, { useState, useEffect, useCallback } from 'react';
import { applyLeave, getMyLeaves, getLeaveBalance } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';

const LEAVE_TYPES = [
  { value: 'SICK_LEAVE', label: '🤒 Sick Leave', quota: 12 },
  { value: 'CASUAL_LEAVE', label: '☕ Casual Leave', quota: 12 },
  { value: 'PAID_LEAVE', label: '💰 Paid Leave', quota: 18 },
];

const STATUS_BADGE = {
  PENDING: <span className="badge badge-warning">⏳ Pending</span>,
  APPROVED: <span className="badge badge-success">✅ Approved</span>,
  REJECTED: <span className="badge badge-danger">❌ Rejected</span>,
};

function LeaveBalanceCard({ balance }) {
  if (!balance) return null;
  const items = [
    { label: '🤒 Sick', used: balance.sickLeaveUsed, total: balance.sickLeaveTotal, color: '#ef4444' },
    { label: '☕ Casual', used: balance.casualLeaveUsed, total: balance.casualLeaveTotal, color: '#f59e0b' },
    { label: '💰 Paid', used: balance.paidLeaveUsed, total: balance.paidLeaveTotal, color: '#10b981' },
  ];
  return (
    <div className="card mb-6">
      <div className="card-header"><span className="card-title">Leave Balance {new Date().getFullYear()}</span></div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {items.map(item => (
            <div key={item.label} style={{ textAlign: 'center', padding: '14px', background: 'var(--surface-2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.label.split(' ')[0]}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{item.label.slice(3)}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: item.color }}>{item.total - item.used}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{item.used} used / {item.total} total</div>
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

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) { showToast('Please select dates', 'error'); return; }
    setSubmitting(true);
    try {
      await applyLeave(form);
      showToast('Leave request submitted successfully!');
      setShowModal(false);
      setForm({ leaveType: 'SICK_LEAVE', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to apply leave', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalDays = form.startDate && form.endDate
    ? Math.max(0, Math.floor((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)
    : 0;

  return (
    <div>
      {ToastComponent}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leaves</h1>
          <p className="page-sub">Apply and track your leave requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Apply for Leave
        </button>
      </div>

      <LeaveBalanceCard balance={balance} />

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
              <div className="empty-text">No leave requests yet. Take a break!</div>
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
                    <th>Reason</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id}>
                      <td>
                        <span className="badge badge-purple">
                          {LEAVE_TYPES.find(t => t.value === l.leaveType)?.label || l.leaveType}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{format(new Date(l.startDate), 'd MMM yyyy')}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{format(new Date(l.endDate), 'd MMM yyyy')}</td>
                      <td style={{ fontWeight: 700 }}>{l.totalDays}</td>
                      <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {l.reason}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {format(new Date(l.appliedAt), 'd MMM')}
                      </td>
                      <td>{STATUS_BADGE[l.status]}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {l.adminComment || <span style={{ color: 'var(--text-light)' }}>–</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Apply for Leave</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select className="form-control" value={form.leaveType}
                  onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                  {LEAVE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label} (Quota: {t.quota}/yr)</option>
                  ))}
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
              {totalDays > 0 && (
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', marginBottom: '12px', fontWeight: 500 }}>
                  📅 Total: <strong>{totalDays} day{totalDays > 1 ? 's' : ''}</strong>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea className="form-control" rows={3} placeholder="Briefly explain your reason..."
                  value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  required style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || totalDays === 0}>
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
