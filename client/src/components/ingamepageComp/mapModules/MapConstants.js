// client/src/components/ingamePageComp/mapModules/MapConstants.js

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const HALF_WIDTH = TILE_WIDTH / 2;
export const HALF_HEIGHT = TILE_HEIGHT / 2;

// --- 1. DEFINISI ID ---
export const TILE_TYPES = {
    VOID: 0,
    // TERRAIN (Ground)
    ZONE_1: 1, // Outer (Grass)
    ZONE_2: 2, // Mid (Dry/Forest)
    ZONE_3: 3, // Inner (Red Soil/War)
    MOUNTAIN: 4,

    // GATES
    PASS_LV1: 5,
    PASS_LV2: 6,
    PASS_BORDER: 7,
    
    // RESOURCES (2x2)
    RES_FOOD: 10,
    RES_WOOD: 11,
    RES_STONE: 12,
    RES_GOLD: 13,

    // BARBARIANS
    BARB_CAMP: 20, // 2x2
    BARB_FORT: 21, // 3x3

    // HOLY SITES
    ALTAR: 30,          // 3x3
    RUINS: 31,          // 3x3
    SHRINE: 32,         // 3x3
    CIRCLE_NATURE: 35,  // 4x4

    // CENTER
    ZIGGURAT: 40,    // 5x5
    TOWER_ALPHA: 41, // 3x3
    TOWER_BETA: 42,  // 3x3
};

// --- 2. UKURAN STRUKTUR (Agar Renderer Tahu) ---
export const TILE_SIZES = {
    [TILE_TYPES.RES_FOOD]: 2, [TILE_TYPES.RES_WOOD]: 2,
    [TILE_TYPES.RES_STONE]: 2, [TILE_TYPES.RES_GOLD]: 2,
    [TILE_TYPES.BARB_CAMP]: 2,
    
    [TILE_TYPES.BARB_FORT]: 3,
    [TILE_TYPES.ALTAR]: 3, [TILE_TYPES.RUINS]: 3,
    [TILE_TYPES.SHRINE]: 3, [TILE_TYPES.TOWER_ALPHA]: 3, 
    [TILE_TYPES.TOWER_BETA]: 3,

    [TILE_TYPES.CIRCLE_NATURE]: 4,
    [TILE_TYPES.ZIGGURAT]: 5,
};

// --- 3. WARNA (Palette) ---
export const PALETTE = {
    [TILE_TYPES.VOID]: 0x0a0e1a,
    [TILE_TYPES.ZONE_1]: 0x86efac, 
    [TILE_TYPES.ZONE_2]: 0x4ade80, 
    [TILE_TYPES.ZONE_3]: 0x57534e, 
    
    [TILE_TYPES.MOUNTAIN]: 0x64748b, 
    
    [TILE_TYPES.PASS_LV1]: 0xf97316, 
    [TILE_TYPES.PASS_LV2]: 0xea580c, 
    [TILE_TYPES.PASS_BORDER]: 0xf43f5e, 

    [TILE_TYPES.RES_FOOD]: 0xfacc15,  
    [TILE_TYPES.RES_WOOD]: 0x78350f,  
    [TILE_TYPES.RES_STONE]: 0x94a3b8, 
    [TILE_TYPES.RES_GOLD]: 0xffd700,  

    [TILE_TYPES.BARB_CAMP]: 0x7f1d1d, 
    [TILE_TYPES.BARB_FORT]: 0x450a0a, 

    [TILE_TYPES.ALTAR]: 0x4c1d95,
    [TILE_TYPES.RUINS]: 0x3f3f46,
    [TILE_TYPES.SHRINE]: 0x0f766e,
    [TILE_TYPES.CIRCLE_NATURE]: 0xa855f7,
    [TILE_TYPES.ZIGGURAT]: 0xffffff, 
    [TILE_TYPES.TOWER_ALPHA]: 0xc0c0c0,
    [TILE_TYPES.TOWER_BETA]: 0x2f4f4f,
};

