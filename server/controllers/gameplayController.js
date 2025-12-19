// server/controllers/gameplayController.js
const World = require('../models/World');
const { TILE_COSTS, calculateTroopLoss } = require('../utils/gameHelpers');

// --- CONQUER TILE (WAR ENGINE V2) ---
const conquerTile = async (req, res) => {
    try {
        const { worldId, userId, targetX, targetY } = req.body;

        // 1. Load World Data
        const world = await World.findOne({ worldId });
        if (!world) return res.status(404).json({ error: "World not found" });

        // Load Attacker Data (Map Mongoose)
        const attacker = world.playerData.get(userId);
        if (!attacker) return res.status(404).json({ error: "Your kingdom is not found!" });

        const tx = parseInt(targetX);
        const ty = parseInt(targetY);

        // 2. Validasi Dasar
        if (tx < 0 || tx >= world.mapSize || ty < 0 || ty >= world.mapSize) {
            return res.status(400).json({ error: "Out of bounds!" });
        }
        
        // Cek apakah sudah milik sendiri
        const currentOwnerId = world.ownershipMap[tx][ty];
        if (currentOwnerId === userId) {
            return res.status(400).json({ error: "You already own this territory!" });
        }

        // Cek Konektivitas (Harus nyambung dengan tanah sendiri)
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
            return res.status(400).json({ error: "Troops cannot reach target! Must be connected to your land." });
        }

        // 3. IDENTIFIKASI TIPE TARGET & COST
        const tileType = world.mapGrid[tx][ty];
        let requiredPower = TILE_COSTS.DEFAULT;
        let isPvP = false;
        let defender = null;

        // --- LOGIKA OBJEKTIF & GATE ---
        if (tileType === 5) requiredPower = TILE_COSTS.GATE_LVL1; // Pass Lvl 1
        else if (tileType === 6) requiredPower = TILE_COSTS.GATE_LVL2; // Pass Lvl 2
        else if (tileType === 40) requiredPower = TILE_COSTS.ZIGGURAT; // King
        else if (tileType >= 30 && tileType <= 35) requiredPower = TILE_COSTS.ALTAR; // Holy Sites
        else if (tileType >= 20 && tileType <= 21) requiredPower = TILE_COSTS.BARBARIAN; // Barbarians
        else if (tileType >= 10 && tileType <= 13) requiredPower = TILE_COSTS.RESOURCE_NODE; // Mines
        else requiredPower = TILE_COSTS.EMPTY_LAND; // Tanah biasa (Grass/Dirt)

        // --- LOGIKA PvP (Jika ada pemiliknya) ---
        if (currentOwnerId) {
            isPvP = true;
            defender = world.playerData.get(currentOwnerId);
            
            // Jika musuh punya 5000 power, kita butuh minimal 5000++ untuk menang
            // Biaya conquer = Power Musuh + Sedikit Extra (Overhead perang)
            const defensePower = defender ? defender.power : 0;
            requiredPower = Math.floor(defensePower * 1.1) + 500; // Harus 10% lebih kuat
        }

        // 4. CEK KEKUATAN ATTACKER
        if (attacker.power < requiredPower) {
            return res.status(400).json({ 
                error: isPvP 
                    ? `Defeat! Enemy too strong. Need ${requiredPower} power.` 
                    : `Troops too weak/scared to conquer this. Need ${requiredPower} power.`
            });
        }

        // 5. EKSEKUSI PERANG (Battle Result)
        // A. Kurangi Pasukan Attacker (Cost of War)
        // Jika PvP: Attacker kehilangan pasukan senilai (Defense Power musuh * 0.5)
        // Jika PvE: Attacker kehilangan flat cost (Fatigue)
        
        const attackerLoss = isPvP 
            ? Math.floor((defender ? defender.power : 0) * 0.4) // 40% dari kekuatan musuh menjadi damage
            : Math.floor(requiredPower * 0.2); // 20% dari cost (Cuma lelah/kecelakaan kecil)

        calculateTroopLoss(attacker, attackerLoss);

        // B. Handle Defender (Jika PvP)
        if (isPvP && defender) {
            // Defender Kalah Total -> Kehilangan Tile
            // Defender juga kehilangan pasukan (Bonyok diserang)
            const defenderLoss = Math.floor(attacker.power * 0.3); // Kena damage 30% dari kekuatan penyerang
            calculateTroopLoss(defender, defenderLoss);
            
            // Update DB Defender (Power berkurang)
            world.playerData.set(currentOwnerId, defender);
        }

        // C. Update Map Ownership
        world.ownershipMap[tx][ty] = userId;
        
        // D. Save Everything (Atomicish)
        // Kita save satu world object karena banyak yang berubah (map, p1, p2)
        world.markModified('ownershipMap');
        world.markModified('playerData');
        await world.save();

        // 6. BROADCAST KE SEMUA PLAYER
        const io = req.app.get('io');
        if (io) {
            const roomName = `world_${String(worldId)}`;
            
            // Update Map Visual
            io.to(roomName).emit('map_updated', {
                type: 'TILE_CONQUERED',
                x: tx, y: ty,
                newOwnerId: userId,
                color: attacker.color,
                isPvP: isPvP
            });

            // Update Resource/Troops UI untuk Player yang terlibat
            const partialUpdate = {};
            partialUpdate[userId] = attacker;
            if (defender) partialUpdate[currentOwnerId] = defender;

            io.to(roomName).emit('resource_update', {
                worldId: worldId,
                playerData: partialUpdate,
                msg: isPvP ? "WAR REPORT: Victory!" : "Territory expanded."
            });
        }

        res.json({ 
            success: true, 
            msg: isPvP ? "Victory! Enemy retreated." : "Land Conquered!", 
            remainingPower: attacker.power 
        });

    } catch (error) {
        console.error("Conquer Error:", error);
        res.status(500).json({ error: "War council dismissed (Server Error)" });
    }
};

// --- TRAIN TROOPS (Tetap Sama/Simpel) ---
const trainTroops = async (req, res) => {
    try {
        const { worldId, userId, troopType, amount } = req.body;
        
        const SPECS = {
            infantry: { food: 10, wood: 10, gold: 0, timePerUnit: 2000 },
            archer:   { food: 15, wood: 20, gold: 2, timePerUnit: 3000 },
            cavalry:  { food: 25, wood: 15, gold: 5, timePerUnit: 5000 },
            siege:    { food: 20, wood: 30, gold: 10, timePerUnit: 6000 }
        };

        const world = await World.findOne({ worldId });
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

        // Kurangi Resource & Tambah Queue
        pData.resources.food -= costFood;
        pData.resources.wood -= costWood;
        pData.resources.gold -= costGold;
        pData.trainingQueue.push(newQueueItem);

        world.playerData.set(userId, pData);
        await world.save();

        const io = req.app.get('io');
        if (io) {
            const partialUpdate = {};
            partialUpdate[userId] = pData;
            io.to(`world_${worldId}`).emit('resource_update', {
                worldId: worldId,
                playerData: partialUpdate,
                msg: "Training Started"
            });
        }

        res.json({ success: true, msg: `Training started!`, queue: newQueueItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Training failed" });
    }
};

module.exports = { conquerTile, trainTroops };