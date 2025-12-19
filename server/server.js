// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { connectDB } = require('./config/db');
const World = require('./models/World');
const { ProvinceManager } = require('./models/ProvinceManager');
const { generateRoKMap } = require('./utils/voronoiMapGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://crypto-kingdoms-the-on-chain-domini.vercel.app",
        "https://cryptokingdoms.xavierrenjiro.site"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log(`📡 [${req.method}] ${req.url}`);
        console.log("📦 Headers Content-Type:", req.headers['content-type']);
        console.log("📦 Body Received:", req.body);
    }
    next();
});

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

// --- DATABASE CONNECTION ---
let isConnected = false;
const connectToDatabase = async () => {
    if (isConnected) return;
    try {
        await connectDB();
        isConnected = true;
        console.log("Database Connected (Cached)");
    } catch (error) {
        console.error("Database Connection Failed:", error);
    }
};

app.use(async (req, res, next) => {
    await connectToDatabase();
    next();
});

// --- GAME LOGIC FUNCTION ---
const runGameTick = async () => {
    try {
        const activeWorlds = await World.find({ status: 'ACTIVE' }).select('worldId playerData status');
        if (activeWorlds.length === 0) return "No Active Worlds";

        let updatesCount = 0;

        for (const world of activeWorlds) {
            if (!world.playerData) continue;
            let hasChanges = false;
            const now = new Date();

            const processUserData = (pData) => {
                let changed = false;
                // 1. Resource
                const baseRate = 10;
                pData.resources.food += baseRate;
                pData.resources.wood += baseRate;
                pData.resources.stone += baseRate / 2;
                pData.resources.gold += baseRate / 5;

                // 2. Training Queue
                if (pData.trainingQueue && pData.trainingQueue.length > 0) {
                    const queueItem = pData.trainingQueue[0];
                    if (new Date(queueItem.endTime) <= now) {
                        pData.troops[queueItem.troopType] += queueItem.amount;
                        pData.trainingQueue.shift();
                        changed = true;
                    }
                }

                // 3. Power Update
                const troopPower = (pData.troops.infantry * 1) + (pData.troops.archer * 1.5) + (pData.troops.cavalry * 2) + (pData.troops.siege * 2.5);
                pData.power = Math.floor(troopPower);
                
                // Return true if ALWAYS updating resources (which we are)
                return true; 
            };

            if (world.playerData instanceof Map) {
                for (const [userId, pData] of world.playerData.entries()) {
                    if(processUserData(pData)) hasChanges = true;
                }
            } else {
                for (const userId in world.playerData) {
                    if(processUserData(world.playerData[userId])) hasChanges = true;
                }
            }

            if (hasChanges) {
                world.markModified('playerData');
                await world.save();
                updatesCount++;
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

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/worlds', require('./routes/worlds'));
app.use('/api/users', require('./routes/users'));

app.get('/api/init-world', async (req, res) => {
    await initializeGameWorld();
    res.send("World Initialization Check Complete");
});

app.get('/api/cron/tick', async (req, res) => {
    try {
        const result = await runGameTick();
        res.status(200).json({ status: 'ok', message: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => res.send('Kingdom Server Running on Vercel'));

// --- INITIALIZATION ---
const initializeGameWorld = async () => {
    try {
        const worldCount = await World.countDocuments();
        if (worldCount === 0) {
            console.log("GENESIS PROTOCOL: Generating Map...");
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

if (process.env.NODE_ENV !== 'production') {
    connectToDatabase().then(() => {
        initializeGameWorld();
        setInterval(runGameTick, 2000); 
        server.listen(PORT, () => {
            console.log(`Local Server running on http://localhost:${PORT}`);
        });
    });
}

module.exports = app;