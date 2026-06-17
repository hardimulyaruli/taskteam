import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import { useUsers } from '../../../context/UserContext';

const UserModal = ({ onClose, editUser }) => {
  const { addUser, updateUser } = useUsers();
  const isEdit = Boolean(editUser);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'team',
    status: 'Aktif',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editUser) {
      setFormData({
        name:     editUser.name     || '',
        username: editUser.username || '',
        password: '',
        role:     editUser.role     || 'team',
        status:   editUser.status   || 'Aktif',
      });
    }
  }, [editUser]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEdit) {
        await updateUser(editUser.id, formData);
      } else {
        await addUser(formData);
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan user.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="modal-card"
      >
        <h2 className="modal-title">
          {isEdit ? 'Edit User' : 'Buat User Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              required
              type="text"
              className="input-field"
              value={formData.name}
              onChange={handleChange('name')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Username (untuk Login)</label>
            <input
              required
              type="text"
              className="input-field"
              value={formData.username}
              onChange={handleChange('username')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Password {isEdit ? '(kosongkan jika tidak ingin mengubah)' : ''}
            </label>
            <input
              type="password"
              className="input-field"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder={isEdit ? '••••••••' : 'Minimal 6 karakter'}
              required={!isEdit}
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="input-field"
                value={formData.role}
                onChange={handleChange('role')}
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
                onChange={handleChange('status')}
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="alert-error" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSaving}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan User')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserModal;