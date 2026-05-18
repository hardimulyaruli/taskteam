import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import '../../styles/Tasks.css';

const Tasks = () => {
  const { user } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef(null);

  const displayTasks = user.role === 'team' 
    ? tasks.filter(t => t.assignee === user.username || t.assignee === 'team')
    : tasks;

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'var(--text-secondary)' },
    { id: 'Dikerjakan', title: 'Dikerjakan', color: 'var(--status-orange)' },
    { id: 'Selesai', title: 'Selesai', color: 'var(--status-green)' }
  ];

  const handleAddSubmit = (formData) => {
    addTask(formData);
    setShowModal(false);
  };

  const updateTaskStatus = (id, newStatus) => {
    updateTask(id, { status: newStatus });
  };

  return (
    <div className="pb-10 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-1">Papan Tugas</h1>
          <p className="text-sm text-[var(--text-secondary)]">Kelola tugas dengan tampilan board interaktif.</p>
        </div>
        {user.role === 'manager' && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)} 
            className="btn-primary flex items-center gap-2 shadow-[var(--shadow-neumorph)]"
          >
            <FiPlus /> Tambah Tugas
          </motion.button>
        )}
      </div>

      <motion.div 
        ref={scrollRef}
        className="task-board-container cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -500, right: 0 }}
        dragElastic={0.1}
      >
        {columns.map(col => (
          <div key={col.id} className="task-column">
            <div className="task-column-header">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }}></div>
                <span>{col.title}</span>
              </div>
              <span className="text-xs bg-[var(--bg-card)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">
                {displayTasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
              <AnimatePresence>
                {displayTasks.filter(t => t.status === col.id).map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    userRole={user.role} 
                    onUpdateStatus={updateTaskStatus}
                    onDelete={deleteTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showModal && <TaskModal onClose={() => setShowModal(false)} onSubmit={handleAddSubmit} />}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
