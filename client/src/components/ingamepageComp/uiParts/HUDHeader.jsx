// client/src/components/ingamePageComp/uiParts/HUDHeader.jsx
import React from 'react';
import { Sword, Home, LogOut, Globe } from 'lucide-react';

const HUDHeader = ({ playerStats, worldInfo, onBack, onLogout }) => {
    const formatNum = (num) => {
        if (!num) return 0;
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    const res = playerStats?.resources || { food: 0, wood: 0, stone: 0, gold: 0 };
    const power = playerStats?.power || 0;
    const worldName = worldInfo ? `World ${worldInfo.worldId}` : "Unknown World";

    return (
        <header className="pointer-events-auto bg-[#1f2937]/90 backdrop-blur border-b border-[#4b5563] px-4 py-2 flex items-center justify-between shadow-lg z-50">
            
            {/* KIRI: Profile */}
            <div className="flex items-center gap-4 min-w-[200px]">
                <div className="flex flex-col">
                    <h2 className="text-[#d4af37] font-bold font-['Cinzel'] leading-none text-lg">
                        {playerStats?.username || "COMMANDER"}
                    </h2>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-blue-400">
                            <Globe className="w-3 h-3" /> {worldName}
                        </span>
                        <span className="flex items-center gap-1">
                             <Sword className="w-3 h-3 text-red-500" /> 
                             Pow: <span className="text-white font-mono font-bold">{formatNum(power)}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* TENGAH: RESOURCE BAR */}
            <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full border border-gray-700">
                <div className="flex items-center gap-2 text-yellow-100 min-w-[70px]" title="Food">
                    <span className="text-lg">🌽</span> 
                    <span className="font-mono font-bold text-sm">{formatNum(res.food)}</span>
                </div>
                <div className="flex items-center gap-2 text-green-100 min-w-[70px]" title="Wood">
                    <span className="text-lg">🌲</span> 
                    <span className="font-mono font-bold text-sm">{formatNum(res.wood)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 min-w-[70px]" title="Stone">
                    <span className="text-lg">🪨</span> 
                    <span className="font-mono font-bold text-sm">{formatNum(res.stone)}</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400 min-w-[70px]" title="Gold">
                    <span className="text-lg">💰</span> 
                    <span className="font-mono font-bold text-sm">{formatNum(res.gold)}</span>
                </div>
            </div>

            {/* KANAN: MENU */}
            <div className="flex items-center gap-2 min-w-[100px] justify-end">
                <button onClick={onBack} className="p-2 bg-[#374151] rounded hover:bg-gray-600 transition-colors" title="Back to Lobby">
                    <Home className="w-4 h-4 text-gray-300"/>
                </button>
                <button onClick={onLogout} className="p-2 bg-red-900/50 rounded hover:bg-red-800 transition-colors" title="Logout">
                    <LogOut className="w-4 h-4 text-red-300"/>
                </button>
            </div>
        </header>
    );
};

export default HUDHeader;