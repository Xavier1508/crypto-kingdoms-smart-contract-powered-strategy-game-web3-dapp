// server/controllers/joinController.js
const World = require('../models/World');
const User = require('../models/User');
const { Province } = require('../models/ProvinceManager');
const { generatePlayerColor, createEmptyGrid } = require('../utils/gameHelpers');

// --- REQUEST SPAWN (Cari Koordinat Kosong) ---
const requestSpawn = async (req, res) => {
    try {
        const { worldId } = req.body;
        const world = await World.findOne({ worldId });
        
        if (!world) return res.status(404).json({ msg: "World not found" });
        if (world.players.length >= world.maxPlayers) return res.status(400).json({ msg: "World Full" });

        const outerProvinces = await Province.find({ worldId, layer: 'outer', isUnlocked: true }).lean();
        const tempOwnership = world.ownershipMap || createEmptyGrid(world.mapSize);

        let spawnFound = false;
        let finalX, finalY;
        let attempt = 0;
        const MAX_ATTEMPTS = 500;

        while (!spawnFound && attempt < MAX_ATTEMPTS) {
            attempt++;
            let cx, cy;

            if (outerProvinces.length > 0) {
                const prov = outerProvinces[Math.floor(Math.random() * outerProvinces.length)];
                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.random() * 35;
                cx = Math.round(prov.centerX + Math.cos(angle) * distance);
                cy = Math.round(prov.centerY + Math.sin(angle) * distance);
            } else {
                cx = Math.floor(Math.random() * 300) + 50;
                cy = Math.floor(Math.random() * 300) + 50;
            }

            if (cx < 5 || cx >= world.mapSize - 5 || cy < 5 || cy >= world.mapSize - 5) continue;

            let areaClear = true;
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    const checkX = cx + i;
                    const checkY = cy + j;
                    if (!world.mapGrid[checkX]) { areaClear = false; break; }
                    if (world.mapGrid[checkX][checkY] !== 1) { areaClear = false; break; } 
                    if (tempOwnership[checkX][checkY]) { areaClear = false; break; }
                }
                if (!areaClear) break;
            }
            
            if (areaClear) { spawnFound = true; finalX = cx; finalY = cy; }
        }

        if (!spawnFound) return res.status(400).json({ msg: "No spawn location found. Try again." });

        console.log(`📍 Spawn Candidate: [${finalX}, ${finalY}] (World ${worldId})`);
        res.json({ success: true, x: finalX, y: finalY });

    } catch (err) {
        console.error("Spawn Error:", err);
        res.status(500).json({ msg: "Spawn calc failed" });
    }
};

// --- FINALIZE JOIN (Simpan Player ke DB) ---
const finalizeJoin = async (req, res) => {
    try {
        const { worldId, userId, x, y, txHash, tokenId } = req.body;
        
        console.log(`📝 Finalizing: User ${userId} -> World ${worldId}`);

        const world = await World.findOne({ worldId });
        if (!world) return res.status(404).json({ msg: "World missing" });

        if (world.ownershipMap[x][y]) {
            return res.status(400).json({ msg: "Land taken! Try again." });
        }

        const userDocs = await User.findById(userId);
        const username = userDocs ? userDocs.username : "Unknown Lord";
        const playerColor = generatePlayerColor(); 

        if (!world.players.includes(userId)) world.players.push(userId);
        if (!world.playerData) world.playerData = new Map();

        const newPlayerData = {
            username: username,
            color: playerColor,
            castleX: parseInt(x),
            castleY: parseInt(y),
            power: 1000,
            tokenId: tokenId || null,
            resources: { food: 1000, wood: 1000, stone: 500, gold: 200 },
            troops: { infantry: 350, archer: 250, cavalry: 150, siege: 100 }
        };

        world.playerData.set(userId, newPlayerData);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                world.ownershipMap[parseInt(x) + i][parseInt(y) + j] = userId;
            }
        }
        
        world.markModified('ownershipMap');
        world.markModified('playerData');
        world.markModified('players');
        
        await world.save();

        // Broadcast Socket
        const io = req.app.get('io');
        if (io) {
            io.to(`world_${worldId}`).emit('map_updated', {
                type: 'NEW_PLAYER',
                userId, username, castleX: x, castleY: y, color: playerColor
            });
        }

        res.json({ success: true, msg: "Welcome to the Kingdom!" });

    } catch (err) {
        console.error("Finalize Error:", err);
        res.status(500).json({ msg: "Finalization failed." });
    }
};

module.exports = { requestSpawn, finalizeJoin };