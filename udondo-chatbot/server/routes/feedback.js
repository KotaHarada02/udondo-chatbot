// server/routes/feedback.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/', feedbackController.handleFeedback);

module.exports = router;
