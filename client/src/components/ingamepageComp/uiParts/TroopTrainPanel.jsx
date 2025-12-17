// client/src/components/ingamePageComp/uiParts/TroopTrainPanel.jsx
import React, { useState, useEffect } from 'react';
import { Hammer, X, Clock, Loader2 } from 'lucide-react';

const TROOP_TYPES = [
    { id: 'infantry', name: 'Infantry', icon: '🛡️', power: 1, cost: { food: 10, wood: 10, gold: 0 } },
    { id: 'archer',   name: 'Archer',   icon: '🏹', power: 1.5, cost: { food: 15, wood: 20, gold: 2 } },
    { id: 'cavalry',  name: 'Cavalry',  icon: '🐎', power: 2, cost: { food: 25, wood: 15, gold: 5 } },
    { id: 'siege',    name: 'Catapult', icon: '☄️', power: 2.5, cost: { food: 20, wood: 30, gold: 10 } },
];

const TroopTrainPanel = ({ onClose, onTrain, playerRes, trainingQueue }) => {
    const [selectedTroop, setSelectedTroop] = useState(TROOP_TYPES[0]);
    const [amount, setAmount] = useState(10);
    
    // Hitung Estimasi Biaya
    const totalCost = {
        food: selectedTroop.cost.food * amount,
        wood: selectedTroop.cost.wood * amount,
        gold: selectedTroop.cost.gold * amount,
    };

    const canAfford = 
        playerRes.food >= totalCost.food &&
        playerRes.wood >= totalCost.wood &&
        playerRes.gold >= totalCost.gold;

    const handleTrain = () => {
        if (!canAfford) return;
        onTrain(selectedTroop.id, amount);
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
                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 mb-4">
                    <h4 className="text-blue-300 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Training in Progress
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto"> {/* Tambah scroll jika antrian panjang */}
                        {trainingQueue.map((q, idx) => (
                            <QueueItem key={idx} queue={q} />
                        ))}
                    </div>
                </div>
            )}

            {/* TAB PILIHAN */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {TROOP_TYPES.map(troop => (
                    <button 
                        key={troop.id}
                        onClick={() => setSelectedTroop(troop)}
                        className={`p-2 rounded border flex flex-col items-center gap-1 transition-all
                            ${selectedTroop.id === troop.id 
                                ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' 
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                    >
                        <span className="text-xl">{troop.icon}</span>
                        <span className="text-[10px] font-bold uppercase">{troop.name}</span>
                    </button>
                ))}
            </div>

            {/* DETAIL INPUT */}
            <div className="bg-black/40 p-3 rounded-lg border border-gray-700 flex-1 flex flex-col">
                <h4 className="text-white font-bold mb-2 text-center text-md border-b border-gray-700 pb-2">{selectedTroop.name}</h4>
                
                <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between text-yellow-200">
                        <span>🌽 Food:</span>
                        <span className={playerRes.food < totalCost.food ? 'text-red-500 font-bold' : ''}>{totalCost.food}</span>
                    </div>
                    <div className="flex justify-between text-green-200">
                        <span>🌲 Wood:</span>
                        <span className={playerRes.wood < totalCost.wood ? 'text-red-500 font-bold' : ''}>{totalCost.wood}</span>
                    </div>
                    <div className="flex justify-between text-yellow-500">
                        <span>💰 Gold:</span>
                        <span className={playerRes.gold < totalCost.gold ? 'text-red-500 font-bold' : ''}>{totalCost.gold}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Amount</span>
                        <span className="text-white font-bold">{amount}</span>
                    </div>
                    <input 
                        type="range" min="10" max="500" step="10" 
                        value={amount} 
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full accent-[#d4af37] h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <button 
                    onClick={handleTrain}
                    disabled={!canAfford}
                    className={`w-full py-3 font-bold text-sm rounded mt-auto flex items-center justify-center gap-2 transition-all
                        ${canAfford 
                            ? 'bg-[#d4af37] text-black hover:bg-[#b5952f] shadow-lg hover:scale-[1.02]' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'}`}
                >
                    {canAfford ? 'TRAIN TROOPS' : 'NO RESOURCES'}
                </button>
            </div>
        </div>
    );
};

// Komponen Kecil Timer
const QueueItem = ({ queue }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(queue.endTime).getTime();
            const dist = end - now;

            if (dist < 0) {
                setTimeLeft("Finishing...");
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
        <div className="bg-black/40 p-2 rounded flex justify-between items-center text-xs">
            <span className="text-white">
                {queue.amount} {queue.troopType}
            </span>
            <span className="text-yellow-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeLeft}
            </span>
        </div>
    );
};

export default TroopTrainPanel;