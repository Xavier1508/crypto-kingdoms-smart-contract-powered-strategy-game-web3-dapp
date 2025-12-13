import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import GameMap from '../components/ingamepageComp/GameMap';
import GameUI from '../components/ingamepageComp/GameUI';

const InGamePage = () => {
    const navigate = useNavigate();
    const mapRef = useRef(null); // Ref untuk akses fungsi kamera di GameMap

    const [worldData, setWorldData] = useState({
        mapGrid: null,
        ownershipMap: null,
        playerData: null
    });
    
    const [worldInfo, setWorldInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTile, setSelectedTile] = useState(null);

    // Load Data
    useEffect(() => {
        const loadGameWorld = async () => {
            const currentWorldId = localStorage.getItem('currentWorldId');
            const userId = localStorage.getItem('userId');

            if (!currentWorldId) {
                navigate('/game');
                return;
            }

            try {
                setLoading(true);
                const res = await fetch(`http://localhost:5000/api/worlds/${currentWorldId}/map`);
                const data = await res.json();
                
                if (!res.ok) throw new Error("Failed to load map");

                // Set Data State
                setWorldData({
                    mapGrid: data.mapGrid,
                    ownershipMap: data.ownershipMap,
                    playerData: data.playerData // Object { userId: { color, castleX, castleY } }
                });

                setWorldInfo({
                    worldId: data.worldId,
                    mapSize: data.mapSize,
                    online: 32 
                });
                
                // --- AUTO FOCUS CAMERA KE CASTLE PEMAIN ---
                if (data.playerData && userId) {
                    const myData = data.playerData[userId];
                    if (myData && mapRef.current) {
                        console.log("Found player castle at:", myData.castleX, myData.castleY);
                        // Beri delay sedikit agar Pixi selesai init
                        setTimeout(() => {
                            mapRef.current.centerOnTile(myData.castleX, myData.castleY);
                        }, 500);
                    }
                }

            } catch (err) {
                console.error("Map Load Error:", err);
                navigate('/game');
            } finally {
                setLoading(false);
            }
        };

        loadGameWorld();
    }, [navigate]);

    const handleTileClick = async (x, y) => {
        // Fetch detail tile (logic fetch detail tetap sama)
        // ...
        // Placeholder UI trigger
        setSelectedTile({ x, y, type: 1, name: "Wilderness" });
    };

    const handleCloseTileInfo = () => setSelectedTile(null);
    const handleBackToLobby = () => navigate('/game');
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

    if (loading) return <div className="text-white bg-black h-screen flex items-center justify-center">Loading Kingdom...</div>;

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            
            {/* PASS REF KE GAMEMAP */}
            <GameMap 
                ref={mapRef}
                mapGrid={worldData.mapGrid} 
                ownershipMap={worldData.ownershipMap}
                playerData={worldData.playerData}
                onTileClick={handleTileClick} 
            />

            <GameUI 
                worldInfo={worldInfo}
                selectedTile={selectedTile}
                onBack={handleBackToLobby}
                onLogout={handleLogout}
                onCloseTileInfo={handleCloseTileInfo}
            />
        </div>
    );
};

export default InGamePage;