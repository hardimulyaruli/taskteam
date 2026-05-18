import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiZap, FiCheck, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login gagal.');
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
            <FiZap className="icon-lg" />
          </div>
          <h1 className="login-title">Masuk ke TaskTeam</h1>
          <p className="login-subtitle">Masuk untuk mengelola workspace Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="login-label">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="admin / manager / team"
            />
          </div>
          <div>
            <label className="login-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="admin123 / manager123 / team123"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary login-submit-btn"
          >
            {isLoading
              ? 'Memverifikasi...'
              : <><span>Lanjutkan</span><FiArrowRight className="icon-sm" /></>
            }
          </button>
        </form>

        <div className="login-footer">
          <FiCheck className="icon-sm login-footer-icon" />
          Server terhubung dengan aman.
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
