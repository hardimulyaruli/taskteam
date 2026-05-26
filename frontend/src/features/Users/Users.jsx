import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UserContext';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

const Users = () => {
  const { user: activeUser } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useUsers();

  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState(null);
  const [editData, setEditData]     = useState({});
  const [formData, setFormData]     = useState({
    name: '', username: '', role: 'team', status: 'Aktif'
  });

  if (activeUser.role !== 'admin') {
    return <div className="p-8 text-[#f85149]">Akses Ditolak. Halaman ini khusus Administrator.</div>;
  }

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addUser(formData);
    setShowModal(false);
    setFormData({ name: '', username: '', role: 'team', status: 'Aktif' });
  };

  const startEdit = (u) => {
    setEditId(u.id);
    setEditData({ username: u.username, role: u.role, status: u.status });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const saveEdit = (id) => {
    updateUser(id, editData);
    setEditId(null);
    setEditData({});
  };

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="pro-heading text-2xl mb-1">Manajemen User</h1>
          <p className="text-sm text-[var(--text-secondary)]">Kelola data pengguna, hak akses, dan status akun.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="pro-button-primary flex items-center gap-2">
          <FiPlus /> Tambah User
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead className="table-head">
            <tr>
              <th className="table-th">Nama Lengkap</th>
              <th className="table-th">Username</th>
              <th className="table-th">Role</th>
              <th className="table-th">Status</th>
              <th className="table-th-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {users.map((u) => {
              const isEditing = editId === u.id;
              return (
                <tr key={u.id} className="table-row">

                  {/* NAMA */}
                  <td className="table-td td-primary">{u.name}</td>

                  {/* USERNAME */}
                  <td className="table-td">
                    {isEditing ? (
                      <input
                        className="users-inline-input"
                        value={editData.username}
                        onChange={e => setEditData({ ...editData, username: e.target.value })}
                      />
                    ) : (
                      <span className="td-secondary">@{u.username}</span>
                    )}
                  </td>

                  {/* ROLE */}
                  <td className="table-td">
                    {isEditing ? (
                      <select
                        className="users-inline-input"
                        value={editData.role}
                        onChange={e => setEditData({ ...editData, role: e.target.value })}
                      >
                        <option value="team">Team</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="table-td-muted" style={{ padding: 0, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="table-td">
                    {isEditing ? (
                      <select
                        className="users-inline-input"
                        value={editData.status}
                        onChange={e => setEditData({ ...editData, status: e.target.value })}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Nonaktif">Nonaktif</option>
                      </select>
                    ) : (
                      <span className={u.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}>
                        {u.status}
                      </span>
                    )}
                  </td>

                  {/* AKSI */}
                  <td className="table-td-right">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(u.id)}
                            className="users-action-save"
                            title="Simpan"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="users-action-cancel"
                            title="Batal"
                          >
                            <FiX />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(u)}
                            disabled={u.username === 'admin'}
                            className="users-action-edit"
                            title="Edit user"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            disabled={u.username === 'admin'}
                            className="action-btn-danger"
                            title="Hapus user"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </td>

                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="table-empty-row">
                  Belum ada user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH USER */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Buat User Baru</h2>
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username (untuk Login)</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="input-field"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="team">Team</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="input-field"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;