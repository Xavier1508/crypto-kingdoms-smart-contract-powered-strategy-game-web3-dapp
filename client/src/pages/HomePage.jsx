// client/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../components/homepageComp/ProfileSidebar';
import MainActionHub from '../components/homepageComp/MainActionHub';
import SocialEventSidebar from '../components/homepageComp/SocialEventSidebar';

const HomePage = () => {
  const navigate = useNavigate();
  
  // STATE DATA USER
  const [userData, setUserData] = useState(null);
  const [activeWorlds, setActiveWorlds] = useState([]);
  const [selectedWorldId, setSelectedWorldId] = useState(null); // ID World yang sedang dilihat infonya
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA USER & WORLD STATS
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}/profile`);
        const data = await res.json();

        if (res.ok) {
          setUserData(data.user);
          setActiveWorlds(data.activeWorlds);
          
          // Default pilih world pertama jika ada
          if (data.activeWorlds.length > 0) {
            setSelectedWorldId(data.activeWorlds[0].worldId);
          }
        } else {
          console.error("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    // Opsional: Polling data setiap 10 detik agar resource nambah realtime di homepage
    const interval = setInterval(fetchUserData, 10000); 
    return () => clearInterval(interval);

  }, [navigate]);

  const handleStartConquest = () => {
    // Jika user punya world aktif, masuk ke yang dipilih
    // Jika tidak, buka lobby (handled inside component)
    if (selectedWorldId) {
      localStorage.setItem('currentWorldId', selectedWorldId);
      navigate('/ingame');
    } else {
      // Trigger open lobby logic via MainActionHub button
      console.log("No active world selected, open lobby manually");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
  };

  const currentWorldStats = activeWorlds.find(w => w.worldId === selectedWorldId);

  if (loading) return <div className="min-h-screen bg-[#1a2332] flex items-center justify-center text-[#d4af37] font-bold">Loading Empire Data...</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a2332] to-[#1f2937] text-[#e0e0e0] font-['Inter']">
      <div className="flex h-screen overflow-hidden">
        <ProfileSidebar 
          user={userData}
          activeWorlds={activeWorlds}
          selectedWorldId={selectedWorldId}
          onSelectWorld={setSelectedWorldId}
          currentStats={currentWorldStats}
          handleLogout={handleLogout} 
        />

        {/* COMPONENT TENGAH: Pass Username */}
        <MainActionHub 
          username={userData?.username}
          handleStartConquest={handleStartConquest} 
        />

        {/* COMPONENT KANAN: Tetap sama */}
        <SocialEventSidebar />

      </div>
    </div>
  );
};

export default HomePage;