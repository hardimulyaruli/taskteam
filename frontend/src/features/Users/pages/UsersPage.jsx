import React, { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useUsers } from '../../../context/UserContext';
import UserModal from '../components/UserModal';
import '../../../styles/Users.css';

const UserTableRow = ({ user: u, onDelete, isCurrentUser }) => {
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
        <button
          onClick={() => onDelete(u.id)}
          disabled={isCurrentUser}
          className="action-btn-danger"
          title={isCurrentUser ? 'Tidak dapat menghapus akun sendiri' : 'Hapus pengguna'}
        >
          <FiTrash2 />
        </button>
      </td>
    </tr>
  );
};

const UsersPage = () => {
  const { user: activeUser } = useAuth();
  const { users, deleteUser } = useUsers();
  const [showModal, setShowModal] = useState(false);

  if (activeUser.role !== 'admin') {
    return (
      <div className="users-page">
        <p className="alert-error">Akses Ditolak. Halaman ini khusus Administrator.</p>
      </div>
    );
  }

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
                  onDelete={deleteUser}
                  isCurrentUser={u.username === activeUser.username}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && <UserModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default UsersPage;
