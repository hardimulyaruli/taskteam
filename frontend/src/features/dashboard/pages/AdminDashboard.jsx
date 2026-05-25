import React from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../../../context/TaskContext';
import { useUsers } from '../../../context/UserContext';
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
const StatCard = ({ label, value, sub, index, accent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="bento-card"
      style={{ borderLeft: `3px solid ${accent}`, borderRadius: '0 1rem 1rem 0', justifyContent: 'flex-start' }}
    >
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value}</p>
      <p className="stat-card-sub">{sub}</p>
    </motion.div>
  );
};

// ============================================
// USER LIST
// ============================================
const UserList = ({ users }) => {
  const roleColor = {
    admin:   { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
    manager: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
    team:    { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa' },
  };

  if (!users || users.length === 0) {
    return <p className="activity-action">Belum ada data user.</p>;
  }

  return (
    <div className="tt-activity-list" style={{ maxHeight: '180px', overflowY: 'auto' }}>
      {users.map((u, i) => {
        const rc = roleColor[u.role] || roleColor.team;
        return (
          <motion.div
            key={u.id || i}
            className="tt-activity-row"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * i }}
          >
            <div
              className="tt-act-icon"
              style={{ background: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.85rem' }}
            >
              {u.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="tt-act-body">
              <span className="tt-act-title">{u.name}</span>
              <span className="tt-act-sub">@{u.username}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                borderRadius: '99px', background: rc.bg, color: rc.color,
                textTransform: 'capitalize',
              }}>
                {u.role}
              </span>
              <span style={{
                fontSize: '0.65rem', padding: '2px 8px', borderRadius: '99px',
                background: u.status === 'Aktif' ? 'rgba(74,222,128,0.12)' : 'rgba(128,128,128,0.12)',
                color: u.status === 'Aktif' ? '#4ade80' : '#94a3b8',
              }}>
                {u.status}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================
// RECENT ACTIVITIES
// ============================================
const RecentActivities = ({ activities }) => {
  const iconMap = {
    memperbarui:  { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa', symbol: '✎' },
    diselesaikan: { bg: 'rgba(74,222,128,0.15)',  color: '#4ade80', symbol: '✓' },
    ditambahkan:  { bg: 'rgba(248,113,113,0.15)', color: '#f87171', symbol: '+' },
  };

  if (!activities || activities.length === 0) {
    return <p className="activity-action">Belum ada aktivitas.</p>;
  }

  return (
    <div className="tt-activity-list" style={{ maxHeight: '180px', overflowY: 'auto' }}>
      {activities.map((act, i) => {
        const icon = iconMap[act.action] || iconMap['memperbarui'];
        return (
          <motion.div
            key={act.id || i}
            className="tt-activity-row"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * i }}
          >
            <div className="tt-act-icon" style={{ background: icon.bg, color: icon.color }}>
              {icon.symbol}
            </div>
            <div className="tt-act-body">
              <span className="tt-act-title">{act.target}</span>
              <span className="tt-act-sub">
                <strong>{act.user}</strong> · {act.action} · {act.time}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const AdminDashboard = ({ user }) => {
  const { activities } = useTasks();
  const { users } = useUsers();

  const totalUsers   = users.length;
  const totalAktif   = users.filter(u => u.status === 'Aktif').length;
  const totalManager = users.filter(u => u.role === 'manager').length;
  const totalTeam    = users.filter(u => u.role === 'team').length;

  return (
    <div className="dashboard-page">
      <DashboardBanner user={user} />

      <div className="bento-grid-admin">

        {/* CARD 1–4: Stat Cards */}
        <StatCard
          label="Total User"
          value={totalUsers}
          sub="terdaftar di sistem"
          accent="var(--accent-blue)"
          index={1}
        />
        <StatCard
          label="User Aktif"
          value={totalAktif}
          sub="sedang aktif"
          accent="#4ade80"
          index={2}
        />
        <StatCard
          label="Manager"
          value={totalManager}
          sub="role manager"
          accent="#fbbf24"
          index={3}
        />
        <StatCard
          label="Team"
          value={totalTeam}
          sub="role team"
          accent="#60a5fa"
          index={4}
        />

        {/* CARD 5: Daftar User */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bento-card bento-col-span-2"
          style={{ justifyContent: 'flex-start' }}
        >
          <h3 className="stat-card-label">Daftar User</h3>
          <UserList users={users} />
        </motion.div>

        {/* CARD 6: Aktivitas Terbaru */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bento-card bento-col-span-2"
          style={{ justifyContent: 'flex-start' }}
        >
          <h3 className="stat-card-label">⚡ Aktivitas Terbaru</h3>
          <RecentActivities activities={activities} />
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;