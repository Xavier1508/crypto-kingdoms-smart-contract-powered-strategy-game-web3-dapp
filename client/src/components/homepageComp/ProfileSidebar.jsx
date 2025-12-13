import React from 'react';
import { 
  Crown, Coins, Trees, Mountain, Sparkles, LogOut,
  Wheat, Gem, Flag, Users, Mail 
} from 'lucide-react';

const ProfileSidebar = ({ handleLogout }) => {
  return (
    <aside className="w-80 border-r border-[#4b5563]/50 bg-[#1f2937]/30 backdrop-blur-sm p-6 space-y-6 flex flex-col h-full">
      
      {/* --- Profile Card --- */}
      <div className="p-6 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937] border border-[#4b5563]/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            <img src="/assets/knight-avatar.jpg" alt="Knight Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-['Cinzel'] text-xl font-bold text-[#d4af37] tracking-wider">PLAYERDUA</h2>
            <p className="text-sm text-[#9ca3af] flex items-center gap-1">
              <Crown className="w-4 h-4" />
              Level 1 Commander
            </p>
          </div>
        </div>
        <div className="text-xs text-[#9ca3af] font-mono bg-[#1a2332]/50 px-3 py-2 rounded">
          0xABC...678
        </div>
      </div>

      {/* --- Core Resources --- */}
      <div className="p-5 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937] border border-[#4b5563]/50">
        <h3 className="font-['Cinzel'] text-sm font-bold mb-4 text-[#d4af37] uppercase tracking-widest">Core Resources</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Wheat className="w-5 h-5 text-amber-600" /><span className="text-sm font-medium">Food</span></div>
            <div className="font-bold">100</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Trees className="w-5 h-5 text-green-500" /><span className="text-sm font-medium">Wood</span></div>
            <div className="font-bold">100</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Mountain className="w-5 h-5 text-gray-400" /><span className="text-sm font-medium">Stone</span></div>
            <div className="font-bold">50</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Coins className="w-5 h-5 text-[#d4af37]" /><span className="text-sm font-medium">Gold</span></div>
            <div className="text-right">
              <div className="font-bold text-[#d4af37]">100</div>
              <div className="text-xs text-[#9ca3af]">+5 per min</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Gem className="w-5 h-5 text-purple-400 shadow-[0_0_40px_rgba(212,175,55,0.3)]" /><span className="text-sm font-medium">Aether Shards</span></div>
            <div className="font-bold text-purple-400">0</div>
          </div>
        </div>
      </div>

      {/* --- On-Chain Assets --- */}
      <div className="p-5 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-gradient-to-br from-[#1f2937] to-[#1f2937]/50 border border-[#d4af37]/30">
        <h3 className="font-['Cinzel'] text-sm font-bold mb-3 text-[#d4af37] uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          On-Chain Dominion
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9ca3af]">Land Plots Owned:</span>
            <span className="font-bold text-[#d4af37] text-lg">0</span>
          </div>
          <p className="text-xs text-[#9ca3af]">Conquer territories to mint your first NFT!</p>
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
      
      {/* --- Logout Button (Pushed to bottom) --- */}
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