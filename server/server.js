// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // Import module HTTP bawaan Node
const { Server } = require('socket.io'); // Import Socket.io

const { connectDB } = require('./config/db');
const World = require('./models/World');
const { Province, ProvinceManager } = require('./models/ProvinceManager');
const { generateRoKMap } = require('./utils/voronoiMapGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- SETUP SOCKET.IO ---
const server = http.createServer(app); // Bungkus Express dengan HTTP Server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/worlds', require('./routes/worlds'));
app.use('/api/users', require('./routes/users'));

// Base Route
app.get('/', (req, res) => res.send('Kingdom Server Running (Socket.io Active)'));

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

const GAME_TICK_RATE = 2000; // Cek setiap 2 detik biar responsif

setInterval(async () => {
  try {
    const activeWorlds = await World.find({ status: 'ACTIVE' });

    for (const world of activeWorlds) {
      if (!world.playerData) continue;

      let updates = {};
      let hasChanges = false;
      const now = new Date();

      for (const [userId, pData] of world.playerData) {
        
        // A. PRODUKSI RESOURCE (Logika lama Anda)
        const baseRate = 5; 
        pData.resources.food += baseRate;
        pData.resources.wood += baseRate;
        pData.resources.stone += baseRate / 2;
        pData.resources.gold += baseRate / 5;

        // B. PROSES TRAINING QUEUE [BARU]
        if (pData.trainingQueue && pData.trainingQueue.length > 0) {
            // Filter queue yang SUDAH SELESAI
            const finishedQueue = pData.trainingQueue.filter(q => new Date(q.endTime) <= now);
            
            // Filter queue yang MASIH BERJALAN
            const activeQueue = pData.trainingQueue.filter(q => new Date(q.endTime) > now);

            if (finishedQueue.length > 0) {
                // Pindahkan pasukan yang jadi
                finishedQueue.forEach(item => {
                    pData.troops[item.troopType] += item.amount;
                    console.log(`✅ Training Complete for ${userId}: ${item.amount} ${item.troopType}`);
                });

                // Update sisa antrian
                pData.trainingQueue = activeQueue;
                hasChanges = true; // Trigger save
            }
        }

        // C. HITUNG POWER TOTAL
        const troopPower = (pData.troops.infantry * 1) + 
                           (pData.troops.archer * 1.5) + 
                           (pData.troops.cavalry * 2) + 
                           (pData.troops.siege * 2.5);
        pData.power = Math.floor(troopPower);
        
        // Tandai ada perubahan resource (selalu true karena produksi jalan)
        hasChanges = true; 
      }

      if (hasChanges) {
        world.markModified('playerData');
        await world.save();

        io.to(`world_${world.worldId}`).emit('resource_update', {
            worldId: world.worldId,
            playerData: world.playerData
        });
      }
    }
  } catch (err) {
    console.error("Game Loop Error:", err);
  }
}, GAME_TICK_RATE);

connectDB().then(async () => {
  await initializeGameWorld();
  
  server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Socket.io Ready`);
  });
});