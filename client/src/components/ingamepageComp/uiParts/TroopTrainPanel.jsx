// client/src/components/ingamePageComp/uiParts/TroopTrainPanel.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Hammer, X, Clock, Loader2, Zap } from 'lucide-react';

const TROOP_TYPES = [
    { id: 'infantry', name: 'Infantry', icon: '🛡️', power: 1, time: 2000, cost: { food: 10, wood: 10, gold: 0 } },
    { id: 'archer',   name: 'Archer',   icon: '🏹', power: 1.5, time: 3000, cost: { food: 15, wood: 20, gold: 2 } },
    { id: 'cavalry',  name: 'Cavalry',  icon: '🐎', power: 2, time: 5000, cost: { food: 25, wood: 15, gold: 5 } },
    { id: 'siege',    name: 'Catapult', icon: '☄️', power: 2.5, time: 6000, cost: { food: 20, wood: 30, gold: 10 } },
];

const TroopTrainPanel = ({ onClose, onTrain, playerRes, trainingQueue }) => {
    const [selectedTroop, setSelectedTroop] = useState(TROOP_TYPES[0]);
    const [amount, setAmount] = useState(10);
    
    // --- KALKULASI STATISTIK ---
    const stats = useMemo(() => {
        return {
            totalFood: selectedTroop.cost.food * amount,
            totalWood: selectedTroop.cost.wood * amount,
            totalGold: selectedTroop.cost.gold * amount,
            totalPower: Math.floor(selectedTroop.power * amount), // POWER GAIN
            totalTime: (selectedTroop.time * amount) / 1000 // Detik
        };
    }, [selectedTroop, amount]);

    const canAfford = 
        playerRes.food >= stats.totalFood &&
        playerRes.wood >= stats.totalWood &&
        playerRes.gold >= stats.totalGold;

    const handleTrain = () => {
        if (!canAfford) return;
        onTrain(selectedTroop.id, amount);
    };

    // Format waktu (detik -> mm:ss)
    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="absolute right-0 top-20 bottom-0 w-80 bg-[#111827]/95 border-l border-[#4b5563] p-4 animate-in slide-in-from-right-10 pointer-events-auto flex flex-col z-20 shadow-2xl">
            
            <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
                <h3 className="text-[#d4af37] font-['Cinzel'] font-bold text-lg flex items-center gap-2">
                    <Hammer className="w-5 h-5" /> Training Camp
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>

            {/* STATUS ANTRIAN (QUEUE) */}
            {Array.isArray(trainingQueue) && trainingQueue.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                    <h4 className="text-blue-300 text-xs font-bold uppercase mb-2 flex items-center gap-1 sticky top-0 bg-[#111827]/80 backdrop-blur pb-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Training in Progress
                    </h4>
                    <div className="space-y-2">
                        {trainingQueue.map((q, idx) => (
                            <QueueItem key={idx} queue={q} />
                        ))}
                    </div>
                </div>
            )}

            {/* TAB PILIHAN PASUKAN */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {TROOP_TYPES.map(troop => (
                    <button 
                        key={troop.id}
                        onClick={() => setSelectedTroop(troop)}
                        className={`p-2 rounded border flex flex-col items-center gap-1 transition-all relative overflow-hidden
                            ${selectedTroop.id === troop.id 
                                ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' 
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                    >
                        <span className="text-2xl">{troop.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{troop.name}</span>
                        
                        {/* Badge Power Kecil */}
                        <span className="absolute top-1 right-1 text-[9px] bg-black/50 px-1 rounded text-blue-300">
                            +{troop.power}
                        </span>
                    </button>
                ))}
            </div>

            {/* DETAIL INPUT & PREVIEW */}
            <div className="bg-black/40 p-4 rounded-lg border border-gray-700 flex-1 flex flex-col">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-3">
                    <h4 className="text-white font-bold text-md">{selectedTroop.name}</h4>
                    <span className="text-blue-400 text-xs font-bold flex items-center gap-1 bg-blue-900/30 px-2 py-1 rounded">
                        <Zap className="w-3 h-3" fill="currentColor" /> Gain +{stats.totalPower} Power
                    </span>
                </div>
                
                {/* Resource Cost */}
                <div className="space-y-2 mb-4 text-xs font-mono">
                    <CostRow label="🌽 Food" value={stats.totalFood} userRes={playerRes.food} color="text-yellow-200" />
                    <CostRow label="🌲 Wood" value={stats.totalWood} userRes={playerRes.wood} color="text-green-200" />
                    <CostRow label="💰 Gold" value={stats.totalGold} userRes={playerRes.gold} color="text-yellow-500" />
                    <div className="flex justify-between text-gray-400 mt-2 pt-2 border-t border-gray-700">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Time:</span>
                        <span>{formatTime(stats.totalTime)}</span>
                    </div>
                </div>

                {/* Slider Input */}
                <div className="mb-6 mt-auto">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Train Amount</span>
                        <span className="text-white font-bold text-lg">{amount}</span>
                    </div>
                    <input 
                        type="range" min="10" max="1000" step="10" 
                        value={amount} 
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full accent-[#d4af37] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 transition-colors"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1 px-1">
                        <span>10</span>
                        <span>500</span>
                        <span>1000</span>
                    </div>
                </div>

                <button 
                    onClick={handleTrain}
                    disabled={!canAfford}
                    className={`w-full py-3 font-bold text-sm rounded shadow-lg flex flex-col items-center justify-center gap-0.5 transition-all
                        ${canAfford 
                            ? 'bg-[#d4af37] text-black hover:bg-[#b5952f] hover:scale-[1.02] active:scale-95' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}
                >
                    <span>{canAfford ? 'START TRAINING' : 'INSUFFICIENT RESOURCES'}</span>
                </button>
            </div>
        </div>
    );
};

// Helper Kecil
const CostRow = ({ label, value, userRes, color }) => (
    <div className={`flex justify-between ${color}`}>
        <span>{label}</span>
        <span className={userRes < value ? 'text-red-500 font-bold animate-pulse' : ''}>
            {value.toLocaleString()} {userRes < value && '(Lacking)'}
        </span>
    </div>
);

const QueueItem = ({ queue }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(queue.endTime).getTime();
            const dist = end - now;

            if (dist < 0) {
                setTimeLeft("Done");
                clearInterval(timer);
            } else {
                const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((dist % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [queue.endTime]);

    return (
        <div className="bg-black/40 p-2 rounded flex justify-between items-center text-xs border-l-2 border-blue-500">
            <span className="text-white font-bold">
                {queue.amount} {queue.troopType}
            </span>
            <span className="text-blue-300 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeLeft}
            </span>
        </div>
    );
};

export default TroopTrainPanel;