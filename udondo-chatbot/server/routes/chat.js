// server/routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat へのリクエストをコントローラーに渡す
router.post('/', chatController.handleChat);

module.exports = router;