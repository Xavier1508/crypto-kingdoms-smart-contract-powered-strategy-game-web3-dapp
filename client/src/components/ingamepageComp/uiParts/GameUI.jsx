// client/src/components/ingamePageComp/GameUI.jsx
import React, { useState } from 'react';
import { Hammer } from 'lucide-react';

import HUDHeader from './HUDHeader';
import TileInfoPanel from './TileInfoPanel';
import TroopTrainPanel from './TroopTrainPanel';
import TroopStatusPanel from './TroopStatusPanel'; // [IMPORT BARU]

const GameUI = ({ 
    worldInfo, 
    selectedTile, 
    playerStats, 
    onBack, 
    onLogout, 
    onCloseTileInfo, 
    onJumpToCoord,
    onTrainTroops,
    onConquerTile
}) => {
  
  const [activePanel, setActivePanel] = useState(null);

  const toggleTraining = () => {
      setActivePanel(activePanel === 'training' ? null : 'training');
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 overflow-hidden">
      
      {/* 1. HEADER */}
      <HUDHeader 
        playerStats={playerStats} 
        worldInfo={worldInfo}
        onBack={onBack} 
        onLogout={onLogout} 
      />

      {/* 2. LEFT PANEL: TROOP STATUS [BARU] */}
      <TroopStatusPanel troops={playerStats?.troops} />

      {/* 3. RIGHT BUTTONS */}
      <div className="absolute right-4 top-24 flex flex-col gap-3 pointer-events-auto">
          <button 
            onClick={toggleTraining}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all
                ${activePanel === 'training' 
                    ? 'bg-[#d4af37] border-white text-black scale-110' 
                    : 'bg-[#1f2937]/90 border-[#d4af37] text-[#d4af37] hover:scale-110'}`}
          >
              <Hammer className="w-6 h-6" />
          </button>
      </div>

      {/* 4. TRAINING PANEL (Dengan Queue) */}
      {activePanel === 'training' && (
          <TroopTrainPanel 
            onClose={() => setActivePanel(null)} 
            playerRes={playerStats?.resources || {}}
            trainingQueue={playerStats?.trainingQueue} // [PASSING QUEUE]
            onTrain={(type, amount) => {
                onTrainTroops(type, amount); 
            }}
          />
      )}

      <TileInfoPanel 
        selectedTile={selectedTile} 
        onClose={onCloseTileInfo}
        onJumpToCoord={onJumpToCoord}
        onConquer={() => onConquerTile(selectedTile.x, selectedTile.y)}
      />
      
    </div>
  );
};

export default GameUI;