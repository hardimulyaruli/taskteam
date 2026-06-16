import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiClock, FiFlag, FiAlertCircle, FiPaperclip, FiCheckCircle } from 'react-icons/fi';
import SubmissionModal from './SubmissionModal';
import CommentSection from './CommentSection';
import { useTasks } from '../../../context/TaskContext';

const getPriorityClass = (priority) => {
  if (priority === 'Tinggi') return 'priority-high';
  if (priority === 'Sedang') return 'priority-medium';
  return 'priority-low';
};

const getStatusClass = (status) => {
  if (status === 'Selesai')    return 'tt-status-selesai';
  if (status === 'Dikerjakan') return 'tt-status-dikerjakan';
  return 'tt-status-to-do';
};

const TaskDetailModal = ({ task, onClose, onEdit, onRevisi, userRole }) => {
  const { updateTask } = useTasks();
  const [showSubmission, setShowSubmission] = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [showSerahkanConfirm, setShowSerahkanConfirm] = useState(false);

  if (!task) return null;

  const today     = new Date();
  const deadline  = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && deadline < today && task.status !== 'Selesai';
  const diffDays  = deadline
    ? Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
    : null;

  const deadlineLabel = () => {
    if (!deadline) return '-';
    if (isOverdue) return `Terlewat ${Math.abs(diffDays)} hari`;
    if (diffDays === 0) return 'Hari ini!';
    if (diffDays <= 3) return `${diffDays} hari lagi`;
    return task.deadline;
  };

  const deadlineColor = () => {
    if (!deadline) return 'var(--text-secondary)';
    if (isOverdue) return 'var(--status-red)';
    if (diffDays <= 3) return 'var(--status-orange)';
    return 'var(--status-green)';
  };

  const isSelesai = task.status === 'Selesai';

  // Hanya muncul kalau team, belum selesai, DAN tidak terlewat
  const canSubmit = userRole === 'team' && !isSelesai && !isOverdue;

  const handleSerahkan = async () => {
    setIsSubmitting(true);
    try {
      await updateTask(task.id, { status: 'Selesai' });
      setShowSerahkanConfirm(false);
      onClose();
    } catch {
      alert('Gagal menyerahkan tugas. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── CONFIRM SERAHKAN ── */}
      <AnimatePresence>
        {showSerahkanConfirm && (
          <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowSerahkanConfirm(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="modal-card"
              style={{ maxWidth: '360px', width: '100%', textAlign: 'center', zIndex: 61 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--text-heading)', fontSize: '1.05rem', fontWeight: 700 }}>
                Serahkan Tugas?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px', lineHeight: 1.6 }}>
                Tugas <strong style={{ color: 'var(--text-primary)' }}>{task.title}</strong> akan ditandai sebagai <strong>Selesai</strong>. Pastikan kamu sudah mengupload hasil kerja sebelumnya.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowSerahkanConfirm(false)} className="btn-secondary">
                  Batal
                </button>
                <button
                  onClick={handleSerahkan}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiCheckCircle size={14} />
                  {isSubmitting ? 'Menyerahkan...' : 'Ya, Serahkan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SUBMISSION MODAL ── */}
      <AnimatePresence>
        {showSubmission && (
          <SubmissionModal
            task={task}
            userRole={userRole}
            onClose={() => setShowSubmission(false)}
            onBack={() => setShowSubmission(false)}
          />
        )}
      </AnimatePresence>

      {/* ── DETAIL MODAL ── */}
      {!showSubmission && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="modal-card"
            style={{ maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="td-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className={`task-priority-badge ${getPriorityClass(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`tt-status-badge ${getStatusClass(task.status)}`}>
                  {task.status}
                </span>
                {task.isRevisi && <span className="task-revisi-badge">🔄 Revisi</span>}
                {isOverdue && (
                  <span className="dl-badge dl-overdue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiAlertCircle size={10} /> Terlewat
                  </span>
                )}
              </div>
              <button onClick={onClose} className="td-close-btn"><FiX /></button>
            </div>

            {/* JUDUL */}
            <h2 className="td-title">{task.title}</h2>

            {/* DESKRIPSI */}
            <div className="td-section">
              <p className="td-section-label">Deskripsi</p>
              <p className="td-desc">
                {task.description || (
                  <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Tidak ada deskripsi.
                  </span>
                )}
              </p>
            </div>

            <div className="td-divider" />

            {/* INFO GRID */}
            <div className="td-info-grid">
              <div className="td-info-item">
                <FiUser className="td-info-icon" />
                <div>
                  <p className="td-info-label">Assignee</p>
                  <p className="td-info-value">{task.assignee || '-'}</p>
                </div>
              </div>
              <div className="td-info-item">
                <FiClock className="td-info-icon" />
                <div>
                  <p className="td-info-label">Deadline</p>
                  <p className="td-info-value" style={{ color: deadlineColor() }}>
                    {deadlineLabel()}
                  </p>
                </div>
              </div>
              <div className="td-info-item">
                <FiFlag className="td-info-icon" />
                <div>
                  <p className="td-info-label">Prioritas</p>
                  <p className="td-info-value">{task.priority || '-'}</p>
                </div>
              </div>
              <div className="td-info-item">
                <FiClock className="td-info-icon" />
                <div>
                  <p className="td-info-label">Tanggal dibuat</p>
                  <p className="td-info-value">
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="td-divider" />

            {/* KOMENTAR */}
            <CommentSection taskId={task.id} userRole={userRole} />

            <div className="td-divider" />

            {/* TOMBOL TEAM — belum selesai & tidak terlewat */}
            {canSubmit && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                <button
                  onClick={() => setShowSubmission(true)}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px', borderRadius: '10px',
                    border: '1.5px dashed var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--accent-blue)',
                    fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                >
                  <FiPaperclip size={14} /> Upload Hasil Kerja
                </button>
                <button
                  onClick={() => setShowSerahkanConfirm(true)}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px', fontSize: '0.82rem',
                  }}
                >
                  <FiCheckCircle size={14} /> Serahkan Tugas
                </button>
              </div>
            )}

            {/* TOMBOL TEAM — sudah selesai, lihat file saja */}
            {userRole === 'team' && isSelesai && (
              <div style={{ marginBottom: '4px' }}>
                <button
                  onClick={() => setShowSubmission(true)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px', borderRadius: '10px',
                    border: '1.5px dashed var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                >
                  <FiPaperclip size={14} /> Lihat File yang Diserahkan
                </button>
              </div>
            )}

            {/* TOMBOL TEAM — terlewat, tampil pesan */}
            {userRole === 'team' && isOverdue && (
              <div style={{
                marginBottom: '4px', padding: '10px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '0.82rem', color: 'var(--status-red)', textAlign: 'center',
              }}>
                ⚠️ Deadline sudah terlewat. Hubungi manager untuk update status.
              </div>
            )}

            {/* TOMBOL MANAGER */}
            {userRole === 'manager' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => setShowSubmission(true)}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '10px', borderRadius: '10px',
                      border: '1.5px dashed var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '0.82rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                  >
                    <FiPaperclip size={14} /> Lihat Submission Team
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={onClose} className="btn-secondary">Tutup</button>
                  {isSelesai ? (
                    <button onClick={() => { onClose(); onRevisi(task); }} className="btn-revisi">
                      Revisi
                    </button>
                  ) : (
                    <button onClick={() => { onClose(); onEdit(task); }} className="btn-primary">
                      Edit Tugas
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default TaskDetailModal;