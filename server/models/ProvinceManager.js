// server/models/ProvinceManager.js
const mongoose = require('mongoose');

const ProvinceSchema = new mongoose.Schema({
    worldId: { type: Number, required: true },
    provinceId: { type: Number, required: true },
    
    layer: { 
        type: String, 
        enum: ['outer', 'mid', 'inner', 'center'], 
        required: true 
    },
    unlockDay: { type: Number, default: 0 },
    isUnlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date },
    
    centerX: { type: Number, required: true },
    centerY: { type: Number, required: true },
    
    adjacentProvinces: [{ type: Number }],
    gates: [{
        toProvinceId: { type: Number },
        gateType: { type: Number },
        isOpen: { type: Boolean, default: false },
        positions: [{ x: Number, y: Number }]
    }],
    
    controlledBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Alliance',
        default: null 
    },
    
    sanctuaries: [{
        x: { type: Number },
        y: { type: Number },
        controlledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Alliance' }
    }],
    
    totalTiles: { type: Number, default: 0 },
    claimedTiles: { type: Number, default: 0 },
});

ProvinceSchema.index({ worldId: 1, provinceId: 1 }, { unique: true });

class ProvinceManagerClass {
    
    static async initializeProvinces(worldId, provincesData) {
        const Province = mongoose.model('Province', ProvinceSchema);
        
        await Province.deleteMany({ worldId });
        
        const provinces = provincesData.map(p => ({
            worldId,
            provinceId: p.id,
            layer: p.layer,
            unlockDay: p.unlockDay,
            isUnlocked: p.unlockDay === 0,
            centerX: Math.round(p.x),
            centerY: Math.round(p.y),
            adjacentProvinces: p.neighbors || [],
            gates: [],
            sanctuaries: [],
        }));
        
        await Province.insertMany(provinces);
        return provinces;
    }
    
    /**
     * IMPROVED: Calculate adjacency from map data
     */
    static async calculateAdjacency(worldId, provinceMap, tileMap) {
        const Province = mongoose.model('Province', ProvinceSchema);
        const size = provinceMap.length;
        
        const gateData = {};
        
        // Scan for gate tiles
        for (let x = 1; x < size - 1; x++) {
            for (let y = 1; y < size - 1; y++) {
                const tile = tileMap[x][y];
                const currentProvince = provinceMap[x][y];
                
                // Check if gate tile (5, 6, 7)
                if (tile >= 5 && tile <= 7 && currentProvince !== 0) {
                    const neighbors = [
                        { id: provinceMap[x+1]?.[y], dir: 'E' },
                        { id: provinceMap[x-1]?.[y], dir: 'W' },
                        { id: provinceMap[x]?.[y+1], dir: 'S' },
                        { id: provinceMap[x]?.[y-1], dir: 'N' },
                    ];
                    
                    for (const neighbor of neighbors) {
                        if (neighbor.id && neighbor.id !== currentProvince && neighbor.id !== 0) {
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
        
        // Update DB
        for (const [provinceId, connections] of Object.entries(gateData)) {
            const adjacentIds = Object.keys(connections).map(Number);
            const gates = Object.entries(connections).map(([toId, positions]) => ({
                toProvinceId: Number(toId),
                gateType: positions[0].gateType,
                isOpen: positions[0].gateType === 7, // Border gates open by default
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
    }
    
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
            await this.openGatesToUnlockedProvinces(worldId);
        }
        
        return result.modifiedCount;
    }
    
    static async openGatesToUnlockedProvinces(worldId) {
        const Province = mongoose.model('Province', ProvinceSchema);
        
        const unlockedProvinces = await Province.find({ 
            worldId, 
            isUnlocked: true 
        }).select('provinceId');
        
        const unlockedIds = unlockedProvinces.map(p => p.provinceId);
        
        await Province.updateMany(
            { worldId, provinceId: { $in: unlockedIds } },
            { $set: { 'gates.$[elem].isOpen': true } },
            { arrayFilters: [{ 'elem.toProvinceId': { $in: unlockedIds } }] }
        );
    }
    
    static async getProvinceInfo(worldId, provinceId) {
        const Province = mongoose.model('Province', ProvinceSchema);
        return await Province.findOne({ worldId, provinceId })
            .populate('controlledBy')
            .populate('sanctuaries.controlledBy');
    }
    
    static async canAccess(worldId, fromProvinceId, toProvinceId) {
        const Province = mongoose.model('Province', ProvinceSchema);
        
        const fromProvince = await Province.findOne({ worldId, provinceId: fromProvinceId });
        const toProvince = await Province.findOne({ worldId, provinceId: toProvinceId });
        
        if (!fromProvince || !toProvince) return false;
        if (!toProvince.isUnlocked) return false;
        
        const gate = fromProvince.gates.find(g => g.toProvinceId === toProvinceId);
        if (!gate) return false;
        
        return gate.isOpen;
    }
}

const Province = mongoose.model('Province', ProvinceSchema);

module.exports = {
    Province,
    ProvinceManager: ProvinceManagerClass
};