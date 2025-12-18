// server/models/World.js
const mongoose = require('mongoose');

const WorldSchema = new mongoose.Schema({
  worldId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['WAITING', 'ACTIVE', 'FULL', 'ENDED'], default: 'WAITING' },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  playerData: {
      type: Map,
      of: new mongoose.Schema({
          tokenId: { type: String, default: null }, 

          username: String,
          color: String,
          castleX: Number,
          castleY: Number,
          
          power: { type: Number, default: 0 }, 
          
          resources: {
              food: { type: Number, default: 1000 },
              wood: { type: Number, default: 1000 },
              stone: { type: Number, default: 500 },
              gold: { type: Number, default: 200 }
          },
          
          troops: {
              infantry: { type: Number, default: 100 },
              archer: { type: Number, default: 0 },
              cavalry: { type: Number, default: 0 },
              siege: { type: Number, default: 0 }
          },

          trainingQueue: [{
              troopType: String,
              amount: Number,
              startTime: Date,
              endTime: Date
          }],
          
          lastUpdated: { type: Date, default: Date.now }

      }, { _id: false })
  },

  maxPlayers: { type: Number, default: 32 },
  createdAt: { type: Date, default: Date.now },
  seasonEnd: { type: Date },
  
  mapGrid: [[Number]], 
  provinceMap: [[Number]], 
  ownershipMap: { type: [[String]], default: [] }, 
  mapSize: { type: Number, default: 200 },
  mapVersion: { type: String, default: 'voronoi-v1' },
});

WorldSchema.index({ worldId: 1 });
WorldSchema.index({ status: 1 });

module.exports = mongoose.model('World', WorldSchema);