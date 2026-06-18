import React, { useState } from 'react';
import { FiUser, FiAtSign, FiLock, FiSave, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

const ProfileForm = () => {
  const { user, updateProfile, updatePassword } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Nama Lengkap & Username sinkron (mengarah ke kolom yang sama) 
  const handleNameOrUsernameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value, username: value }));
  };

  const handlePasswordChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setIsSaving(true);
    try {
      if (formData.username !== user?.username) {
        await updateProfile(formData.username);
      }

      if (formData.password) {
        await updatePassword(formData.password);
      }

      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Gagal menyimpan perubahan.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* INFORMASI DASAR + GANTI PASSWORD */}
      <form onSubmit={handleSubmit} className="profile-form-card">
        <h2 className="form-section-title">Informasi Dasar</h2>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">
              <FiUser /> Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameOrUsernameChange}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <FiAtSign /> Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={handleNameOrUsernameChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="form-divider">
          <h2 className="form-section-title">Ganti Password</h2>
          <p className="form-hint">Kosongkan jika tidak ingin mengubah password.</p>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <FiLock /> Password Baru
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={handlePasswordChange('password')}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <FiLock /> Konfirmasi Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
            {message.type === 'success' && <FiCheckCircle />}
            {message.text}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2 px-6">
            {isSaving ? 'Menyimpan...' : <><FiSave /> Simpan Perubahan</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileForm;