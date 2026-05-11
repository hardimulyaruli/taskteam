import React from 'react';
import { motion } from 'framer-motion';
import DashboardBanner from '../components/DashboardBanner';
import StatCard from '../components/StatCard';
import RecentActivities from '../components/RecentActivities';
import { useTasks } from '../../../context/TaskContext';
import { useUsers } from '../../../context/UserContext';
import '../../../styles/Dashboard.css';

const AdminDashboard = ({ user }) => {
  const { tasks } = useTasks();
  const { users } = useUsers();

  const stats = {
    total: tasks.length,
    selesai: tasks.filter(t => t.status === 'Selesai').length,
    dikerjakan: tasks.filter(t => t.status === 'Dikerjakan').length,
    totalUsers: users.length
  };
  const percentage = Math.round((stats.selesai / stats.total) * 100) || 0;

  return (
    <div className="dashboard-page">
      <DashboardBanner user={user} />

      <div className="bento-grid-admin">
        {/* Large Completion Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bento-card bento-col-span-2 bento-row-span-2"
        >
          <div className="bento-glow" />
          <div className="ring-card-wrapper">
            <div className="ring-container">
              <span className="ring-number">{percentage}%</span>
              <span className="ring-label">Selesai</span>
              <svg className="ring-svg">
                <circle cx="80" cy="80" r="76" fill="transparent" stroke="var(--accent-blue)" strokeWidth="4"
                  strokeDasharray="477" strokeDashoffset={477 - (477 * percentage) / 100}
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
            </div>
            <h3 className="ring-title">Tingkat Penyelesaian Tim</h3>
            <p className="ring-subtitle">Berdasarkan total tugas di workspace</p>
          </div>
        </motion.div>

        <StatCard label="Total Tugas" value={stats.total} sub="Semua tugas" index={1} />
        <StatCard label="Total User" value={stats.totalUsers} sub="Terdaftar" index={2} />
        <StatCard label="Dikerjakan" value={stats.dikerjakan} sub="Sedang berjalan" index={3} />
        <StatCard label="Selesai" value={stats.selesai} sub="Tugas tuntas" index={4} />

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

export default AdminDashboard;
