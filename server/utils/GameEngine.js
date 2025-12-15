// server/utils/GameEngine.js
const { TILE_TYPES } = require('../utils/MapConstants'); // Pastikan path ini benar atau sesuaikan manual ID-nya jika constants ada di client

// ID Tile Resource (Sesuaikan dengan MapConstants Anda)
const RESOURCE_TILES = {
    10: 'food',  // Cropland
    11: 'wood',  // Logging Camp
    12: 'stone', // Stone Deposit
    13: 'gold'   // Gold Mine
};

// Konstanta Game Balance
const BASE_PRODUCTION = 1;      // +1 per pixel biasa
const NODE_BONUS = 4;           // +4 per pixel resource (Total 16 untuk 2x2)
const DISTANCE_PENALTY = 5;     // -5 Power per pixel jarak
const BASE_CONQUER_COST = 500;  // Biaya dasar conquer wilayah kosong

class GameEngine {

    /**
     * 1. LOGIKA JARAK & POWER (The Nerf Logic)
     * Menghitung Power Efektif sebuah kerajaan di koordinat tertentu
     */
    static calculateEffectivePower(playerData, targetX, targetY) {
        if (!playerData || playerData.castleX === undefined) return 0;

        // Rumus Pythagoras untuk jarak pixel
        const dist = Math.sqrt(
            Math.pow(targetX - playerData.castleX, 2) + 
            Math.pow(targetY - playerData.castleY, 2)
        );

        // Power Asli dari Pasukan
        const basePower = playerData.power || 0;

        // Hitung Penalti
        const penalty = Math.floor(dist * DISTANCE_PENALTY);

        // Power Efektif tidak boleh minus
        return Math.max(0, basePower - penalty);
    }

    /**
     * 2. LOGIKA PRODUKSI RESOURCE (The Pixel Yield)
     * Menghitung total produksi per tick berdasarkan pixel yang dikuasai
     */
    static calculateProduction(userId, world) {
        // Default Production
        let production = {
            food: 10, wood: 10, stone: 5, gold: 2
        };

        const mapSize = world.mapSize;
        const ownership = world.ownershipMap;
        const grid = world.mapGrid;

        // Loop seluruh map (Perlu optimasi di masa depan, tapi oke untuk sekarang)
        for (let x = 0; x < mapSize; x++) {
            for (let y = 0; y < mapSize; y++) {
                
                // Jika pixel ini milik user
                if (ownership[x][y] === userId) {
                    const tileType = grid[x][y];
                    
                    // Cek apakah ini pixel Resource?
                    if (RESOURCE_TILES[tileType]) {
                        // Tambah Bonus Besar (+4)
                        const resName = RESOURCE_TILES[tileType];
                        production[resName] += NODE_BONUS;
                    } else {
                        // Pixel Biasa (Tanah/Gunung/Dll) -> Tambah Sedikit ke Food & Wood
                        production.food += BASE_PRODUCTION;
                        production.wood += BASE_PRODUCTION;
                    }
                }
            }
        }

        return production;
    }

    /**
     * 3. LOGIKA BATTLE / CONQUER
     * Cek apakah attacker bisa mengambil tile ini
     */
    static canConquerTile(attacker, defender, x, y) {
        // 1. Hitung Power Attacker di lokasi tersebut (kena penalti jarak)
        const attackPower = this.calculateEffectivePower(attacker, x, y);

        // 2. Tentukan Power Defender
        let defensePower = 0;
        
        if (!defender) {
            // Kalau kosong (Wilderness), pakai Base Cost
            // Semakin ke tengah map (koordinat 200,200), semakin mahal? (Opsional)
            defensePower = BASE_CONQUER_COST; 
        } else {
            // Kalau punya orang lain, hitung power efektif dia di situ
            defensePower = this.calculateEffectivePower(defender, x, y);
            
            // Defender Bonus (Home advantage) - Opsional
            defensePower = Math.floor(defensePower * 1.1); 
        }

        return {
            success: attackPower > defensePower,
            attackPower,
            defensePower
        };
    }
}

module.exports = GameEngine;