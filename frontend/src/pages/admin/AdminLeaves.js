import React, { useState, useEffect } from 'react';
import { getAllLeaves, getPendingLeaves, reviewLeave } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { format, parseISO } from 'date-fns';

const DAILY_SALARY_DEDUCTION = 500;

const LEAVE_TYPE_LABEL = {
  SICK_LEAVE: '🤒 Sick Leave',
  CASUAL_LEAVE: '☕ Casual Leave',
  PAID_LEAVE: '💰 Paid Leave',
};

const STATUS_BADGE = {
  PENDING: <span className="badge badge-warning">⏳ Pending</span>,
  APPROVED: <span className="badge badge-success">✅ Approved</span>,
  REJECTED: <span className="badge badge-danger">❌ Rejected</span>,
};

// Indian holidays
const INDIAN_HOLIDAYS = [
  { date: '2025-01-26', name: "Republic Day" },
  { date: '2025-03-14', name: "Holi" },
  { date: '2025-04-14', name: "Dr. Ambedkar Jayanti" },
  { date: '2025-04-18', name: "Good Friday" },
  { date: '2025-05-01', name: "Maharashtra Day" },
  { date: '2025-08-15', name: "Independence Day" },
  { date: '2025-08-27', name: "Ganesh Chaturthi" },
  { date: '2025-10-02', name: "Gandhi Jayanti / Dussehra" },
  { date: '2025-10-20', name: "Diwali" },
  { date: '2025-10-21', name: "Diwali" },
  { date: '2025-11-05', name: "Guru Nanak Jayanti" },
  { date: '2025-12-25', name: "Christmas" },
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

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewModal, setReviewModal] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => { fetchLeaves(); }, [filter]);

  const fetchLeaves = () => {
    setLoading(true);
    const promise = filter === 'pending' ? getPendingLeaves() : getAllLeaves();
    promise.then(res => setLeaves(res.data)).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
  };

  const handleReview = async (status) => {
    setSubmitting(true);
    try {
      await reviewLeave(reviewModal.id, { status, comment });
      showToast(`Leave ${status.toLowerCase()} successfully`);
      setReviewModal(null);
      setComment('');
      fetchLeaves();
    } catch {
      showToast('Review failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total deductions for approved leaves
  const totalDeductions = leaves
    .filter(l => l.status === 'APPROVED')
    .reduce((sum, l) => sum + (l.totalDays * DAILY_SALARY_DEDUCTION), 0);

  return (
    <div>
      {ToastComponent}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Requests</h1>
          <p className="page-sub">Review and manage team leave requests</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('pending')}>
            Pending
          </button>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>
            All Requests
          </button>
        </div>
      </div>

      {/* Policy info */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>📋</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Leave Policy</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>1 day per month maximum</div>
                <div style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>₹{DAILY_SALARY_DEDUCTION}/day deducted</div>
              </div>
            </div>
          </div>
        </div>
        {filter === 'all' && totalDeductions > 0 && (
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>💰</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>Total Deductions</div>
                  <div style={{ color: '#dc2626', fontSize: '20px', fontWeight: 700 }}>₹{totalDeductions.toLocaleString()}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>From approved leaves</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indian Holidays Reference */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title">🇮🇳 Upcoming Indian Public Holidays</span>
        </div>
        <div className="card-body" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {INDIAN_HOLIDAYS
              .filter(h => parseISO(h.date) >= new Date())
              .slice(0, 8)
              .map((h, i) => (
                <div key={i} style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  color: '#dc2626',
                  fontWeight: 500
                }}>
                  {format(parseISO(h.date), 'd MMM')} — {h.name}
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ paddingBottom: '12px' }}>
          <span className="card-title">{filter === 'pending' ? 'Pending Approvals' : 'All Leave Requests'}</span>
          <span className="badge badge-gray">{leaves.length} requests</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><div className="empty-text">Loading...</div></div>
          ) : leaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <div className="empty-text">{filter === 'pending' ? 'No pending requests!' : 'No leave requests found'}</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Developer</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Deduction</th>
                    <th>Reason</th>
                    <th>Applied</th>
                    <th>Status</th>
                    {filter === 'pending' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.userName}</td>
                      <td><span className="badge badge-purple">{LEAVE_TYPE_LABEL[l.leaveType] || l.leaveType}</span></td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {format(parseISO(l.startDate), 'd MMM')} – {format(parseISO(l.endDate), 'd MMM yyyy')}
                      </td>
                      <td style={{ fontWeight: 700 }}>{l.totalDays}d</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>
                        {l.status === 'APPROVED' ? `₹${(l.totalDays * DAILY_SALARY_DEDUCTION).toLocaleString()}` : '–'}
                      </td>
                      <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {l.reason}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {format(parseISO(l.appliedAt), 'd MMM')}
                      </td>
                      <td>{STATUS_BADGE[l.status]}</td>
                      {filter === 'pending' && (
                        <td>
                          {l.status === 'PENDING' && (
                            <button className="btn btn-primary btn-sm" onClick={() => setReviewModal(l)}>
                              Review
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Review Leave Request</span>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Developer:</span> <strong>{reviewModal.userName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> <strong>{LEAVE_TYPE_LABEL[reviewModal.leaveType]}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>From:</span> <strong>{format(parseISO(reviewModal.startDate), 'd MMM yyyy')}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>To:</span> <strong>{format(parseISO(reviewModal.endDate), 'd MMM yyyy')}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Days:</span> <strong>{reviewModal.totalDays}</strong></div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Deduction:</span>
                  <strong style={{ color: '#dc2626' }}> ₹{(reviewModal.totalDays * DAILY_SALARY_DEDUCTION).toLocaleString()}</strong>
                </div>
                <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--text-muted)' }}>Reason:</span> {reviewModal.reason}</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea className="form-control" rows={3}
                placeholder="Add a comment for the developer..."
                value={comment} onChange={e => setComment(e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleReview('REJECTED')} disabled={submitting}>❌ Reject</button>
              <button className="btn btn-success" onClick={() => handleReview('APPROVED')} disabled={submitting}>✅ Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}