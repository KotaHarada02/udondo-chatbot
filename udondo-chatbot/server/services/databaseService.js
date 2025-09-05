// server/services/databaseService.js
const { db, isPostgres } = require('../config/db');

async function saveConversation(chatId, userMessage, botResponse) {
  const sql = isPostgres 
    ? `INSERT INTO conversations (chat_id, user_message, bot_response) VALUES ($1, $2, $3)`
    : `INSERT INTO conversations (chat_id, user_message, bot_response) VALUES (?, ?, ?)`;
  
  try {
    if (isPostgres) {
      await db.query(sql, [chatId, userMessage, botResponse]);
    } else {
      db.run(sql, [chatId, userMessage, botResponse]);
    }
    console.log('会話が正常にデータベースに保存されました。');
  } catch (err) {
    console.error('会話の保存に失敗しました:', err.message);
  }
}

async function getConversationHistory(chatId) {
  const sql = isPostgres
    ? `SELECT user_message, bot_response FROM conversations WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT 2`
    : `SELECT user_message, bot_response FROM conversations WHERE chat_id = ? ORDER BY timestamp DESC LIMIT 2`;
  
  try {
    if (isPostgres) {
      const { rows } = await db.query(sql, [chatId]);
      return rows.reverse();
    } else {
      return new Promise((resolve, reject) => {
        db.all(sql, [chatId], (err, rows) => {
          if (err) reject(err);
          resolve(rows.reverse());
        });
      });
    }
  } catch (err) {
    console.error('会話履歴の取得に失敗しました:', err.message);
    return [];
  }
}

module.exports = { saveConversation, getConversationHistory };