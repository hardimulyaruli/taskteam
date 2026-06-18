import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiArrowLeft, FiCheckCircle, FiKey } from 'react-icons/fi';
import { forgotPasswordRequest, resetPasswordRequest } from '../../services/auth';
import '../../styles/Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]           = useState(1); // 1 = minta kode, 2 = input kode + password baru
  const [username, setUsername]   = useState('');
  const [code, setCode]           = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCode, setGeneratedCode]      = useState('');
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await forgotPasswordRequest(username);
      setGeneratedCode(res.data.code);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses permintaan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordRequest(code, password);
      setSuccessMsg('Password berhasil direset! Mengarahkan ke halaman login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-blob-1" />
      <div className="login-blob-2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <div className="login-header">
          <div className="login-logo-box">
            <FiKey className="icon-lg" />
          </div>
          <h1 className="login-title">Lupa Password</h1>
          <p className="login-subtitle">
            {step === 1
              ? 'Fitur ini khusus untuk akun Admin.'
              : 'Masukkan kode reset dan password baru Anda.'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="login-form">
            <div>
              <label className="login-label">Username Admin</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Masukkan username admin"
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" disabled={isLoading} className="btn-primary login-submit-btn">
              {isLoading ? 'Memproses...' : 'Kirim Kode Reset'}
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
              fontSize: '0.82rem', color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.6,
            }}>
              Kode reset Anda (simulasi, tanpa email):
              <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent-blue)', margin: '6px 0' }}>
                {generatedCode}
              </div>
              Berlaku 15 menit.
            </div>

            <form onSubmit={handleResetPassword} className="login-form">
              <div>
                <label className="login-label">Kode Reset</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field"
                  placeholder="Masukkan 6 digit kode"
                />
              </div>
              <div>
                <label className="login-label">Password Baru</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <label className="login-label">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Ulangi password baru"
                />
              </div>

              {error && <p className="login-error">{error}</p>}
              {successMsg && (
                <p style={{ color: 'var(--status-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheckCircle size={14} /> {successMsg}
                </p>
              )}

              <button type="submit" disabled={isLoading || successMsg} className="btn-primary login-submit-btn">
                {isLoading ? 'Memproses...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="login-footer" style={{ justifyContent: 'center' }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.82rem' }}>
            <FiArrowLeft size={14} /> Kembali ke Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;