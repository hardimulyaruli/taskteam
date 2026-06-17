import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiCalendar, FiLoader, FiTrash2, FiAlertTriangle, FiEdit2, FiUpload } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useTasks } from '../../../context/TaskContext';
import api from '../../../services/api';

const AVATAR_BASE = api.defaults.baseURL || 'http://localhost:5000';

const ProfileCard = ({ user }) => {
  const { uploadAvatar, deleteAvatar } = useAuth();
  const { tasks } = useTasks();
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);

  // ── Hitung stat mini ──
  const myTasks = user?.role === 'team'
    ? tasks.filter(t => {
        const assignees = String(t.assignee || '').split(',').map(s => s.trim());
        return assignees.includes(user.username) || assignees.includes('team');
      })
    : tasks;

  const totalTugas = myTasks.length;
  const selesaiTugas = myTasks.filter(t => t.status === 'Selesai').length;

  const avatarUrl = user?.avatar ? `${AVATAR_BASE}/uploads/avatars/${user.avatar}` : null;

  // ── Tutup menu kalau klik di luar ──
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowEditMenu(false);
      }
    }
    if (showEditMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEditMenu]);

  const handleAvatarClick = () => {
    setShowEditMenu(false);
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    try {
      await uploadAvatar(file);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengupload foto.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await deleteAvatar();
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menghapus foto.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="profile-summary-card"
      >
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            {isUploading && (
              <div className="profile-avatar-loading">
                <FiLoader className="spin" size={18} />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />

          {/* TOMBOL EDIT FOTO + MENU DROPDOWN */}
          <div className="profile-edit-menu-wrap" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowEditMenu(prev => !prev)}
              disabled={isUploading}
              className="profile-edit-trigger-btn"
            >
              <FiEdit2 size={11} /> Edit Foto
            </button>

            <AnimatePresence>
              {showEditMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="profile-edit-dropdown"
                >
                  <button type="button" onClick={handleAvatarClick} className="profile-edit-dropdown-item">
                    <FiUpload size={13} /> Ganti Foto
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => { setShowEditMenu(false); setShowDeleteConfirm(true); }}
                      className="profile-edit-dropdown-item profile-edit-dropdown-item-danger"
                    >
                      <FiTrash2 size={13} /> Hapus Foto
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <h3 className="profile-name">{user?.name}</h3>
          <p className="profile-username">@{user?.username}</p>
          <span className="profile-role-badge">{user?.role}</span>

          {error && <p className="profile-avatar-error">{error}</p>}
        </div>

        {/* STAT MINI */}
        <div className="profile-stats-row">
          <div className="profile-stat-box">
            <div className="profile-stat-num">{totalTugas}</div>
            <div className="profile-stat-label">Total Tugas</div>
          </div>
          <div className="profile-stat-box">
            <div className="profile-stat-num">{selesaiTugas}</div>
            <div className="profile-stat-label">Selesai</div>
          </div>
        </div>

        <div className="profile-joined">
          <FiCalendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          Bergabung sejak {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
        </div>
      </motion.div>

      {/* MODAL KONFIRMASI HAPUS FOTO */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => !isDeleting && setShowDeleteConfirm(false)}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="modal-card"
              style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(248,113,113,0.12)', color: 'var(--status-red)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', fontSize: '22px',
              }}>
                <FiAlertTriangle />
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px' }}>
                Hapus foto profil?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                Foto profil kamu akan dihapus secara permanen dan tidak dapat dikembalikan.
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="btn-danger"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isDeleting ? (
                    <><FiLoader className="spin" size={13} /> Menghapus...</>
                  ) : (
                    'Ya, Hapus'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileCard;