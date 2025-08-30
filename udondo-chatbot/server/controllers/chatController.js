// server/controllers/chatController.js

import { getChatResponse as getTestResponse } from '../services/testApiService.js';
// chatServiceから新しい関数をインポート
import { generateRagResponse } from '../services/chatService.js';

// .envの設定に応じて、使用するサービスを動的に切り替える
// geminiモードの時は、新しいchatServiceを使うように変更
const apiService = process.env.API_SERVICE === 'gemini'
  ? generateRagResponse
  : getTestResponse;

export async function handleChat(req, res) {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'メッセージが必要です' });
    }

    const botResponse = await apiService(userMessage);

    res.json({ reply: botResponse });

  } catch (error) {
    console.error('チャット処理中にエラー:', error);
    res.status(500).json({ error: 'サーバーでエラーが発生しました' });
  }
}