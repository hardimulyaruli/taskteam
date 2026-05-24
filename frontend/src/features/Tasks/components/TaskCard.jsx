import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiUser, FiTrash2 } from 'react-icons/fi';

const getPriorityClass = (priority) => {
  if (priority === 'Tinggi') return 'priority-high';
  if (priority === 'Sedang') return 'priority-medium';
  return 'priority-low';
};

const TaskCard = ({ task, userRole, onUpdateStatus, onDelete, isOverdue }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`task-card ${isOverdue ? 'task-card-overdue' : ''}`}
    >
      <div className="task-card-top">
        <span className={`task-priority-badge ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>

        {userRole === 'manager' && (
          <button
            onClick={() => onDelete(task.id)}
            className="action-btn-danger"
            title="Hapus tugas"
          >
            <FiTrash2 />
          </button>
        )}
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

      {userRole === 'team' && (
        <div className="task-status-select">
          {isOverdue ? (
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
              <option value="Selesai">Selesai</option>
            </select>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;