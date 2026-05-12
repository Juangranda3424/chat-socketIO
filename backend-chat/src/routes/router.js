const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta pública
router.post('/register', userController.signup);

// Ruta middleware
router.get('/me', authMiddleware, userController.getProfile);

module.exports = router;