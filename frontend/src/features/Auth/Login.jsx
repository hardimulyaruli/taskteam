import { useEffect, useState } from 'react'
import { FiZap, FiCheck, FiArrowRight } from 'react-icons/fi'
import { motion } from 'framer-motion'
import api from '../../services/api'
import '../../styles/Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState('Mengecek koneksi API...')

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await api.get('/health')
        if (response?.data?.status === 'OK') {
          setApiStatus('API terhubung')
          return
        }

        setApiStatus('API merespons, tetapi status tidak sesuai')
      } catch {
        setApiStatus('API belum terhubung')
      }
    }

    checkApiConnection()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (!username || !password) {
        throw new Error('Username dan password wajib diisi')
      }

      const response = await api.get('/health')
      if (response?.data?.status !== 'OK') {
        throw new Error('API belum siap. Jalankan backend terlebih dahulu')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

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
              placeholder="Gunakan: role123"
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
          {apiStatus}
        </div>
      </motion.div>
    </div>
  )
}

export default Login
