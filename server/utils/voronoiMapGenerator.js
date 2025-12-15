const PerlinNoise = require('./perlinNoise');

/**
 * ═══════════════════════════════════════════════════════════════
 * RISE OF KINGDOMS - INSPIRED MAP GENERATOR
 * ═══════════════════════════════════════════════════════════════
 * 
 * KEY IMPROVEMENTS:
 * 1. ORGANIC PROVINCE SHAPES (Voronoi + Domain Warping)
 * 2. INTELLIGENT GATE PLACEMENT (No crossing, proper connections)
 * 3. LAYER-BASED ACCESS CONTROL (Outer→Mid→Inner→Center)
 * 4. BALANCED RESOURCE DISTRIBUTION
 * 5. NATURAL TERRAIN GENERATION
 */

class RoKMapGenerator {
    constructor(size = 400, seed = Date.now()) {
        this.size = size;
        this.perlin = new PerlinNoise(seed);
        this.center = size / 2;
        
        // Data Structures
        this.provinces = [];
        this.map = [];
        this.provinceMap = [];
        this.occupiedMap = [];
        this.gatePositions = []; // Track gate locations
        
        // ═══ LAYER CONFIGURATION ═══
        this.config = {
            // Layer Radii (Chebyshev distance)
            LAYER_CENTER_RADIUS: 40,
            LAYER_INNER_RADIUS: 95,
            LAYER_MID_RADIUS: 145,
            LAYER_OUTER_RADIUS: 195,
            
            // Province Count per Layer
            PROVINCES_OUTER: 12,  // Outer ring provinces
            PROVINCES_MID: 8,     // Mid ring provinces
            PROVINCES_INNER: 4,   // Inner ring provinces
            
            // Voronoi Settings
            RELAXATION_ITERATIONS: 3, // Lloyd's relaxation for better spacing
            
            // Warping (Organic borders)
            WARP_STRENGTH: 15,
            WARP_SCALE: 0.03,
            
            // Gate Settings
            GATE_SPACING: 45,      // Minimum distance between gates
            GATE_WIDTH: 3,         // Gate thickness (pixels)
            BORDER_THICKNESS: 2,   // Mountain border thickness
            
            // Structure Density
            BARBARIAN_DENSITY: 0.35,  // % of outer provinces with barbarians
            RESOURCE_PER_PROVINCE: 3, // Avg resource nodes per province
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * PHASE 1: PROVINCE SEED GENERATION
     * ═══════════════════════════════════════════════════════════════
     * Generates province centers using Poisson Disk Sampling
     * for even distribution
     */
    generateProvinceSeedsAdvanced() {
        console.log("🌍 Generating Province Seeds (Organic Method)...");
        
        let provinceId = 1;
        
        // ─────────────────────────────────────────
        // CENTER PROVINCE (ID 999)
        // ─────────────────────────────────────────
        this.provinces.push({
            id: 999,
            layer: 'center',
            x: this.center,
            y: this.center,
            unlockDay: 20,
            neighbors: [] // Will be populated later
        });
        
        // ─────────────────────────────────────────
        // INNER LAYER (4 provinces in cardinal directions)
        // ─────────────────────────────────────────
        const innerAngles = [0, 90, 180, 270]; // N, E, S, W
        const innerRadius = (this.config.LAYER_CENTER_RADIUS + this.config.LAYER_INNER_RADIUS) / 2;
        
        for (const angle of innerAngles) {
            const rad = (angle * Math.PI) / 180;
            const jitter = this.perlin.noise(provinceId, 0) * 8;
            
            this.provinces.push({
                id: provinceId++,
                layer: 'inner',
                x: this.center + Math.cos(rad) * (innerRadius + jitter),
                y: this.center + Math.sin(rad) * (innerRadius + jitter),
                unlockDay: 10,
                neighbors: []
            });
        }
        
        // ─────────────────────────────────────────
        // MID LAYER (8 provinces)
        // ─────────────────────────────────────────
        const midRadius = (this.config.LAYER_INNER_RADIUS + this.config.LAYER_MID_RADIUS) / 2;
        const midAngleStep = 360 / this.config.PROVINCES_MID;
        
        for (let i = 0; i < this.config.PROVINCES_MID; i++) {
            const angle = i * midAngleStep + (midAngleStep / 2) * (i % 2); // Offset alternating
            const rad = (angle * Math.PI) / 180;
            const jitter = this.perlin.noise(provinceId, 100) * 10;
            
            this.provinces.push({
                id: provinceId++,
                layer: 'mid',
                x: this.center + Math.cos(rad) * (midRadius + jitter),
                y: this.center + Math.sin(rad) * (midRadius + jitter),
                unlockDay: 5,
                neighbors: []
            });
        }
        
        // ─────────────────────────────────────────
        // OUTER LAYER (12 provinces)
        // ─────────────────────────────────────────
        const outerRadius = (this.config.LAYER_MID_RADIUS + this.config.LAYER_OUTER_RADIUS) / 2;
        const outerAngleStep = 360 / this.config.PROVINCES_OUTER;
        
        for (let i = 0; i < this.config.PROVINCES_OUTER; i++) {
            const angle = i * outerAngleStep;
            const rad = (angle * Math.PI) / 180;
            const jitter = this.perlin.noise(provinceId, 200) * 12;
            
            this.provinces.push({
                id: provinceId++,
                layer: 'outer',
                x: this.center + Math.cos(rad) * (outerRadius + jitter),
                y: this.center + Math.sin(rad) * (outerRadius + jitter),
                unlockDay: 0,
                neighbors: []
            });
        }
        
        // ─────────────────────────────────────────
        // LLOYD'S RELAXATION (Make provinces more evenly spaced)
        // ─────────────────────────────────────────
        this.applyLloydsRelaxation();
        
        console.log(`✅ Generated ${this.provinces.length} provinces`);
    }

    /**
     * Lloyd's Relaxation Algorithm
     * Improves province spacing by moving seeds to centroids
     */
    applyLloydsRelaxation() {
        for (let iter = 0; iter < this.config.RELAXATION_ITERATIONS; iter++) {
            // Skip center province (stays fixed)
            for (let i = 1; i < this.provinces.length; i++) {
                const prov = this.provinces[i];
                
                // Find all pixels belonging to this province
                let sumX = 0, sumY = 0, count = 0;
                
                // Sample grid (not full map for performance)
                for (let x = 0; x < this.size; x += 5) {
                    for (let y = 0; y < this.size; y += 5) {
                        const nearest = this.findNearestProvince(x, y);
                        if (nearest && nearest.id === prov.id) {
                            sumX += x;
                            sumY += y;
                            count++;
                        }
                    }
                }
                
                if (count > 0) {
                    // Move province center to centroid (with damping)
                    const newX = sumX / count;
                    const newY = sumY / count;
                    prov.x += (newX - prov.x) * 0.5; // 50% damping
                    prov.y += (newY - prov.y) * 0.5;
                }
            }
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * PHASE 2: VORONOI TESSELLATION + DOMAIN WARPING
     * ═══════════════════════════════════════════════════════════════
     * Creates organic province boundaries
     */
    generateVoronoiMap() {
        console.log("🎨 Creating Voronoi Map with Domain Warping...");
        
        // Initialize grids
        for (let x = 0; x < this.size; x++) {
            this.map[x] = [];
            this.provinceMap[x] = [];
            this.occupiedMap[x] = [];
            
            for (let y = 0; y < this.size; y++) {
                this.occupiedMap[x][y] = false;
                
                // ─────────────────────────────────────────
                // DOMAIN WARPING (Organic Effect)
                // ─────────────────────────────────────────
                const nx = x * this.config.WARP_SCALE;
                const ny = y * this.config.WARP_SCALE;
                
                const warpX = x + this.perlin.octaveNoise(nx, ny, 3, 0.5) * this.config.WARP_STRENGTH;
                const warpY = y + this.perlin.octaveNoise(nx + 50, ny + 50, 3, 0.5) * this.config.WARP_STRENGTH;
                
                // ─────────────────────────────────────────
                // Find Nearest Province (Voronoi)
                // ─────────────────────────────────────────
                const nearest = this.findNearestProvince(warpX, warpY);
                
                if (!nearest) {
                    this.map[x][y] = 0; // Void
                    this.provinceMap[x][y] = 0;
                    continue;
                }
                
                // ─────────────────────────────────────────
                // Check if pixel is within map bounds (Square shape)
                // ─────────────────────────────────────────
                const distFromCenter = Math.max(
                    Math.abs(x - this.center),
                    Math.abs(y - this.center)
                );
                
                if (distFromCenter > this.config.LAYER_OUTER_RADIUS) {
                    this.map[x][y] = 0; // Void (outside map)
                    this.provinceMap[x][y] = 0;
                    continue;
                }
                
                // ─────────────────────────────────────────
                // Assign Province & Base Terrain
                // ─────────────────────────────────────────
                this.provinceMap[x][y] = nearest.id;
                
                // Base terrain based on layer
                if (nearest.layer === 'outer') this.map[x][y] = 1;
                else if (nearest.layer === 'mid') this.map[x][y] = 2;
                else if (nearest.layer === 'inner') this.map[x][y] = 3;
                else this.map[x][y] = 3; // Center
            }
        }
        
        console.log("✅ Voronoi map complete");
    }

    /**
     * Helper: Find nearest province to a point
     */
    findNearestProvince(x, y) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const prov of this.provinces) {
            const dist = (prov.x - x) ** 2 + (prov.y - y) ** 2;
            if (dist < minDist) {
                minDist = dist;
                nearest = prov;
            }
        }
        
        return nearest;
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * PHASE 3: INTELLIGENT BORDER & GATE GENERATION
     * ═══════════════════════════════════════════════════════════════
     * Creates mountains and gates between provinces
     */
    generateBordersAndGates() {
        console.log("🏔️ Generating Borders & Gates...");
        
        // ─────────────────────────────────────────
        // STEP 1: Find all border pixels
        // ─────────────────────────────────────────
        const borderPixels = [];
        
        for (let x = 2; x < this.size - 2; x++) {
            for (let y = 2; y < this.size - 2; y++) {
                const currentProvince = this.provinceMap[x][y];
                if (currentProvince === 0) continue;
                
                // Check 4-directional neighbors
                const neighbors = [
                    this.provinceMap[x + 1][y],
                    this.provinceMap[x - 1][y],
                    this.provinceMap[x][y + 1],
                    this.provinceMap[x][y - 1]
                ];
                
                // If any neighbor is different province, this is a border
                const hasDifferentNeighbor = neighbors.some(n => n !== currentProvince && n !== 0);
                
                if (hasDifferentNeighbor) {
                    borderPixels.push({ x, y, provinceId: currentProvince });
                }
            }
        }
        
        console.log(`Found ${borderPixels.length} border pixels`);
        
        // ─────────────────────────────────────────
        // STEP 2: Calculate Province Adjacency
        // ─────────────────────────────────────────
        const adjacencyMap = new Map(); // provinceId -> Set of neighbor IDs
        
        for (const border of borderPixels) {
            const { x, y, provinceId } = border;
            
            if (!adjacencyMap.has(provinceId)) {
                adjacencyMap.set(provinceId, new Set());
            }
            
            // Check neighbors
            const neighbors = [
                this.provinceMap[x + 1][y],
                this.provinceMap[x - 1][y],
                this.provinceMap[x][y + 1],
                this.provinceMap[x][y - 1]
            ];
            
            for (const neighborId of neighbors) {
                if (neighborId !== provinceId && neighborId !== 0) {
                    adjacencyMap.get(provinceId).add(neighborId);
                    
                    // Bidirectional
                    if (!adjacencyMap.has(neighborId)) {
                        adjacencyMap.set(neighborId, new Set());
                    }
                    adjacencyMap.get(neighborId).add(provinceId);
                }
            }
        }
        
        // ─────────────────────────────────────────
        // STEP 3: Place Gates (Intelligent Positioning)
        // ─────────────────────────────────────────
        this.placeGatesIntelligent(borderPixels, adjacencyMap);
        
        // ─────────────────────────────────────────
        // STEP 4: Fill remaining borders with mountains
        // ─────────────────────────────────────────
        for (const border of borderPixels) {
            const { x, y } = border;
            
            // Skip if already a gate
            if (this.map[x][y] >= 5 && this.map[x][y] <= 7) continue;
            
            // Place mountain
            this.map[x][y] = 4;
            this.occupiedMap[x][y] = true;
        }
        
        // Update province neighbor lists
        for (const [provinceId, neighbors] of adjacencyMap) {
            const province = this.provinces.find(p => p.id === provinceId);
            if (province) {
                province.neighbors = Array.from(neighbors);
            }
        }
        
        console.log("✅ Borders & Gates complete");
    }

    /**
     * Intelligent Gate Placement Algorithm
     * - Ensures gates don't cross each other
     * - Maintains proper spacing
     * - Respects layer hierarchy (outer can't connect directly to center)
     */
    placeGatesIntelligent(borderPixels, adjacencyMap) {
        const processedConnections = new Set();
        
        for (const [provinceId, neighborIds] of adjacencyMap) {
            const province = this.provinces.find(p => p.id === provinceId);
            if (!province) continue;
            
            for (const neighborId of neighborIds) {
                // Skip if already processed (bidirectional)
                const connectionKey = [Math.min(provinceId, neighborId), Math.max(provinceId, neighborId)].join('-');
                if (processedConnections.has(connectionKey)) continue;
                processedConnections.add(connectionKey);
                
                const neighbor = this.provinces.find(p => p.id === neighborId);
                if (!neighbor) continue;
                
                // ─────────────────────────────────────────
                // LAYER VALIDATION (Prevent illegal connections)
                // ─────────────────────────────────────────
                if (!this.isValidConnection(province.layer, neighbor.layer)) {
                    continue; // Skip this connection
                }
                
                // ─────────────────────────────────────────
                // Find best gate position
                // ─────────────────────────────────────────
                const gatePos = this.findBestGatePosition(provinceId, neighborId, borderPixels);
                
                if (gatePos) {
                    // Determine gate type based on layers
                    let gateType = 7; // Default: Border Gate
                    if (province.layer === 'mid' || neighbor.layer === 'mid') gateType = 5;
                    if (province.layer === 'inner' || neighbor.layer === 'inner') gateType = 6;
                    
                    // Place gate (3x3 for visibility)
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const gx = gatePos.x + dx;
                            const gy = gatePos.y + dy;
                            
                            if (gx >= 0 && gx < this.size && gy >= 0 && gy < this.size) {
                                this.map[gx][gy] = gateType;
                                this.occupiedMap[gx][gy] = true;
                            }
                        }
                    }
                    
                    this.gatePositions.push(gatePos);
                }
            }
        }
    }

    /**
     * Validates if two layers can connect
     * Outer → Mid → Inner → Center (no skipping)
     */
    isValidConnection(layer1, layer2) {
        const hierarchy = ['outer', 'mid', 'inner', 'center'];
        const idx1 = hierarchy.indexOf(layer1);
        const idx2 = hierarchy.indexOf(layer2);
        
        // Allow connections between same layer or adjacent layers only
        return Math.abs(idx1 - idx2) <= 1;
    }

    /**
     * Finds optimal gate position between two provinces
     */
    findBestGatePosition(provinceId, neighborId, borderPixels) {
        // Filter border pixels between these two provinces
        const candidateBorders = borderPixels.filter(b => {
            const { x, y } = b;
            const neighbors = [
                this.provinceMap[x + 1]?.[y],
                this.provinceMap[x - 1]?.[y],
                this.provinceMap[x]?.[y + 1],
                this.provinceMap[x]?.[y - 1]
            ];
            
            return (b.provinceId === provinceId && neighbors.includes(neighborId)) ||
                   (b.provinceId === neighborId && neighbors.includes(provinceId));
        });
        
        if (candidateBorders.length === 0) return null;
        
        // Find border pixel closest to midpoint between province centers
        const prov1 = this.provinces.find(p => p.id === provinceId);
        const prov2 = this.provinces.find(p => p.id === neighborId);
        
        const midX = (prov1.x + prov2.x) / 2;
        const midY = (prov1.y + prov2.y) / 2;
        
        let bestPos = null;
        let minDist = Infinity;
        
        for (const candidate of candidateBorders) {
            // Skip if too close to existing gates
            const tooClose = this.gatePositions.some(g => {
                const dist = Math.sqrt((g.x - candidate.x) ** 2 + (g.y - candidate.y) ** 2);
                return dist < this.config.GATE_SPACING;
            });
            
            if (tooClose) continue;
            
            const dist = Math.sqrt((candidate.x - midX) ** 2 + (candidate.y - midY) ** 2);
            if (dist < minDist) {
                minDist = dist;
                bestPos = candidate;
            }
        }
        
        return bestPos;
    }
/**
     * ═══════════════════════════════════════════════════════════════
     * PHASE 4: RESOURCE NODE PLACEMENT
     * ═══════════════════════════════════════════════════════════════
     * Places Food, Wood, Stone, Gold mines evenly across provinces
     */
    placeResourceNodes() {
        console.log("💎 Placing Resource Nodes...");
        
        let totalPlaced = 0;
        
        // ─────────────────────────────────────────
        // Resource Distribution Strategy:
        // - Outer: More Food & Wood
        // - Mid: Balanced mix
        // - Inner: More Stone & Gold
        // ─────────────────────────────────────────
        
        const resourceWeights = {
            'outer': [0.4, 0.4, 0.1, 0.1], // [Food, Wood, Stone, Gold]
            'mid':   [0.3, 0.3, 0.2, 0.2],
            'inner': [0.2, 0.2, 0.3, 0.3],
            'center': [0.15, 0.15, 0.35, 0.35]
        };
        
        for (const province of this.provinces) {
            if (province.layer === 'center') continue; // Skip center province
            
            const weights = resourceWeights[province.layer];
            const nodeCount = Math.floor(this.config.RESOURCE_PER_PROVINCE + Math.random() * 2);
            
            for (let i = 0; i < nodeCount; i++) {
                // Choose resource type based on weights
                const rand = Math.random();
                let resourceType = 10; // Food
                let cumulative = 0;
                
                for (let j = 0; j < weights.length; j++) {
                    cumulative += weights[j];
                    if (rand <= cumulative) {
                        resourceType = 10 + j; // 10=Food, 11=Wood, 12=Stone, 13=Gold
                        break;
                    }
                }
                
                // Try to place near province center (with randomness)
                const placed = this.tryPlaceStructureInProvince(
                    province, 
                    2, 2, // 2x2 size
                    resourceType,
                    40 // Max radius from center
                );
                
                if (placed) totalPlaced++;
            }
        }
        
        console.log(`✅ Placed ${totalPlaced} resource nodes`);
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * PHASE 5: BARBARIAN CAMP PLACEMENT
     * ═══════════════════════════════════════════════════════════════
     * Places barbarian camps/keeps in outer provinces
     */
    placeBarbarianCamps() {
        console.log("⚔️ Placing Barbarian Camps...");
        
        let totalPlaced = 0;
        const outerProvinces = this.provinces.filter(p => p.layer === 'outer');
        
        for (const province of outerProvinces) {
            // Not every province has barbarians
            if (Math.random() > this.config.BARBARIAN_DENSITY) continue;
            
            // 80% camp (2x2), 20% keep (3x3)
            const isKeep = Math.random() < 0.2;
            const type = isKeep ? 21 : 20;
            const size = isKeep ? 3 : 2;
            
            const placed = this.tryPlaceStructureInProvince(
                province,
                size, size,
                type,
                35 // Radius
            );
            
            if (placed) totalPlaced++;
        }
        
        console.log(`✅ Placed ${totalPlaced} barbarian camps`);
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * PHASE 6: SPECIAL STRUCTURES (Holy Sites, Ziggurat)
     * ═══════════════════════════════════════════════════════════════
     */
    placeSpecialStructures() {
        console.log("🏛️ Placing Special Structures...");
        
        // ─────────────────────────────────────────
        // CENTER: The Great Ziggurat (5x5)
        // ─────────────────────────────────────────
        const cx = Math.floor(this.center) - 2;
        const cy = Math.floor(this.center) - 2;
        this.placeStructure(cx, cy, 5, 5, 40);
        
        // ─────────────────────────────────────────
        // CENTER: Twin Towers (3x3 each)
        // ─────────────────────────────────────────
        this.placeStructure(cx - 12, cy + 1, 3, 3, 41); // Tower of Light
        this.placeStructure(cx + 14, cy + 1, 3, 3, 42); // Tower of Shadow
        
        // ─────────────────────────────────────────
        // INNER PROVINCES: Circle of Nature (4x4)
        // ─────────────────────────────────────────
        const innerProvinces = this.provinces.filter(p => p.layer === 'inner');
        for (const province of innerProvinces) {
            this.tryPlaceStructureInProvince(province, 4, 4, 35, 20);
        }
        
        // ─────────────────────────────────────────
        // MID PROVINCES: Altars & Ruins (3x3)
        // ─────────────────────────────────────────
        const midProvinces = this.provinces.filter(p => p.layer === 'mid');
        for (const province of midProvinces) {
            const type = Math.random() > 0.5 ? 30 : 31; // Altar or Ruins
            this.tryPlaceStructureInProvince(province, 3, 3, type, 25);
        }
        
        // ─────────────────────────────────────────
        // OUTER PROVINCES: Shrines (3x3) - Sparse
        // ─────────────────────────────────────────
        const outerProvinces = this.provinces.filter(p => p.layer === 'outer');
        for (const province of outerProvinces) {
            if (Math.random() < 0.3) { // Only 30% chance
                this.tryPlaceStructureInProvince(province, 3, 3, 32, 30);
            }
        }
        
        console.log("✅ Special structures placed");
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * HELPER METHODS
     * ═══════════════════════════════════════════════════════════════
     */

    /**
     * Check if area is clear for placement
     */
    isAreaClear(x, y, width, height) {
        if (x < 0 || y < 0 || x + width >= this.size || y + height >= this.size) {
            return false;
        }

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const tx = x + i;
                const ty = y + j;
                
                // Check if occupied
                if (this.occupiedMap[tx][ty]) return false;
                
                // Check if valid terrain (must be ground, not void/mountain/gate)
                const tileType = this.map[tx][ty];
                if (![1, 2, 3].includes(tileType)) return false;
            }
        }
        
        return true;
    }

    /**
     * Place structure at exact position
     */
    placeStructure(x, y, width, height, typeId) {
        if (!this.isAreaClear(x, y, width, height)) return false;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const tx = x + i;
                const ty = y + j;
                this.map[tx][ty] = typeId;
                this.occupiedMap[tx][ty] = true;
            }
        }
        
        return true;
    }

