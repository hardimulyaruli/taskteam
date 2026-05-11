import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, sub, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bento-card"
    >
      <h3 className="stat-card-label">{label}</h3>
      <div>
        <div className="stat-card-value">{value}</div>
        <p className="stat-card-sub">{sub}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
