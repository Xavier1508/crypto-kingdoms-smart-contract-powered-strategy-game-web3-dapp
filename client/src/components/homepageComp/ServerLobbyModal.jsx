// client/src/components/homepageComp/ServerLobbyModal.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Globe, Shield, Activity, Lock, AlertCircle, Loader2 } from 'lucide-react';

import { mintKingdomNFT } from '../../utils/Web3Client'; 

const ServerLobbyModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // STATE
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); 
  
  // State Status Join
  const [joiningId, setJoiningId] = useState(null); 
  const [joinStep, setJoinStep] = useState(""); 

  const currentUserId = localStorage.getItem('userId'); 

  // 1. FETCH WORLDS DATA
  useEffect(() => {
    if (isOpen) fetchWorlds();
  }, [isOpen]);

  const fetchWorlds = async () => {
    try {
      setLoading(true);
      setError(null);
      // PENTING: Pastikan backend server nyala di port 5000
      const res = await fetch('http://localhost:5000/api/worlds');
      
      // Cek apakah response JSON valid
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error("Server tidak merespons dengan data yang benar. Cek koneksi backend.");
      }

      if (!res.ok) throw new Error("Gagal mengambil data server.");
      
      const data = await res.json();
      setWorlds(data);
      
      // Auto-switch ke tab 'My Realm' jika user sudah punya world
      const myWorld = data.find(w => w.players.includes(currentUserId));
      if (myWorld) setActiveTab('my');

    } catch (err) {
      console.error("Lobby Error:", err);
      setError("Cannot connect to Kingdom Network.");
    } finally {
      setLoading(false);
    }
  };

  const myWorlds = worlds.filter(w => w.players.includes(currentUserId));
  const displayWorlds = activeTab === 'my' ? myWorlds : worlds;

  // --- [PERBAIKAN UTAMA DISINI] JOIN LOGIC ---
  const handleJoinWorld = async (world) => {
    const isAlreadyJoined = world.players.includes(currentUserId);

    if (isAlreadyJoined) {
      // Kalau sudah join, langsung masuk
      console.log(`🚀 Entering World ${world.worldId}...`);
      enterGame(world.worldId);
    } else {
      // Kalau BELUM join -> Proses Spawn & Minting
      if (world.status === 'FULL') return;
      
      // Cek MetaMask
      if (!window.ethereum) {
        alert("MetaMask is required to join a new world!");
        return;
      }

      try {
        setJoiningId(world.worldId);
        setJoinStep("Allocating Territory..."); // Step 1
        
        // 1. REQUEST SPAWN LOCATION KE SERVER
        const spawnRes = await fetch('http://localhost:5000/api/worlds/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worldId: world.worldId,
            userId: currentUserId 
          })
        });

        // Validasi Response Server (Mencegah error "<" unexpected token)
        const contentType = spawnRes.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await spawnRes.text();
            console.error("Server Error Response:", text);
            throw new Error("Server Error: Endpoint /join tidak ditemukan atau error internal.");
        }

        const data = await spawnRes.json();
        if (!spawnRes.ok) throw new Error(data.msg || "Failed to join");

        console.log("✅ Server Spawn Success:", data);
        
        // 2. SIAPKAN METADATA URL & TOKEN ID YANG KONSISTEN
        // Kita generate ID unik (timestamp) agar URL metadata dan ID di DB sama
        const tempTokenId = Date.now().toString(); 
        const API_URL = "https://crumply-stalky-delilah.ngrok-free.dev/api/users/metadata/";
        
        // URL ini yang akan disimpan di Blockchain (Smart Contract)
        const tokenURI = `${API_URL}${tempTokenId}`; 

        setJoinStep("Minting Kingdom NFT..."); // Step 2 (MetaMask Popup)
        
        // 3. MINT NFT DENGAN URI YANG BENAR
        const kingdomName = localStorage.getItem('username') || "Unknown King";
        
        // Panggil fungsi Web3
        const mintResult = await mintKingdomNFT(
            kingdomName, 
            data.spawnLocation.x, 
            data.spawnLocation.y, 
            tokenURI // <--- Kirim URI yang sudah ada ID-nya
        );
        
        if (!mintResult.success) {
          throw new Error("Blockchain Minting Failed: " + mintResult.error);
        }

        console.log("✅ NFT Minted on Chain!");
        setJoinStep("Finalizing...");

        // 4. LINK TOKEN ID KE DATABASE
        // Agar saat OpenSea memanggil URL tadi, server tau data siapa yang harus dikirim
        await fetch('http://localhost:5000/api/users/link-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId,
                worldId: world.worldId,
                tokenId: tempTokenId // <--- GUNAKAN ID YANG SAMA DENGAN URI
            })
        });

        console.log("✅ Identity Linked!");
        enterGame(world.worldId);

      } catch (err) {
        // Tampilkan error yang lebih bersahabat
        alert(`Join Failed: ${err.message}`);
        console.error(err);
        setJoiningId(null);
        setJoinStep("");
      }
    }
  };

  const enterGame = (worldId) => {
    localStorage.setItem('currentWorldId', worldId);
    navigate('/ingame');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#1a2332] border border-[#4b5563] rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-[#4b5563] flex justify-between items-center bg-[#1f2937]">
          <div>
            <h2 className="text-2xl font-bold font-['Cinzel'] text-[#d4af37] tracking-wider flex items-center gap-2">
              <Globe className="w-6 h-6" /> SELECT REALM
            </h2>
            <p className="text-sm text-gray-400 mt-1">Choose a timeline to conquer. Seasons last 30 days.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#4b5563] bg-[#1a2332]">
             <button 
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2
                  ${activeTab === 'all' 
                    ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-b-2 border-[#00d4ff]' 
                    : 'text-gray-400 hover:bg-[#1f2937] hover:text-white'}`}
              >
                <Globe className="w-4 h-4" /> ALL REALMS
              </button>
              <button 
                onClick={() => setActiveTab('my')}
                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2
                  ${activeTab === 'my' 
                    ? 'bg-[#d4af37]/10 text-[#d4af37] border-b-2 border-[#d4af37]' 
                    : 'text-gray-400 hover:bg-[#1f2937] hover:text-white'}`}
              >
                <Shield className="w-4 h-4" /> MY ACTIVE REALM
              </button>
        </div>

        {/* LIST SERVER */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f172a] min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-12 h-12 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#00d4ff] animate-pulse">Detecting timelines...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-400 space-y-2">
              <AlertCircle className="w-10 h-10" />
              <p>{error}</p>
              <button onClick={fetchWorlds} className="text-sm underline hover:text-white">Try Again</button>
            </div>
          ) : displayWorlds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No realms found in this category.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {displayWorlds.map((world) => {
                const isJoined = world.players.includes(currentUserId);
                const isFull = world.players.length >= world.maxPlayers;
                const progress = (world.players.length / world.maxPlayers) * 100;

                return (
                  <div 
                    key={world.worldId}
                    className={`relative group rounded-lg border p-5 transition-all duration-300
                      ${isJoined 
                        ? 'bg-gradient-to-r from-[#d4af37]/10 to-[#1f2937] border-[#d4af37]/50' 
                        : 'bg-[#1f2937] border-[#4b5563] hover:border-[#00d4ff]/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`font-['Cinzel'] text-xl font-bold ${isJoined ? 'text-[#d4af37]' : 'text-white'}`}>
                            WORLD #{world.worldId}: {world.name}
                          </h3>
                          {isJoined && (
                            <span className="px-2 py-0.5 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] text-[10px] font-bold rounded uppercase tracking-wider">
                              Commander Active
                            </span>
                          )}
                        </div>
                        {/* Info Status */}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                           <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-green-500" />
                            Status: <span className="text-green-400 font-bold">{world.status}</span>
                          </span>
                           <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {world.players.length}/{world.maxPlayers}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col items-end gap-3 min-w-[160px]">
                        
                        {/* Progress Bar */}
                        <div className="w-full text-right">
                          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden ml-auto">
                            <div 
                              className={`h-full rounded-full ${isJoined ? 'bg-[#d4af37]' : 'bg-[#00d4ff]'}`} 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Button JOIN / CONTINUE */}
                        <button 
                          onClick={() => handleJoinWorld(world)}
                          disabled={joiningId === world.worldId || (!isJoined && isFull)}
                          className={`px-6 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all shadow-lg min-w-[140px] justify-center
                            ${joiningId === world.worldId 
                                ? 'bg-indigo-600 text-white cursor-wait animate-pulse' 
                                : isJoined
                                  ? 'bg-[#d4af37] hover:bg-[#b5952f] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                                  : isFull
                                    ? 'bg-red-900/20 text-red-500 border border-red-900 cursor-not-allowed'
                                    : 'bg-[#00d4ff] hover:bg-[#00bfe6] text-[#0f172a] shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                            }`}
                        >
                            {joiningId === world.worldId ? (
                             <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin"/> {joinStep}
                             </span>
                            ) : isJoined ? (
                              <>CONTINUE <ChevronRightIcon /></>
                            ) : isFull ? (
                              <><Lock className="w-3 h-3"/> FULL</>
                            ) : (
                              <>JOIN REALM</>
                            )}
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#1a2332] border-t border-[#4b5563] text-center text-xs text-gray-500">
          Minting a Kingdom requires a small amount of GO/ETH gas fee on Hardhat Network.
        </div>
      </div>
    </div>
  );
};

// Helper Icon
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default ServerLobbyModal;