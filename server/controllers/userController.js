// server/controllers/userController.js
const User = require('../models/User');
const World = require('../models/World');

// GET User Profile & Active Worlds Data
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;

        // 1. Ambil Data User Dasar (Username, Email, Wallet)
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // 2. Cari World dimana user ini bermain
        // Kita cari world yang di array 'players' nya ada userId ini
        const activeWorlds = await World.find({ players: userId });

        // 3. Format Data untuk Frontend
        // Kita butuh resource & stats spesifik user ini dari setiap world
        const worldsData = activeWorlds.map(world => {
            // Ambil data spesifik player dari Map 'playerData'
            // Perlu .get() jika Mongoose Map, atau akses langsung jika object
            const playerData = world.playerData.get ? world.playerData.get(userId) : world.playerData[userId];

            return {
                worldId: world.worldId,
                worldName: world.name,
                status: world.status,
                // Data Gameplay User di World ini
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

module.exports = {
    getUserProfile
};