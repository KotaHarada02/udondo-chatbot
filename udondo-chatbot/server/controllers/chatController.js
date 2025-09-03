// server/controllers/chatController.js

const { getChatResponse: getTestResponse } = require('../services/testApiService');
const { generateRagResponse } = require('../services/chatService');
const { saveConversation } = require('../services/databaseService');
const fs = require('fs').promises; // fs.promisesをインポート
const path = require('path'); // pathをインポート

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
        // 【変更】保存時にもsessionIdを渡し、conversationIdを取得
        const conversationId = await saveConversation(sessionId, userMessage, botResponse);
        res.json({ reply: botResponse, conversationId: conversationId });
      } else {
        res.json({ reply: '応答がありませんでした。' });
      }
  
    } catch (error) {
      console.error('チャット処理中にエラー:', error);
      res.status(500).json({ error: 'サーバーでエラーが発生しました' });
    }
}

// 【新機能】kb.jsonから代表的な質問を読み込んで返す関数
async function getFaqQuestions(req, res) {
  try {
    const kbPath = path.join(__dirname, '..', 'data', 'kb.json');
    const data = await fs.readFile(kbPath, 'utf8');
    const kb = JSON.parse(data);

    // ボタンとして表示したい代表的な質問を抽出
    const representativeQuestions = [
      "注文方法を教えてください",
      "商品はどこにありますか？かけうどんはどれですか？",
      "おすすめのメニューはなんですか？",
      "お店のルールや注意事項はありますか？"
    ];

    // kb.jsonから質問文と回答を含めて返す
    const faqData = kb
      .filter(item => representativeQuestions.includes(item.question))
      .map(item => ({
        question: item.question,
        answer: item.answer
      }));

    res.json({ faqData });
  } catch (error) {
    console.error('FAQの取得中にエラー:', error);
    res.status(500).json({ error: 'サーバーでエラーが発生しました' });
  }
}

// 【新機能】FAQ回答を取得してDBに保存する関数
async function handleFaqRequest(req, res) {
  try {
    const { question, sessionId } = req.body;
    if (!question || !sessionId) {
      return res.status(400).json({ error: '質問とセッションIDが必要です' });
    }

    // kb.jsonから回答を取得
    const kbPath = path.join(__dirname, '..', 'data', 'kb.json');
    const data = await fs.readFile(kbPath, 'utf8');
    const kb = JSON.parse(data);

    const faqItem = kb.find(item => item.question === question);
    if (!faqItem) {
      return res.status(404).json({ error: '質問に対する回答が見つかりません' });
    }

    // DBに保存（API呼び出しなし）
    const conversationId = await saveConversation(sessionId, question, faqItem.answer);

    res.json({ 
      reply: faqItem.answer, 
      conversationId: conversationId,
      source: 'kb' // kb.jsonからの回答であることを示す
    });

  } catch (error) {
    console.error('FAQ回答処理中にエラー:', error);
    res.status(500).json({ error: 'サーバーでエラーが発生しました' });
  }
}

module.exports = { handleChat, getFaqQuestions, handleFaqRequest };