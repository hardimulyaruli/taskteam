import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import '../../styles/Tasks.css';

// ============================================
// STAT CARDS
// ============================================
const StatCards = ({ tasks }) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const total = tasks.length;

  const deadlineMingguIni = tasks.filter(t => {
    if (t.status === 'Selesai' || !t.deadline) return false;
    const d = new Date(t.deadline);
    return d >= today && d <= in7Days;
  }).length;

  const lewatDeadline = tasks.filter(t => {
    if (t.status === 'Selesai' || !t.deadline) return false;
    return new Date(t.deadline) < today;
  }).length;

  const selesaiBulanIni = tasks.filter(t => {
    if (t.status !== 'Selesai' || !t.updatedAt) return false;
    return new Date(t.updatedAt) >= startOfMonth;
  }).length;

  const cards = [
    {
      label: 'Total Tugas',
      value: total,
      sub: 'tanggungan kamu',
      accent: 'var(--accent-blue)',
    },
    {
      label: 'Deadline Minggu Ini',
      value: deadlineMingguIni,
      sub: 'segera dikerjakan',
      accent: 'var(--status-orange)',
    },
    {
      label: 'Lewat Deadline',
      value: lewatDeadline,
      sub: lewatDeadline > 0 ? 'perlu perhatian!' : 'semua aman',
      accent: lewatDeadline > 0 ? 'var(--status-red)' : 'var(--status-green)',
    },
    {
      label: 'Selesai Bulan Ini',
      value: selesaiBulanIni,
      sub: `dari ${total} tugas`,
      accent: 'var(--status-green)',
    },
  ];

  return (
    <div className="tasks-stat-row">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className="tasks-stat-card"
          style={{ borderLeftColor: card.accent }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <div className="tasks-stat-label">{card.label}</div>
          <div className="tasks-stat-value">{card.value}</div>
          <div className="tasks-stat-sub">{card.sub}</div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const Tasks = () => {
  const { user } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const location = useLocation();

  const [showModal, setShowModal]   = useState(false);
  const [viewTask, setViewTask]     = useState(null);
  const [editTask, setEditTask]     = useState(null);
  const [revisiTask, setRevisiTask] = useState(null);
  const scrollRef = useRef(null);
  const boardRef  = useRef(null);

  const today = new Date();

  // ── Baca taskId dari URL, langsung buka modal detail ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');
    if (taskId && tasks.length > 0) {
      const found = tasks.find(t => String(t.id) === String(taskId));
      if (found) setViewTask(found);
    }
  }, [location.search, tasks]);

  const displayTasks = user.role === 'team'
    ? tasks.filter(t => {
        const assignees = String(t.assignee || '').split(',').map(s => s.trim());
        return assignees.includes(user.username) || assignees.includes('team');
      })
    : tasks;

  const overdueTasks = displayTasks.filter(t =>
    t.status !== 'Selesai' && t.deadline && new Date(t.deadline) < today
  );

  const overdueIds = new Set(overdueTasks.map(t => t.id));

  const columns = [
    { id: 'To Do',      title: 'To Do',      color: 'var(--text-secondary)' },
    { id: 'Dikerjakan', title: 'Dikerjakan', color: 'var(--status-orange)'  },
    { id: 'Selesai',    title: 'Selesai',    color: 'var(--status-green)'   },
  ];

  const handleAddSubmit = async (formData) => {
    try {
      await addTask(formData);
      setShowModal(false);
    } catch (err) {
      console.error('Gagal menambah tugas:', err);
      alert('Gagal menambah tugas. Silakan coba lagi.');
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateTask(editTask.id, formData);
      setEditTask(null);
    } catch (err) {
      console.error('Gagal edit tugas:', err);
      alert('Gagal menyimpan perubahan.');
    }
  };

  const handleRevisiSubmit = async (formData) => {
    try {
      await updateTask(revisiTask.id, {
        ...formData,
        isRevisi: true,
      });
      setRevisiTask(null);
    } catch (err) {
      console.error('Gagal minta revisi:', err);
      alert('Gagal menyimpan revisi.');
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
    } catch (err) {
      console.error('Gagal mengubah status:', err);
      alert('Gagal mengubah status tugas.');
    }
  };

  const colWidth      = 288;
  const gap           = 24;
  const totalCols     = columns.length + 1;
  const boardWidth    = totalCols * colWidth + (totalCols - 1) * gap;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth - 80 : 1200;
  const maxDrag       = Math.max(0, boardWidth - viewportWidth);

  return (
    <div className="pb-10 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
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

      {/* STAT CARDS */}
      <StatCards tasks={displayTasks} />

      <div ref={boardRef} style={{ overflow: 'hidden', flex: 1 }}>
        <motion.div
          ref={scrollRef}
          className="task-board-container cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.05}
        >
          {/* KOLOM BIASA */}
          {columns.map(col => (
            <div key={col.id} className="task-column">
              <div className="task-column-header">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <span>{col.title}</span>
                </div>
                <span className="text-xs bg-[var(--bg-card)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">
                  {displayTasks.filter(t =>
                    t.status === col.id && !overdueIds.has(t.id)
                  ).length}
                </span>
              </div>
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                <AnimatePresence>
                  {displayTasks
                    .filter(t => t.status === col.id && !overdueIds.has(t.id))
                    .map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        userRole={user.role}
                        onUpdateStatus={updateTaskStatus}
                        onDelete={deleteTask}
                        isOverdue={false}
                        onView={setViewTask}
                      />
                    ))
                  }
                </AnimatePresence>
              </div>
            </div>
          ))}

          {/* KOLOM TERLEWAT */}
          <div className="task-column task-column-overdue">
            <div className="task-column-header">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--status-red)' }} />
                <span>Terlewat</span>
              </div>
              <span className="text-xs bg-[var(--bg-card)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">
                {overdueTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
              <AnimatePresence>
                {overdueTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-2"
                  >
                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                    <span className="text-xs text-[var(--text-secondary)] opacity-60">
                      Semua tugas tepat waktu!
                    </span>
                  </motion.div>
                ) : (
                  overdueTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      userRole={user.role}
                      onUpdateStatus={updateTaskStatus}
                      onDelete={deleteTask}
                      isOverdue={true}
                      onView={setViewTask}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MODAL DETAIL */}
      <AnimatePresence>
        {viewTask && (
          <TaskDetailModal
            task={viewTask}
            onClose={() => setViewTask(null)}
            onEdit={(task) => { setEditTask(task); setViewTask(null); }}
            onRevisi={(task) => { setRevisiTask(task); setViewTask(null); }}
            userRole={user.role}
          />
        )}
      </AnimatePresence>

      {/* MODAL TAMBAH / EDIT */}
      <AnimatePresence>
        {(showModal || editTask) && (
          <TaskModal
            task={editTask}
            onClose={() => { setShowModal(false); setEditTask(null); }}
            onSubmit={editTask ? handleEditSubmit : handleAddSubmit}
            isRevisiMode={false}
          />
        )}
      </AnimatePresence>

      {/* MODAL REVISI */}
      <AnimatePresence>
        {revisiTask && (
          <TaskModal
            task={revisiTask}
            onClose={() => setRevisiTask(null)}
            onSubmit={handleRevisiSubmit}
            isRevisiMode={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;