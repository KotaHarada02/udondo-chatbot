// server/controllers/chatController.js

const { getChatResponse: getTestResponse } = require('../services/testApiService');
// chatServiceから新しい関数をインポート
const { generateRagResponse } = require('../services/chatService');
const { saveConversation } = require('../services/databaseService');
// .envの設定に応じて、使用するサービスを動的に切り替える
// geminiモードの時は、新しいchatServiceを使うように変更
const apiService = process.env.API_SERVICE === 'gemini'
  ? generateRagResponse
  : getTestResponse;

async function handleChat(req, res) {
    try {
      const userMessage = req.body.message;
      if (!userMessage) {
        return res.status(400).json({ error: 'メッセージが必要です' });
      }
  
      const botResponse = await apiService(userMessage);
  
      if (process.env.API_SERVICE === 'gemini') {
        saveConversation(userMessage, botResponse);
      }
      
      res.json({ reply: botResponse });
  
    } catch (error) {
      console.error('チャット処理中にエラー:', error);
      res.status(500).json({ error: 'サーバーでエラーが発生しました' });
    }
  }
module.exports = { handleChat };