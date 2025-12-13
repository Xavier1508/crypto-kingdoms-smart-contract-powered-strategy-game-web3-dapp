// server/utils/voronoiMapGenerator.js
const PerlinNoise = require('./perlinNoise');

/**
 * RoK MAP GENERATOR - VORONOI PROVINCES + DOMAIN WARPING
 * 
 * Konsep:
 * 1. Voronoi Diagram: Bagi map jadi banyak provinsi organik
 * 2. Hierarchical Layers: Outer (spawn) -> Mid -> Inner -> Center (temple)
 * 3. Domain Warping: Batas provinsi jadi wavy/bergelombang
 * 4. Strategic Gates: Connect antar provinsi adjacent only
 */

class VoronoiMapGenerator {
    constructor(size = 200, seed = 12345) {
        this.size = size;
        this.perlin = new PerlinNoise(seed);
        this.center = size / 2;
        
        // Province seeds (Voronoi points)
        this.provinces = [];
        
        // Map layers
        this.map = [];
        this.provinceMap = []; // ID provinsi untuk tiap pixel
        
        // Config
        this.config = {
            // Layer boundaries (Chebyshev distance)
            LAYER_OUTER_MIN: 70,    // Spawn area (furthest)
            LAYER_OUTER_MAX: 95,    
            LAYER_MID_MIN: 45,      // Mid ring (unlocks after 5 days)
            LAYER_MID_MAX: 70,
            LAYER_INNER_MIN: 25,    // Inner ring (unlocks after 10 days)
            LAYER_INNER_MAX: 45,
            LAYER_CENTER: 25,       // Kingdom center
            LAYER_TEMPLE: 8,        // Temple
            
            // Province counts per layer
            PROVINCES_OUTER: 12,    // 12 starting provinces
            PROVINCES_MID: 8,       // 8 mid provinces
            PROVINCES_INNER: 4,     // 4 inner provinces
            
            // Warping
            WARP_STRENGTH: 15,      // Border wave amplitude
            WARP_SCALE: 0.04,       // Perlin scale for warping
        };
    }
    
    /**
     * STEP 1: Generate Voronoi Province Seeds
     */
    generateProvinceSeeds() {
        const { PROVINCES_OUTER, PROVINCES_MID, PROVINCES_INNER } = this.config;
        const { LAYER_OUTER_MIN, LAYER_MID_MIN, LAYER_INNER_MIN, LAYER_CENTER } = this.config;
        
        // OUTER LAYER (Starting provinces)
        for (let i = 0; i < PROVINCES_OUTER; i++) {
            const angle = (i / PROVINCES_OUTER) * 2 * Math.PI;
            const radius = (LAYER_OUTER_MIN + this.config.LAYER_OUTER_MAX) / 2;
            const noise = this.perlin.noise(i * 10, 0) * 5; // Small jitter
            
            this.provinces.push({
                id: i + 1,
                layer: 'outer',
                x: this.center + Math.cos(angle) * (radius + noise),
                y: this.center + Math.sin(angle) * (radius + noise),
                unlockDay: 0, // Available from start
            });
        }
        
        // MID LAYER
        for (let i = 0; i < PROVINCES_MID; i++) {
            const angle = (i / PROVINCES_MID) * 2 * Math.PI + Math.PI / PROVINCES_MID; // Offset
            const radius = (LAYER_MID_MIN + this.config.LAYER_MID_MAX) / 2;
            const noise = this.perlin.noise(i * 10, 100) * 5;
            
            this.provinces.push({
                id: PROVINCES_OUTER + i + 1,
                layer: 'mid',
                x: this.center + Math.cos(angle) * (radius + noise),
                y: this.center + Math.sin(angle) * (radius + noise),
                unlockDay: 5, // Unlock after 5 days
            });
        }
        
        // INNER LAYER
        for (let i = 0; i < PROVINCES_INNER; i++) {
            const angle = (i / PROVINCES_INNER) * 2 * Math.PI;
            const radius = (LAYER_INNER_MIN + this.config.LAYER_INNER_MAX) / 2;
            const noise = this.perlin.noise(i * 10, 200) * 3;
            
            this.provinces.push({
                id: PROVINCES_OUTER + PROVINCES_MID + i + 1,
                layer: 'inner',
                x: this.center + Math.cos(angle) * (radius + noise),
                y: this.center + Math.sin(angle) * (radius + noise),
                unlockDay: 10, // Unlock after 10 days
            });
        }
        
        // CENTER (Kingdom)
        this.provinces.push({
            id: 99, // Special ID for center
            layer: 'center',
            x: this.center,
            y: this.center,
            unlockDay: 15, // Final battle zone
        });
    }
    
