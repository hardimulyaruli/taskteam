import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiSave, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      const updatedData = { 
        name: formData.name, 
        username: formData.username 
      };
      
      // In a real app, password would be hashed and sent securely
      // For mock, we just update the user session context
      updateProfile(updatedData);
      
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setIsSaving(false);
      
      // Clear success message after 3s
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-1">Profil Pengguna</h1>
        <p className="text-sm text-[var(--text-secondary)]">Kelola informasi pribadi dan pengaturan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1"
        >
          <div className="bento-card bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-hover)] border border-[var(--border-color)]">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-24 h-24 rounded-full bg-[var(--accent-blue-bg)] text-[var(--accent-blue)] flex items-center justify-center text-3xl font-bold uppercase mb-4 shadow-sm border border-[var(--border-color)]">
                {user?.name?.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-heading)]">{user?.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">@{user?.username}</p>
              <span className="px-3 py-1 bg-[var(--status-green-bg)] text-[var(--status-green)] text-xs font-semibold uppercase tracking-wider rounded-full border border-[var(--status-green)]/20">
                {user?.role}
              </span>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)] text-center">
              Bergabung sejak 2026
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <div className="bento-card-large shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-6 border-b border-[var(--border-color)] pb-3">Informasi Dasar</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <FiUser className="w-3.5 h-3.5" /> Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <FiMail className="w-3.5 h-3.5" /> Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4">Ganti Password</h2>
                <p className="text-xs text-[var(--text-secondary)] mb-5">Kosongkan jika tidak ingin mengubah password saat ini.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                      <FiLock className="w-3.5 h-3.5" /> Password Baru
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                      <FiLock className="w-3.5 h-3.5" /> Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-md text-sm font-medium flex items-center gap-2 ${
                  message.type === 'error' ? 'bg-[var(--status-red-bg)] text-[var(--status-red)]' : 'bg-[var(--status-green-bg)] text-[var(--status-green)]'
                }`}>
                  {message.type === 'success' && <FiCheckCircle className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  {isSaving ? 'Menyimpan...' : <><FiSave /> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
