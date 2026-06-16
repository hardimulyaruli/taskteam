import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { FiUser, FiAtSign, FiLock, FiSave, FiCheckCircle, FiCamera, FiMoon, FiSun, FiSettings, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AVATAR_BASE = api.defaults.baseURL || 'http://localhost:5000';

const Profile = () => {
  const { user, updateProfile, updatePassword, uploadAvatar } = useAuth();
  const { tasks } = useTasks();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  // ── Sinkronkan Nama Lengkap & Username (mengarah ke kolom yang sama) ──
  const handleNameOrUsernameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value, username: value }));
  };

  // ── Upload foto profil ──
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setMessage({ type: '', text: '' });
    try {
      await uploadAvatar(file);
      setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Gagal mengupload foto.' });
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // ── Submit form ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setIsSaving(true);
    try {
      // Update username/nama jika berubah
      if (formData.username !== user?.username) {
        await updateProfile(formData.username);
      }

      // Update password jika diisi
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
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-1">Profil Pengguna</h1>
        <p className="text-sm text-[var(--text-secondary)]">Kelola informasi pribadi dan pengaturan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ============ SIDEBAR ============ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1"
        >
          <div className="bento-card bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-hover)] border border-[var(--border-color)]">
            <div className="flex flex-col items-center text-center p-4">
              {/* AVATAR + TOMBOL KAMERA */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <div
                  className="w-24 h-24 rounded-full bg-[var(--accent-blue-bg)] text-[var(--accent-blue)] flex items-center justify-center text-3xl font-bold uppercase shadow-sm border border-[var(--border-color)] overflow-hidden"
                  style={{ width: '96px', height: '96px' }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user?.name?.charAt(0)
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  title="Ganti foto profil"
                  style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-secondary)',
                  }}
                >
                  <FiCamera size={13} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>

              <h3 className="text-lg font-bold text-[var(--text-heading)]">{user?.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">@{user?.username}</p>
              <span className="px-3 py-1 bg-[var(--status-green-bg)] text-[var(--status-green)] text-xs font-semibold uppercase tracking-wider rounded-full border border-[var(--status-green)]/20">
                {user?.role}
              </span>
            </div>

            {/* STAT MINI */}
            <div className="grid grid-cols-2 gap-2 mt-2 px-1">
              <div className="text-center rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{totalTugas}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Tugas</div>
              </div>
              <div className="text-center rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{selesaiTugas}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Selesai</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)] text-center flex items-center justify-center gap-1.5">
              <FiCalendar size={12} />
              Bergabung sejak {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
            </div>
          </div>
        </motion.div>

        {/* ============ KANAN ============ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <form onSubmit={handleSubmit}>
            {/* INFORMASI DASAR */}
            <div className="bento-card-large shadow-sm" style={{ marginBottom: '1.25rem' }}>
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-6 border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                <FiUser className="w-4 h-4" /> Informasi Dasar
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <FiUser className="w-3.5 h-3.5" /> Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameOrUsernameChange(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <FiAtSign className="w-3.5 h-3.5" /> Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => handleNameOrUsernameChange(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* PREFERENSI TAMPILAN */}
            <div className="bento-card-large shadow-sm" style={{ marginBottom: '1.25rem' }}>
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4 border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                <FiSettings className="w-4 h-4" /> Preferensi
              </h2>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: '36px', height: '36px', background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                  >
                    {theme === 'dark' ? <FiMoon size={16} /> : <FiSun size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
                      Mode Tampilan
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Pilih tema terang atau gelap
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    width: '44px', height: '24px', borderRadius: '99px',
                    background: theme === 'dark' ? 'var(--accent-blue)' : 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    position: 'relative', cursor: 'pointer', flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute', top: '2px',
                      left: theme === 'dark' ? '23px' : '2px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: 'var(--accent-blue)',
                    }}
                  >
                    {theme === 'dark' ? <FiMoon size={10} /> : <FiSun size={10} />}
                  </motion.div>
                </button>
              </div>
            </div>

            {/* GANTI PASSWORD */}
            <div className="bento-card-large shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4 border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                <FiLock className="w-4 h-4" /> Ganti Password
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-5">
                Kosongkan kedua kolom jika tidak ingin mengubah password.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <FiLock className="w-3.5 h-3.5" /> Password Baru
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-md text-sm font-medium flex items-center gap-2 mt-5 ${
                  message.type === 'error' ? 'bg-[var(--status-red-bg)] text-[var(--status-red)]' : 'bg-[var(--status-green-bg)] text-[var(--status-green)]'
                }`}>
                  {message.type === 'success' && <FiCheckCircle className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <div className="flex justify-end pt-5">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  {isSaving ? 'Menyimpan...' : <><FiSave /> Simpan Perubahan</>}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;