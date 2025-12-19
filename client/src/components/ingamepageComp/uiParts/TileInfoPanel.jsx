// client/src/components/ingamePageComp/uiParts/TileInfoPanel.jsx
import React, { useMemo } from 'react';
import { Shield, Sword, Eye, XCircle, Zap, Lock } from 'lucide-react';

// --- 1. SINKRONISASI KONSTANTA DENGAN BACKEND (gameHelpers.js) ---
const TILE_COSTS = {
    EMPTY_LAND: 250,
    RESOURCE_NODE: 1000,
    BARBARIAN: 5000,
    GATE_LVL1: 15000, // ID 5
    GATE_LVL2: 30000, // ID 6
    SHRINE: 20000,    // ID 32
    ALTAR: 40000,     // ID 30, 31, 33-35
    ZIGGURAT: 100000, // ID 40
    DEFAULT: 500
};

const TileInfoPanel = ({ selectedTile, onClose, onJumpToCoord, onConquer, myPower }) => {
    if (!selectedTile) return null;

    const fmt = (n) => n?.toString().padStart(3, '0') || '000';
    const formatNum = (num) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;

    const conquestInfo = useMemo(() => {
        if (!selectedTile) {
            return {
                cost: 0,
                typeLabel: "",
                canConquer: false,
            };
        }

        let cost = TILE_COSTS.DEFAULT;
        let typeLabel = "Wilderness";
        const type = selectedTile.type;

        if (type === 5) { cost = TILE_COSTS.GATE_LVL1; typeLabel = "Level 1 Pass"; }
        else if (type === 6) { cost = TILE_COSTS.GATE_LVL2; typeLabel = "Level 2 Pass"; }
        else if (type === 40) { cost = TILE_COSTS.ZIGGURAT; typeLabel = "The Great Ziggurat"; }
        else if (type >= 30 && type <= 35) { cost = TILE_COSTS.ALTAR; typeLabel = "Ancient Sanctum"; }
        else if (type >= 20 && type <= 21) { cost = TILE_COSTS.BARBARIAN; typeLabel = "Barbarian Camp"; }
        else if (type >= 10 && type <= 13) { cost = TILE_COSTS.RESOURCE_NODE; typeLabel = "Resource Deposit"; }
        else if ([1, 2, 3].includes(type)) { cost = TILE_COSTS.EMPTY_LAND; typeLabel = "Plains"; }

        if (selectedTile.ownerName && selectedTile.isEnemy) {
            const enemyPower = selectedTile.ownerPower || 0;
            cost = Math.floor(enemyPower * 1.1) + 500;
            typeLabel = `Territory of ${selectedTile.ownerName}`;
        }

        const canConquer = (myPower || 0) >= cost;

        return { cost, typeLabel, canConquer };
    }, [selectedTile, myPower]);

    // --- 3. UI DISPLAY ---
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl pointer-events-auto 
                        bg-[#1f2937]/95 border border-[#d4af37]/50 rounded-xl p-4 
                        animate-in slide-in-from-bottom-10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-20">
            
            <div className="flex items-center justify-between gap-4">
                
                {/* BAGIAN KIRI: GAMBAR & TYPE */}
                <div className="flex items-center gap-5 min-w-[200px]">
                    <div className={`w-16 h-16 rounded border-2 overflow-hidden relative shadow-inner flex-shrink-0
                        ${selectedTile.isEnemy ? 'border-red-500' : (selectedTile.ownerName ? 'border-[#00d4ff]' : 'border-gray-600')}`}>
                        
                        {selectedTile.ownerName ? (
                            <img src="/assets/castle.png" alt="Castle" className="w-full h-full object-contain bg-black/50 p-1"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-800">
                                {selectedTile.type === 1 && '🌿'}
                                {selectedTile.type === 4 && '🏔️'}
                                {selectedTile.type === 5 && '⛩️'}
                                {selectedTile.type === 40 && '👑'}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className={`${selectedTile.isEnemy ? 'text-red-400' : 'text-[#d4af37]'} font-['Cinzel'] text-xl font-bold leading-tight`}>
                            {conquestInfo.typeLabel}
                        </h3>
                        <p className="text-gray-400 text-xs italic mb-1">
                            {selectedTile.ownerName ? `Occupied by ${selectedTile.ownerName}` : "Unclaimed Land"}
                        </p>
                        <div className="flex gap-2 text-[10px] font-mono text-gray-500">
                             <span className="bg-black/40 px-1.5 py-0.5 rounded border border-gray-700">X: {fmt(selectedTile.x)}</span>
                             <span className="bg-black/40 px-1.5 py-0.5 rounded border border-gray-700">Y: {fmt(selectedTile.y)}</span>
                        </div>
                    </div>
                </div>

                {/* BAGIAN TENGAH: KALKULASI BATTLE/COST */}
                <div className="flex-1 flex flex-col items-center px-6 border-x border-gray-700/50">
                    {selectedTile.ownerName && !selectedTile.isEnemy ? (
                        // JIKA MILIK SENDIRI
                        <div className="text-[#00d4ff] flex flex-col items-center">
                            <Shield className="w-6 h-6 mb-1" />
                            <span className="font-bold text-sm">SECURE TERRITORY</span>
                            <span className="text-xs text-gray-400">Power: {formatNum(selectedTile.ownerPower)}</span>
                        </div>
                    ) : selectedTile.isClaimable ? (
                        // JIKA BISA DISERANG/CLAIM
                        <div className="w-full">
                            <div className="flex justify-between text-xs text-gray-400 mb-1 uppercase tracking-wider">
                                <span>Required Power</span>
                                <span>Your Power</span>
                            </div>
                            
                            <div className="flex justify-between items-end mb-2">
                                <span className={`text-xl font-bold font-mono ${conquestInfo.canConquer ? 'text-white' : 'text-red-500'}`}>
                                    {formatNum(conquestInfo.cost)} ⚡
                                </span>
                                <span className={`text-sm font-bold ${conquestInfo.canConquer ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatNum(myPower)}
                                </span>
                            </div>

                            {/* Progress Bar Visual */}
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${conquestInfo.canConquer ? 'bg-green-500' : 'bg-red-600'}`} 
                                    style={{ width: `${Math.min(100, (myPower / conquestInfo.cost) * 100)}%` }}
                                />
                            </div>
                            
                            {!conquestInfo.canConquer && (
                                <p className="text-[10px] text-red-400 mt-1 text-center font-bold animate-pulse">
                                    INSUFFICIENT POWER! TRAIN MORE TROOPS.
                                </p>
                            )}
                        </div>
                    ) : (
                        // JIKA TERKUNCI (Misal Gunung/Void)
                        <div className="text-gray-500 flex flex-col items-center">
                            <Lock className="w-6 h-6 mb-1" />
                            <span className="font-bold text-sm">UNREACHABLE</span>
                        </div>
                    )}
                </div>

                {/* BAGIAN KANAN: TOMBOL AKSI */}
                <div className="flex items-center gap-3 min-w-[150px] justify-end">
                    {selectedTile.isClaimable ? (
                        <button 
                            onClick={onConquer}
                            disabled={!conquestInfo.canConquer}
                            className={`px-6 py-3 text-white text-sm font-bold rounded shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95
                                ${!conquestInfo.canConquer
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50 grayscale'
                                    : selectedTile.isEnemy 
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-900/50' 
                                        : 'bg-[#d4af37] hover:bg-[#b5952f] text-black shadow-yellow-900/50'
                                }`}
                        >
                            {selectedTile.isEnemy ? <Sword className="w-5 h-5"/> : <Shield className="w-5 h-5"/>}
                            {selectedTile.isEnemy ? "ATTACK" : "CONQUER"}
                        </button>
                    ) : (
                        selectedTile.ownerName && !selectedTile.isEnemy && (
                            <button disabled className="px-5 py-2 bg-[#00d4ff]/20 text-[#00d4ff] text-sm font-bold rounded border border-[#00d4ff]/50">
                                DEFENDING
                            </button>
                        )
                    )}
                    
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 rounded-full transition-colors">
                        <XCircle className="w-6 h-6 text-gray-400 hover:text-white" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TileInfoPanel;