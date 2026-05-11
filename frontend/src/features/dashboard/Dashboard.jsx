import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard';
import TeamDashboard from './pages/TeamDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Switch based on user role to render different context components
  if (user?.role === 'admin') {
    return <AdminDashboard user={user} />;
  }
  
  if (user?.role === 'manager') {
    return <ManagerDashboard user={user} />;
  }
  
  if (user?.role === 'team') {
    return <TeamDashboard user={user} />;
  }

  // Fallback just in case
  return (
    <div className="text-white p-8">
      <h1>Dashboard (No specific role detected)</h1>
    </div>
  );
};

export default Dashboard;
