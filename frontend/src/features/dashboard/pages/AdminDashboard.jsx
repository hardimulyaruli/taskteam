import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../../../context/TaskContext';
import '../../../styles/Dashboard.css';

// ============================================
// DASHBOARD BANNER
// ============================================
const DashboardBanner = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <div className="dashboard-banner">
      <h1 className="dashboard-greeting">
        {getGreeting()}, {user?.username || user?.name || 'Admin'} 👋
      </h1>
      <p className="dashboard-greeting-sub">
        Berikut adalah ringkasan aktivitas workspace Anda hari ini.
      </p>
    </div>
  );
};

// ============================================
// STAT CARD
// ============================================
const StatCard = ({ label, value, sub, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="bento-card"
    >
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value}</p>
      <p className="stat-card-sub">{sub}</p>
    </motion.div>
  );
};

// ============================================
// RECENT ACTIVITIES
// ============================================
const RecentActivities = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <>
        <p className="activity-feed-title">⚡ Aktivitas Terbaru</p>
        <p className="activity-action">Belum ada aktivitas.</p>
      </>
    );
  }

  return (
    <>
      <p className="activity-feed-title">⚡ Aktivitas Terbaru</p>
      <div className="activity-feed-list">
        {activities.map((act, i) => (
          <div key={act.id || i} className="activity-feed-item">
            <div className="activity-dot" />
            <p className="activity-text">
              <span className="activity-actor">{act.actor || act.user}</span>{' '}
              <span className="activity-action">{act.action}</span>{' '}
              <span className="activity-target">{act.target}</span>
            </p>
            <span className="activity-time">{act.time}</span>
          </div>
        ))}
      </div>
    </>
  );
};

// ============================================
// DONUT CHART (canvas, no library)
// ============================================
const DonutChart = ({ selesai, dikerjakan, todo, terlewat }) => {
  const canvasRef = useRef(null);
  const total = selesai + dikerjakan + todo + terlewat;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 52;
    const lineWidth = 14;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(128,128,128,0.15)';
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      return;
    }

    const segments = [
      { value: selesai,    color: '#4ade80' },
      { value: dikerjakan, color: '#60a5fa' },
      { value: todo,       color: '#f59e0b' },
      { value: terlewat,   color: '#f87171' },
    ];

    let startAngle = -Math.PI / 2;
    segments.forEach(seg => {
      if (seg.value === 0) return;
      const slice = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      startAngle += slice + 0.04;
    });
  }, [selesai, dikerjakan, todo, terlewat, total]);

  const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;

  return (
    <div className="tt-donut-wrap">
      <div className="tt-donut-canvas-wrap">
        <canvas ref={canvasRef} width={130} height={130} />
        <div className="tt-donut-center">
          <span className="tt-donut-pct">{pct}%</span>
          <span className="tt-donut-label">selesai</span>
        </div>
      </div>
      <div className="tt-donut-legend">
        <div className="tt-legend-item">
          <span className="tt-legend-dot" style={{ background: '#4ade80' }} />
          <span>Selesai</span>
          <span className="tt-legend-val">{selesai}</span>
        </div>
        <div className="tt-legend-item">
          <span className="tt-legend-dot" style={{ background: '#60a5fa' }} />
          <span>Dikerjakan</span>
          <span className="tt-legend-val">{dikerjakan}</span>
        </div>
        <div className="tt-legend-item">
          <span className="tt-legend-dot" style={{ background: '#f59e0b' }} />
          <span>To Do</span>
          <span className="tt-legend-val">{todo}</span>
        </div>
        <div className="tt-legend-item">
          <span className="tt-legend-dot" style={{ background: '#f87171' }} />
          <span>Terlewat</span>
          <span className="tt-legend-val">{terlewat}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PROGRESS BAR
// ============================================
const ProgressBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="tt-progress-row">
      <div className="tt-progress-header">
        <span>{label}</span>
        <span>{value}/{total} ({pct}%)</span>
      </div>
      <div className="tt-progress-track">
        <motion.div
          className="tt-progress-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// ============================================
// WEEKLY BAR CHART
// ============================================
const WeeklyChart = ({ tasks }) => {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const counts = Array(7).fill(0);
  const today = new Date();

  tasks.forEach(task => {
    if (task.status !== 'Selesai' || !task.updatedAt) return;
    const d = new Date(task.updatedAt);
    const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      counts[6 - diff]++;
    }
  });

  const max = Math.max(...counts, 1);

  return (
    <div className="tt-week-chart">
      {counts.map((count, i) => (
        <div key={i} className="tt-week-col">
          <div className="tt-week-bar-wrap">
            <motion.div
              className="tt-week-bar"
              style={{
                height: `${Math.round((count / max) * 100)}%`,
                background: count > 0 ? '#4ade80' : 'rgba(128,128,128,0.15)',
              }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.round((count / max) * 100)}%` }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: 'easeOut' }}
            />
          </div>
          <span className="tt-week-day">{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const AdminDashboard = ({ user }) => {
  const { tasks, activities } = useTasks();
  const today = new Date();

  const overdueTasks = tasks.filter(
    t => t.status !== 'Selesai' && t.deadline && new Date(t.deadline) < today
  );

  const stats = {
    total:      tasks.length,
    selesai:    tasks.filter(t => t.status === 'Selesai').length,
    dikerjakan: tasks.filter(t => t.status === 'Dikerjakan').length,
    todo:       tasks.filter(t => t.status === 'To Do').length,
    terlewat:   overdueTasks.length,
  };

  return (
    <div className="dashboard-page">
      <DashboardBanner user={user} />

      <div className="bento-grid-admin">

        {/* CARD 1 — Donut Chart + Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bento-card bento-card-accent bento-col-span-2 bento-row-span-2"
        >
          <h3 className="stat-card-label">Tingkat Penyelesaian Tim</h3>
          <DonutChart
            selesai={stats.selesai}
            dikerjakan={stats.dikerjakan}
            todo={stats.todo}
            terlewat={stats.terlewat}
          />
          <div className="tt-progress-section">
            <ProgressBar label="Selesai"    value={stats.selesai}    total={stats.total} color="#4ade80" />
            <ProgressBar label="Dikerjakan" value={stats.dikerjakan} total={stats.total} color="#60a5fa" />
            <ProgressBar label="To Do"      value={stats.todo}       total={stats.total} color="#f59e0b" />
            <ProgressBar label="Terlewat"   value={stats.terlewat}   total={stats.total} color="#f87171" />
          </div>
        </motion.div>

        {/* CARD 2–4 — Stat Cards */}
        <StatCard label="Total Tugas" value={stats.total}      sub="Semua tugas"     index={1} />
        <StatCard label="Dikerjakan"  value={stats.dikerjakan} sub="Sedang berjalan"  index={2} />
        <StatCard label="Terlewat"    value={stats.terlewat}   sub="Perlu perhatian!" index={3} />

        {/* CARD 4 — Grafik Mingguan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bento-card bento-col-span-2"
        >
          <div className="tt-week-header">
            <h3 className="stat-card-label">Selesai Minggu Ini</h3>
            <div>
              <span className="tt-week-count">{stats.selesai}</span>
              <span className="stat-card-sub" style={{ fontSize: '0.7rem', marginLeft: '4px' }}>tugas</span>
            </div>
          </div>
          <WeeklyChart tasks={tasks} />
        </motion.div>

        {/* CARD 5 — Aktivitas Terbaru */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bento-card-large bento-col-span-4"
        >
          <RecentActivities activities={activities} />
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;