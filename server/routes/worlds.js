// server/routes/worlds.js
const express = require('express');
const router = express.Router();

const { 
    getWorldsList, 
    getWorldMap, 
    getTileInfo, 
    getProvinceDetails 
} = require('../controllers/mapController');

const { 
    requestSpawn, 
    finalizeJoin 
} = require('../controllers/joinController');

const { 
    trainTroops, 
    conquerTile 
} = require('../controllers/gameplayController');

const { 
    createWorld, 
    regenerateWorldMap 
} = require('../controllers/adminController');

// --- PUBLIC ROUTES (Read Only) ---
router.get('/', getWorldsList);
router.get('/:worldId/map', getWorldMap);
router.get('/:worldId/tile/:x/:y', getTileInfo);
router.get('/:worldId/province/:provinceId', getProvinceDetails);

// --- PLAYER ACTIONS (Join, Play) ---
router.post('/request-spawn', requestSpawn);
router.post('/finalize-join', finalizeJoin);
router.post('/train', trainTroops);
router.post('/conquer', conquerTile);

// --- ADMIN ROUTES (Generator) ---
// trigger lewat api ini http://localhost:5000/api/worlds/create
// trigger lewat postman saja ini
// {
//     "name": "Kingdom of Java",
//     "season": "Season 1"
// }
router.post('/create', createWorld);
router.post('/:worldId/regenerate', regenerateWorldMap);

module.exports = router;