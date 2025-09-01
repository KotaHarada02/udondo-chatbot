// server/controllers/feedbackController.js
const { saveFeedback } = require('../services/databaseService');

async function handleFeedback(req, res) {
    try {
        const { conversationId, feedbackType } = req.body;
        if (!conversationId || !feedbackType) {
            return res.status(400).json({ error: '必要な情報が不足しています' });
        }

        await saveFeedback(conversationId, feedbackType);
        res.status(200).json({ message: 'フィードバックを受け付けました' });
    } catch (error) {
        console.error('フィードバック処理中にエラー:', error);
        res.status(500).json({ error: 'サーバーでエラーが発生しました' });
    }
}

module.exports = { handleFeedback };
