import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import ProfileForm from '../components/ProfileForm';
import '../../../styles/Profile.css';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Profil Pengguna</h1>
        <p className="page-subtitle">Kelola informasi pribadi dan pengaturan keamanan akun Anda.</p>
      </div>

      <div className="profile-grid">
        <ProfileCard user={user} />
        <ProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage;
