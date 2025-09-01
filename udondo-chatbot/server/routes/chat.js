// server/routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat へのリクエストをコントローラーに渡す
router.post('/', chatController.handleChat);

// 【新機能】GET /api/chat/faq へのリクエストで、よくある質問リストを返す
router.get('/faq', chatController.getFaqQuestions);

// 【新機能】POST /api/chat/faq へのリクエストで、FAQ回答を取得（API呼び出しなし）
router.post('/faq', chatController.handleFaqRequest);

module.exports = router;