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
        
        // 1. Validasi Input
        if (!worldId || !userId) return res.status(400).json({ msg: "Invalid Data" });

        const world = await World.findOne({ worldId: worldId });
        const userDocs = await User.findById(userId);
        const realUsername = userDocs ? userDocs.username : "Unknown Lord"; 

        if (!world) return res.status(404).json({ msg: "World not found" });
        
        const io = req.app.get('io'); 

        // --- [LOGIKA PERBAIKAN START] ---
        // Kita cek Data Player secara mendalam, bukan cuma cek ID di array
        let pData = null;
        if (world.playerData) {
            pData = world.playerData.get(userId) || world.playerData[userId];
        }

        // Cek apakah castle user benar-benar ada koordinatnya
        const hasValidCastle = pData && pData.castleX !== undefined && pData.castleY !== undefined;

        // JIKA USER SUDAH PUNYA CASTLE VALID -> LANGSUNG MASUK (WELCOME BACK)
        if (hasValidCastle) {
            console.log(`User ${realUsername} returning to castle at ${pData.castleX}, ${pData.castleY}`);
            return res.json({ 
                msg: "Welcome back", 
                worldId, 
                spawnLocation: { x: pData.castleX, y: pData.castleY },
                playerData: pData // Kirim data lengkap biar frontend ga bingung
            });
        }
        // JIKA TIDAK PUNYA CASTLE (Meskipun ID ada di list players) -> LANJUT KE PROSES SPAWN DI BAWAH
        // --- [LOGIKA PERBAIKAN END] ---

        if (world.players.length >= world.maxPlayers && !world.players.includes(userId)) {
            return res.status(400).json({ msg: "World Full" });
        }

        // --- PROSES MENCARI LAHAN (SPAWN ALGORITHM) ---
        // Get outer provinces
        const outerProvinces = await Province.find({
            worldId, layer: 'outer', isUnlocked: true
        }).lean();

        if (outerProvinces.length === 0) {
            console.warn("⚠️ Warning: No outer provinces found. Using fallback spawn range.");
        }

        // Init ownership if needed
        if (!world.ownershipMap || world.ownershipMap.length !== world.mapSize) {
            world.ownershipMap = createEmptyGrid(world.mapSize);
        }

        let spawnFound = false;
        let finalX, finalY;
        let attempt = 0;
        const MAX_ATTEMPTS = 500;

        while (!spawnFound && attempt < MAX_ATTEMPTS) {
            attempt++;
            
            let cx, cy;

            if (outerProvinces.length > 0) {
                // Pick random outer province
                const prov = outerProvinces[Math.floor(Math.random() * outerProvinces.length)];
                // Random position near province center
                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.random() * 35;
                cx = Math.round(prov.centerX + Math.cos(angle) * distance);
                cy = Math.round(prov.centerY + Math.sin(angle) * distance);
            } else {
                // Fallback Logic (Random di pinggiran map 400x400)
                // Spawn di range 50-350
                cx = Math.floor(Math.random() * 300) + 50;
                cy = Math.floor(Math.random() * 300) + 50;
            }

            // Bounds check (Safety Margin 5 pixel dari ujung)
            if (cx < 5 || cx >= world.mapSize - 5 || cy < 5 || cy >= world.mapSize - 5) continue;

            // Check 3x3 area availability
            let areaClear = true;
            for (let i = -2; i <= 2; i++) { // Cek radius lebih luas (5x5) biar aman
                for (let j = -2; j <= 2; j++) {
                    const checkX = cx + i;
                    const checkY = cy + j;
                    
                    // Pastikan grid ada
                    if (!world.mapGrid[checkX]) { areaClear = false; break; }

                    // Cek Tipe Tanah (Harus Zone 1/Grass)
                    const tile = world.mapGrid[checkX][checkY];
                    if (tile !== 1) { areaClear = false; break; } 
                    
                    // Cek Kepemilikan (Harus Kosong/Null)
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
            console.error("❌ Failed to find spawn location after", MAX_ATTEMPTS, "attempts");
            return res.status(400).json({ msg: "No safe spawn space available. Please regenerate world." });
        }

        // --- CREATE / UPDATE PLAYER DATA ---
        const playerColor = generatePlayerColor(); 
        
        // Hanya push jika ID belum ada (untuk mencegah duplikasi array)
        if (!world.players.some(p => p.toString() === userId)) {
            world.players.push(userId);
        }
        
        if (!world.playerData) world.playerData = new Map();

        const newPlayerData = {
            username: realUsername,
            color: playerColor,
            castleX: finalX,
            castleY: finalY,
            power: 1000,
            // Resource Awal
            resources: { food: 1000, wood: 1000, stone: 500, gold: 200 },
            // Pasukan Awal
            troops: { infantry: 350, archer: 250, cavalry: 150, siege: 100 }
        };

        world.playerData.set(userId, newPlayerData);

        // Update Ownership Map (3x3 area jadi milik user)
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                world.ownershipMap[finalX + i][finalY + j] = userId;
            }
        }
        
        world.markModified('ownershipMap');
        world.markModified('playerData');
        world.markModified('players');
        
        await world.save();

        console.log(`✅ NEW KINGDOM FOUNDED: ${realUsername} at [${finalX}, ${finalY}]`);

        if (io) {
            io.to(`world_${worldId}`).emit('map_updated', {
                type: 'NEW_PLAYER',
                userId: userId,
                username: realUsername,
                castleX: finalX,
                castleY: finalY,
                color: playerColor
            });
        }

        res.json({ 
            msg: "Kingdom Founded!", 
            worldId,
            spawnLocation: { x: finalX, y: finalY },
            playerColor: playerColor,
            playerData: newPlayerData
        });

    } catch (err) {
        console.error("Join Error:", err);
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
        
        const SPECS = {
            infantry: { food: 10, wood: 10, gold: 0, timePerUnit: 2000 },
            archer:   { food: 15, wood: 20, gold: 2, timePerUnit: 3000 },
            cavalry:  { food: 25, wood: 15, gold: 5, timePerUnit: 5000 },
            siege:    { food: 20, wood: 30, gold: 10, timePerUnit: 6000 }
        };

        // 1. Fetch Ringan (Player only)
        const world = await World.findOne({ worldId }, { [`playerData.${userId}`]: 1 });
        
        if (!world) return res.status(404).json({ error: "World not found" });
        const pData = world.playerData.get(userId);
        if (!pData) return res.status(404).json({ error: "Player not found" });

        // 2. Validasi Resource
        const costFood = SPECS[troopType].food * amount;
        const costWood = SPECS[troopType].wood * amount;
        const costGold = SPECS[troopType].gold * amount;

        if (pData.resources.food < costFood || pData.resources.wood < costWood || pData.resources.gold < costGold) {
            return res.status(400).json({ error: "Not enough resources!" });
        }

        // 3. Hitung Waktu
        const totalTimeMs = SPECS[troopType].timePerUnit * amount;
        const lastQueue = pData.trainingQueue.length > 0 ? pData.trainingQueue[pData.trainingQueue.length - 1] : null;
        const startTime = lastQueue ? new Date(lastQueue.endTime) : new Date();
        const endTime = new Date(startTime.getTime() + totalTimeMs);

        const newQueueItem = {
            troopType,
            amount: parseInt(amount),
            startTime: startTime,
            endTime: endTime
        };

        // 4. Atomic Update
        await World.updateOne(
            { worldId: worldId },
            {
                $inc: {
                    [`playerData.${userId}.resources.food`]: -costFood,
                    [`playerData.${userId}.resources.wood`]: -costWood,
                    [`playerData.${userId}.resources.gold`]: -costGold,
                },
                $push: {
                    [`playerData.${userId}.trainingQueue`]: newQueueItem
                }
            }
        );

        // 5. Broadcast Socket (Realtime Sync) [DIIMPLEMENTASIKAN]
        const io = req.app.get('io');
        if (io) {
            // Ambil data terbaru setelah update untuk memastikan frontend sinkron
            const updatedWorld = await World.findOne({ worldId }, { [`playerData.${userId}`]: 1 }).lean();
            const updatedPlayerData = updatedWorld.playerData[userId];

            const partialUpdate = {};
            partialUpdate[userId] = updatedPlayerData;

            io.to(`world_${worldId}`).emit('resource_update', {
                worldId: worldId,
                playerData: partialUpdate,
                msg: "Instant Sync"
            });
        }

        res.json({ success: true, msg: `Training started!`, queue: newQueueItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Training failed" });
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