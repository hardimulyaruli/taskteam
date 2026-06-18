import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardBanner from '../components/DashboardBanner';
import StatCard from '../components/StatCard';
import { useTasks } from '../../../context/TaskContext';
import '../../../styles/Dashboard.css';

// DONUT CHART
const DonutChart = ({ selesai, dikerjakan, todo }) => {
  const canvasRef = useRef(null);
  const total = selesai + dikerjakan + todo;

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
      { value: todo,       color: '#ee0f38' },
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
  }, [selesai, dikerjakan, todo, total]);

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
        <div className="tt-legend-item">
          <span className="tt-legend-dot" style={{ background: '#00ea7d' }} />
          <span>Selesai</span>
          <span className="tt-legend-val">{selesai}</span>
        </div>
        <div className="tt-legend-item">
          <span className="tt-legend-dot" style={{ background: '#67abff' }} />
          <span>Dikerjakan</span>
          <span className="tt-legend-val">{dikerjakan}</span>
        </div>
        <div className="tt-legend-item">
          <span className="tt-legend-dot" style={{ background: '#ee0f38' }} />
          <span>To Do</span>
          <span className="tt-legend-val">{todo}</span>
        </div>
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

// WEEKLY BAR CHART
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

// ACTIVITY FEED
const ActivityFeed = ({ activities }) => {
  const iconMap = {
    memperbarui:  { bg: 'rgba(56,191,255,0.15)',  color: '#67abff', symbol: '✎' },
    diselesaikan: { bg: 'rgba(0,255,136,0.15)',   color: '#00ea7d', symbol: '✓' },
    ditambahkan:  { bg: 'rgba(255,77,109,0.15)',  color: '#ee0f38', symbol: '+' },
  };

  if (!activities || activities.length === 0) {
    return <p className="tt-empty">Belum ada aktivitas.</p>;
  }

  return (
    <div className="tt-activity-list">
      {activities.slice(0, 4).map((act, i) => {
        const icon = iconMap[act.action] || iconMap['memperbarui'];
        return (
          <motion.div
            key={act.id || i}
            className="tt-activity-row"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="tt-act-icon" style={{ background: icon.bg, color: icon.color }}>
              {icon.symbol}
            </div>
            <div className="tt-act-body">
              <span className="tt-act-title">{act.target}</span>
              <span className="tt-act-sub">{act.action} · {act.time}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// MAIN COMPONENT
const TeamDashboard = ({ user }) => {
  const { tasks, activities } = useTasks();
  const today = new Date();

  const myTasks = tasks.filter(
    t => {
      const assignees = String(t.assignee || '').split(',').map(s => s.trim().toLowerCase());
      return assignees.includes(user.username.toLowerCase()) || assignees.includes('team');
    }
  );

  const overdueTasks = myTasks.filter(t =>
    t.status !== 'Selesai' && t.deadline && new Date(t.deadline) < today
  );
  const overdueIds = new Set(overdueTasks.map(t => t.id));
  const activeTasks = myTasks.filter(t => !overdueIds.has(t.id));

  const stats = {
    total:      activeTasks.length,
    selesai:    activeTasks.filter(t => t.status === 'Selesai').length,
    dikerjakan: activeTasks.filter(t => t.status === 'Dikerjakan').length,
    todo:       activeTasks.filter(t => t.status === 'To Do').length,
  };

  const urgentTasks = activeTasks.filter(t => t.status !== 'Selesai').slice(0, 3);

  return (
    <div className="dashboard-page">
      <DashboardBanner user={user} />

      <div className="bento-grid-admin">

        {/* CARD 1 — Produktivitas Pribadi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bento-card bento-card-accent bento-col-span-2 bento-row-span-2"
        >
          <h3 className="stat-card-label">Produktivitas Pribadi</h3>
          <DonutChart
            selesai={stats.selesai}
            dikerjakan={stats.dikerjakan}
            todo={stats.todo}
          />
          <div className="tt-progress-section">
            <ProgressBar label="Selesai"    value={stats.selesai}    total={stats.total} color="#00ea7d" />
            <ProgressBar label="Dikerjakan" value={stats.dikerjakan} total={stats.total} color="#67abff" />
            <ProgressBar label="To Do"      value={stats.todo}       total={stats.total} color="#ee0f38" />
          </div>
        </motion.div>

        {/* CARD 2 & 3 — StatCard */}
        <StatCard label="Dikerjakan" value={stats.dikerjakan} sub="Sedang berjalan" index={1} />
        <StatCard label="To Do"      value={stats.todo}       sub="Belum dimulai"   index={2} />

        {/* CARD 4 — Tugas Prioritas */}
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
            ) : (
              urgentTasks.map(task => (
                <div key={task.id} className="deadline-item">
                  <span className="deadline-title">{task.title}</span>
                  <span className={`deadline-date tt-status-badge tt-status-${task.status?.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* CARD 5 — Aktivitas Terbaru */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bento-card bento-col-span-2"
        >
          <h3 className="stat-card-label">Aktivitas Terbaru</h3>
          <ActivityFeed activities={activities} />
        </motion.div>

        {/* CARD 6 — Grafik Mingguan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bento-card bento-col-span-2"
        >
          <div className="tt-week-header">
            <h3 className="stat-card-label">Selesai Minggu Ini</h3>
            <div>
              <span className="tt-week-count">{stats.selesai}</span>
              <span className="stat-card-sub" style={{ fontSize: '0.7rem', marginLeft: '4px' }}>tugas</span>
            </div>
          </div>
          <WeeklyChart tasks={myTasks} />
        </motion.div>

      </div>
    </div>
  );
};

export default TeamDashboard;