    /**
     * Try to place structure near province center
     */
    tryPlaceStructureInProvince(province, width, height, typeId, maxRadius) {
        const attempts = 15; // Increased attempts for better success rate
        
        for (let i = 0; i < attempts; i++) {
            // Random offset from province center
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * maxRadius;
            
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            
            const px = Math.floor(province.x + offsetX);
            const py = Math.floor(province.y + offsetY);
            
            // Check if this position is actually in the province
            if (px < 0 || px >= this.size || py < 0 || py >= this.size) continue;
            if (this.provinceMap[px][py] !== province.id) continue;
            
            // Try to place
            if (this.placeStructure(px, py, width, height, typeId)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * MAIN GENERATION FUNCTION
     * ═══════════════════════════════════════════════════════════════
     */
    generate() {
        console.log("═══════════════════════════════════════════");
        console.log("🏰 RISE OF KINGDOMS MAP GENERATOR");
        console.log(`📐 Size: ${this.size}x${this.size}`);
        console.log("═══════════════════════════════════════════");
        
        const startTime = Date.now();
        
        // ─────────────────────────────────────────
        // PHASE 1: Province Seeds
        // ─────────────────────────────────────────
        this.generateProvinceSeedsAdvanced();
        
        // ─────────────────────────────────────────
        // PHASE 2: Voronoi Map
        // ─────────────────────────────────────────
        this.generateVoronoiMap();
        
        // ─────────────────────────────────────────
        // PHASE 3: Borders & Gates
        // ─────────────────────────────────────────
        this.generateBordersAndGates();
        
        // ─────────────────────────────────────────
        // PHASE 4: Resources
        // ─────────────────────────────────────────
        this.placeResourceNodes();
        
        // ─────────────────────────────────────────
        // PHASE 5: Barbarians
        // ─────────────────────────────────────────
        this.placeBarbarianCamps();
        
        // ─────────────────────────────────────────
        // PHASE 6: Special Structures
        // ─────────────────────────────────────────
        this.placeSpecialStructures();
        
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log("═══════════════════════════════════════════");
        console.log(`✅ MAP GENERATION COMPLETE (${elapsedTime}s)`);
        console.log("═══════════════════════════════════════════");
        
        return {
            grid: this.map,
            provinceMap: this.provinceMap,
            provinces: this.provinces,
            config: {
                size: this.size,
                centerX: this.center,
                centerY: this.center,
                layers: {
                    center: this.config.LAYER_CENTER_RADIUS,
                    inner: this.config.LAYER_INNER_RADIUS,
                    mid: this.config.LAYER_MID_RADIUS,
                    outer: this.config.LAYER_OUTER_RADIUS
                }
            }
        };
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EXPORT FUNCTION
 * ═══════════════════════════════════════════════════════════════
 */
const generateRoKMap = (size = 400) => {
    const generator = new RoKMapGenerator(size, Date.now());
    return generator.generate();
};

module.exports = { generateRoKMap };