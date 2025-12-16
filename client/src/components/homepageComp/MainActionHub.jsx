// client/src/components/homepageComp/MainActionHub.jsx
import React, { useState } from 'react';
import { Crown, Castle, Globe, ChevronRight } from 'lucide-react';
import ServerLobbyModal from './ServerLobbyModal';

const MainActionHub = ({ username }) => { 
  const [isLobbyOpen, setIsLobbyOpen] = useState(false);

  const handleOpenLobby = () => {
    setIsLobbyOpen(true);
  };

  return (
    <>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 
              className="font-['Cinzel'] text-5xl font-black mb-3 text-[#d4af37] uppercase tracking-widest"
              style={{ textShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }} 
            >
              WELCOME, {username || "COMMANDER"}
            </h1>
            <p className="text-[#9ca3af] text-lg">Your kingdom awaits. Choose your path to glory.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Solo Conquest */}
            <div className="p-8 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-gradient-to-br from-[#1f2937]/60 to-[#1f2937]/40 border border-[#4b5563]/30 relative overflow-hidden opacity-75">
               <div className="absolute inset-0 bg-gradient-to-br from-[#1f2937] to-transparent opacity-50" />
              <div className="relative flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-[#1f2937] border border-[#4b5563]">
                  <Castle className="w-12 h-12 text-[#9ca3af]" />
                </div>
                <div>
                  <h2 className="font-['Cinzel'] text-2xl font-bold mb-2 text-[#9ca3af] uppercase tracking-wider">Solo Conquest</h2>
                  <p className="text-sm text-[#9ca3af] leading-relaxed">Battle AI warlords in single player mode.</p>
                </div>
                <button disabled className="w-full bg-[#1f2937] border border-[#4b5563] text-[#9ca3af] font-bold text-lg py-6 cursor-not-allowed rounded-md">
                  COMING SOON
                </button>
              </div>
            </div>

            {/* Multiplayer Mode */}
            <div 
              className="group p-8 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-gradient-to-br from-[#1f2937] to-[#1f2937]/80 border border-[#00d4ff]/50 hover:border-[#00d4ff] transition-all duration-300 cursor-pointer hover:scale-105" 
              onClick={handleOpenLobby} 
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-[#00d4ff]/10 group-hover:shadow-[0_0_40px_rgba(0,212,255,0.3)] transition-all">
                  <Globe className="w-12 h-12 text-[#00d4ff]" />
                </div>
                <div>
                  <h2 className="font-['Cinzel'] text-2xl font-bold mb-2 text-[#00d4ff] uppercase tracking-wider">Global Dominion</h2>
                  <p className="text-sm text-[#9ca3af] leading-relaxed">Enter the global map, forge alliances, and conquer territories.</p>
                </div>
                <button className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-[#1f2937] font-bold text-lg py-6 rounded-md hover:shadow-[0_0_40px_rgba(0,212,255,0.3)] transition-all shadow-lg flex items-center justify-center gap-2">
                  ENTER WORLD
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

           <div className="p-6 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937]/40 border border-[#4b5563]/30">
             <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[#d4af37]/20">
                <Crown className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Cinzel'] font-bold text-[#d4af37] mb-2 uppercase tracking-wider">Your Path to Dominion</h3>
                <p className="text-sm text-[#9ca3af] leading-relaxed">
                  Prepare for battle. Select a realm carefully. Once inside, you must expand quickly before the season ends.
                </p>
              </div>
            </div>
           </div>

        </div>
      </main>

      <ServerLobbyModal isOpen={isLobbyOpen} onClose={() => setIsLobbyOpen(false)} />
    </>
  );
};

export default MainActionHub;