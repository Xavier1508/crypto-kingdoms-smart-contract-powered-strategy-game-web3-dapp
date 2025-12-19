// server/controllers/adminController.js
const World = require('../models/World');
const { ProvinceManager } = require('../models/ProvinceManager');
const { generateRoKMap } = require('../utils/voronoiMapGenerator');
const { createEmptyGrid } = require('../utils/gameHelpers');

// --- [FITUR BARU] CREATE NEW WORLD (Admin Only) ---
const createWorld = async (req, res) => {
    try {
        const { name, season } = req.body;

        // Hitung ID World selanjutnya (Auto Increment sederhana)
        const lastWorld = await World.findOne().sort({ worldId: -1 });
        const newWorldId = lastWorld ? lastWorld.worldId + 1 : 1;

        console.log(`⚡ Generating World #${newWorldId}: ${name}...`);
        
        const MAP_SIZE = 400;
        const mapData = generateRoKMap(MAP_SIZE);
        const emptyOwnership = createEmptyGrid(MAP_SIZE);
        
        const newWorld = new World({
            worldId: newWorldId,
            name: name || `Kingdom #${newWorldId} (${season || 'Season 1'})`,
            status: "ACTIVE",
            maxPlayers: 32, // Bisa diubah sesuai keinginan
            seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Hari
            mapGrid: mapData.grid,
            provinceMap: mapData.provinceMap || [],
            mapSize: MAP_SIZE,
            mapVersion: 'voronoi-v2',
            playerData: {},
            players: [],
            ownershipMap: emptyOwnership
        });

        await newWorld.save();
        await ProvinceManager.initializeProvinces(newWorldId, mapData.provinces);
        
        console.log(`World #${newWorldId} Created Successfully!`);
        res.json({ success: true, msg: `World #${newWorldId} Created`, worldId: newWorldId });

    } catch (error) {
        console.error("Create World Error:", error);
        res.status(500).json({ error: 'Failed to create world' });
    }
};

// --- REGENERATE MAP (Reset Map yang sudah ada) ---
const regenerateWorldMap = async (req, res) => {
    try {
        const { worldId } = req.params;
        const MAP_SIZE = 400;
        
        console.log(`Regenerating Map for World #${worldId}...`);

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
        
        res.json({ success: true, message: 'Map regenerated' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed' });
    }
};

module.exports = { createWorld, regenerateWorldMap };