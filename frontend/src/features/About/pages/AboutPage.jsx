import React from 'react';
import { FiGithub } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AboutHero, TaskTeamInfoCard, TeamSection } from '../components/AboutComponents';
import '../../../styles/About.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <AboutHero />
      <TaskTeamInfoCard />
      <TeamSection />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="about-footer-card"
      >
        <h2 className="about-footer-title">Universitas Jenderal Achmad Yani</h2>
        <p className="about-footer-subtitle">
          Fakultas Sains dan Informatika &bull; Program Studi Teknik Informatika &bull; 2026
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://github.com/hardimulyaruli/taskteam"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <FiGithub /> Source Code Aplikasi
        </motion.a>
      </motion.div>
    </div>
  );
};

export default AboutPage;