// --- 4. KETINGGIAN 3D ---
export const HEIGHTS = {
    4: 45, // Gunung
    5: 25, 6: 25, 7: 20, // Gate
    10: 15, 11: 15, 12: 15, 13: 15, // Res
    20: 25, 21: 35, // Barb
    30: 40, 31: 40, 32: 40, 35: 45, // Holy
    40: 80, // Ziggurat
    41: 50, 42: 50
};

// --- 5. NAMA TILE (Yang hilang tadi) ---
export const TILE_NAMES = {
    [TILE_TYPES.VOID]: "Void",
    [TILE_TYPES.ZONE_1]: "Outer Province",
    [TILE_TYPES.ZONE_2]: "Mid Province",
    [TILE_TYPES.ZONE_3]: "Inner Province",
    [TILE_TYPES.MOUNTAIN]: "Mountain Range",
    
    [TILE_TYPES.PASS_LV1]: "Level 1 Pass",
    [TILE_TYPES.PASS_LV2]: "Level 2 Pass",
    [TILE_TYPES.PASS_BORDER]: "Border Gate",
    
    [TILE_TYPES.RES_FOOD]: "Cropland (Lv.1)",
    [TILE_TYPES.RES_WOOD]: "Logging Camp (Lv.1)",
    [TILE_TYPES.RES_STONE]: "Stone Deposit (Lv.1)",
    [TILE_TYPES.RES_GOLD]: "Gold Mine (Lv.1)",

    [TILE_TYPES.BARB_CAMP]: "Barbarian Camp",
    [TILE_TYPES.BARB_FORT]: "Barbarian Keep",

    [TILE_TYPES.ALTAR]: "Darkness Altar",
    [TILE_TYPES.RUINS]: "Ancient Ruins",
    [TILE_TYPES.SHRINE]: "Shrine of Warriors",
    [TILE_TYPES.CIRCLE_NATURE]: "Circle of Nature",

    [TILE_TYPES.ZIGGURAT]: "The Great Ziggurat",
    [TILE_TYPES.TOWER_ALPHA]: "Tower of Light",
    [TILE_TYPES.TOWER_BETA]: "Tower of Shadow",
};

// --- 6. DESKRIPSI TILE (Yang hilang tadi) ---
export const TILE_DESCRIPTIONS = {
    [TILE_TYPES.VOID]: "Nothing exists here.",
    [TILE_TYPES.ZONE_1]: "Fertile lands on the kingdom's edge. Safe for new governors.",
    [TILE_TYPES.ZONE_2]: "A contested region rich in resources.",
    [TILE_TYPES.ZONE_3]: "The war-torn lands near the capital.",
    [TILE_TYPES.MOUNTAIN]: "Impassable terrain.",
    
    [TILE_TYPES.PASS_LV1]: "Connects Outer and Mid provinces.",
    [TILE_TYPES.PASS_LV2]: "Connects Mid and Inner provinces.",
    [TILE_TYPES.PASS_BORDER]: "Connects neighboring provinces.",

    [TILE_TYPES.RES_FOOD]: "Produces Food for your army.",
    [TILE_TYPES.RES_WOOD]: "Produces Wood for construction.",
    [TILE_TYPES.RES_STONE]: "Produces Stone for walls.",
    [TILE_TYPES.RES_GOLD]: "Produces Gold for research.",

    [TILE_TYPES.BARB_CAMP]: "A gathering of savages. Defeat them for XP.",
    [TILE_TYPES.BARB_FORT]: "A heavily fortified barbarian base. Requires a rally.",

    [TILE_TYPES.ALTAR]: "Grants attack buffs to the controlling alliance.",
    [TILE_TYPES.RUINS]: "Explore to find ancient technology.",
    [TILE_TYPES.SHRINE]: "Grants defense buffs to the controlling alliance.",
    [TILE_TYPES.CIRCLE_NATURE]: "Increases healing speed for the region.",

    [TILE_TYPES.ZIGGURAT]: "The center of the world. He who controls this, rules the kingdom.",
    [TILE_TYPES.TOWER_ALPHA]: "A mystical tower guarding the Ziggurat.",
    [TILE_TYPES.TOWER_BETA]: "A dark tower guarding the Ziggurat.",
};