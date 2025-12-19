// server/utils/gameHelpers.js

const generatePlayerColor = (username = "Player") => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Gunakan HSL dengan Saturation & Lightness tinggi biar neon/terang
    const hue = Math.abs(hash % 360); 
    return `hsl(${hue}, 85%, 60%)`; 
};

const createEmptyGrid = (size) => Array(size).fill().map(() => Array(size).fill(null));

// --- 2. KONSTANTA GAMEPLAY (Rules of War) ---
const TILE_COSTS = {
    EMPTY_LAND: 250,      // Tanah kosong (Lelah jalan doang)
    RESOURCE_NODE: 1000,  // Rebutan tambang
    BARBARIAN: 5000,      // PvE Menengah
    GATE_LVL1: 15000,     // Syarat masuk Zone 2 (Outer -> Mid)
    GATE_LVL2: 30000,     // Syarat masuk Zone 3 (Mid -> Inner)
    SHRINE: 20000,        // Objektif Outer
    ALTAR: 40000,         // Objektif Mid
    ZIGGURAT: 100000,     // THE KING (Tengah Map)
    DEFAULT: 500
};

// Fungsi bantu untuk membunuh pasukan secara proporsional
const calculateTroopLoss = (pData, powerLossAmount) => {
    // 1. Hitung Total Power Real saat ini (Berdasarkan jumlah pasukan)
    // Rumus harus sama persis dengan di game loop
    const currentRealPower = 
        (pData.troops.infantry * 1) + 
        (pData.troops.archer * 1.5) + 
        (pData.troops.cavalry * 2) + 
        (pData.troops.siege * 2.5);

    if (currentRealPower <= 0) {
        pData.power = 0;
        return;
    }

    // 2. Hitung Persentase Kerugian
    // Contoh: Punya 1000 Power, Cost 250. Loss Ratio = 0.25 (25%)
    // Artinya 25% dari infantry mati, 25% dari kuda mati, dst.
    const lossRatio = Math.min(1, powerLossAmount / currentRealPower);

    // 3. Bunuh Pasukan (Bulatkan ke bawah biar aman)
    pData.troops.infantry = Math.floor(pData.troops.infantry * (1 - lossRatio));
    pData.troops.archer   = Math.floor(pData.troops.archer * (1 - lossRatio));
    pData.troops.cavalry  = Math.floor(pData.troops.cavalry * (1 - lossRatio));
    pData.troops.siege    = Math.floor(pData.troops.siege * (1 - lossRatio));

    pData.power = Math.floor(
        (pData.troops.infantry * 1) + 
        (pData.troops.archer * 1.5) + 
        (pData.troops.cavalry * 2) + 
        (pData.troops.siege * 2.5)
    );
};

module.exports = {
    generatePlayerColor,
    createEmptyGrid,
    TILE_COSTS,
    calculateTroopLoss
};