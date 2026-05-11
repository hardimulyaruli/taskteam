import React from 'react';
import { motion } from 'framer-motion';
import DashboardBanner from '../components/DashboardBanner';
import StatCard from '../components/StatCard';
import RecentActivities from '../components/RecentActivities';
import { useTasks } from '../../../context/TaskContext';
import '../../../styles/Dashboard.css';

const ManagerDashboard = ({ user }) => {
  const { tasks } = useTasks();

  const stats = {
    total: tasks.length,
    selesai: tasks.filter(t => t.status === 'Selesai').length,
    dikerjakan: tasks.filter(t => t.status === 'Dikerjakan').length,
    todo: tasks.filter(t => t.status === 'To Do').length
  };
  const pct = (n) => `${Math.round((n / stats.total) * 100) || 0}%`;

  return (
    <div className="dashboard-page">
      <DashboardBanner user={user} />

      <div className="bento-grid-manager">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bento-card bento-col-span-2 bento-row-span-2"
        >
          <h3 className="stat-card-label">Ringkasan Proyek Tim</h3>
          <div className="progress-section">
            {[
              { label: 'Selesai', count: stats.selesai, fillClass: 'progress-fill-green' },
              { label: 'Dikerjakan', count: stats.dikerjakan, fillClass: 'progress-fill-orange' },
              { label: 'To Do', count: stats.todo, fillClass: 'progress-fill-muted' }
            ].map(({ label, count, fillClass }) => (
              <div key={label}>
                <div className="progress-item-label">
                  <span>{label}</span>
                  <span className="progress-item-count">{count}/{stats.total}</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: pct(count) }}
                    transition={{ duration: 1 }}
                    className={fillClass}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <StatCard label="Selesai" value={stats.selesai} sub="Tugas tuntas" index={1} />
        <StatCard label="Dikerjakan" value={stats.dikerjakan} sub="Sedang berjalan" index={2} />

        {/* Deadline Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bento-card bento-col-span-2"
        >
          <h3 className="stat-card-label">Deadline Terdekat</h3>
          <div className="activity-feed-list">
            {tasks.filter(t => t.status !== 'Selesai').slice(0, 3).map(task => (
              <div key={task.id} className="deadline-item">
                <span className="deadline-title">{task.title}</span>
                <span className="deadline-date">{task.deadline}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bento-card-large bento-col-span-4"
        >
          <RecentActivities />
        </motion.div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
