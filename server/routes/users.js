// server/routes/users.js
const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');

// GET /api/users/:userId/profile
router.get('/:userId/profile', getUserProfile);

module.exports = router;