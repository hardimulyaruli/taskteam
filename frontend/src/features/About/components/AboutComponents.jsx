import React from 'react';
import { FiUsers, FiLayout, FiPieChart, FiUserCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const team = [
  { name: 'Rakhafi Surya Permana', nim: '2250081142', role: 'Fullstack Developer', img: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rakhafi&backgroundColor=2f81f7&facialHairChance=100' },
  { name: 'Muhammad Hanif N',      nim: '2350081125', role: 'Backend Developer',   img: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Hanif123&backgroundColor=2f81f7&facialHairChance=100' },
  { name: 'Veliana Alifah N',       nim: '2350081127', role: 'Frontend Developer',  img: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia&backgroundColor=2f81f7&facialHairChance=0' },
  { name: 'Selvi Liana Putri H',   nim: '2350081137', role: 'Backend Developer',      img: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Lily&backgroundColor=2f81f7&facialHairChance=0' },
  { name: 'Ruli Hardimulya',       nim: '2350081141', role: 'Frontend Developer',      img: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ruli999&backgroundColor=2f81f7&facialHairChance=100' },
];

const features = [
  {
    icon: FiLayout,
    title: 'Kanban Board',
    desc: 'Kelola tugas dengan tampilan board interaktif per status.',
  },
  {
    icon: FiPieChart,
    title: 'Dashboard Produktivitas',
    desc: 'Pantau progres tim secara real-time dengan visualisasi data.',
  },
  {
    icon: FiUserCheck,
    title: 'Manajemen User',
    desc: 'Atur hak akses dan role anggota tim dengan mudah.',
  },
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
  </motion.div>
);

const TaskTeamInfoCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="about-info-card"
  >
    <div className="about-info-header">
      <div className="about-info-logo">⚡</div>
      <div>
        <h2 className="about-info-title">TaskTeam</h2>
        <p className="about-info-version">v1.0.0 · Tugas Besar Teknologi Web</p>
      </div>
    </div>
    <p className="about-info-desc">
      TaskTeam adalah aplikasi manajemen tugas tim berbasis web yang dirancang untuk memudahkan
      koordinasi antar anggota tim. Dengan fitur kanban board, dashboard produktivitas, dan
      manajemen user, TaskTeam membantu tim bekerja lebih terorganisir dan efisien.
    </p>
    <div className="about-features-grid">
      {features.map((f, i) => (
        <div key={i} className="about-feature-item">
          <div className="about-feature-icon">
            <f.icon size={16} />
          </div>
          <h3 className="about-feature-title">{f.title}</h3>
          <p className="about-feature-desc">{f.desc}</p>
        </div>
      ))}
    </div>
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

export { AboutHero, TaskTeamInfoCard, TeamSection, TeamMemberCard };