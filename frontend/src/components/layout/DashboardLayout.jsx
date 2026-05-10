import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Layout.css';

const DashboardLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
