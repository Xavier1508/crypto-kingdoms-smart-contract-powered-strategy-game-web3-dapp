// client/src/components/ingamePageComp/uiParts/TileInfoPanel.jsx
import React from 'react';
import { Shield, Sword, Eye, XCircle, Zap, Skull } from 'lucide-react';

const TileInfoPanel = ({ selectedTile, onClose, onJumpToCoord, onConquer }) => {
    if (!selectedTile) return null;

    const fmt = (n) => n?.toString().padStart(3, '0') || '000';
    const formatNum = (num) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;

    // --- LOGIKA KALKULASI POWER ---
    const calculateEffectivePower = () => {
        if (!selectedTile.ownerName) return null; // Jika wilderness, skip

        if (!selectedTile.ownerCastle) return null; // Safety check

        // Hitung selisih jarak X dan Y
        const diffX = Math.abs(selectedTile.x - selectedTile.ownerCastle.x);
        const diffY = Math.abs(selectedTile.y - selectedTile.ownerCastle.y);

        // 1. CEK AREA CAPITAL (3x3)
        // Jika jarak X <= 1 DAN jarak Y <= 1, berarti dia ada di kotak 3x3 pusat
        if (diffX <= 1 && diffY <= 1) {
             return { 
                 isCastle: true, 
                 total: selectedTile.ownerPower,
                 text: "Capital Strength" 
            };
        }

        // 2. Hitung Jarak Euclidean untuk Penalty (Di luar 3x3)
        const dx = selectedTile.x - selectedTile.ownerCastle.x;
        const dy = selectedTile.y - selectedTile.ownerCastle.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // 3. Hitung Penalty & Sisa Power
        const penalty = Math.floor(distance * 30); 
        const effective = Math.max(0, selectedTile.ownerPower - penalty);

        return { 
            isCastle: false, 
            total: selectedTile.ownerPower,
            penalty: penalty,
            effective: effective 
        };
    };

    const powerStats = calculateEffectivePower();

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl pointer-events-auto 
                        bg-[#1f2937]/95 border border-[#d4af37]/50 rounded-xl p-4 
                        animate-in slide-in-from-bottom-10 shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-20">
            
            <div className="flex items-center justify-between">
                
                {/* 1. KIRI: GAMBAR & INFO DASAR */}
                <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded border-2 overflow-hidden relative shadow-inner flex-shrink-0
                        ${selectedTile.isEnemy ? 'border-red-500' : (selectedTile.ownerName ? 'border-[#00d4ff]' : 'border-gray-600')}`}>
                        
                        {selectedTile.ownerName ? (
                            <img src="/assets/castle.png" alt="Castle" className="w-full h-full object-contain bg-black/50 p-1"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-800">
                                {selectedTile.type === 1 && '🌿'}
                                {selectedTile.type === 4 && '🏔️'}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className={`${selectedTile.isEnemy ? 'text-red-400' : 'text-[#d4af37]'} font-['Cinzel'] text-xl font-bold leading-tight`}>
                            {selectedTile.name}
                        </h3>
                        {/* Deskripsi Kontekstual */}
                        <p className="text-gray-400 text-xs italic mb-1 max-w-[250px] leading-snug">
                            {selectedTile.description}
                        </p>
                        
                        <div className="flex gap-2 text-[10px] font-mono text-gray-500">
                             <span className="bg-black/40 px-1.5 py-0.5 rounded border border-gray-700">X: {fmt(selectedTile.x)}</span>
                             <span className="bg-black/40 px-1.5 py-0.5 rounded border border-gray-700">Y: {fmt(selectedTile.y)}</span>
                        </div>
                    </div>
                </div>

                {/* 2. TENGAH: STATISTIK POWER (ANGKA REAL) */}
                <div className="flex flex-col items-center px-6 border-x border-gray-700/50 min-w-[240px]">
                    {selectedTile.ownerName ? (
                        <>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                                {selectedTile.isEnemy ? "Enemy Territory" : "Your Territory"}
                            </div>
                            
                            <div className={`text-lg font-bold flex items-center gap-2 mb-2
                                ${selectedTile.isEnemy ? 'text-red-500' : 'text-[#00d4ff]'}`}>
                                <Shield className="w-4 h-4" /> 
                                {selectedTile.ownerName} {/* Nama Asli dari DB */}
                            </div>
                            
                            {/* PANEL ANGKA POWER */}
                            <div className="w-full bg-black/30 p-2 rounded border border-gray-700 flex flex-col gap-1">
                                {powerStats.isCastle ? (
                                    <div className="flex justify-between items-center text-yellow-400 font-bold text-sm">
                                        <span className="flex items-center gap-1"><Zap className="w-3 h-3"/> Total Power</span>
                                        <span>{formatNum(powerStats.total)}</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Baris 1: Total Power Pusat */}
                                        <div className="flex justify-between text-[10px] text-gray-400">
                                            <span>Base Power:</span>
                                            <span>{formatNum(powerStats.total)}</span>
                                        </div>
                                        {/* Baris 2: Penalty Jarak */}
                                        <div className="flex justify-between text-[10px] text-red-400">
                                            <span>Distance Penalty:</span>
                                            <span>-{powerStats.penalty}</span>
                                        </div>
                                        {/* Baris 3: Power Efektif (YANG PENTING) */}
                                        <div className="border-t border-gray-600 mt-1 pt-1 flex justify-between font-bold text-sm text-white">
                                            <span>Effective Power:</span>
                                            <span className={selectedTile.isEnemy ? "text-red-400" : "text-green-400"}>
                                                {formatNum(powerStats.effective)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Status</div>
                            <div className="text-base font-bold text-gray-300 italic mb-1">Unclaimed Wilderness</div>
                            <div className="text-xs text-yellow-500/80 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-900/50">
                                Conquest Cost: 500 Power
                            </div>
                        </>
                    )}
                </div>

                {/* 3. KANAN: TOMBOL AKSI (MERAH JIKA MUSUH) */}
                <div className="flex items-center gap-3">
                    {selectedTile.isClaimable ? (
                        <button 
                            onClick={onConquer}
                            className={`px-6 py-3 text-white text-sm font-bold rounded shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95
                                ${selectedTile.isEnemy 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-900/50' // Merah untuk Serang
                                    : 'bg-[#d4af37] hover:bg-[#b5952f] text-black shadow-yellow-900/50' // Kuning untuk Claim
                                }`}
                        >
                            {selectedTile.isEnemy ? <Sword className="w-5 h-5"/> : <Shield className="w-5 h-5"/>}
                            {selectedTile.isEnemy ? "ATTACK TERRITORY" : "CONQUER"}
                        </button>
                    ) : (
                        <button disabled className="px-5 py-2 bg-gray-700 text-gray-500 text-sm font-bold rounded border border-gray-600 cursor-not-allowed">
                            LOCKED
                        </button>
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