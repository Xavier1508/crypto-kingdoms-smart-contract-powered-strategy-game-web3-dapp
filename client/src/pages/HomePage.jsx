import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Coins, Trees, Mountain, Swords, Castle, Globe, LogOut,
  ChevronRight, Sparkles, Wheat, Gem, Flag, Users, Mail, Send
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('log');
  const [chatTab, setChatTab] = useState('global');

  const handleStartConquest = () => {
    navigate('/ingame'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a2332] to-[#1f2937] text-[#e0e0e0] font-['Inter']">
      <div className="flex min-h-screen">
        
        {/* LEFT SIDEBAR - Player Profile & Vitals                              */}
        <aside className="w-80 border-r border-[#4b5563]/50 bg-[#1f2937]/30 backdrop-blur-sm p-6 space-y-6 flex flex-col">
          
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

        {/* CENTER PANEL - Main Action Hub                                      */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h1 
                className="font-['Cinzel'] text-5xl font-black mb-3 text-[#d4af37] uppercase tracking-widest"
                style={{ textShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }} 
              >
                WELCOME, COMMANDER
              </h1>
              <p className="text-[#9ca3af] text-lg">Your kingdom awaits. Choose your path to glory.</p>
            </div>

            {/* --- Game Mode Selection --- */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Card 1: Solo Conquest */}
              <div 
                className="group p-8 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-gradient-to-br from-[#1f2937] to-[#1f2937]/80 border border-[#d4af37]/50 hover:border-[#d4af37] transition-all duration-300 cursor-pointer hover:scale-105" 
                onClick={handleStartConquest}
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-4 rounded-full bg-[#d4af37]/20 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all">
                    <Castle className="w-12 h-12 text-[#d4af37]" />
                  </div>
                  <div>
                    <h2 className="font-['Cinzel'] text-2xl font-bold mb-2 text-[#d4af37] uppercase tracking-wider">Solo Conquest</h2>
                    <p className="text-sm text-[#9ca3af] leading-relaxed">Grow your kingdom, battle AI warlords, and gather resources to claim your first Land NFT.</p>
                  </div>
                  <button className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#1f2937] font-bold text-lg py-6 rounded-md hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all shadow-lg flex items-center justify-center gap-2">
                    START CONQUEST
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Card 2: Multiplayer Mode */}
              <div className="p-8 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-gradient-to-br from-[#1f2937]/60 to-[#1f2937]/40 border border-[#4b5563]/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 to-transparent" />
                <div className="relative flex flex-col items-center text-center space-y-6 opacity-75">
                  <div className="p-4 rounded-full bg-[#00d4ff]/10">
                    <Globe className="w-12 h-12 text-[#00d4ff]" />
                  </div>
                  <div>
                    <h2 className="font-['Cinzel'] text-2xl font-bold mb-2 text-[#00d4ff] uppercase tracking-wider">Global Dominion</h2>
                    <p className="text-sm text-[#9ca3af] leading-relaxed">Enter the global map to forge alliances, wage war, and conquer territories from other players.</p>
                  </div>
                  <button disabled className="w-full bg-[#00d4ff]/30 text-white font-bold text-lg py-6 cursor-not-allowed rounded-md">
                    COMING SOON
                  </button>
                </div>
              </div>
            </div>

            {/* --- Kingdom Management Section --- */}
            <div className="p-6 rounded-lg shadow-[0_4px_24px_-4px_rgba(17,17,26,0.5)] bg-[#1f2937]/40 border border-[#4b5563]/30">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#d4af37]/20">
                  <Crown className="w-6 h-6 text-[#d4af37]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Cinzel'] font-bold text-[#d4af37] mb-2 uppercase tracking-wider">Your Path to Dominion</h3>
                  <p className="text-sm text-[#9ca3af] leading-relaxed mb-4">
                    Start in Solo Conquest to master the art of war. Build your economy, train your armies, and conquer AI territories. Once you've proven your worth, you'll unlock the ability to mint your conquered lands as NFTs and enter the multiplayer arena.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm border border-[#d4af37]/50 hover:bg-[#d4af37]/10 rounded-md transition-all">
                      Manage Troops
                    </button>
                    <button className="px-4 py-2 text-sm border border-[#d4af37]/50 hover:bg-[#d4af37]/10 rounded-md transition-all">
                      View Research
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* RIGHT SIDEBAR - Social & Event Hub                                  */}
        <aside className="w-96 border-l border-[#4b5563]/50 bg-[#1f2937]/30 backdrop-blur-sm p-6 space-y-6 overflow-y-auto">
          
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
                  <div className="flex items-center gap-1 col-span-2"><div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_40px_rgba(212,175,55,0.3)]" /><span>Aetherium (Aether Shards)</span></div>
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
                          Your 50 troops have engaged 30 AI troops at the Gold Mine (10, 25). <span className="text-[#d4af37] cursor-pointer hover:underline">View Battle</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#d4af37] font-semibold">[EVENT]</p>
                        <p className="text-sm text-[#9ca3af]">A new Gold Mine has appeared at (x:10, y:25)!</p>
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
                        <p className="text-sm text-[#9ca3af]">Welcome to the v1.0 Alpha! Your journey begins now.</p>
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
                      <div className="flex gap-2"><span className="text-xs text-[#d4af37] font-semibold">Player123:</span><span className="text-xs text-[#9ca3af]">Anyone want to join an alliance?</span></div>
                      <div className="flex gap-2"><span className="text-xs text-[#00d4ff] font-semibold">Commander99:</span><span className="text-xs text-[#9ca3af]">Just conquered my first territory!</span></div>
                      <div className="flex gap-2"><span className="text-xs text-purple-400 font-semibold">WarLord_X:</span><span className="text-xs text-[#9ca3af]">Looking for experienced players for raids</span></div>
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

      </div>
    </div>
  );
};

export default HomePage;