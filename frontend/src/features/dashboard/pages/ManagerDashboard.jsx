import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardBanner from '../components/DashboardBanner';
import StatCard from '../components/StatCard';
import RecentActivities from '../components/RecentActivities';
import { useTasks } from '../../../context/TaskContext';
import '../../../styles/Dashboard.css';

// ============================================
// DONUT CHART
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
        {[
          { label: 'Selesai',    val: selesai,    color: '#4ade80' },
          { label: 'Dikerjakan', val: dikerjakan, color: '#60a5fa' },
          { label: 'To Do',      val: todo,       color: '#f59e0b' },
          { label: 'Terlewat',   val: terlewat,   color: '#f87171' },
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
// TOP ASSIGNEE
// ============================================
const TopAssignee = ({ tasks }) => {
  const map = {};
  tasks.forEach(t => {
    if (t.status !== 'Selesai') return;
    const name = t.assignedTo || t.assignee || t.member || 'Unknown';
    map[name] = (map[name] || 0) + 1;
  });

  const list = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const max = list[0]?.[1] || 1;

  const getInitials = (name) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = ['#6366f1', '#f59e0b', '#10b981'];

  return (
    <div className="mgr-assignee-list">
      {list.length === 0 ? (
        <p className="tt-empty">Belum ada tugas selesai.</p>
      ) : (
        list.map(([name, count], i) => (
          <div key={name} className="mgr-assignee-row">
            <div
              className="mgr-assignee-avatar"
              style={{ background: avatarColors[i % avatarColors.length] }}
            >
              {getInitials(name)}
            </div>
            <div className="mgr-assignee-body">
              <div className="mgr-assignee-name">{name}</div>
              <div className="mgr-assignee-sub">{count} tugas selesai</div>
              <div className="mgr-assignee-bar-track">
                <motion.div
                  className="mgr-assignee-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((count / max) * 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  style={{ background: avatarColors[i % avatarColors.length] }}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const ManagerDashboard = ({ user }) => {
  const { tasks } = useTasks();
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

  const pct = (n) => `${Math.round((n / stats.total) * 100) || 0}%`;

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
      <DashboardBanner user={user} />

      <div className="bento-grid-manager">

        {/* CARD 1 — Donut + Progress (2 col × 2 row) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bento-card bento-col-span-2 bento-row-span-2"
        >
          <h3 className="stat-card-label">Ringkasan Proyek Tim</h3>
          <DonutChart
            selesai={stats.selesai}
            dikerjakan={stats.dikerjakan}
            todo={stats.todo}
            terlewat={stats.terlewat}
          />
          <div className="progress-section">
            {[
              { label: 'Selesai',    count: stats.selesai,    fillClass: 'progress-fill-green'  },
              { label: 'Dikerjakan', count: stats.dikerjakan, fillClass: 'progress-fill-orange' },
              { label: 'To Do',      count: stats.todo,       fillClass: 'progress-fill-muted'  },
              { label: 'Terlewat',   count: stats.terlewat,   fillClass: 'progress-fill-red'    },
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

        {/* CARD 2 — Stat: Selesai */}
        <StatCard label="Selesai"    value={stats.selesai}    sub="↑ 1 dari minggu lalu" index={1} />

        {/* CARD 3 — Stat: Dikerjakan */}
        <StatCard label="Dikerjakan" value={stats.dikerjakan} sub="Sedang berjalan"        index={2} />

        {/* CARD 4 — Deadline Terdekat (2 col) */}
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

        {/* CARD 5 — Top Assignee (2 col) */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bento-card bento-col-span-2"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <h3 className="stat-card-label" style={{ marginBottom: 0 }}>Top Assignee Minggu Ini</h3>
            <span className="mgr-badge-new">BARU</span>
          </div>
          <TopAssignee tasks={tasks} />
        </motion.div>

        {/* CARD 6 — Grafik Mingguan (2 col) */}
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

        {/* CARD 7 — Aktivitas Terbaru (4 col) */}
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