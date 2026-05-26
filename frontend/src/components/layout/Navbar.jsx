import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiZap, FiHome, FiCheckSquare, FiUsers, FiInfo,
  FiChevronDown, FiUser, FiLogOut, FiBell, FiAlertCircle, FiClock, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import ThemeToggle from '../common/ThemeToggle';
import useClickOutside from '../../hooks/useClickOutside';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Layout.css';

const MENU_ITEMS = [
  { title: 'Dashboard', icon: FiHome,        path: '/dashboard', roles: ['admin', 'manager', 'team'] },
  { title: 'Tugas',     icon: FiCheckSquare, path: '/tasks',     roles: ['manager', 'team'] },
  { title: 'Users',     icon: FiUsers,       path: '/users',     roles: ['admin'] },
  { title: 'About Us',  icon: FiInfo,        path: '/about',     roles: ['admin', 'manager', 'team'] },
];

// ============================================
// NOTIF DROPDOWN
// ============================================
const NotifDropdown = ({ notifs, onClickNotif, onMarkAll }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    transition={{ duration: 0.15 }}
    className="notif-dropdown"
  >
    <div className="notif-dropdown-head">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="notif-dropdown-title">Notifikasi</span>
        {notifs.length > 0 && (
          <span className="notif-new-count">{notifs.length} baru</span>
        )}
      </div>
      {notifs.length > 0 && (
        <button onClick={onMarkAll} className="notif-mark-all">
          Tandai dibaca
        </button>
      )}
    </div>

    <div className="notif-list">
      {notifs.length === 0 ? (
        <div className="notif-empty">
          <FiCheck style={{ fontSize: '1.5rem', color: 'var(--status-green)', marginBottom: '6px' }} />
          <p>Semua tugas tepat waktu!</p>
        </div>
      ) : (
        notifs.map((n, i) => (
          <div
            key={i}
            className={`notif-item ${n.unread ? 'notif-item-unread' : ''}`}
            onClick={() => onClickNotif(n)}
          >
            <div className={`notif-icon-wrap notif-icon-${n.type}`}>
              {n.type === 'overdue' && <FiAlertCircle />}
              {n.type === 'soon'    && <FiClock />}
              {n.type === 'done'    && <FiCheck />}
            </div>
            <div className="notif-body">
              <p className="notif-title">{n.title}</p>
              <p className="notif-sub">{n.sub}</p>
              <span className="notif-time">{n.time}</span>
            </div>
            {n.unread && <div className="notif-unread-dot" />}
          </div>
        ))
      )}
    </div>

    <div className="notif-footer" onClick={() => onClickNotif({ path: '/tasks' })}>
      Lihat semua tugas →
    </div>
  </motion.div>
);

// ============================================
// MAIN NAVBAR
// ============================================
const Navbar = () => {
  const { user, logout } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [readNotifs, setReadNotifs]     = useState(false);

  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);

  const allowedMenus = MENU_ITEMS.filter(m => m.roles.includes(user?.role));

  useClickOutside(dropdownRef, () => setDropdownOpen(false));
  useClickOutside(notifRef,    () => setNotifOpen(false));

  const handleLogout  = () => { setDropdownOpen(false); logout(); };
  const handleProfile = () => { setDropdownOpen(false); navigate('/profile'); };

  // ── Build notifikasi dari tasks ──────────────────
  const today = new Date();

  const buildNotifs = () => {
    const list = [];
    tasks.forEach(t => {
      if (!t.deadline) return;
      const dl   = new Date(t.deadline);
      const diff = Math.ceil((dl - today) / (1000 * 60 * 60 * 24));

      if (t.status !== 'Selesai' && diff < 0) {
        list.push({
          type:   'overdue',
          title:  'Deadline terlewat!',
          sub:    `${t.title} sudah melewati deadline`,
          time:   `${Math.abs(diff)} hari lalu`,
          taskId: t.id,
          path:   '/tasks',
          unread: !readNotifs,
        });
      } else if (t.status !== 'Selesai' && diff <= 3 && diff >= 0) {
        list.push({
          type:   'soon',
          title:  diff === 0 ? 'Deadline hari ini!' : `H-${diff} deadline`,
          sub:    `${t.title} segera diselesaikan`,
          time:   diff === 0 ? 'Hari ini' : `${diff} hari lagi`,
          taskId: t.id,
          path:   '/tasks',
          unread: !readNotifs,
        });
      }
    });
    return list;
  };

  const notifs      = buildNotifs();
  const unreadCount = readNotifs ? 0 : notifs.length;

  const handleNotifClick = (n) => {
    setNotifOpen(false);
    setReadNotifs(true);
    if (n.taskId) {
      navigate(`/tasks?taskId=${n.taskId}`);
    } else {
      navigate('/tasks');
    }
  };

  const handleMarkAll = () => setReadNotifs(true);

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">

        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-box">
            <FiZap className="navbar-logo-icon icon-md" />
          </div>
          <span className="navbar-logo-text">TaskTeam</span>
        </div>

        {/* Center Navigation */}
        <div className="navbar-nav">
          {allowedMenus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `navbar-nav-link${isActive ? ' active' : ''}`}
            >
              <item.icon className="icon-sm" />
              {item.title}
            </NavLink>
          ))}
        </div>

        {/* Right Controls */}
        <div className="navbar-right">
          <ThemeToggle />

          {/* BELL NOTIFIKASI */}
          {(user?.role === 'manager' || user?.role === 'team') && (
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="notif-bell-btn"
                onClick={() => { setNotifOpen(v => !v); setDropdownOpen(false); }}
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notif-bell-badge">{unreadCount}</span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <NotifDropdown
                    notifs={notifs}
                    onClickNotif={handleNotifClick}
                    onMarkAll={handleMarkAll}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setDropdownOpen(v => !v); setNotifOpen(false); }}
              className="profile-btn"
            >
              <div className="profile-avatar-btn">
                {user?.name?.charAt(0)}
              </div>
              <span className="profile-btn-name">{user?.name?.split(' ')[0]}</span>
              <FiChevronDown className={`icon-sm profile-chevron${dropdownOpen ? ' open' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="dropdown-menu"
                >
                  <div className="dropdown-header">
                    <p className="dropdown-user-name">{user?.name}</p>
                    <p className="dropdown-user-role">{user?.role}</p>
                  </div>
                  <div className="dropdown-body">
                    <button onClick={handleProfile} className="dropdown-item">
                      <FiUser className="icon-sm" /> Profil Pribadi
                    </button>
                    <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                      <FiLogOut className="icon-sm" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;