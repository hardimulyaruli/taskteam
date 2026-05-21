import React from 'react';
import { motion } from 'framer-motion';

const ProfileCard = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="profile-summary-card"
    >
      <div className="profile-avatar-wrapper">
        <div className="profile-avatar">
          {user?.name?.charAt(0)}
        </div>
        <h3 className="profile-name">{user?.name}</h3>
        <p className="profile-username">@{user?.username}</p>
        <span className="profile-role-badge">{user?.role}</span>
      </div>
      <div className="profile-joined">Bergabung sejak 2026</div>
    </motion.div>
  );
};

export default ProfileCard;
