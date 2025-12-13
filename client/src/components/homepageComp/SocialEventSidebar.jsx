import React, { useState } from 'react';
import { Flag, Send, Swords, Sparkles, Mountain, Trees, Crown } from 'lucide-react';

const SocialEventSidebar = () => {
  const [activeTab, setActiveTab] = useState('log');
  const [chatTab, setChatTab] = useState('global');

  return (
    <aside className="w-96 border-l border-[#4b5563]/50 bg-[#1f2937]/30 backdrop-blur-sm p-6 space-y-6 overflow-y-auto h-full">
      
      {/* --- Minimap Preview --- */}
      <div className="overflow-hidden rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937] border border-[#4b5563]/50">
        <div className="p-4 bg-gradient-to-r from-[#d4af37]/20 to-transparent border-b border-[#4b5563]/50">
          <h3 className="font-['Cinzel'] text-sm font-bold text-[#d4af37] uppercase tracking-widest">
            World Preview
          </h3>
        </div>
        <div className="relative">
          <img src="/assets/minimap-preview.jpg" alt="World Map Preview" className="w-full h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937] to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Forests (Wood)</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-600" /><span>Farms (Food)</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400" /><span>Mountains (Stone)</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.3)]" /><span>Gold Mines</span></div>
              <div className="flex items-center gap-1 col-span-2"><div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_40px_rgba(212,175,55,0.3)]" /><span>Aetherium</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Tabbed Interface - Social & Logs Hub --- */}
      <div className="rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937] border border-[#4b5563]/50 overflow-hidden">
        {/* Tab Buttons */}
        <div className="w-full grid grid-cols-3 border-b border-[#4b5563]/50">
          <button 
            onClick={() => setActiveTab('log')} 
            className={`text-xs uppercase tracking-wider py-3 transition-colors ${activeTab === 'log' ? 'bg-[#1a2332] text-[#d4af37]' : 'text-[#9ca3af] hover:text-[#e0e0e0]'}`}
          >
            Kingdom Log
          </button>
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`text-xs uppercase tracking-wider py-3 transition-colors ${activeTab === 'chat' ? 'bg-[#1a2332] text-[#d4af37]' : 'text-[#9ca3af] hover:text-[#e0e0e0]'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveTab('alliance')} 
            className={`text-xs uppercase tracking-wider py-3 transition-colors ${activeTab === 'alliance' ? 'bg-[#1a2332] text-[#d4af37]' : 'text-[#9ca3af] hover:text-[#e0e0e0]'}`}
          >
            Alliance
          </button>
        </div>
        
        {/* --- Tab Panel 1: Kingdom Log --- */}
        {activeTab === 'log' && (
          <div className="p-5">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-2">
                  <Swords className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-400 font-semibold">[COMBAT]</p>
                    <p className="text-sm text-[#9ca3af]">
                      World Server #2 is now OPEN! 32 slots available.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#d4af37] font-semibold">[EVENT]</p>
                    <p className="text-sm text-[#9ca3af]">New season starts in 24 Hours.</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#1a2332]/30">
                <div className="flex items-start gap-2">
                  <Mountain className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#e0e0e0] font-semibold">[RESOURCE]</p>
                    <p className="text-sm text-[#9ca3af]">Stone quarry production increased by 10%.</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#1a2332]/30">
                <div className="flex items-start gap-2">
                  <Trees className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#e0e0e0] font-semibold">[LOG]</p>
                    <p className="text-sm text-[#9ca3af]">Your wood resources are full.</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30">
                <div className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-[#00d4ff] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#00d4ff] font-semibold">[NEWS]</p>
                    <p className="text-sm text-[#9ca3af]">Welcome to Global Dominion Alpha!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab Panel 2: Chat --- */}
        {activeTab === 'chat' && (
          <div>
            <div className="w-full grid grid-cols-3 border-b border-[#4b5563]/30 bg-[#1a2332]/30">
              <button onClick={() => setChatTab('global')} className={`text-xs py-2 transition-colors ${chatTab === 'global' ? 'bg-[#1a2332] text-[#d4af37]' : 'text-[#9ca3af]'}`}>Global</button>
              <button onClick={() => setChatTab('alliance-chat')} className={`text-xs py-2 transition-colors ${chatTab === 'alliance-chat' ? 'bg-[#1a2332] text-[#d4af37]' : 'text-[#9ca3af]'}`}>Alliance</button>
              <button onClick={() => setChatTab('friends')} className={`text-xs py-2 transition-colors ${chatTab === 'friends' ? 'bg-[#1a2332] text-[#d4af37]' : 'text-[#9ca3af]'}`}>Friends</button>
            </div>
            
            {chatTab === 'global' && (
              <div className="p-4">
                <div className="space-y-3 max-h-80 overflow-y-auto mb-3">
                  <div className="flex gap-2"><span className="text-xs text-[#d4af37] font-semibold">Player123:</span><span className="text-xs text-[#9ca3af]">Where is the best spawn point?</span></div>
                  <div className="flex gap-2"><span className="text-xs text-[#00d4ff] font-semibold">Commander99:</span><span className="text-xs text-[#9ca3af]">Join World #2 guys!</span></div>
                  <div className="flex gap-2"><span className="text-xs text-purple-400 font-semibold">WarLord_X:</span><span className="text-xs text-[#9ca3af]">Looking for alliance members</span></div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-[#4b5563]/30">
                  <input type="text" placeholder="Type a message..." className="flex-1 bg-[#1a2332]/50 border border-[#4b5563]/50 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d4af37] text-[#e0e0e0]" />
                  <button className="px-3 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 rounded"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {chatTab === 'alliance-chat' && (
              <div className="p-4"><div className="text-center py-8"><p className="text-sm text-[#9ca3af]">You are not in an alliance yet.</p></div></div>
            )}
            
            {chatTab === 'friends' && (
              <div className="p-4"><div className="text-center py-8"><p className="text-sm text-[#9ca3af]">No friends online.</p></div></div>
            )}
          </div>
        )}

        {/* --- Tab Panel 3: Alliance --- */}
        {activeTab === 'alliance' && (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="p-4 rounded-full bg-[#d4af37]/20">
                <Flag className="w-12 h-12 text-[#d4af37]" />
              </div>
              <div>
                <h4 className="font-['Cinzel'] text-lg font-bold text-[#d4af37] mb-2">No Alliance</h4>
                <p className="text-sm text-[#9ca3af] mb-6">You are not currently in an Alliance.</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#1f2937] py-2 px-4 rounded-md font-bold">Create Alliance</button>
                <button className="w-full border border-[#d4af37]/50 hover:bg-[#d4af37]/10 py-2 px-4 rounded-md">Search for an Alliance</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SocialEventSidebar;