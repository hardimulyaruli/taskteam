import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUser, FiClock, FiFlag, FiAlertCircle } from 'react-icons/fi';

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
  if (!task) return null;

  const today = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && deadline < today && task.status !== 'Selesai';
  const diffDays = deadline
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="modal-card"
        style={{ maxWidth: '480px', width: '100%' }}
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
            {task.isRevisi && (
              <span className="task-revisi-badge">🔄 Revisi</span>
            )}
            {isOverdue && (
              <span className="dl-badge dl-overdue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiAlertCircle size={10} /> Terlewat
              </span>
            )}
          </div>
          <button onClick={onClose} className="td-close-btn">
            <FiX />
          </button>
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

        {/* ACTIONS */}
        {userRole === 'manager' && (
          <>
            <div className="td-divider" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={onClose} className="btn-secondary">
                Tutup
              </button>
              {isSelesai ? (
                <button
                  onClick={() => { onClose(); onRevisi(task); }}
                  className="btn-revisi"
                >
                  Revisi
                </button>
              ) : (
                <button
                  onClick={() => { onClose(); onEdit(task); }}
                  className="btn-primary"
                >
                  Edit Tugas
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TaskDetailModal;