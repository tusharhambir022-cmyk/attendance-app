import React, { useState, useEffect } from 'react';
import { getAllLeaves, getPendingLeaves, reviewLeave } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';

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
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Applied</th>
                    <th>Status</th>
                    {filter === 'pending' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.userName}</td>
                      <td><span className="badge badge-purple">{LEAVE_TYPE_LABEL[l.leaveType] || l.leaveType}</span></td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {format(new Date(l.startDate), 'd MMM')} – {format(new Date(l.endDate), 'd MMM yyyy')}
                      </td>
                      <td style={{ fontWeight: 700 }}>{l.totalDays}d</td>
                      <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {l.reason}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {format(new Date(l.appliedAt), 'd MMM')}
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
                <div><span style={{ color: 'var(--text-muted)' }}>From:</span> <strong>{format(new Date(reviewModal.startDate), 'd MMM yyyy')}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>To:</span> <strong>{format(new Date(reviewModal.endDate), 'd MMM yyyy')}</strong></div>
                <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--text-muted)' }}>Reason:</span> {reviewModal.reason}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Add a comment for the developer..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleReview('REJECTED')} disabled={submitting}>
                ❌ Reject
              </button>
              <button className="btn btn-success" onClick={() => handleReview('APPROVED')} disabled={submitting}>
                ✅ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
