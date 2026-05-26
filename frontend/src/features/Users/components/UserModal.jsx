import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUsers } from '../../../context/UserContext';

const UserModal = ({ onClose, editUser }) => {
  const { addUser, updateUser } = useUsers();
  const isEdit = Boolean(editUser);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'team',
    status: 'Aktif',
  });

  useEffect(() => {
    if (editUser) {
      setFormData({
        name:     editUser.name     || '',
        username: editUser.username || '',
        role:     editUser.role     || 'team',
        status:   editUser.status   || 'Aktif',
      });
    }
  }, [editUser]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateUser(editUser.id, formData);
    } else {
      addUser(formData);
    }
    onClose();
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
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              {isEdit ? 'Simpan Perubahan' : 'Simpan User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserModal;