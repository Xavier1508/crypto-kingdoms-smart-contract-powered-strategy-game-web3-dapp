// server/models/ProvinceManager.js
const mongoose = require('mongoose');

/**
 * PROVINCE SCHEMA
 * Menyimpan data setiap provinsi dan status unlock-nya
 */
const ProvinceSchema = new mongoose.Schema({
    worldId: { type: Number, required: true },
    provinceId: { type: Number, required: true },
    
    // Layer & Timing
    layer: { 
        type: String, 
        enum: ['outer', 'mid', 'inner', 'center'], 
        required: true 
    },
    unlockDay: { type: Number, default: 0 }, // Hari ke berapa bisa diakses
    isUnlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date }, // Timestamp actual unlock
    
    // Position (Center of province)
    centerX: { type: Number, required: true },
    centerY: { type: Number, required: true },
    
    // Adjacency (Province tetangga yang terhubung gate)
    adjacentProvinces: [{ type: Number }], // Array of provinceId
    gates: [{
        toProvinceId: { type: Number },
        gateType: { type: Number }, // 5, 6, or 7
        isOpen: { type: Boolean, default: false },
        positions: [{ x: Number, y: Number }] // Pixel coordinates gate
    }],
    
    // Ownership
    controlledBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Alliance',
        default: null 
    },
    
    // Objectives
    sanctuaries: [{
        x: { type: Number },
        y: { type: Number },
        controlledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Alliance' }
    }],
    
    // Statistics
    totalTiles: { type: Number, default: 0 },
    claimedTiles: { type: Number, default: 0 },
});

ProvinceSchema.index({ worldId: 1, provinceId: 1 }, { unique: true });

/**
 * PROVINCE MANAGER - Business Logic
 */
class ProvinceManagerClass {
    
    /**
     * Initialize provinces dari map generation
     */
    static async initializeProvinces(worldId, provincesData) {
        const Province = mongoose.model('Province', ProvinceSchema);
        
        // Delete existing
        await Province.deleteMany({ worldId });
        
        // Create new
        const provinces = provincesData.map(p => ({
            worldId,
            provinceId: p.id,
            layer: p.layer,
            unlockDay: p.unlockDay,
            isUnlocked: p.unlockDay === 0, // Outer provinces unlocked by default
            centerX: Math.round(p.x),
            centerY: Math.round(p.y),
            adjacentProvinces: [],
            gates: [],
            sanctuaries: [],
        }));
        
        await Province.insertMany(provinces);
        console.log(`✅ Initialized ${provinces.length} provinces for world ${worldId}`);
        
        return provinces;
    }
    
    /**
     * Calculate adjacency dari map grid
     */
    static async calculateAdjacency(worldId, provinceMap, tileMap) {
        const Province = mongoose.model('Province', ProvinceSchema);
        const size = provinceMap.length;
        
        // Scan borders untuk find gates
        const gateData = {}; // { provinceId: { toProvinceId: [positions] } }
        
        for (let x = 1; x < size - 1; x++) {
            for (let y = 1; y < size - 1; y++) {
                const tile = tileMap[x][y];
                const currentProvince = provinceMap[x][y];
                
                // Check if this is a gate tile
                if (tile >= 5 && tile <= 7 && currentProvince !== 0) {
                    const neighbors = [
                        { id: provinceMap[x+1][y], dir: 'E' },
                        { id: provinceMap[x-1][y], dir: 'W' },
                        { id: provinceMap[x][y+1], dir: 'S' },
                        { id: provinceMap[x][y-1], dir: 'N' },
                    ];
                    
                    for (const neighbor of neighbors) {
                        if (neighbor.id !== currentProvince && neighbor.id !== 0) {
                            // Found a gate connection!
                            if (!gateData[currentProvince]) gateData[currentProvince] = {};
                            if (!gateData[currentProvince][neighbor.id]) {
                                gateData[currentProvince][neighbor.id] = [];
                            }
                            gateData[currentProvince][neighbor.id].push({ x, y, gateType: tile });
                        }
                    }
                }
            }
        }
        
        // Update database
        for (const [provinceId, connections] of Object.entries(gateData)) {
            const adjacentIds = Object.keys(connections).map(Number);
            const gates = Object.entries(connections).map(([toId, positions]) => ({
                toProvinceId: Number(toId),
                gateType: positions[0].gateType,
                isOpen: false, // Default closed
                positions: positions.map(p => ({ x: p.x, y: p.y })),
            }));
            
            await Province.updateOne(
                { worldId, provinceId: Number(provinceId) },
                { 
                    $set: { 
                        adjacentProvinces: adjacentIds,
                        gates: gates
                    }
                }
            );
        }
        
        console.log(`✅ Calculated adjacency for ${Object.keys(gateData).length} provinces`);
    }
    
    /**
     * Unlock provinces based on day
     */
    static async unlockByDay(worldId, currentDay) {
        const Province = mongoose.model('Province', ProvinceSchema);
        
        const result = await Province.updateMany(
            { 
                worldId, 
                unlockDay: { $lte: currentDay },
                isUnlocked: false 
            },
            { 
                $set: { 
                    isUnlocked: true,
                    unlockedAt: new Date()
                }
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`🔓 Unlocked ${result.modifiedCount} provinces on day ${currentDay}`);
            
            // Open gates to newly unlocked provinces
            await this.openGatesToUnlockedProvinces(worldId);
        }
        
        return result.modifiedCount;
    }
    
    /**
     * Open gates ke provinsi yang sudah unlock
     */
    static async openGatesToUnlockedProvinces(worldId) {
        const Province = mongoose.model('Province', ProvinceSchema);
        
        const unlockedProvinces = await Province.find({ 
            worldId, 
            isUnlocked: true 
        }).select('provinceId');
        
        const unlockedIds = unlockedProvinces.map(p => p.provinceId);
        
        // Open gates between unlocked provinces
        await Province.updateMany(
            { worldId, provinceId: { $in: unlockedIds } },
            { $set: { 'gates.$[elem].isOpen': true } },
            { arrayFilters: [{ 'elem.toProvinceId': { $in: unlockedIds } }] }
        );
    }
    
    /**
     * Get province info
     */
    static async getProvinceInfo(worldId, provinceId) {
        const Province = mongoose.model('Province', ProvinceSchema);
        return await Province.findOne({ worldId, provinceId })
            .populate('controlledBy')
            .populate('sanctuaries.controlledBy');
    }
    
    /**
     * Can player access province?
     */
    static async canAccess(worldId, fromProvinceId, toProvinceId) {
        const Province = mongoose.model('Province', ProvinceSchema);
        
        const fromProvince = await Province.findOne({ worldId, provinceId: fromProvinceId });
        const toProvince = await Province.findOne({ worldId, provinceId: toProvinceId });
        
        if (!fromProvince || !toProvince) return false;
        if (!toProvince.isUnlocked) return false;
        
        // Check if there's a gate connection
        const gate = fromProvince.gates.find(g => g.toProvinceId === toProvinceId);
        if (!gate) return false;
        
        return gate.isOpen;
    }
}

// Register model
const Province = mongoose.model('Province', ProvinceSchema);

module.exports = {
    Province,
    ProvinceManager: ProvinceManagerClass
};