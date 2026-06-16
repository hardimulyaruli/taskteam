import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2, FiMessageSquare, FiLoader } from 'react-icons/fi';
import { fetchComments, addComment, deleteComment } from '../../../services/comment';
import { useAuth } from '../../../context/AuthContext';

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diffMs   = now - date;
  const diffMin  = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay  = Math.floor(diffHour / 24);

  if (diffMin < 1)  return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7)  return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID');
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

function getAvatarColor(username = '') {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash += username.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
}

const CommentSection = ({ taskId, userRole }) => {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchComments(taskId);
      setComments(res.data?.comments ?? []);
    } catch {
      setError('Gagal memuat komentar.');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setIsSending(true);
    setError('');
    try {
      await addComment(taskId, text.trim());
      setText('');
      await loadComments();
    } catch {
      setError('Gagal mengirim komentar.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await deleteComment(taskId, commentId);
      await loadComments();
    } catch {
      setError('Gagal menghapus komentar.');
    }
  };

  return (
    <div className="comment-section">
      <p className="td-section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FiMessageSquare size={12} /> Komentar ({comments.length})
      </p>

      {/* LIST KOMENTAR */}
      <div className="comment-list">
        {isLoading ? (
          <div className="comment-empty">Memuat komentar...</div>
        ) : comments.length === 0 ? (
          <div className="comment-empty">Belum ada komentar. Mulai diskusi di sini!</div>
        ) : (
          comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="comment-item"
            >
              <div
                className="comment-avatar"
                style={{ background: getAvatarColor(c.username) }}
              >
                {getInitials(c.username)}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-username">{c.username}</span>
                  <span className="comment-time">{formatTime(c.createdAt)}</span>
                </div>
                <p className="comment-text">{c.content}</p>
              </div>

              {/* Hapus — manager bisa hapus semua, user hapus milik sendiri */}
              {(userRole === 'manager' || c.userId === user?.id) && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="comment-delete-btn"
                  title="Hapus komentar"
                >
                  <FiTrash2 size={13} />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {error && <p style={{ color: 'var(--status-red)', fontSize: '0.75rem', marginTop: '6px' }}>⚠️ {error}</p>}

      {/* INPUT KOMENTAR */}
      <div className="comment-input-wrap">
        <textarea
          className="comment-input"
          placeholder="Tulis komentar..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className="comment-send-btn"
          title="Kirim"
        >
          {isSending ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <FiLoader size={14} />
            </motion.div>
          ) : (
            <FiSend size={14} />
          )}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;