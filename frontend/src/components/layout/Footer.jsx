import React from 'react';
import { FiHeart } from 'react-icons/fi';
import '../../styles/Layout.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} TaskTeam. Dibangun dengan{' '}
          <FiHeart className="icon-sm footer-heart" /> oleh Kelompok 3 DSE-C.
        </div>
        <div className="footer-univ">
          Universitas Jenderal Achmad Yani
        </div>
      </div>
    </footer>
  );
};

export default Footer;
