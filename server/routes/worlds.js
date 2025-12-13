// server/routes/worlds.js
const express = require('express');
const router = express.Router();
const { 
    getWorldsList, 
    getWorldMap, 
    regenerateWorldMap,
    joinWorld, 
    getTileInfo,
    getProvinceDetails // NEW
} = require('../controllers/worldController');

// 1. Ambil List Server (Lobby)
router.get('/', getWorldsList);

// 2. Join Server
router.post('/join', joinWorld);

// 3. Ambil Data Map
router.get('/:worldId/map', getWorldMap);

// 4. Force Regenerate Map (Admin/Dev)
router.post('/:worldId/regenerate', regenerateWorldMap);

// 5. Info Tile
router.get('/:worldId/tile/:x/:y', getTileInfo);

// 6. Province Details (NEW!)
router.get('/:worldId/province/:provinceId', getProvinceDetails);

module.exports = router;