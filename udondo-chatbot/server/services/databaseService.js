// server/services/databaseService.js
const db = require('../config/db');

// 【変更】引数にsessionIdを追加
function saveConversation(sessionId, userMessage, botResponse) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO conversations (session_id, user_message, bot_response) VALUES (?, ?, ?)`;
    
    db.run(sql, [sessionId, userMessage, botResponse], function(err) {
      if (err) {
        console.error('会話の保存に失敗しました:', err.message);
        reject(err);
      } else {
        console.log(`会話が正常にデータベースに保存されました。ID: ${this.lastID}`);
        resolve(this.lastID); // 保存した行のIDを返す
      }
    });
  });
}

// 【変更】引数にsessionIdを追加し、そのセッションの履歴のみを取得
function getConversationHistory(sessionId, limit = 5) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, user_message, bot_response 
      FROM conversations 
      WHERE session_id = ?  -- このWHERE句を追加
      ORDER BY timestamp DESC 
      LIMIT ?`;
      
    db.all(sql, [sessionId, limit], (err, rows) => {
      if (err) {
        console.error('会話履歴の取得に失敗しました:', err.message);
        reject(err);
      } else {
        resolve(rows.reverse());
      }
    });
  });
}

// 【新機能】フィードバックを保存する関数
function saveFeedback(conversationId, feedbackType) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO feedback (conversation_id, feedback_type) VALUES (?, ?)`;
    db.run(sql, [conversationId, feedbackType], function(err) {
      if (err) {
        console.error('フィードバックの保存に失敗しました:', err.message);
        reject(err);
      } else {
        console.log('フィードバックが正常に保存されました。');
        resolve(this.lastID);
      }
    });
  });
}

module.exports = { saveConversation, getConversationHistory, saveFeedback };