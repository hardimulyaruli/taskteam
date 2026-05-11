import React from 'react';
import { motion } from 'framer-motion';
import DashboardBanner from '../components/DashboardBanner';
import StatCard from '../components/StatCard';
import { useTasks } from '../../../context/TaskContext';
import '../../../styles/Dashboard.css';

const TeamDashboard = ({ user }) => {
  const { tasks } = useTasks();

  const myTasks = tasks.filter(t => t.assignee === user.username || t.assignee === 'team');
  const stats = {
    total: myTasks.length,
    selesai: myTasks.filter(t => t.status === 'Selesai').length,
    dikerjakan: myTasks.filter(t => t.status === 'Dikerjakan').length,
    todo: myTasks.filter(t => t.status === 'To Do').length
  };

  const urgentTasks = myTasks.filter(t => t.status !== 'Selesai').slice(0, 2);

  return (
    <div className="dashboard-page">
      <DashboardBanner user={user} />

      <div className="bento-grid-admin">
        {/* Productivity Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bento-card bento-card-accent bento-col-span-2 bento-row-span-2"
        >
          <h3 className="stat-card-label">Produktivitas Pribadi</h3>
          <div>
            <div className="ring-number" style={{ fontSize: '3.75rem' }}>
              {stats.selesai} <span className="stat-card-value" style={{ fontSize: '1.5rem' }}>/ {stats.total}</span>
            </div>
            <p className="stat-card-sub">Tugas diselesaikan dari total tanggungan Anda.</p>
          </div>
        </motion.div>

        <StatCard label="Dikerjakan" value={stats.dikerjakan} sub="Sedang berjalan" index={1} />
        <StatCard label="To Do" value={stats.todo} sub="Belum dimulai" index={2} />

        {/* Priority Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bento-card bento-col-span-2"
        >
          <h3 className="stat-card-label">Tugas Prioritas Anda</h3>
          <div className="activity-feed-list">
            {urgentTasks.length === 0 ? (
              <p className="activity-action">Tidak ada tugas mendesak.</p>
            ) : urgentTasks.map(task => (
              <div key={task.id} className="deadline-item">
                <span className="deadline-title">{task.title}</span>
                <span className="deadline-date">{task.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamDashboard;
