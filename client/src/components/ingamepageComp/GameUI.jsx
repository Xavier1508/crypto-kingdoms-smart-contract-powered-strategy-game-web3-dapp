import React from 'react';
import { Map as MapIcon, Users, Home, LogOut, XCircle, Shield, Sword } from 'lucide-react';

const GameUI = ({ worldInfo, selectedTile, onBack, onLogout, onCloseTileInfo }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
      
      {/* --- TOP HUD (HEADER) --- */}
      <header className="pointer-events-auto bg-[#1f2937]/90 backdrop-blur border-b border-[#4b5563] px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-[#d4af37]/10 p-2 rounded-lg border border-[#d4af37]/30">
            <MapIcon className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div>
            <h1 className="font-['Cinzel'] text-xl font-bold text-[#d4af37] tracking-wider">
              {worldInfo ? `WORLD #${worldInfo.worldId}` : 'LOADING REALM...'}
            </h1>
            <div className="flex items-center gap-3 text-xs text-[#9ca3af]">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3"/> {worldInfo?.online || 0} Commanders Online
              </span>
              <span className="text-green-500 flex items-center gap-1">• Season Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[#374151] hover:bg-[#4b5563] text-white text-sm rounded transition-colors flex items-center gap-2 font-bold"
          >
            <Home className="w-4 h-4" /> LOBBY
          </button>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 text-sm rounded transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- BOTTOM PANEL (TILE INFO) --- */}
      {selectedTile && (
        <div className="pointer-events-auto bg-[#1f2937]/95 border-t border-[#d4af37]/50 p-6 animate-in slide-in-from-bottom-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex items-start justify-between">
            
            {/* Kiri: Info Tile */}
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center text-3xl shadow-lg
                ${selectedTile.type === 1 ? 'bg-green-600 border-green-400' : 
                  selectedTile.type === 4 ? 'bg-gray-700 border-gray-500' :
                  selectedTile.type === 9 ? 'bg-yellow-900 border-yellow-500' : 'bg-slate-800 border-slate-600'}`}
              >
                {selectedTile.type === 1 && '🌿'}
                {selectedTile.type === 2 && '🌲'}
                {selectedTile.type === 3 && '⚔️'}
                {selectedTile.type === 4 && '🏔️'}
                {selectedTile.type >= 5 && selectedTile.type <= 7 && '⛩️'}
                {selectedTile.type === 8 && '🔮'}
                {selectedTile.type === 9 && '👑'}
              </div>

              <div>
                <h3 className="text-[#d4af37] font-['Cinzel'] text-2xl font-bold mb-1">
                  {selectedTile.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3">Coordinate: X {selectedTile.x} | Y {selectedTile.y}</p>
                
                <div className="flex items-center gap-4">
                   {selectedTile.province && (
                     <span className="px-3 py-1 bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs rounded flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Province {selectedTile.province.id} ({selectedTile.province.layer})
                     </span>
                   )}
                   {selectedTile.isClaimable && (
                     <span className="px-3 py-1 bg-green-900/30 border border-green-500/30 text-green-400 text-xs rounded">
                        Available to Conquer
                     </span>
                   )}
                </div>
              </div>
            </div>

            {/* Kanan: Action Buttons */}
            <div className="flex items-center gap-3 h-full pt-2">
               {selectedTile.isClaimable ? (
                 <button className="px-8 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold rounded shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center gap-2">
                    <Sword className="w-5 h-5" /> MARCH TROOPS
                 </button>
               ) : (
                 <div className="text-gray-500 italic text-sm px-4">Cannot interact</div>
               )}
               
               <button onClick={onCloseTileInfo} className="p-2 hover:bg-white/10 rounded-full transition-colors ml-4">
                  <XCircle className="w-8 h-8 text-gray-500 hover:text-white" />
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;