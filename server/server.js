require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose'); // Pastikan mongoose terimport

const { connectDB } = require('./config/db');
const World = require('./models/World');
const { Province, ProvinceManager } = require('./models/ProvinceManager');
const { generateRoKMap } = require('./utils/voronoiMapGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors({
    origin: [
        "http://localhost:5173", // Biar di laptop tetap jalan
        "https://crypto-kingdoms-the-on-chain-domini.vercel.app",
        "https://cryptokingdoms.xavierrenjiro.site"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    const allowedOrigins = [
        "http://localhost:5173", 
        "https://crypto-kingdoms-the-on-chain-domini.vercel.app",
        "https://cryptokingdoms.xavierrenjiro.site"
    ];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});

// --- SETUP SERVER & SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    // Opsi tambahan untuk stabilitas di serverless (long-polling)
    transports: ['polling', 'websocket'], 
    path: '/socket.io/'
});

app.set('io', io);

// --- LOGIKA SOCKET.IO ---
io.on('connection', (socket) => {
    console.log(`⚡ User Connected: ${socket.id}`);
    
    socket.on('join_world_room', (worldId) => {
        const roomName = `world_${String(worldId)}`;
        socket.join(roomName);
        console.log(`🔌 Socket ${socket.id} JOINED room: ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// --- DATABASE CONNECTION HANDLING (Vercel Optimized) ---
// Kita memastikan DB connect sebelum memproses request
let isConnected = false;
const connectToDatabase = async () => {
    if (isConnected) return;
    try {
        await connectDB();
        isConnected = true;
        console.log("✅ Database Connected (Cached)");
    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
    }
};

// Middleware untuk memastikan DB connect di setiap request Vercel
app.use(async (req, res, next) => {
    await connectToDatabase();
    next();
});

// --- GAME LOGIC FUNCTION (DIPISAH DARI INTERVAL) ---
// Fungsi ini akan dipanggil oleh CRON JOB atau Request Manual
const runGameTick = async () => {
    try {
        console.log("⏳ Running Game Tick...");
        
        // Optimasi: Hanya ambil field yang diperlukan
        const activeWorlds = await World.find({ status: 'ACTIVE' })
            .select('worldId playerData status');

        if (activeWorlds.length === 0) return "No Active Worlds";

        let updatesCount = 0;

        for (const world of activeWorlds) {
            if (!world.playerData) continue;

            let hasChanges = false;
            const now = new Date();

            // Mongoose Map Iteration
            if (world.playerData instanceof Map) {
                 for (const [userId, pData] of world.playerData.entries()) {
                    // 1. Produksi Resource
                    const baseRate = 10;
                    pData.resources.food += baseRate;
                    pData.resources.wood += baseRate;
                    pData.resources.stone += baseRate / 2;
                    pData.resources.gold += baseRate / 5;

                    // 2. Proses Queue Training
                    if (pData.trainingQueue && pData.trainingQueue.length > 0) {
                        const queueItem = pData.trainingQueue[0];
                        if (new Date(queueItem.endTime) <= now) {
                            pData.troops[queueItem.troopType] += queueItem.amount;
                            // Hapus item pertama
                            pData.trainingQueue.shift();
                            hasChanges = true;
                        }
                    }

                    // 3. Update Power
                    const troopPower = (pData.troops.infantry * 1) + 
                                     (pData.troops.archer * 1.5) + 
                                     (pData.troops.cavalry * 2) + 
                                     (pData.troops.siege * 2.5);
                    pData.power = Math.floor(troopPower);
                    hasChanges = true;
                }
            } else {
                // Fallback jika bukan Map (Object biasa)
                 for (const userId in world.playerData) {
                    const pData = world.playerData[userId];
                    const baseRate = 10;
                    pData.resources.food += baseRate;
                    pData.resources.wood += baseRate;
                    pData.resources.stone += baseRate / 2;
                    pData.resources.gold += baseRate / 5;
                    
                     if (pData.trainingQueue && pData.trainingQueue.length > 0) {
                        const queueItem = pData.trainingQueue[0];
                        if (new Date(queueItem.endTime) <= now) {
                            pData.troops[queueItem.troopType] += queueItem.amount;
                            pData.trainingQueue.shift();
                            hasChanges = true;
                        }
                    }
                    const troopPower = (pData.troops.infantry * 1) + (pData.troops.archer * 1.5) + (pData.troops.cavalry * 2) + (pData.troops.siege * 2.5);
                    pData.power = Math.floor(troopPower);
                    hasChanges = true;
                 }
            }

            if (hasChanges) {
                world.markModified('playerData');
                await world.save();
                updatesCount++;

                // Emit ke Socket (Mungkin tidak sampai jika pakai Vercel Serverless, tapi tetap kita pasang)
                io.to(`world_${world.worldId}`).emit('resource_update', {
                    worldId: world.worldId,
                    playerData: world.playerData
                });
            }
        }
        return `Tick Success. Updated ${updatesCount} worlds.`;
    } catch (err) {
        console.error("Game Loop Error:", err);
        throw err;
    }
};

// --- INITIALIZATION FUNCTION ---
const initializeGameWorld = async () => {
    try {
        const worldCount = await World.countDocuments();
        if (worldCount === 0) {
            console.log("GENESIS PROTOCOL: Generating Map (400x400)...");
            const mapData = generateRoKMap(400);

            const newWorld = new World({
                worldId: 1,
                name: "The Lost Kingdom (Season 1)",
                status: "ACTIVE",
                maxPlayers: 32,
                seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                mapGrid: mapData.grid,
                provinceMap: mapData.provinceMap || [],
                mapSize: 400,
                mapVersion: 'voronoi-v2',
                playerData: {},
                players: [],
                ownershipMap: Array(400).fill().map(() => Array(400).fill(null))
            });

            await newWorld.save();
            await ProvinceManager.initializeProvinces(1, mapData.provinces);
            console.log("✅ World #1 Created!");
        } else {
            console.log(`✅ Server Ready. ${worldCount} Worlds Detected.`);
        }
    } catch (error) {
        console.error("❌ Init Error:", error);
    }
};

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/worlds', require('./routes/worlds'));
app.use('/api/users', require('./routes/users'));

// Route Khusus untuk memicu Init World pertama kali
app.get('/api/init-world', async (req, res) => {
    await initializeGameWorld();
    res.send("World Initialization Check Complete");
});

// [PENTING] Route Khusus untuk Vercel Cron Job
// Vercel akan memanggil link ini setiap X detik/menit untuk menjalankan game loop
app.get('/api/cron/tick', async (req, res) => {
    // Opsional: Tambahkan proteksi secret key agar tidak sembarang orang hit
    // if (req.query.key !== process.env.CRON_SECRET) return res.status(401).send('Unauthorized');
    
    try {
        const result = await runGameTick();
        res.status(200).json({ status: 'ok', message: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Base Route
app.get('/', (req, res) => res.send('Kingdom Server Running on Vercel'));

// --- SERVER LISTENER LOGIC ---
// Jika di Local (Development), pakai server.listen
// Jika di Vercel (Production), export app
if (process.env.NODE_ENV !== 'production') {
    connectToDatabase().then(() => {
        initializeGameWorld();
        // Jalankan setInterval HANYA jika di local
        setInterval(runGameTick, 2000); 
        
        server.listen(PORT, () => {
            console.log(`🚀 Local Server running on http://localhost:${PORT}`);
        });
    });
}

// Export untuk Vercel
module.exports = app;