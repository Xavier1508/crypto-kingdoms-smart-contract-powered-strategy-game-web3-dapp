const express = require('express');
const router = express.Router();
const { getUserProfile, linkTokenId, getMetadata } = require('../controllers/userController');

// GET Profile
router.get('/:userId/profile', getUserProfile);

// Endpoint untuk OpenSea membaca data
router.get('/metadata/:tokenId', getMetadata);

// Endpoint untuk Frontend melapor Token ID baru
router.post('/link-token', linkTokenId);

module.exports = router;