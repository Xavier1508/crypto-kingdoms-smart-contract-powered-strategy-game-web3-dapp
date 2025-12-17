import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'; // Import Socket Client

// Import Component
import GameMap from '../components/ingamepageComp/GameMap';
import GameUI from '../components/ingamepageComp/uiParts/GameUI';
import { TILE_NAMES, TILE_DESCRIPTIONS } from '../components/ingamepageComp/mapModules/MapConstants';

const InGamePage = () => {
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const socketRef = useRef(null);
    const [myStats, setMyStats] = useState(null);

    const [worldData, setWorldData] = useState({
        mapGrid: null, ownershipMap: null, playerData: null
    });
    const [worldInfo, setWorldInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTile, setSelectedTile] = useState(null);
    const [initialCameraPos, setInitialCameraPos] = useState(null);

    const handleJumpHomeCastle = () => {
        if (myStats && myStats.castleX !== undefined && myStats.castleY !== undefined) {
            console.log(`Jumping to Home Castle: ${myStats.castleX}, ${myStats.castleY}`);
            if (mapRef.current) {
                mapRef.current.centerOnTile(myStats.castleX, myStats.castleY);
            }
        } else {
            alert("Castle coordinates not found!");
        }
    };

    const handleTrainTroops = async (troopType, amount) => {
        const currentWorldId = localStorage.getItem('currentWorldId');
        const userId = localStorage.getItem('userId');

        if (!currentWorldId || !userId) return;

        try {
            const res = await fetch('http://localhost:5000/api/worlds/train', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    worldId: currentWorldId,
                    userId: userId,
                    troopType: troopType,
                    amount: amount
                })
            });

            const data = await res.json();
            
            if (data.success) {
                console.log("Training Started:", data.msg);
                // Kita tidak perlu manual update state disini, 
                // karena server akan emit socket 'resource_update' 
                // yang sudah kita listen di useEffect.
            } else {
                alert("Training Failed: " + data.error);
            }

        } catch (err) {
            console.error("Training Error:", err);
        }
    };

    const handleConquerTile = async (targetX, targetY) => {
        const currentWorldId = localStorage.getItem('currentWorldId');
        const userId = localStorage.getItem('userId');

        if (!currentWorldId || !userId) return;

        try {
            // Tampilkan loading visual sementara (opsional)
            console.log(`⚔️ Attempting to conquer (${targetX}, ${targetY})...`);

            const res = await fetch('http://localhost:5000/api/worlds/conquer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    worldId: currentWorldId,
                    userId: userId,
                    targetX: targetX,
                    targetY: targetY
                })
            });

            const data = await res.json();
            
            if (data.success) {
                // Sukses! Tutup panel info atau beri notifikasi
                alert(`Victory! ${data.msg}`);
                handleCloseTileInfo(); 
                
                // Fetch map ulang tidak perlu manual karena Socket akan handle
            } else {
                // Gagal (Misal: Power kurang atau tidak nyambung)
                alert("Conquest Failed: " + data.error);
            }

        } catch (err) {
            console.error("Conquer Error:", err);
            alert("Connection Error during conquest.");
        }
    };


    // Fungsi Fetch Map (Dipisahkan agar bisa dipanggil ulang saat update)
    const fetchMapData = async () => {
        const currentWorldId = localStorage.getItem('currentWorldId');
        if (!currentWorldId) return;

        try {
            const res = await fetch(`http://localhost:5000/api/worlds/${currentWorldId}/map`);
            if (!res.ok) throw new Error("Gagal load map");
            const data = await res.json();

            setWorldData({
                mapGrid: data.mapGrid,
                ownershipMap: data.ownershipMap,
                playerData: data.playerData
            });

            setWorldInfo(prev => ({
                ...prev,
                worldId: data.worldId,
                mapSize: data.mapSize
            }));
            
            return data; // Return data untuk usage lain jika perlu

        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    // --- 1. INITIAL LOAD & SOCKET SETUP ---
    useEffect(() => {
        const currentWorldId = localStorage.getItem('currentWorldId');
        const userId = localStorage.getItem('userId');

        if (!currentWorldId) {
            navigate('/game');
            return;
        }

        // A. Load Data Awal
        const initGame = async () => {
            setLoading(true);
            const data = await fetchMapData();
            
            if (data && data.playerData && userId) {
                const myData = data.playerData[userId];
                if (myData && myData.castleX !== undefined) {
                    setInitialCameraPos({ x: myData.castleX, y: myData.castleY });
                }
            }
            setLoading(false);
        };
        initGame();

        const socket = io('http://localhost:5000'); 
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log("Connected to Socket Server ID:", socket.id);
            if (currentWorldId) {
                socket.emit('join_world_room', String(currentWorldId)); 
            }
        });

        socket.on('map_updated', (data) => {
            console.log("🔥 Map Update:", data);

            if (data.type === 'TILE_CONQUERED') {
                setWorldData(prev => {
                    if (!prev.ownershipMap) return prev;
                    
                    // Clone array 2D (Shallow clone barisnya biar cepat)
                    const newOwnership = [...prev.ownershipMap];
                    // Clone baris spesifik yang berubah
                    newOwnership[data.x] = [...newOwnership[data.x]];
                    // Update nilai
                    newOwnership[data.x][data.y] = data.newOwnerId;

                    return {
                        ...prev,
                        ownershipMap: newOwnership
                    };
                });
            } else {
                // Jika update besar (misal player baru join), baru fetch ulang
                fetchMapData(); 
            }
        });
        
        socket.on('resource_update', (data) => {
            const myId = localStorage.getItem('userId');
            
            setWorldData(prev => {
                const newPlayerData = { ...prev.playerData, ...data.playerData };
                
                // Update stats saya sendiri
                if (newPlayerData[myId]) {
                    setMyStats(newPlayerData[myId]);
                }

                return {
                    ...prev,
                    playerData: newPlayerData
                };
            });
        });

        // Cleanup
        return () => {
            socket.disconnect();
        };
    }, [navigate]);

    const handleTileClick = (x, y) => {
        if (!worldData.mapGrid) return;

        const type = worldData.mapGrid[x][y];
        const ownerId = worldData.ownershipMap?.[x]?.[y];
        const myUserId = localStorage.getItem('userId');
        
        let ownerName = null;
        let ownerCastle = null; // Ini penting untuk fitur "Locate Enemy"
        let ownerColor = null;
        let ownerPower = 0;
        let isEnemy = false;

        if (ownerId && worldData.playerData) {
            const pData = worldData.playerData[ownerId];
            if (pData) {
                ownerName = pData.username || "Unknown Lord"; 
                ownerCastle = { x: pData.castleX, y: pData.castleY }; // <--- Pastikan ini ada
                ownerColor = pData.color;
                ownerPower = pData.power || 0;
                
                if (ownerId !== myUserId) {
                    isEnemy = true;
                }
            }
        }

        // Tentukan Deskripsi Berdasarkan Status
        let description = TILE_DESCRIPTIONS[type];
        if (ownerId) {
            description = isEnemy 
                ? `Occupied territory of ${ownerName}. Attack to reduce their influence!`
                : "Your sovereign territory. Defend it at all costs.";
        }

        setSelectedTile({
            x, y, type,
            name: TILE_NAMES[type] || "Unknown Region",
            description: description, // Deskripsi dinamis
            
            // Logic Claim: Bisa diclaim jika (Tanah Kosong) ATAU (Punya Musuh & Kita Punya Power)
            isClaimable: ([1, 2, 3].includes(type) && !ownerId) || (isEnemy), 
            
            ownerId,
            ownerName, 
            ownerCastle, 
            ownerColor,
            ownerPower,
            isEnemy
        });
    };

    const handleJumpToCoord = (x, y) => {
        if (mapRef.current) mapRef.current.centerOnTile(x, y);
    };

    const handleCloseTileInfo = () => setSelectedTile(null);
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };
    const handleBackToLobby = () => navigate('/game');

    if (loading) return <div className="flex items-center justify-center h-screen bg-black text-[#d4af37] font-bold">CONNECTING TO SERVER...</div>;
    
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            <GameMap 
                ref={mapRef}
                mapGrid={worldData.mapGrid} 
                ownershipMap={worldData.ownershipMap}
                playerData={worldData.playerData}
                onTileClick={handleTileClick}
                initialCenterX={initialCameraPos?.x}
                initialCenterY={initialCameraPos?.y}
                selectedTile={selectedTile}
            />

            <GameUI 
                worldInfo={worldInfo}
                selectedTile={selectedTile}
                onBack={handleBackToLobby}
                onLogout={handleLogout}
                onCloseTileInfo={handleCloseTileInfo}
                onJumpToCoord={handleJumpToCoord}
                playerStats={myStats}
                onTrainTroops={handleTrainTroops}
                onConquerTile={handleConquerTile}
                onJumpHome={handleJumpHomeCastle}
            />
        </div>
    );
};

export default InGamePage;