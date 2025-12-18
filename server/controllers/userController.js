// server/controllers/userController.js
const User = require('../models/User');
const World = require('../models/World');

// GET User Profile & Active Worlds Data
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const activeWorlds = await World.find({ players: userId });

        const worldsData = activeWorlds.map(world => {
            const playerData = world.playerData.get ? world.playerData.get(userId) : world.playerData[userId];
            return {
                worldId: world.worldId,
                worldName: world.name,
                status: world.status,
                power: playerData ? playerData.power : 0,
                resources: playerData ? playerData.resources : null,
                troops: playerData ? playerData.troops : null,
                castleX: playerData ? playerData.castleX : 0,
                castleY: playerData ? playerData.castleY : 0,
            };
        });

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
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

// [PERBAIKAN] Link Token ID dengan metode yang pasti tersimpan
const linkTokenId = async (req, res) => {
    try {
        // Ambil data, pastikan worldId di-convert jadi Number agar cocok dengan DB
        let { userId, tokenId, worldId } = req.body;
        worldId = parseInt(worldId); // <--- KUNCI PERBAIKAN: Paksa jadi Angka

        console.log(`LINKING REQUEST: User ${userId} -> Token ${tokenId} in World ${worldId}`);

        // Cek dulu apakah World-nya ada?
        const worldExists = await World.findOne({ worldId: worldId });
        if (!worldExists) {
            console.error("Link Error: World ID not found in DB:", worldId);
            return res.status(404).json({ error: "World not found" });
        }

        // Update langsung ke path spesifik
        const updateField = {};
        updateField[`playerData.${userId}.tokenId`] = String(tokenId);

        const result = await World.updateOne(
            { worldId: worldId },
            { $set: updateField }
        );

        console.log("🛠️ DB Update Result:", result);

        if (result.modifiedCount > 0) {
            console.log("✅ SUCCESS: Token ID Linked!");
            res.json({ success: true, msg: "Token Linked" });
        } else {
            console.warn("⚠️ WARNING: DB not modified. Check if User ID matches exactly.");
            res.json({ success: false, msg: "User path not found or Token already set" });
        }

    } catch (error) {
        console.error("❌ CRITICAL Link Error:", error);
        res.status(500).json({ error: "Link failed server error" });
    }
};

// [PERBAIKAN] Metadata Generator
const getMetadata = async (req, res) => {
    try {
        const tokenId = req.params.tokenId; 
        console.log(`🔍 Searching Metadata for Token ID: ${tokenId}`);

        // Ambil world aktif dan playerData-nya
        // Gunakan .lean() agar jadi object JavaScript biasa (bukan Map Mongoose) biar mudah di-loop
        const worlds = await World.find({ status: 'ACTIVE' }).select('playerData').lean();
        
        let foundPlayer = null;
        
        // Loop manual karena struktur Map di Mongo agak unik saat di-lean()
        for (const world of worlds) {
            if (!world.playerData) continue;

            // world.playerData adalah Object sekarang (karena .lean())
            // Keys-nya adalah UserID
            const playerIds = Object.keys(world.playerData);
            
            for (const pid of playerIds) {
                const pData = world.playerData[pid];
                // Pastikan tokenId ada dan cocok (String vs String)
                if (pData.tokenId && String(pData.tokenId) === String(tokenId)) {
                    foundPlayer = pData;
                    break;
                }
            }
            if (foundPlayer) break;
        }

        if (!foundPlayer) {
            console.warn(`❌ Token ID ${tokenId} not found in DB.`);
            return res.json({
                name: `Unrevealed Kingdom #${tokenId}`,
                description: "This kingdom has not yet been established in the database.",
                image: "https://via.placeholder.com/500x500.png?text=Loading+Kingdom"
            });
        }

        console.log(`✅ Metadata Found for: ${foundPlayer.username}`);

        // --- FORMAT STANDAR OPENSEA ---
        const metadata = {
            name: `Kingdom of ${foundPlayer.username}`,
            description: `A powerful kingdom located at [${foundPlayer.castleX}, ${foundPlayer.castleY}].`,
            image: "https://i.imgur.com/XqQZ4pZ.png", 
            external_url: "https://cryptokingdoms.game",
            attributes: [
                { trait_type: "Power", value: foundPlayer.power },
                { trait_type: "Troops", value: (foundPlayer.troops.infantry + foundPlayer.troops.archer + foundPlayer.troops.cavalry) },
                { trait_type: "Resources", value: (foundPlayer.resources.gold + foundPlayer.resources.food) },
                { trait_type: "X Coordinate", value: foundPlayer.castleX },
                { trait_type: "Y Coordinate", value: foundPlayer.castleY },
                { trait_type: "Season", value: "Alpha 1" }
            ]
        };

        res.json(metadata);

    } catch (error) {
        console.error("Metadata Error:", error);
        res.status(500).json({ error: "Metadata Error" });
    }
};

module.exports = {
    getUserProfile,
    linkTokenId,
    getMetadata,
};