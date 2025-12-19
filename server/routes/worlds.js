const express = require('express');
const router = express.Router();
const { 
    getWorldsList, 
    getWorldMap, 
    requestSpawn,
    finalizeJoin,
    trainTroops, 
    regenerateWorldMap,
    getTileInfo,
    getProvinceDetails,
    conquerTile
} = require('../controllers/worldController');

router.get('/', getWorldsList);
router.post('/request-spawn', requestSpawn);
router.post('/finalize-join', finalizeJoin);
router.get('/:worldId/map', getWorldMap);
router.post('/train', trainTroops); 
router.post('/conquer', conquerTile);

// 6. Admin/Dev Utils
router.post('/:worldId/regenerate', regenerateWorldMap);
router.get('/:worldId/tile/:x/:y', getTileInfo);
router.get('/:worldId/province/:provinceId', getProvinceDetails);

module.exports = router;