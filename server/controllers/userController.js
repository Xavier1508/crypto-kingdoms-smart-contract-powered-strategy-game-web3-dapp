// server/controllers/userController.js
const User = require('../models/User');
const World = require('../models/World');

// --- 1. GET USER PROFILE ---
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('-password');
        
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Cari semua world dimana user ini terdaftar
        const activeWorlds = await World.find({ players: userId });

        const worldsData = activeWorlds.map(world => {
            // Ambil data user secara aman (baik dari Map maupun Object)
            const playerData = world.playerData.get ? world.playerData.get(userId) : world.playerData[userId];
            
            // Safety check
            if (!playerData) return null;

            return {
                worldId: world.worldId,
                worldName: world.name,
                seasonEnd: world.seasonEnd,
                status: world.status,
                // Data Realtime
                power: playerData.power || 0,
                resources: playerData.resources || { food: 0, wood: 0, stone: 0, gold: 0 },
                troops: playerData.troops || { infantry: 0, archer: 0, cavalry: 0, siege: 0 },
                castleX: playerData.castleX,
                castleY: playerData.castleY,
                tokenId: playerData.tokenId || null
            };
        }).filter(w => w !== null);

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email, // Opsional jika mau ditampilkan
                walletAddress: user.walletAddress,
                createdAt: user.createdAt
            },
            activeWorlds: worldsData
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// --- 2. LINK TOKEN ID ---
// Menghubungkan Token ID dari Blockchain ke Database MongoDB
const linkTokenId = async (req, res) => {
    try {
        let { userId, tokenId, worldId } = req.body;
        
        worldId = parseInt(worldId); 
        tokenId = String(tokenId);

        console.log(`🔗 Linking: User ${userId} -> Token ${tokenId} (World ${worldId})`);

        const worldExists = await World.findOne({ worldId: worldId });
        if (!worldExists) {
            return res.status(404).json({ error: "World not found" });
        }

        // Update Token ID ke dalam Player Data (Support dot notation untuk nested object/map)
        const updatePath = `playerData.${userId}.tokenId`;
        
        const result = await World.updateOne(
            { worldId: worldId },
            { $set: { [updatePath]: tokenId } }
        );

        if (result.modifiedCount > 0) {
            res.json({ success: true, msg: "Identity Linked" });
        } else {
            // Bisa jadi sudah ter-link sebelumnya, anggap sukses
            res.json({ success: true, msg: "Link verified (No Change)" });
        }

    } catch (error) {
        console.error("Link Error:", error);
        res.status(500).json({ error: "Server link failed" });
    }
};

