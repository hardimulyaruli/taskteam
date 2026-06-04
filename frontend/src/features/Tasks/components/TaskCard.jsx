import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser, FiTrash2, FiCheckCircle, FiPaperclip } from 'react-icons/fi';
import SubmissionModal from './SubmissionModal';

const getPriorityClass = (priority) => {
  if (priority === 'Tinggi') return 'priority-high';
  if (priority === 'Sedang') return 'priority-medium';
  return 'priority-low';
};

const TaskCard = ({ task, userRole, onUpdateStatus, onDelete, isOverdue, onView }) => {
  const [showSubmission, setShowSubmission] = useState(false);

  const isSelesai = task.status === 'Selesai';
  const showClip  = isSelesai || isOverdue;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        className={`task-card ${isOverdue ? 'task-card-overdue' : ''}`}
        onClick={() => onView && onView(task)}
        style={{ cursor: 'pointer' }}
      >
        {/* TOP ROW */}
        <div className="task-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span className={`task-priority-badge ${getPriorityClass(task.priority)}`}>
              {task.priority}
            </span>
            {task.isRevisi && (
              <span className="task-revisi-badge">🔄 Revisi</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {showClip && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSubmission(true); }}
                title={userRole === 'team' ? 'Lihat hasil kerja' : 'Lihat submission'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent-blue)', padding: '4px',
                  borderRadius: '6px', display: 'flex', alignItems: 'center',
                }}
              >
                <FiPaperclip size={15} />
              </button>
            )}
            {userRole === 'manager' && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="action-btn-danger"
                title="Hapus tugas"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        </div>

        <h4 className="task-card-title">{task.title}</h4>
        <p className="task-card-desc">{task.description}</p>

        <div className="task-card-footer">
          <div className="task-meta-item">
            <FiUser /> <span>{task.assignee}</span>
          </div>
          <div className="task-deadline">
            <FiClock /> <span>{task.deadline}</span>
          </div>
        </div>

        {/* STATUS SECTION — hanya untuk team */}
        {userRole === 'team' && (
          <div className="task-status-select" onClick={(e) => e.stopPropagation()}>
            {isSelesai ? (
              <div className="task-done-label">
                <FiCheckCircle style={{ color: 'var(--status-green)' }} />
                Tugas telah selesai
              </div>
            ) : isOverdue ? (
              <div className="task-overdue-label">
                ⚠️ Hubungi manager untuk update status
              </div>
            ) : (
              <select
                value={task.status}
                onChange={(e) => onUpdateStatus(task.id, e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="Dikerjakan">Dikerjakan</option>
              </select>
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showSubmission && (
          <SubmissionModal
            task={task}
            userRole={userRole}
            onClose={() => setShowSubmission(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskCard;