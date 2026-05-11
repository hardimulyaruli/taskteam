import React from 'react';

const DashboardBanner = ({ user }) => {
  const hour = new Date().getHours();
  let greeting = 'Selamat malam';
  if (hour < 12) greeting = 'Selamat pagi';
  else if (hour < 15) greeting = 'Selamat siang';
  else if (hour < 18) greeting = 'Selamat sore';

  return (
    <div className="dashboard-banner">
      <h1 className="dashboard-greeting">
        {greeting}, {user?.name?.split(' ')[0]}
      </h1>
      <p className="dashboard-greeting-sub">
        Berikut adalah ringkasan aktivitas workspace Anda hari ini.
      </p>
    </div>
  );
};

export default DashboardBanner;
