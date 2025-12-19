// server/controllers/mapController.js
const World = require('../models/World');
const { ProvinceManager } = require('../models/ProvinceManager');

// --- GET WORLD LIST ---
const getWorldsList = async (req, res) => {
    try {
        let worlds = await World.find({}, '-mapGrid -ownershipMap -provinceMap').lean(); 
        res.json(worlds);
    } catch (error) {
        console.error("Get Worlds Error:", error);
        res.status(500).json({ error: 'Failed to fetch worlds' });
    }
};

// --- GET WORLD MAP DETAIL ---
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

// --- GET TILE INFO ---
const getTileInfo = async (req, res) => {
    try {
        const { worldId, x, y } = req.params;
        const world = await World.findOne({ worldId });
        
        if (!world) return res.status(404).json({ error: 'World not found' });

        const tileX = parseInt(x);
        const tileY = parseInt(y);
        
        if (tileX < 0 || tileX >= world.mapSize || tileY < 0 || tileY >= world.mapSize) {
             return res.status(400).json({ error: 'Out of bounds' });
        }

        const tileType = world.mapGrid[tileX][tileY];
        const ownerId = world.ownershipMap[tileX][tileY]; 
        
        let ownerName = null;
        let ownerCastle = null;
        let ownerColor = null;

        if (ownerId) {
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
                x: tileX, y: tileY,
                type: tileType,
                name: tileNames[tileType] || 'Unknown Region',
                isClaimable: [1, 2, 3].includes(tileType) && !ownerId,
                ownerId, ownerName, ownerCastle, ownerColor
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tile info' });
    }
};

// --- GET PROVINCE INFO ---
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

module.exports = {
    getWorldsList,
    getWorldMap,
    getTileInfo,
    getProvinceDetails
};