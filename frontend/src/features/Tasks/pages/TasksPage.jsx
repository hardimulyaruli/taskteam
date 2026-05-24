import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useTasks } from '../../../context/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import '../../../styles/Tasks.css';

const COLUMNS = [
  { id: 'To Do', title: 'To Do', colorVar: 'var(--text-secondary)' },
  { id: 'Dikerjakan', title: 'Dikerjakan', colorVar: 'var(--status-orange)' },
  { id: 'Selesai', title: 'Selesai', colorVar: 'var(--status-green)' }
];

const TaskColumn = ({ column, tasks, userRole, onUpdateStatus, onDelete }) => {
  return (
    <div className="task-column">
      <div className="task-column-header">
        <div className="task-col-label">
          <div className="task-col-dot" style={{ backgroundColor: column.colorVar }} />
          <span>{column.title}</span>
        </div>
        <span className="task-col-count">{tasks.length}</span>
      </div>
      <div className="task-col-body">
        <AnimatePresence>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              userRole={userRole}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const { user } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [showModal, setShowModal] = useState(false);

  const displayTasks = user.role === 'team'
    ? tasks.filter(t => t.assignee === user.username || t.assignee === 'team')
    : tasks;

  const updateTaskStatus = (id, newStatus) => {
    updateTask(id, { status: newStatus });
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1 className="page-title">Papan Tugas</h1>
          <p className="page-subtitle">Kelola tugas dengan tampilan board interaktif.</p>
        </div>
        {user.role === 'manager' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Tambah Tugas
          </motion.button>
        )}
      </div>

      <div className="task-board-container">
        {COLUMNS.map(col => (
          <TaskColumn
            key={col.id}
            column={col}
            tasks={displayTasks.filter(t => t.status === col.id)}
            userRole={user.role}
            onUpdateStatus={updateTaskStatus}
            onDelete={deleteTask}
          />
        ))}
      </div>

      <AnimatePresence>
        {showModal && <TaskModal onClose={() => setShowModal(false)} onSubmit={(data) => { addTask(data); setShowModal(false); }} />}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;