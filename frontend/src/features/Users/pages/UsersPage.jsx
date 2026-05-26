import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useUsers } from '../../../context/UserContext';
import UserModal from '../components/UserModal';
import '../../../styles/Users.css';

// ============================================
// CONFIRM DELETE DIALOG
// ============================================
const ConfirmDialog = ({ user, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="modal-card"
        style={{ maxWidth: '400px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(239,68,68,0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <FiAlertTriangle size={22} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>
              Hapus Pengguna?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Anda yakin ingin menghapus <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> (@{user?.username})?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary"
            style={{ background: '#ef4444', borderColor: '#ef4444' }}
          >
            Ya, Hapus
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// USER TABLE ROW
// ============================================
const UserTableRow = ({ user: u, onDelete, onEdit, isCurrentUser }) => {
  return (
    <tr className="table-row">
      <td className="table-td td-primary">{u.name}</td>
      <td className="table-td td-secondary">@{u.username}</td>
      <td className="table-td-muted">{u.role}</td>
      <td className="table-td">
        <span className={u.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}>
          {u.status}
        </span>
      </td>
      <td className="table-td-right">
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => onEdit(u)}
            className="action-btn-edit"
            title="Edit pengguna"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={() => onDelete(u)}
            disabled={isCurrentUser}
            className="action-btn-danger"
            title={isCurrentUser ? 'Tidak dapat menghapus akun sendiri' : 'Hapus pengguna'}
          >
            <FiTrash2 />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ============================================
// MAIN PAGE
// ============================================
const UsersPage = () => {
  const { user: activeUser } = useAuth();
  const { users, deleteUser } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (activeUser.role !== 'admin') {
    return (
      <div className="users-page">
        <p className="alert-error">Akses Ditolak. Halaman ini khusus Administrator.</p>
      </div>
    );
  }

  const handleEdit = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditUser(null);
  };

  const handleDeleteClick = (user) => {
    setDeleteTarget(user);
  };

  const handleConfirmDelete = () => {
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <div className="page-header">
          <h1 className="page-title">Manajemen User</h1>
          <p className="page-subtitle">Kelola data pengguna, hak akses, dan status akun.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Tambah User
        </motion.button>
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
            {users.length === 0 ? (
              <tr><td colSpan="5" className="table-empty-row">Tidak ada data pengguna.</td></tr>
            ) : (
              users.map((u) => (
                <UserTableRow
                  key={u.id}
                  user={u}
                  onDelete={handleDeleteClick}
                  onEdit={handleEdit}
                  isCurrentUser={u.username === activeUser.username}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <UserModal
            onClose={handleClose}
            editUser={editUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            user={deleteTarget}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersPage;