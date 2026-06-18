import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardBanner from '../components/DashboardBanner';
import StatCard from '../components/StatCard';
import RecentActivities from '../components/RecentActivities';
import ExportPDF from '../components/ExportPDF';
import { useTasks } from '../../../context/TaskContext';
import '../../../styles/Dashboard.css';

// DONUT CHART — disesuaikan dengan TeamDashboard
const DonutChart = ({ selesai, dikerjakan, todo, terlewat }) => {
  const canvasRef = useRef(null);
  const total = selesai + dikerjakan + todo + terlewat;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 80, cy = 80, r = 58, lw = 28;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(128,128,128,0.1)';
    ctx.lineWidth = lw;
    ctx.shadowBlur = 0;
    ctx.stroke();

    if (total === 0) return;

    const segments = [
      { value: selesai,    color: '#00ea7d' },
      { value: dikerjakan, color: '#67abff' },
      { value: todo,       color: '#f59e0b' },
      { value: terlewat,   color: '#ee0f38' },
    ];

    let startAngle = -Math.PI / 2;
    ctx.shadowBlur = 16;
    segments.forEach(seg => {
      if (seg.value === 0) return;
      const slice = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lw;
      ctx.lineCap = 'butt';
      ctx.stroke();
      startAngle += slice + 0.02;
    });
  }, [selesai, dikerjakan, todo, terlewat, total]);

  const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;

  return (
    <div className="tt-donut-wrap">
      <div className="tt-donut-canvas-wrap">
        <canvas ref={canvasRef} width={160} height={160} />
        <div className="tt-donut-center">
          <span className="tt-donut-pct">{pct}%</span>
          <span className="tt-donut-label">selesai</span>
        </div>
      </div>
      <div className="tt-donut-legend">
        {[
          { label: 'Selesai',    val: selesai,    color: '#00ea7d' },
          { label: 'Dikerjakan', val: dikerjakan, color: '#67abff' },
          { label: 'To Do',      val: todo,       color: '#f59e0b' },
          { label: 'Terlewat',   val: terlewat,   color: '#ee0f38' },
        ].map(({ label, val, color }) => (
          <div key={label} className="tt-legend-item">
            <span className="tt-legend-dot" style={{ background: color }} />
            <span>{label}</span>
            <span className="tt-legend-val">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// PROGRESS BAR 
const ProgressBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="tt-progress-row">
      <div className="tt-progress-header">
        <span>{label}</span>
        <span>{value}/{total}</span>
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

// WEEKLY BAR CHART — disesuaikan dengan TeamDashboard
const WeeklyChart = ({ tasks }) => {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const counts = Array(7).fill(0);
  const today = new Date();

  tasks.forEach(task => {
    if (task.status !== 'Selesai' || !task.updatedAt) return;
    const d = new Date(task.updatedAt);
    const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) counts[6 - diff]++;
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
                background: count > 0 ? '#00ea7d' : 'rgba(128,128,128,0.15)',
                boxShadow: count > 0 ? '0 0 8px #00ff8866' : 'none',
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

// MAIN COMPONENT
const ManagerDashboard = ({ user }) => {
  const { tasks, users } = useTasks();
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

  const deadlineSorted = tasks
    .filter(t => t.status !== 'Selesai' && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const getDeadlineBadge = (deadline) => {
    const diff = Math.ceil((new Date(deadline) - today) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return { label: 'Terlewat',          className: 'dl-badge dl-overdue' };
    if (diff <= 3) return { label: `${diff} hari lagi`, className: 'dl-badge dl-soon'    };
    return             { label: `${diff} hari lagi`,    className: 'dl-badge dl-ok'      };
  };

  return (
    <div className="dashboard-page">

      {/* BANNER + EXPORT BUTTON */}
      <div className="dashboard-banner-row">
        <DashboardBanner user={user} />
        <ExportPDF tasks={tasks} users={users} stats={stats} user={user} />
      </div>

      <div className="bento-grid-manager">

        {/* CARD 1 — Donut + Progress (2 col × 2 row) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bento-card bento-card-accent bento-col-span-2 bento-row-span-2"
        >
          <h3 className="stat-card-label">Ringkasan Proyek Tim</h3>
          <DonutChart
            selesai={stats.selesai}
            dikerjakan={stats.dikerjakan}
            todo={stats.todo}
            terlewat={stats.terlewat}
          />
          <div className="tt-progress-section">
            <ProgressBar label="Selesai"    value={stats.selesai}    total={stats.total} color="#00ea7d" />
            <ProgressBar label="Dikerjakan" value={stats.dikerjakan} total={stats.total} color="#67abff" />
            <ProgressBar label="To Do"      value={stats.todo}       total={stats.total} color="#f59e0b" />
            <ProgressBar label="Terlewat"   value={stats.terlewat}   total={stats.total} color="#ee0f38" />
          </div>
        </motion.div>

        {/* CARD 2 & 3 — Stat Cards */}
        <StatCard label="Selesai"    value={stats.selesai}    sub="↑ 1 dari minggu lalu" index={1} />
        <StatCard label="Dikerjakan" value={stats.dikerjakan} sub="Sedang berjalan"        index={2} />

        {/* CARD 4 — Deadline Terdekat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bento-card bento-col-span-2"
        >
          <h3 className="stat-card-label">Deadline Terdekat</h3>
          <div className="deadline-list">
            {deadlineSorted.length === 0 ? (
              <p className="tt-empty">Tidak ada deadline aktif.</p>
            ) : (
              deadlineSorted.map(task => {
                const badge = getDeadlineBadge(task.deadline);
                return (
                  <div key={task.id} className="deadline-item">
                    <span className="deadline-title">{task.title}</span>
                    <span className={badge.className}>{badge.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* CARD 5 — Grafik Mingguan */}
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

        {/* CARD 6 — Aktivitas Terbaru */}
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