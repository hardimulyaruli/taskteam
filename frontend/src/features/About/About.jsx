import React from 'react';
import { FiUsers, FiGithub, FiLayout, FiPieChart, FiUserCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const About = () => {
  const team = [
    { name: 'Rakhafi Surya Permana', nim: '2250081142', role: 'Fullstack Developer', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rakhafi&backgroundColor=2f81f7' },
    { name: 'Muhammad Hanif N',      nim: '2350081125', role: 'Backend Developer',   img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hanif&backgroundColor=2f81f7' },
    { name: 'Veliana Alifa N',        nim: '2350081127', role: 'Frontend Developer',  img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Veliana&backgroundColor=2f81f7' },
    { name: 'Selvi Liana Putri H',    nim: '2350081137', role: 'UI/UX Designer',      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Selvi&backgroundColor=2f81f7' },
    { name: 'Ruli Hardimulya',        nim: '2350081141', role: 'System Analyst',      img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruli&backgroundColor=2f81f7' },
  ];

  const features = [
    {
      icon: FiLayout,
      title: 'Kanban Board',
      desc: 'Kelola tugas dengan tampilan board interaktif per status — To Do, Dikerjakan, hingga Selesai.',
    },
    {
      icon: FiPieChart,
      title: 'Dashboard Produktivitas',
      desc: 'Pantau progres tim secara real-time dengan visualisasi donut chart dan grafik mingguan.',
    },
    {
      icon: FiUserCheck,
      title: 'Manajemen User',
      desc: 'Atur hak akses dan role anggota tim — Admin, Manager, dan Team — dengan mudah.',
    },
  ];

  const techStack = [
    { label: 'React',       icon: '⚛️' },
    { label: 'Vite',        icon: '⚡' },
    { label: 'Node.js',     icon: '🟢' },
    { label: 'Express.js',  icon: '🚀' },
    { label: 'MySQL',       icon: '🗄️' },
    { label: 'Tailwind CSS',icon: '🎨' },
    { label: 'Framer Motion', icon: '🎞️' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="pb-10 max-w-4xl mx-auto overflow-hidden">

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 mt-8"
      >
        <div className="w-16 h-16 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-neumorph)]">
          <FiUsers className="w-8 h-8 text-[var(--accent-blue)]" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-heading)] mb-3">Tentang TaskTeam</h1>
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
          TaskTeam adalah platform manajemen tugas kolaboratif yang dirancang khusus untuk mempermudah pendelegasian, pemantauan tenggat waktu, dan sinkronisasi pekerjaan di dalam tim secara real-time.
        </p>
      </motion.div>

      {/* FITUR UTAMA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4 border-b border-[var(--border-color)] pb-2">
          Fitur Utama
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center">
                <f.icon className="text-[var(--accent-blue)]" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-heading)] mb-1">{f.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* TIM PENGEMBANG */}
      <div className="mb-10">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-lg font-semibold text-[var(--text-heading)] mb-6 border-b border-[var(--border-color)] pb-2"
        >
          Tim Pengembang (Kelompok 3 DSE-C)
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {team.map((member, idx) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotate: 1 }}
              key={idx}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center gap-4 shadow-sm hover:shadow-[var(--shadow-neumorph)] cursor-pointer transition-shadow"
            >
              <img src={member.img} alt={member.name} className="w-14 h-14 rounded-full bg-[var(--bg-hover)]" />
              <div>
                <h3 className="text-[var(--text-heading)] font-medium text-sm">{member.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{member.nim}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--accent-blue)] font-bold mt-1.5">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* TECH STACK */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-4 border-b border-[var(--border-color)] pb-2">
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-3">
          {techStack.map((t, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)]"
            >
              <span>{t.icon}</span> {t.label}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* FOOTER CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-2xl text-center bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-main)] border border-[var(--border-color)] shadow-sm relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent-blue)] opacity-5 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-2">Universitas Jenderal Achmad Yani</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Fakultas Sains dan Informatika • Program Studi Teknik Informatika • 2026
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 btn-secondary"
        >
          <FiGithub /> Source Code Aplikasi
        </motion.a>
      </motion.div>

    </div>
  );
};

export default About;