    /**
     * STEP 2: Assign Province to Each Pixel (Voronoi)
     */
    assignProvinces() {
        for (let x = 0; x < this.size; x++) {
            this.provinceMap[x] = [];
            this.map[x] = [];
            
            for (let y = 0; y < this.size; y++) {
                // Apply domain warping for organic borders
                const wx = x + this.perlin.octaveNoise(
                    x * this.config.WARP_SCALE, 
                    y * this.config.WARP_SCALE, 
                    3, 0.5
                ) * this.config.WARP_STRENGTH;
                
                const wy = y + this.perlin.octaveNoise(
                    (x + 1000) * this.config.WARP_SCALE, 
                    (y + 1000) * this.config.WARP_SCALE, 
                    3, 0.5
                ) * this.config.WARP_STRENGTH;
                
                // Find nearest province (Voronoi)
                let nearestProvince = null;
                let minDist = Infinity;
                
                for (const province of this.provinces) {
                    const dx = wx - province.x;
                    const dy = wy - province.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < minDist) {
                        minDist = dist;
                        nearestProvince = province;
                    }
                }
                
                // Check if pixel is within map bounds (square boundary)
                const distFromCenter = Math.max(
                    Math.abs(x - this.center), 
                    Math.abs(y - this.center)
                );
                
                if (distFromCenter > this.config.LAYER_OUTER_MAX) {
                    this.provinceMap[x][y] = 0; // Void
                    this.map[x][y] = 0;
                } else {
                    this.provinceMap[x][y] = nearestProvince.id;
                    
                    // Assign base tile type based on layer
                    if (nearestProvince.layer === 'outer') {
                        this.map[x][y] = 1; // Zone 1 (Safe spawn)
                    } else if (nearestProvince.layer === 'mid') {
                        this.map[x][y] = 2; // Zone 2 (Resources)
                    } else if (nearestProvince.layer === 'inner') {
                        this.map[x][y] = 3; // Zone 3 (War)
                    } else {
                        // Center/Temple
                        const distToCenter = Math.max(
                            Math.abs(x - this.center),
                            Math.abs(y - this.center)
                        );
                        this.map[x][y] = distToCenter < this.config.LAYER_TEMPLE ? 9 : 3;
                    }
                }
            }
        }
    }
    
    /**
     * STEP 3: Generate Borders & Gates
     */
    generateBorders() {
        for (let x = 1; x < this.size - 1; x++) {
            for (let y = 1; y < this.size - 1; y++) {
                const currentProvince = this.provinceMap[x][y];
                
                if (currentProvince === 0) continue;
                
                // Check neighbors
                const neighbors = [
                    this.provinceMap[x+1][y],
                    this.provinceMap[x-1][y],
                    this.provinceMap[x][y+1],
                    this.provinceMap[x][y-1],
                ];
                
                const hasDifferentNeighbor = neighbors.some(n => n !== currentProvince && n !== 0);
                
                if (hasDifferentNeighbor) {
                    // This is a border pixel
                    
                    // Determine gate placement (strategic points)
                    const currentProvinceData = this.provinces.find(p => p.id === currentProvince);
                    
                    // Gates di mid-point antara 2 province centers
                    let isGate = false;
                    
                    for (const neighbor of neighbors) {
                        if (neighbor !== currentProvince && neighbor !== 0) {
                            const neighborData = this.provinces.find(p => p.id === neighbor);
                            
                            if (!neighborData) continue;
                            
                            // Calculate midpoint between two province centers
                            const midX = (currentProvinceData.x + neighborData.x) / 2;
                            const midY = (currentProvinceData.y + neighborData.y) / 2;
                            
                            // Check if current pixel is near this midpoint
                            const distToMid = Math.sqrt(
                                Math.pow(x - midX, 2) + Math.pow(y - midY, 2)
                            );
                            
                            if (distToMid < 4) { // Gate width
                                isGate = true;
                                
                                // Gate type based on layers
                                if (currentProvinceData.layer === 'outer' && neighborData.layer === 'outer') {
                                    this.map[x][y] = 7; // Border pass (green gates)
                                } else if (currentProvinceData.layer === 'mid' || neighborData.layer === 'mid') {
                                    this.map[x][y] = 5; // Level 1 pass (orange)
                                } else {
                                    this.map[x][y] = 6; // Level 2 pass (red)
                                }
                                break;
                            }
                        }
                    }
                    
                    // If not a gate, make it a mountain
                    if (!isGate) {
                        this.map[x][y] = 4; // Mountain wall
                    }
                }
            }
        }
    }
    
    /**
     * STEP 4: Place Sanctuaries (Objectives)
     */
    placeSanctuaries() {
        for (const province of this.provinces) {
            if (province.layer === 'center') continue; // Skip temple
            
            const px = Math.round(province.x);
            const py = Math.round(province.y);
            
            // Place 3x3 sanctuary at province center
            for (let ox = -1; ox <= 1; ox++) {
                for (let oy = -1; oy <= 1; oy++) {
                    const nx = px + ox;
                    const ny = py + oy;
                    
                    if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                        const tile = this.map[nx][ny];
                        if (tile >= 1 && tile <= 3) { // Only on zone tiles
                            this.map[nx][ny] = 8; // Sanctuary
                        }
                    }
                }
            }
        }
    }
    
    /**
     * MAIN GENERATION
     */
    generate() {
        console.log('🗺️  Generating Organic Voronoi Map...');
        
        this.generateProvinceSeeds();
        console.log(`✅ Generated ${this.provinces.length} provinces`);
        
        this.assignProvinces();
        console.log('✅ Assigned provinces to pixels');
        
        this.generateBorders();
        console.log('✅ Generated borders & gates');
        
        this.placeSanctuaries();
        console.log('✅ Placed sanctuaries');
        
        return {
            grid: this.map,
            provinceMap: this.provinceMap,
            provinces: this.provinces,
            config: {
                size: this.size,
                centerX: this.center,
                centerY: this.center,
            }
        };
    }
}

/**
 * Export function
 */
const generateRoKMap = (size = 200) => {
    const generator = new VoronoiMapGenerator(size, 12345);
    return generator.generate();
};

module.exports = { generateRoKMap };