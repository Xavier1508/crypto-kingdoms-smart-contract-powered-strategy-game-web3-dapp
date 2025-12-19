// server/utils/gameHelpers.js

// --- 1. GENERATOR WARNA DETERMINISTIK ---
// Warna akan dibuat berdasarkan nama username, jadi pasti unik & konsisten.
const generatePlayerColor = (username = "Player") => {
    // Buat hash dari username
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
const calculateTroopLoss = (pData, lossAmount) => {
    // Total pasukan
    const totalTroops = pData.troops.infantry + pData.troops.archer + pData.troops.cavalry + pData.troops.siege;
    if (totalTroops <= 0) return;

    // Persentase kematian (Loss / Total Power * Scaling)
    // Kita sederhanakan: LossAmount adalah "Power Damage" yang diterima
    // Power kira-kira 1-2 per troop. Jadi kita bagi rata.
    
    // Safety: Jangan sampai minus
    const safeLoss = Math.min(pData.power, lossAmount);
    
    // Kurangi Power Total
    pData.power = Math.max(0, pData.power - safeLoss);

    // Kurangi Unit (Proporsional)
    // Jika kehilangan 10% power, maka kehilangan 10% dari setiap jenis pasukan
    const lossRatio = safeLoss / (totalTroops * 1.5 || 1); // Asumsi rata-rata 1 power = 1.5 power points

    pData.troops.infantry = Math.floor(Math.max(0, pData.troops.infantry * (1 - lossRatio)));
    pData.troops.archer = Math.floor(Math.max(0, pData.troops.archer * (1 - lossRatio)));
    pData.troops.cavalry = Math.floor(Math.max(0, pData.troops.cavalry * (1 - lossRatio)));
    pData.troops.siege = Math.floor(Math.max(0, pData.troops.siege * (1 - lossRatio)));
};

module.exports = {
    generatePlayerColor,
    createEmptyGrid,
    TILE_COSTS,
    calculateTroopLoss
};