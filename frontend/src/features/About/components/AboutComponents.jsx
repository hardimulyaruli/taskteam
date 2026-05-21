import React from 'react';
import { FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

const team = [
  { name: 'Rakhafi Surya Permana', nim: '2250081142', role: 'Fullstack Developer', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rakhafi&backgroundColor=2f81f7' },
  { name: 'Muhammad Hanif N', nim: '2350081125', role: 'Backend Developer', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hanif&backgroundColor=2f81f7' },
  { name: 'Veliana Alifa N', nim: '2350081127', role: 'Frontend Developer', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Veliana&backgroundColor=2f81f7' },
  { name: 'Selvi Liana Putri H', nim: '2350081137', role: 'UI/UX Designer', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Selvi&backgroundColor=2f81f7' },
  { name: 'Ruli Hardimulya', nim: '2350081141', role: 'System Analyst', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruli&backgroundColor=2f81f7' }
];

const TeamMemberCard = ({ member, index }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05, rotate: 1 }}
      className="team-member-card"
    >
      <img src={member.img} alt={member.name} className="team-member-avatar" />
      <div>
        <h3 className="team-member-name">{member.name}</h3>
        <p className="team-member-nim">{member.nim}</p>
        <p className="team-member-role">{member.role}</p>
      </div>
    </motion.div>
  );
};

const AboutHero = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="about-hero"
  >
    <div className="about-logo-box">
      <FiUsers className="icon-lg" />
    </div>
    <h1 className="about-title">Tentang TaskTeam</h1>
    <p className="about-subtitle">
      TaskTeam adalah platform manajemen tugas kolaboratif yang dirancang khusus untuk
      mempermudah pendelegasian, pemantauan tenggat waktu, dan sinkronisasi pekerjaan
      di dalam tim secara real-time.
    </p>
  </motion.div>
);

const TeamSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="mb-12">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        className="about-section-title"
      >
        Tim Pengembang (Kelompok 3 DSE-C)
      </motion.h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className="team-grid"
      >
        {team.map((member, idx) => (
          <TeamMemberCard key={idx} member={member} index={idx} />
        ))}
      </motion.div>
    </div>
  );
};

export { AboutHero, TeamSection, TeamMemberCard };
