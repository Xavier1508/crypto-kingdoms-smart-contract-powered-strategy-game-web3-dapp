// server/models/World.js
const mongoose = require('mongoose');

const WorldSchema = new mongoose.Schema({
  worldId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  
  // Status Server
  status: { 
    type: String, 
    enum: ['WAITING', 'ACTIVE', 'FULL', 'ENDED'], 
    default: 'WAITING' 
  },
  
  // Data Pemain
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // NEW: Simpan warna unik & koordinat castle per player
  playerData: {
      type: Map,
      of: new mongoose.Schema({
          color: String, // Hex Code
          castleX: Number,
          castleY: Number,
          username: String
      }, { _id: false })
  },

  maxPlayers: { type: Number, default: 32 },
  
  // Data Waktu
  createdAt: { type: Date, default: Date.now },
  seasonEnd: { type: Date },
  
  // MAP DATA
  mapGrid: [[Number]],  // Tile types (0-9)
  provinceMap: [[Number]], // Province ID
  
  // NEW: Peta Kepemilikan (Menyimpan User ID pemilik tile)
  // Format: ownershipMap[x][y] = "userId_string" atau null
  ownershipMap: { type: [[String]], default: [] }, 
  
  mapSize: { type: Number, default: 200 },
  
  // Map Generation Info
  mapVersion: { type: String, default: 'voronoi-v1' },
  generatedAt: { type: Date, default: Date.now },
});

// Index untuk performance
WorldSchema.index({ worldId: 1 });
WorldSchema.index({ status: 1 });

module.exports = mongoose.model('World', WorldSchema);