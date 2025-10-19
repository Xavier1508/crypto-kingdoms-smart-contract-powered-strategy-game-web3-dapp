import React from 'react';
import GameMap from '../components/GameMap';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';

const InGamePage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/game');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="w-full h-screen bg-[#1f2937] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <div className="w-full bg-[#1a2332] border-b border-[#4b5563] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-['Cinzel'] text-2xl font-bold text-[#d4af37]">Crypto Kingdoms</h1>
          <span className="text-sm text-[#9ca3af]">Solo Conquest Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToHome}
            className="px-4 py-2 bg-[#1f2937] hover:bg-[#2a3a4a] border border-[#4b5563] rounded-md flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/50 hover:border-red-500 text-red-500 hover:text-white rounded-md flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Game Content Area */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center mb-4">
            <h2 className="font-['Cinzel'] text-3xl font-bold text-[#d4af37] mb-2">Game Map</h2>
            <p className="text-[#9ca3af]">Your strategic battlefield awaits</p>
          </div>
          
          <div className="border-4 border-[#4b5563] rounded-lg overflow-hidden shadow-[0_8px_32px_-8px_rgba(17,17,26,0.5)]">
            <GameMap />
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-[#9ca3af] mb-2">
              Use this map to plan your conquests and manage your territories
            </p>
            <div className="flex gap-4 justify-center text-xs text-[#9ca3af]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded" />
                <span>Grassland</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded" />
                <span>Mountain/Wall</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InGamePage;
