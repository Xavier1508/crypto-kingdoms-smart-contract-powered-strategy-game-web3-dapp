// server/controllers/worldController.js
const World = require('../models/World');
const { Province, ProvinceManager } = require('../models/ProvinceManager');
const { generateRoKMap } = require('../utils/voronoiMapGenerator'); 

// --- HELPER: Generate Warna Random (Pastel/Neon) ---
const generatePlayerColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`; // HSL to ensure distinct, nice colors
};

// --- HELPER: Init Empty Grid ---
const createEmptyGrid = (size) => Array(size).fill().map(() => Array(size).fill(null));

/**
 * 1. Get All Worlds
 */
const getWorldsList = async (req, res) => {
    // ... (CODE SAMA SEPERTI SEBELUMNYA) ...
    try {
        const worlds = await World.find({}, '-mapGrid -ownershipMap').lean(); // Exclude heavy data
        // ... (sisanya sama)
        res.json(worlds);
    } catch (error) {
        console.error("❌ Error fetching worlds:", error);
        res.status(500).json({ error: 'Failed to fetch worlds' });
    }
};

/**
 * 2. Get World Map (Updated untuk kirim ownership)
 */
const getWorldMap = async (req, res) => {
    try {
        const { worldId } = req.params;
        const world = await World.findOne({ worldId: worldId }).lean(); // Use .lean() for speed

        if (!world) return res.status(404).json({ success: false, error: 'World not found' });

        const daysPassed = Math.floor((Date.now() - world.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        // Return ownership map & player data too
        res.json({
            success: true,
            worldId: world.worldId,
            mapGrid: world.mapGrid,
            ownershipMap: world.ownershipMap || [], // NEW
            playerData: world.playerData || {},     // NEW
            mapSize: world.mapSize,
            currentDay: daysPassed
        });
    } catch (error) {
        console.error('❌ Error getting world map:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * 3. Regenerate Map (Updated untuk reset ownership)
 */
const regenerateWorldMap = async (req, res) => {
    try {
        const { worldId } = req.params;
        const mapData = generateRoKMap(200);
        
        // Reset ownership saat regenerasi
        const emptyOwnership = createEmptyGrid(200);

        const updatedWorld = await World.findOneAndUpdate(
            { worldId: worldId },
            { 
                mapGrid: mapData.grid,
                provinceMap: mapData.provinceMap,
                ownershipMap: emptyOwnership, // Reset owners
                playerData: {}, // Reset player colors
                players: [], // Kick all players (Opsional, tergantung aturan game)
                mapSize: 200,
            },
            { new: true }
        );
        
        if (!updatedWorld) return res.status(404).json({ error: 'World not found' });
        await ProvinceManager.initializeProvinces(worldId, mapData.provinces);

        res.json({ success: true, message: 'Map regenerated & Ownership Reset' });
    } catch (error) {
        console.error('❌ Error regenerating map:', error);
        res.status(500).json({ success: false, error: 'Failed' });
    }
};

/**
 * 4. Join World (SPAWN LOGIC 3x3)
 */
const joinWorld = async (req, res) => {
    try {
        const { worldId, userId } = req.body;
        // Gunakan Mongoose Document (jangan lean) agar bisa save()
        const world = await World.findOne({ worldId: worldId });

        if (!world) return res.status(404).json({ msg: "World not found" });
        
        // Cek apakah user sudah ada di list players
        const isJoined = world.players.some(p => p.toString() === userId);
        
        // Jika sudah join, kembalikan lokasi castle dia yang sudah ada
        if (isJoined) {
            const pData = world.playerData.get(userId);
            return res.json({ 
                msg: "Welcome back, Commander!", 
                worldId, 
                spawnLocation: pData ? { x: pData.castleX, y: pData.castleY } : null 
            });
        }

        if (world.players.length >= world.maxPlayers) {
            return res.status(400).json({ msg: "World Full" });
        }

        // --- ALGORITMA SPAWN 3x3 ---
        
        // 1. Ambil list provinsi Outer yang aman
        const outerProvinces = await Province.find({
            worldId, layer: 'outer', isUnlocked: true
        }).lean();

        if (outerProvinces.length === 0) return res.status(500).json({ msg: "No spawn zones available" });

        // 2. Inisialisasi ownershipMap jika belum ada
        if (!world.ownershipMap || world.ownershipMap.length === 0) {
            world.ownershipMap = createEmptyGrid(world.mapSize);
        }

        let spawnFound = false;
        let finalX, finalY;
        let attempt = 0;
        const MAX_ATTEMPTS = 200; // Mencegah infinite loop

        while (!spawnFound && attempt < MAX_ATTEMPTS) {
            attempt++;
            
            // A. Pilih Provinsi Random
            const prov = outerProvinces[Math.floor(Math.random() * outerProvinces.length)];
            
            // B. Pilih Titik Random di sekitar center provinsi (Radius 15)
            const cx = Math.round(prov.centerX + (Math.random() * 30 - 15));
            const cy = Math.round(prov.centerY + (Math.random() * 30 - 15));

            // C. Validasi Bounds
            if (cx < 2 || cx >= world.mapSize - 2 || cy < 2 || cy >= world.mapSize - 2) continue;

            // D. Validasi Area 3x3 (Harus Zone 1 & Kosong)
            let areaClear = true;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const checkX = cx + i;
                    const checkY = cy + j;

                    // Syarat 1: Harus Tipe 1 (Wilderness/Grass) - Bukan Gunung/Air
                    if (world.mapGrid[checkX][checkY] !== 1) {
                        areaClear = false; break;
                    }
                    // Syarat 2: Belum ada yang punya
                    if (world.ownershipMap[checkX][checkY]) {
                        areaClear = false; break;
                    }
                }
                if (!areaClear) break;
            }

            if (areaClear) {
                spawnFound = true;
                finalX = cx;
                finalY = cy;
            }
        }

        if (!spawnFound) {
            return res.status(400).json({ msg: "World is too crowded, cannot find safe spawn!" });
        }

        // --- SPAWN SUKSES ---
        
        // 3. Generate Data Player
        const playerColor = generatePlayerColor(); // Helper function (Hex/HSL)
        
        // 4. Update Database
        
        // A. Masukkan User ke List
        world.players.push(userId);
        
        // B. Simpan Metadata Player
        if (!world.playerData) world.playerData = new Map();
        world.playerData.set(userId, {
            color: playerColor,
            castleX: finalX,
            castleY: finalY,
            username: "Commander" // Nanti ambil dari User Model jika perlu
        });

        // C. Klaim Area 3x3 di OwnershipMap
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                world.ownershipMap[finalX + i][finalY + j] = userId;
            }
        }
        
        // D. Mark Modified (Penting untuk Array/Map di Mongoose)
        world.markModified('ownershipMap');
        world.markModified('playerData');
        
        await world.save();

        res.json({ 
            msg: "Kingdom Founded!", 
            worldId,
            spawnLocation: { x: finalX, y: finalY },
            playerColor: playerColor
        });

    } catch (err) {
        console.error('❌ Join error:', err);
        res.status(500).send('Server Error');
    }
};

/**
 * 5. Get Tile Info
 */
const getTileInfo = async (req, res) => {
    try {
        const { worldId, x, y } = req.params;
        const world = await World.findOne({ worldId });
        
        if (!world) return res.status(404).json({ error: 'World not found' });

        const tileX = parseInt(x);
        const tileY = parseInt(y);
        
        if (!world.mapGrid[tileX] || typeof world.mapGrid[tileX][tileY] === 'undefined') {
             return res.status(400).json({ error: 'Out of bounds' });
        }

        const tileType = world.mapGrid[tileX][tileY];
        
        const tileNames = {
            0: 'Void',
            1: 'Zone 1 (Safe Province)',
            2: 'Zone 2 (Resource Province)',
            3: 'Zone 3 (Elite Province)',
            4: 'Mountains',
            5: 'Level 1 Pass',
            6: 'Level 2 Pass',
            7: 'Border Pass',
            8: 'Ancient Sanctuary',
            9: 'The Lost Kingdom (Temple)',
        };
        
        // Find which province this tile belongs to
        let provinceInfo = null;
        if (world.provinceMap && world.provinceMap[tileX] && world.provinceMap[tileX][tileY]) {
            const provinceId = world.provinceMap[tileX][tileY];
            const province = await Province.findOne({ worldId, provinceId }).lean();
            if (province) {
                provinceInfo = {
                    id: province.provinceId,
                    layer: province.layer,
                    isUnlocked: province.isUnlocked,
                    unlockDay: province.unlockDay,
                    controlledBy: province.controlledBy
                };
            }
        }

        res.json({
            success: true,
            tile: {
                x: tileX,
                y: tileY,
                type: tileType,
                name: tileNames[tileType] || 'Unknown',
                isClaimable: [1, 2, 3].includes(tileType),
                province: provinceInfo
            }
        });
    } catch (error) {
        console.error('❌ Tile info error:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

/**
 * 6. Get Province Details (NEW!)
 */
const getProvinceDetails = async (req, res) => {
    try {
        const { worldId, provinceId } = req.params;
        
        const province = await ProvinceManager.getProvinceInfo(
            parseInt(worldId), 
            parseInt(provinceId)
        );
        
        if (!province) {
            return res.status(404).json({ error: 'Province not found' });
        }
        
        res.json({
            success: true,
            province: province
        });
    } catch (error) {
        console.error('❌ Province details error:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

module.exports = {
    getWorldsList,
    getWorldMap,
    regenerateWorldMap,
    joinWorld,
    getTileInfo,
    getProvinceDetails,
};