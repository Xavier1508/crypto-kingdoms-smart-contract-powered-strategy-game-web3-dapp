// client/src/components/homepageComp/ProfileSidebar.jsx
import React from 'react';
import { 
  Crown, Coins, Trees, Mountain, Sparkles, LogOut,
  Wheat, Gem, Flag, Users, Mail, Globe 
} from 'lucide-react';

const ProfileSidebar = ({ user, activeWorlds, selectedWorldId, onSelectWorld, currentStats, handleLogout }) => {
  
  // Format angka (1000 -> 1k)
  const fmt = (num) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : (num || 0);

  return (
    <aside className="w-80 border-r border-[#4b5563]/50 bg-[#1f2937]/30 backdrop-blur-sm p-6 space-y-6 flex flex-col h-full overflow-y-auto">
      
      {/* --- Profile Card --- */}
      <div className="p-6 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937] border border-[#4b5563]/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            <img src="/assets/knight-avatar.jpg" alt="Knight Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-['Cinzel'] text-xl font-bold text-[#d4af37] tracking-wider truncate max-w-[140px]">
                {user?.username || "Commander"}
            </h2>
            <p className="text-sm text-[#9ca3af] flex items-center gap-1">
              <Crown className="w-4 h-4" />
              Level {Math.floor((currentStats?.power || 0) / 1000) + 1} Lord
            </p>
          </div>
        </div>
        <div className="text-xs text-[#9ca3af] font-mono bg-[#1a2332]/50 px-3 py-2 rounded truncate">
          {user?.walletAddress || "Wallet Not Connected"}
        </div>
      </div>

      {/* --- WORLD SELECTOR (TAB SWITCHER) --- */}
      {activeWorlds.length > 0 ? (
        <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Select Active Realm</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {activeWorlds.map(w => (
                    <button
                        key={w.worldId}
                        onClick={() => onSelectWorld(w.worldId)}
                        className={`px-3 py-2 rounded text-xs font-bold whitespace-nowrap transition-all border
                            ${selectedWorldId === w.worldId 
                                ? 'bg-[#d4af37] text-black border-[#d4af37]' 
                                : 'bg-[#1a2332] text-gray-400 border-gray-600 hover:border-gray-400'}`}
                    >
                        World #{w.worldId}
                    </button>
                ))}
            </div>
        </div>
      ) : (
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-200 text-center">
            No active realms. Join a world to start producing resources!
        </div>
      )}

      {/* --- Core Resources (DINAMIS) --- */}
      <div className="p-5 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937] border border-[#4b5563]/50">
        <h3 className="font-['Cinzel'] text-sm font-bold mb-4 text-[#d4af37] uppercase tracking-widest flex justify-between">
            <span>Resources</span>
            <span className="text-[10px] text-gray-500 mt-0.5">#{selectedWorldId || '?'}</span>
        </h3>
        
        {currentStats ? (
            <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Wheat className="w-5 h-5 text-amber-600" /><span className="text-sm font-medium">Food</span></div>
                <div className="font-bold">{fmt(currentStats.resources?.food)}</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Trees className="w-5 h-5 text-green-500" /><span className="text-sm font-medium">Wood</span></div>
                <div className="font-bold">{fmt(currentStats.resources?.wood)}</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Mountain className="w-5 h-5 text-gray-400" /><span className="text-sm font-medium">Stone</span></div>
                <div className="font-bold">{fmt(currentStats.resources?.stone)}</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Coins className="w-5 h-5 text-[#d4af37]" /><span className="text-sm font-medium">Gold</span></div>
                <div className="text-right">
                <div className="font-bold text-[#d4af37]">{fmt(currentStats.resources?.gold)}</div>
                <div className="text-xs text-[#9ca3af]">Power: {fmt(currentStats.power)}</div>
                </div>
            </div>
            </div>
        ) : (
            <div className="text-center text-gray-500 text-sm py-4 italic">
                Select a realm to view resources.
            </div>
        )}
      </div>

      {/* --- On-Chain Assets --- */}
      <div className="p-5 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-gradient-to-br from-[#1f2937] to-[#1f2937]/50 border border-[#d4af37]/30">
        <h3 className="font-['Cinzel'] text-sm font-bold mb-3 text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          On-Chain Dominion
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9ca3af]">NFT Kingdom:</span>
            <span className="font-bold text-[#d4af37] text-lg">{activeWorlds.length > 0 ? 'Minted' : 'None'}</span>
          </div>
          <p className="text-xs text-[#9ca3af]">
             {activeWorlds.length > 0 ? "Your assets are secure on the database." : "Conquer territories to mint your first NFT!"}
          </p>
        </div>
      </div>

      {/* --- Social Navigation --- */}
      <div className="p-4 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937] border border-[#4b5563]/50">
        <h3 className="font-['Cinzel'] text-xs font-bold mb-3 text-[#d4af37] uppercase tracking-widest">Social</h3>
        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center h-auto py-3 px-2 border border-[#4b5563] rounded-md hover:border-[#d4af37] transition-all bg-transparent text-[#e0e0e0]">
            <Flag className="w-5 h-5 mb-1" />
            <span className="text-xs">Alliance</span>
          </button>
          <button className="flex flex-col items-center h-auto py-3 px-2 border border-[#4b5563] rounded-md hover:border-[#d4af37] transition-all bg-transparent text-[#e0e0e0]">
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs">Friends</span>
          </button>
          <button className="flex flex-col items-center h-auto py-3 px-2 border border-[#4b5563] rounded-md hover:border-[#d4af37] transition-all bg-transparent text-[#e0e0e0]">
            <Mail className="w-5 h-5 mb-1" />
            <span className="text-xs">Mailbox</span>
          </button>
        </div>
      </div>
      
      {/* --- Logout --- */}
      <div className="mt-auto">
        <button 
          onClick={handleLogout} 
          className="w-full py-2 px-4 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-md flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default ProfileSidebar;