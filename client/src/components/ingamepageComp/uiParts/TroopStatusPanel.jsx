// client/src/components/ingamePageComp/uiParts/TroopStatusPanel.jsx
import React from 'react';
import { Shield, Users } from 'lucide-react';

const TroopStatusPanel = ({ troops }) => {
    // Default 0 jika data belum load
    const t = troops || { infantry: 0, archer: 0, cavalry: 0, siege: 0 };

    return (
        <div className="absolute left-4 top-24 pointer-events-auto flex flex-col gap-3">
            
            {/* Header Kecil */}
            <div className="bg-[#1f2937]/90 p-2 rounded border border-[#d4af37]/50 shadow-lg backdrop-blur">
                <h3 className="text-[#d4af37] text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2 border-b border-gray-600 pb-1">
                    <Shield className="w-3 h-3" /> Army Strength
                </h3>
                
                {/* List Pasukan */}
                <div className="flex flex-col gap-1 w-40">
                    <TroopItem icon="🛡️" name="Infantry" count={t.infantry} color="text-gray-300" />
                    <TroopItem icon="🏹" name="Archer" count={t.archer} color="text-red-300" />
                    <TroopItem icon="🐎" name="Cavalry" count={t.cavalry} color="text-yellow-300" />
                    <TroopItem icon="☄️" name="Siege" count={t.siege} color="text-orange-300" />
                </div>
            </div>

            {/* Total Unit */}
            <div className="bg-black/60 px-3 py-1 rounded-full border border-gray-600 text-xs text-center text-gray-400">
                Total Units: <span className="text-white font-bold">{t.infantry + t.archer + t.cavalry + t.siege}</span>
            </div>
        </div>
    );
};

const TroopItem = ({ icon, name, count, color }) => (
    <div className="flex justify-between items-center text-sm bg-black/20 px-2 py-1 rounded">
        <span className="flex items-center gap-2 text-gray-400">
            <span>{icon}</span> {name}
        </span>
        <span className={`font-mono font-bold ${color}`}>{count.toLocaleString()}</span>
    </div>
);

export default TroopStatusPanel;