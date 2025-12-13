import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../components/homepageComp/ProfileSidebar';
import MainActionHub from '../components/homepageComp/MainActionHub';
import SocialEventSidebar from '../components/homepageComp/SocialEventSidebar';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartConquest = () => {
    console.log("Entering Global Dominion...");
    navigate('/ingame'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a2332] to-[#1f2937] text-[#e0e0e0] font-['Inter']">
      <div className="flex h-screen overflow-hidden">
        
        {/* Component Kiri: Profil & Resources */}
        <ProfileSidebar handleLogout={handleLogout} />

        {/* Component Tengah: Game Modes & Welcome */}
        <MainActionHub handleStartConquest={handleStartConquest} />

        {/* Component Kanan: Chat & Events */}
        <SocialEventSidebar />

      </div>
    </div>
  );
};

export default HomePage;