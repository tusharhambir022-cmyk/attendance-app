import React, { useState, useEffect } from 'react';
import { getAllDevelopers, createUser, toggleUserStatus } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';

export default function AdminDevelopers() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', role: 'DEVELOPER' });
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => { fetchDevelopers(); }, []);

  const fetchDevelopers = () => {
    setLoading(true);
    getAllDevelopers()
      .then(res => setDevelopers(res.data))
      .catch(() => showToast('Failed to load developers', 'error'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUser(form);
      showToast(`${form.name} added successfully!`);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', department: '', role: 'DEVELOPER' });
      fetchDevelopers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (dev) => {
    try {
      await toggleUserStatus(dev.id);
      showToast(`${dev.name} ${dev.active ? 'deactivated' : 'activated'}`);
      fetchDevelopers();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div>
      {ToastComponent}
      <div className="page-header">
        <div>
          <h1 className="page-title">Developers</h1>
          <p className="page-sub">Manage your development team</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Developer
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><div className="empty-text">Loading...</div></div>
          ) : developers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-text">No developers yet. Add your first team member!</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Developer</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Leaves (This Year)</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {developers.map(dev => (
                    <tr key={dev.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                            {dev.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{dev.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{dev.email}</td>
                      <td>{dev.department || <span style={{ color: 'var(--text-light)' }}>–</span>}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: dev.totalLeavesThisYear > 10 ? 'var(--danger)' : 'var(--text)' }}>
                          {dev.totalLeavesThisYear || 0} days
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {dev.createdAt ? format(new Date(dev.createdAt), 'd MMM yyyy') : '–'}
                      </td>
                      <td>
                        <span className={`badge ${dev.active ? 'badge-success' : 'badge-danger'}`}>
                          {dev.active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${dev.active ? 'btn-outline' : 'btn-success'}`}
                          onClick={() => handleToggle(dev)}
                        >
                          {dev.active ? 'Deactivate' : 'Activate'}
                        </button>
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
              <span className="modal-title">Add New Developer</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" placeholder="Rahul Sharma" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" placeholder="dev@company.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" type="password" placeholder="Min 6 chars" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-control" placeholder="e.g. Backend, Frontend" value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control" value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="DEVELOPER">Developer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
