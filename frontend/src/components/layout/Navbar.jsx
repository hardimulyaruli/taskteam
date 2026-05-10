import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiZap, FiHome, FiCheckSquare, FiUsers, FiInfo,
  FiChevronDown, FiUser, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import useClickOutside from '../../hooks/useClickOutside';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Layout.css';

const MENU_ITEMS = [
  { title: 'Dashboard', icon: FiHome, path: '/dashboard', roles: ['admin', 'manager', 'team'] },
  { title: 'Tugas', icon: FiCheckSquare, path: '/tasks', roles: ['admin', 'manager', 'team'] },
  { title: 'Users', icon: FiUsers, path: '/users', roles: ['admin'] },
  { title: 'About Us', icon: FiInfo, path: '/about', roles: ['admin', 'manager', 'team'] },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const allowedMenus = MENU_ITEMS.filter(m => m.roles.includes(user?.role));

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  const handleLogout = () => { setDropdownOpen(false); logout(); };
  const handleProfile = () => { setDropdownOpen(false); navigate('/profile'); };

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

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
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