// --- 3. DYNAMIC METADATA GENERATOR (THE BRAIN) ---
// Ini yang dibaca oleh OpenSea. 
// Menggabungkan Data Player + Analisa Map untuk menentukan Status Raja.
const getMetadata = async (req, res) => {
    try {
        const tokenId = req.params.tokenId; 
        
        // 1. SCAN SEMUA WORLD
        // Kita mencari world mana yang memiliki Player dengan Token ID ini.
        // Gunakan .lean() agar hemat memori.
        const worlds = await World.find({}).lean();
        
        let foundPlayer = null;
        let sourceWorld = null;
        let userId = null;

        // Loop Manual (karena struktur data World kita dinamis)
        for (const world of worlds) {
            if (!world.playerData) continue;
            
            // Handle struktur Map vs Object (tergantung versi Mongoose/Save)
            const pDataEntries = world.playerData instanceof Map 
                ? world.playerData.entries() 
                : Object.entries(world.playerData);
            
            for (const [pid, pData] of pDataEntries) {
                // Cek Token ID (String Comparison)
                if (pData.tokenId && String(pData.tokenId) === String(tokenId)) {
                    foundPlayer = pData;
                    sourceWorld = world;
                    userId = pid;
                    break;
                }
            }
            if (foundPlayer) break; // Ketemu! Stop looping.
        }

        // Handle Jika Belum Ketemu (Mungkin baru minting, DB belum sync)
        if (!foundPlayer) {
            return res.json({
                name: `Unrevealed Kingdom #${tokenId}`,
                description: "This kingdom is currently being established on the map. Please refresh shortly.",
                image: "https://via.placeholder.com/500x500.png?text=Building+Kingdom...",
                attributes: [{ trait_type: "Status", value: "Syncing" }]
            });
        }

        // --- 2. ANALISA KEKUASAAN (HIERARCHY OF POWER) ---
        // Kita scan Map Grid world tersebut. Apakah user ini menguasai tile keramat?
        
        let highestTier = 0; // 0 = Basic
        let specialTitle = "Novice Commander";
        let specialImage = "https://opengameart.org/sites/default/files/castle_7.png"; // Gambar Default
        
        const mapGrid = sourceWorld.mapGrid;
        const ownershipMap = sourceWorld.ownershipMap;
        const mapSize = sourceWorld.mapSize;

        // Scan Ownership Map
        // (NOTE: Di server production yang sangat besar, logic ini bisa di-cache. 
        // Tapi untuk skala ini, loop scan ini sangat cepat < 10ms)
        
        outerLoop:
        for (let x = 0; x < mapSize; x++) {
            for (let y = 0; y < mapSize; y++) {
                // Jika pixel ini milik user
                if (ownershipMap[x] && ownershipMap[x][y] === userId) {
                    const tileType = mapGrid[x][y];

                    // TIER 4: THE GREAT ZIGGURAT (ID 40) - GOD KING
                    if (tileType === 40) {
                        highestTier = 4;
                        specialTitle = "WORLD KING OF ZIGGURAT";
                        specialImage = "https://your-server.com/assets/nft/king-ziggurat-gold.png"; // Ganti URL Gambar Raja
                        break outerLoop; // Tidak ada yang lebih tinggi, stop scan.
                    }

                    // TIER 3: CIRCLE OF NATURE (ID 35)
                    else if (tileType === 35 && highestTier < 3) {
                        highestTier = 3;
                        specialTitle = "HIGH GUARDIAN OF NATURE";
                        specialImage = "https://your-server.com/assets/nft/guardian-green.png";
                    }

                    // TIER 2: ALTAR (30) OR RUINS (31)
                    else if ((tileType === 30 || tileType === 31) && highestTier < 2) {
                        highestTier = 2;
                        specialTitle = "MYSTIC CONQUEROR";
                        specialImage = "https://your-server.com/assets/nft/mystic-purple.png";
                    }

                    // TIER 1: SHRINE (32)
                    else if (tileType === 32 && highestTier < 1) {
                        highestTier = 1;
                        specialTitle = "WARLORD OF THE OUTER RIM";
                        specialImage = "https://your-server.com/assets/nft/warlord-red.png";
                    }
                }
            }
        }

        // --- 3. HITUNG TOTAL TROOPS (Masih oke di-sum) ---
        const totalTroops = (foundPlayer.troops.infantry || 0) + 
                            (foundPlayer.troops.archer || 0) + 
                            (foundPlayer.troops.cavalry || 0) + 
                            (foundPlayer.troops.siege || 0);

        // --- 4. FORMAT METADATA (DENGAN RESOURCE TERPISAH) ---
        // Sesuai permintaan: Resource TIDAK dijumlahkan, tapi dirinci.
        
        const metadata = {
            name: highestTier === 4 ? `👑 ${specialTitle} ${foundPlayer.username}` : `${specialTitle} ${foundPlayer.username}`,
            description: `A powerful dominion in ${sourceWorld.name}. Currently holding the rank of ${specialTitle}. Rules from coordinates [${foundPlayer.castleX}, ${foundPlayer.castleY}].`,
            image: specialImage,
            external_url: "https://crypto-kingdoms-the-on-chain-domini.vercel.app", // Link Game Anda
            background_color: highestTier === 4 ? "FFD700" : "1a2332", // Emas jika Raja
            
            attributes: [
                // --- IDENTITY & RANK ---
                { trait_type: "Rank Title", value: specialTitle },
                { trait_type: "Tier Class", value: `Tier ${highestTier}` },
                { trait_type: "Is King?", value: highestTier === 4 ? "Yes" : "No" },
                { trait_type: "Origin World", value: sourceWorld.name },
                { trait_type: "Season", value: sourceWorld.seasonEnd ? "Active" : "Legacy" },

                // --- POWER & TROOPS ---
                { trait_type: "Commander Power", value: foundPlayer.power, display_type: "number" },
                { trait_type: "Military Strength (Troops)", value: totalTroops },

                // --- RESOURCES (TERPISAH & DETAILED) ---
                // Ini permintaan khusus Anda agar resource tercatat masing-masing
                { trait_type: "Resource: Food", value: foundPlayer.resources.food || 0 },
                { trait_type: "Resource: Wood", value: foundPlayer.resources.wood || 0 },
                { trait_type: "Resource: Stone", value: foundPlayer.resources.stone || 0 },
                { trait_type: "Resource: Gold", value: foundPlayer.resources.gold || 0 },

                // --- LOCATION ---
                { trait_type: "Capital X", value: foundPlayer.castleX, display_type: "number" },
                { trait_type: "Capital Y", value: foundPlayer.castleY, display_type: "number" },
                { trait_type: "Last Sync", value: new Date().toISOString() }
            ]
        };

        // Cache Control: Agar OpenSea tidak terlalu sering hit tapi data tetap segar (1 menit)
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        
        res.json(metadata);

    } catch (error) {
        console.error("Metadata Error:", error);
        res.status(500).json({ error: "Failed to fetch metadata" });
    }
};

module.exports = {
    getUserProfile,
    linkTokenId,
    getMetadata,
};