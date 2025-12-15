// server/controllers/worldController.js
const World = require('../models/World');
const { Province, ProvinceManager } = require('../models/ProvinceManager');
const { generateRoKMap } = require('../utils/voronoiMapGenerator'); 
const User = require('../models/User');

const generatePlayerColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
const createEmptyGrid = (size) => Array(size).fill().map(() => Array(size).fill(null));

const getWorldsList = async (req, res) => {
    try {
        const worlds = await World.find({}, '-mapGrid -ownershipMap -provinceMap').lean(); 
        res.json(worlds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch worlds' });
    }
};

const getWorldMap = async (req, res) => {
    try {
        const { worldId } = req.params;
        const world = await World.findOne({ worldId: worldId }).lean(); 

        if (!world) return res.status(404).json({ success: false, error: 'World not found' });

        const daysPassed = Math.floor((Date.now() - world.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        res.json({
            success: true,
            worldId: world.worldId,
            mapGrid: world.mapGrid,
            ownershipMap: world.ownershipMap || [], 
            playerData: world.playerData || {},     
            mapSize: world.mapSize,
            currentDay: daysPassed
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

const regenerateWorldMap = async (req, res) => {
    try {
        const { worldId } = req.params;
        const MAP_SIZE = 400;
        
        const mapData = generateRoKMap(MAP_SIZE);
        const emptyOwnership = createEmptyGrid(MAP_SIZE);

        const updatedWorld = await World.findOneAndUpdate(
            { worldId: worldId },
            { 
                mapGrid: mapData.grid,
                provinceMap: mapData.provinceMap,
                ownershipMap: emptyOwnership, 
                playerData: {}, 
                players: [], 
                mapSize: MAP_SIZE,
            },
            { new: true }
        );
        
        if (!updatedWorld) return res.status(404).json({ error: 'World not found' });
        
        await ProvinceManager.initializeProvinces(worldId, mapData.provinces);
        await ProvinceManager.calculateAdjacency(worldId, mapData.provinceMap, mapData.grid);

        res.json({ success: true, message: 'Map regenerated' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed' });
    }
};

const joinWorld = async (req, res) => {
    try {
        const { worldId, userId } = req.body;
        const world = await World.findOne({ worldId: worldId });
        const userDocs = await User.findById(userId);
        const realUsername = userDocs ? userDocs.username : "Unknown Lord"; 

        if (!world) return res.status(404).json({ msg: "World not found" });
        
        const io = req.app.get('io'); 
        const isJoined = world.players.some(p => p.toString() === userId);
        
        if (isJoined) {
            let pData = world.playerData.get(userId) || world.playerData[userId];
            return res.json({ 
                msg: "Welcome back", 
                worldId, 
                spawnLocation: pData ? { x: pData.castleX, y: pData.castleY } : null 
            });
        }

        if (world.players.length >= world.maxPlayers) {
            return res.status(400).json({ msg: "World Full" });
        }

        // Get outer provinces
        const outerProvinces = await Province.find({
            worldId, layer: 'outer', isUnlocked: true
        }).lean();

        if (outerProvinces.length === 0) {
            return res.status(500).json({ msg: "No spawn zones available" });
        }

        // Init ownership if needed
        if (!world.ownershipMap || world.ownershipMap.length !== world.mapSize) {
            world.ownershipMap = createEmptyGrid(world.mapSize);
        }

        let spawnFound = false;
        let finalX, finalY;
        let attempt = 0;
        const MAX_ATTEMPTS = 300;

        while (!spawnFound && attempt < MAX_ATTEMPTS) {
            attempt++;
            
            // Pick random outer province
            const prov = outerProvinces[Math.floor(Math.random() * outerProvinces.length)];
            
            // Random position near province center
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * 35;
            const cx = Math.round(prov.centerX + Math.cos(angle) * distance);
            const cy = Math.round(prov.centerY + Math.sin(angle) * distance);

            // Bounds check
            if (cx < 3 || cx >= world.mapSize - 3 || cy < 3 || cy >= world.mapSize - 3) continue;

            // Check 3x3 area
            let areaClear = true;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const checkX = cx + i;
                    const checkY = cy + j;
                    
                    if (!world.mapGrid[checkX] || !world.ownershipMap[checkX]) {
                        areaClear = false; 
                        break;
                    }

                    const tile = world.mapGrid[checkX][checkY];
                    if (tile !== 1) { areaClear = false; break; } // Must be Zone 1 (outer grass)
                    if (world.ownershipMap[checkX][checkY]) { areaClear = false; break; }
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
            return res.status(400).json({ msg: "No spawn space available" });
        }

        // Create player
        const playerColor = generatePlayerColor(); 
        world.players.push(userId);
        
        if (!world.playerData) world.playerData = new Map();

        world.playerData.set(userId, {
            username: realUsername,
            color: playerColor,
            castleX: finalX,
            castleY: finalY,
            power: 1000,
            resources: { food: 1000, wood: 1000, stone: 500, gold: 200 },
            troops: { infantry: 100, archer: 0, cavalry: 0, siege: 0 }
        });
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                world.ownershipMap[finalX + i][finalY + j] = userId;
            }
        }
        
        world.markModified('ownershipMap');
        world.markModified('playerData');
        await world.save();

        if (io) {
            io.to(`world_${worldId}`).emit('map_updated', {
                type: 'NEW_PLAYER',
                userId: userId,
                castleX: finalX,
                castleY: finalY,
                color: playerColor
            });
        }

        res.json({ 
            msg: "Kingdom Founded!", 
            worldId,
            spawnLocation: { x: finalX, y: finalY },
            playerColor: playerColor
        });

    } catch (err) {
        res.status(500).send('Server Error: ' + err.message);
    }
};

const getTileInfo = async (req, res) => {
    try {
        const { worldId, x, y } = req.params;
        const world = await World.findOne({ worldId });
        
        if (!world) return res.status(404).json({ error: 'World not found' });

        const tileX = parseInt(x);
        const tileY = parseInt(y);
        
        // Validasi Koordinat
        if (tileX < 0 || tileX >= world.mapSize || tileY < 0 || tileY >= world.mapSize) {
             return res.status(400).json({ error: 'Out of bounds' });
        }

        const tileType = world.mapGrid[tileX][tileY];
        const ownerId = world.ownershipMap[tileX][tileY]; // Ambil ID pemilik
        
        // Cari Data Pemilik (Jika ada)
        let ownerName = null;
        let ownerCastle = null;
        let ownerColor = null;

        if (ownerId) {
            // Karena playerData di Map, kita ambil valuenya
            const pData = world.playerData.get(ownerId);
            if (pData) {
                ownerName = pData.username;
                ownerCastle = { x: pData.castleX, y: pData.castleY };
                ownerColor = pData.color;
            }
        }

        const tileNames = {
            0: "Void", 1: "Outer Province", 2: "Mid Province", 3: "Inner Province",
            4: "Mountain Range", 5: "Level 1 Pass", 6: "Level 2 Pass", 7: "Border Gate",
            10: "Cropland", 11: "Logging Camp", 12: "Stone Deposit", 13: "Gold Mine",
            20: "Barbarian Camp", 21: "Barbarian Keep",
            30: "Darkness Altar", 31: "Ancient Ruins", 32: "Shrine of Warriors",
            35: "Circle of Nature",
            40: "The Great Ziggurat",
        };

        res.json({
            success: true,
            tile: {
                x: tileX,
                y: tileY,
                type: tileType,
                name: tileNames[tileType] || 'Unknown Region',
                isClaimable: [1, 2, 3].includes(tileType) && !ownerId, // Hanya bisa claim tanah kosong
                ownerId: ownerId,
                ownerName: ownerName,
                ownerCastle: ownerCastle,
                ownerColor: ownerColor
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tile info' });
    }
};

const conquerTile = async (req, res) => {
    try {
        const { worldId, userId, targetX, targetY } = req.body;
        const CONQUER_COST = 500; 

        // 1. Cek Data Awal (Read Only - Cepat)
        // Kita gunakan .lean() agar return object JS biasa (ringan)
        const world = await World.findOne({ worldId }).select('mapSize mapGrid ownershipMap playerData').lean();
        
        if (!world) return res.status(404).json({ error: "World not found" });

        // Ambil data player dari Map object
        // Perhatikan: Karena .lean(), playerData adalah object biasa, bukan Map Mongoose
        const pData = world.playerData[userId]; 
        
        if (!pData) return res.status(404).json({ error: "Player not found" });

        const tx = parseInt(targetX);
        const ty = parseInt(targetY);

        // --- VALIDASI (Logic Sama) ---
        if (tx < 0 || tx >= world.mapSize || ty < 0 || ty >= world.mapSize) {
            return res.status(400).json({ error: "Out of bounds!" });
        }
        
        // Cek Tipe Tile
        const tileType = world.mapGrid[tx][ty];
        if (![1, 2, 3].includes(tileType)) { 
            return res.status(400).json({ error: "Terrain cannot be conquered!" });
        }
        
        // Cek Milik Sendiri
        // Akses array 2D secara langsung
        if (world.ownershipMap[tx] && world.ownershipMap[tx][ty] === userId) {
            return res.status(400).json({ error: "You already own this territory!" });
        }
        
        // Cek Power
        if (pData.power < CONQUER_COST) {
            return res.status(400).json({ error: `Not enough Power! Need ${CONQUER_COST}` });
        }

        // Cek Adjacency (Nyambung)
        const neighbors = [
            [tx-1, ty], [tx+1, ty], [tx, ty-1], [tx, ty+1], 
            [tx-1, ty-1], [tx+1, ty+1], [tx-1, ty+1], [tx+1, ty-1] 
        ];

        let isConnected = false;
        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < world.mapSize && ny >= 0 && ny < world.mapSize) {
                if (world.ownershipMap[nx][ny] === userId) {
                    isConnected = true;
                    break;
                }
            }
        }

        if (!isConnected) {
            return res.status(400).json({ error: "Territory must be connected to your lands!" });
        }

        // --- EKSEKUSI ATOMIC (ANTI VERSION ERROR) ---
        // Kita update database langsung tanpa save document utuh
        // Syntax update array 2D di Mongo: "field.index1.index2"
        
        const updateQuery = {
            $set: {
                [`ownershipMap.${tx}.${ty}`]: userId, // Update HANYA 1 pixel kepemilikan
                [`playerData.${userId}.power`]: pData.power - CONQUER_COST // Update HANYA power user
            }
        };

        await World.updateOne({ worldId: worldId }, updateQuery);

        // --- SOCKET BROADCAST ---
        const io = req.app.get('io');
        if (io) {
            const roomName = `world_${String(worldId)}`;
            
            // Emit Update Map (Hanya tile yang berubah)
            io.to(roomName).emit('map_updated', {
                type: 'TILE_CONQUERED',
                x: tx, y: ty,
                newOwnerId: userId,
                color: pData.color
            });

            const partialPlayerData = {};
            partialPlayerData[userId] = { ...pData, power: pData.power - CONQUER_COST };

            io.to(roomName).emit('resource_update', {
                worldId: worldId,
                playerData: partialPlayerData,
                partial: true
            });
        }

        res.json({ success: true, msg: "Territory Conquered!", remainingPower: pData.power - CONQUER_COST });

    } catch (error) {
        console.error("Conquer Error:", error);
        res.status(500).json({ error: "Conquest failed (Server Error)" });
    }
};

const getProvinceDetails = async (req, res) => {
    try {
        const { worldId, provinceId } = req.params;
        const province = await ProvinceManager.getProvinceInfo(parseInt(worldId), parseInt(provinceId));
        if (!province) return res.status(404).json({ error: 'Province not found' });
        res.json({ success: true, province });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

const trainTroops = async (req, res) => {
    try {
        const { worldId, userId, troopType, amount } = req.body;
        
        // Konstanta Harga & Waktu
        const SPECS = {
            infantry: { food: 10, wood: 10, gold: 0, timePerUnit: 2000 }, // 2 detik per unit
            archer:   { food: 15, wood: 20, gold: 2, timePerUnit: 3000 },
            cavalry:  { food: 25, wood: 15, gold: 5, timePerUnit: 5000 },
            siege:    { food: 20, wood: 30, gold: 10, timePerUnit: 6000 }
        };

        const world = await World.findOne({ worldId });
        if (!world) return res.status(404).json({ error: "World not found" });

        const pData = world.playerData.get(userId);
        if (!pData) return res.status(404).json({ error: "Player not found" });

        // Cek Resource
        const costFood = SPECS[troopType].food * amount;
        const costWood = SPECS[troopType].wood * amount;
        const costGold = SPECS[troopType].gold * amount;

        if (pData.resources.food < costFood || pData.resources.wood < costWood || pData.resources.gold < costGold) {
            return res.status(400).json({ error: "Not enough resources!" });
        }

        // Cek apakah sudah ada antrian? (Opsional: Limit 1 antrian)
        // if (pData.trainingQueue.length > 0) return res.status(400).json({ error: "Barracks busy!" });

        // 1. Kurangi Resource (Bayar di muka)
        pData.resources.food -= costFood;
        pData.resources.wood -= costWood;
        pData.resources.gold -= costGold;

        // 2. Hitung Waktu Selesai
        const totalTimeMs = SPECS[troopType].timePerUnit * amount;
        const endTime = new Date(Date.now() + totalTimeMs);

        // 3. Masukkan ke Queue (Bukan langsung ke troops)
        pData.trainingQueue.push({
            troopType,
            amount: parseInt(amount),
            startTime: new Date(),
            endTime: endTime
        });

        world.markModified('playerData');
        await world.save();

        // 4. Emit update resource (Socket logic tetap sama)
        const io = req.app.get('io');
        if (io) {
            io.to(`world_${worldId}`).emit('resource_update', {
                worldId: world.worldId,
                playerData: world.playerData
            });
        }

        res.json({ success: true, msg: `Training ${amount} ${troopType} started!`, endTime });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Training failed server side" });
    }
};

module.exports = {
    getWorldsList,
    getWorldMap,
    regenerateWorldMap,
    joinWorld,
    getTileInfo,
    getProvinceDetails,
    trainTroops,
    conquerTile,
};