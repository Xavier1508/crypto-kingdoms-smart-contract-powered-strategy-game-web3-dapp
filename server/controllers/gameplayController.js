// server/controllers/gameplayController.js
const World = require('../models/World');

// --- CONQUER TILE (Menaklukkan Wilayah) ---
const conquerTile = async (req, res) => {
    try {
        const { worldId, userId, targetX, targetY } = req.body;
        const CONQUER_COST = 500; 

        // 1. Cek Data Awal (Read Only - Cepat)
        const world = await World.findOne({ worldId }).select('mapSize mapGrid ownershipMap playerData').lean();
        
        if (!world) return res.status(404).json({ error: "World not found" });

        const pData = world.playerData[userId]; 
        if (!pData) return res.status(404).json({ error: "Player not found" });

        const tx = parseInt(targetX);
        const ty = parseInt(targetY);

        // Validasi
        if (tx < 0 || tx >= world.mapSize || ty < 0 || ty >= world.mapSize) {
            return res.status(400).json({ error: "Out of bounds!" });
        }
        
        const tileType = world.mapGrid[tx][ty];
        if (![1, 2, 3].includes(tileType)) { 
            return res.status(400).json({ error: "Terrain cannot be conquered!" });
        }
        
        if (world.ownershipMap[tx] && world.ownershipMap[tx][ty] === userId) {
            return res.status(400).json({ error: "You already own this territory!" });
        }
        
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

        // --- EKSEKUSI ATOMIC ---
        const updateQuery = {
            $set: {
                [`ownershipMap.${tx}.${ty}`]: userId, 
                [`playerData.${userId}.power`]: pData.power - CONQUER_COST 
            }
        };

        await World.updateOne({ worldId: worldId }, updateQuery);

        // Socket Broadcast
        const io = req.app.get('io');
        if (io) {
            const roomName = `world_${String(worldId)}`;
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
        res.status(500).json({ error: "Conquest failed" });
    }
};

// --- TRAIN TROOPS (Melatih Pasukan) ---
const trainTroops = async (req, res) => {
    try {
        const { worldId, userId, troopType, amount } = req.body;
        
        const SPECS = {
            infantry: { food: 10, wood: 10, gold: 0, timePerUnit: 2000 },
            archer:   { food: 15, wood: 20, gold: 2, timePerUnit: 3000 },
            cavalry:  { food: 25, wood: 15, gold: 5, timePerUnit: 5000 },
            siege:    { food: 20, wood: 30, gold: 10, timePerUnit: 6000 }
        };

        const world = await World.findOne({ worldId }, { [`playerData.${userId}`]: 1 });
        if (!world) return res.status(404).json({ error: "World not found" });
        
        const pData = world.playerData.get(userId);
        if (!pData) return res.status(404).json({ error: "Player not found" });

        const costFood = SPECS[troopType].food * amount;
        const costWood = SPECS[troopType].wood * amount;
        const costGold = SPECS[troopType].gold * amount;

        if (pData.resources.food < costFood || pData.resources.wood < costWood || pData.resources.gold < costGold) {
            return res.status(400).json({ error: "Not enough resources!" });
        }

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

        const io = req.app.get('io');
        if (io) {
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

module.exports = { conquerTile, trainTroops };