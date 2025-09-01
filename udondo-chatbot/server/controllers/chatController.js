// server/controllers/chatController.js

const { getChatResponse: getTestResponse } = require('../services/testApiService');
const { generateRagResponse } = require('../services/chatService');
const { saveConversation } = require('../services/databaseService');

async function handleChat(req, res) {
    try {
      // 【変更】messageとsessionIdをリクエストボディから取得
      const { message: userMessage, sessionId } = req.body;

      if (!userMessage) {
        return res.status(400).json({ error: 'メッセージが必要です' });
      }
      if (!sessionId) {
        return res.status(400).json({ error: 'セッションIDが必要です' });
      }
  
      let botResponse;
  
      if (process.env.API_SERVICE === 'gemini') {
        // 【変更】sessionIdを渡す（将来の拡張用）
        botResponse = await generateRagResponse(userMessage, sessionId);
      } else {
        // 【変更】sessionIdをテストサービスに渡す
        botResponse = await getTestResponse(userMessage, sessionId);
      }

      if (botResponse) {
        // 【変更】保存時にもsessionIdを渡す
        saveConversation(sessionId, userMessage, botResponse);
      }
      
      res.json({ reply: botResponse });
  
    } catch (error) {
      console.error('チャット処理中にエラー:', error);
      res.status(500).json({ error: 'サーバーでエラーが発生しました' });
    }
}

module.exports = { handleChat };