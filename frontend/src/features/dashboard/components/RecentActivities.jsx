import React from 'react';
import { FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTasks } from '../../../context/TaskContext';

const RecentActivities = () => {
  const { activities } = useTasks();

  return (
    <div className="bento-card-large">
      <div className="activity-feed-title">
        <FiActivity /> Aktivitas Terbaru
      </div>

      <div className="activity-feed-list">
        {activities.length === 0 ? (
          <p className="activity-action">Belum ada aktivitas.</p>
        ) : (
          activities.map((act, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={act.id}
              className="activity-feed-item"
            >
              <div className="activity-dot" />
              <p className="activity-text">
                <span className="activity-actor">{act.user}</span>{' '}
                <span className="activity-action">{act.action}</span>{' '}
                <span className="activity-target">{act.target}</span>
              </p>
              <span className="activity-time">{act.time}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
