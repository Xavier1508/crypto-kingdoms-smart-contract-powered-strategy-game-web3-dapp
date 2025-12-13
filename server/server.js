// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const World = require('./models/World');
const { Province, ProvinceManager } = require('./models/ProvinceManager');
const { generateRoKMap } = require('./utils/voronoiMapGenerator'); // VORONOI!

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/worlds', require('./routes/worlds')); 

// Base Route
app.get('/', (req, res) => res.send('🏰 Kingdom Server Running (Voronoi Edition)'));

/**
 * LOGIKA INISIALISASI WORLD (VORONOI)
 */
const initializeGameWorld = async () => {
  try {
    const worldCount = await World.countDocuments();

    if (worldCount === 0) {
      console.log("🌍 Tidak ada dunia ditemukan. Memulai Protokol GENESIS...");
      console.log("⚙️  Generating ORGANIC MAP (Voronoi + Domain Warping)...");
      
      // Generate Map dengan Voronoi
      const mapData = generateRoKMap(200);
      
      console.log(`✅ Map generated: ${mapData.provinces.length} provinces`);
      console.log(`   - Outer: ${mapData.provinces.filter(p => p.layer === 'outer').length}`);
      console.log(`   - Mid: ${mapData.provinces.filter(p => p.layer === 'mid').length}`);
      console.log(`   - Inner: ${mapData.provinces.filter(p => p.layer === 'inner').length}`);
      console.log(`   - Center: ${mapData.provinces.filter(p => p.layer === 'center').length}`);

      // Create World
      const newWorld = new World({
        worldId: 1,
        name: "The Lost Kingdom (Season 1)",
        status: "ACTIVE",
        maxPlayers: 32,
        seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        mapGrid: mapData.grid,
        provinceMap: mapData.provinceMap || [], // Store province assignments
        mapSize: 200,
        mapVersion: 'voronoi-v1',
        generatedAt: new Date()
      });

      await newWorld.save();
      console.log("✅ World #1 created in database");
      
      // Initialize Province System
      console.log("⚙️  Initializing province system...");
      await ProvinceManager.initializeProvinces(1, mapData.provinces);
      
      // TODO: Calculate adjacency (needs provinceMap from generator)
      // For now, we'll calculate it lazily on first map request
      
      console.log("✅ SUKSES: World #1 (Voronoi Organic Style) Siap Dimainkan!");
      console.log("📍 Map Layout:");
      console.log("   🟢 Layer 1 (Outer): Starting provinces - Available Day 0");
      console.log("   🟩 Layer 2 (Mid): Resource provinces - Unlocks Day 5");
      console.log("   🌲 Layer 3 (Inner): Elite provinces - Unlocks Day 10");
      console.log("   👑 Center: Kingdom Temple - Unlocks Day 15");
      
    } else {
      console.log(`✅ Server Siap. ${worldCount} Dunia terdeteksi di Database.`);
      
      // Auto-unlock provinces berdasarkan hari
      for (let i = 1; i <= worldCount; i++) {
        const world = await World.findOne({ worldId: i });
        if (world && world.status === 'ACTIVE') {
          const daysPassed = Math.floor(
            (Date.now() - world.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          await ProvinceManager.unlockByDay(i, daysPassed);
          console.log(`🔓 World ${i}: Day ${daysPassed} - Checked province unlocks`);
        }
      }
    }

  } catch (error) {
    console.error("❌ Gagal Inisialisasi World:", error);
    console.error(error.stack);
  }
};

// Start Server
connectDB().then(async () => {
  
  // UNCOMMENT UNTUK RESET DATABASE (DEV ONLY!)
  // await World.deleteMany({});
  // await Province.deleteMany({});
  // console.log("⚠️  Database World & Province di-reset!");

  await initializeGameWorld();
  
  app.listen(PORT, () => {
    console.log(`🚀 Kingdom Server berjalan di http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   GET  /api/worlds - List all worlds`);
    console.log(`   GET  /api/worlds/:id/map - Get map data`);
    console.log(`   GET  /api/worlds/:id/province/:provinceId - Province details`);
    console.log(`   POST /api/worlds/:id/regenerate - Regenerate map`);
  });
});