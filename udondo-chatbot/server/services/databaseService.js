// server/services/databaseService.js
const { db, isPostgres } = require('../config/db');

async function saveConversation(chatId, userMessage, botResponse) {
  const sql = isPostgres 
    ? `INSERT INTO conversations (chat_id, user_message, bot_response) VALUES ($1, $2, $3) RETURNING id`
    : `INSERT INTO conversations (chat_id, user_message, bot_response) VALUES (?, ?, ?)`;
  
  try {
    if (isPostgres) {
      const result = await db.query(sql, [chatId, userMessage, botResponse]);
      console.log('会話が正常にデータベースに保存されました。');
      return result.rows[0].id;
    } else {
      return new Promise((resolve, reject) => {
        db.run(sql, [chatId, userMessage, botResponse], function(err) {
          if (err) {
            console.error('会話の保存に失敗しました:', err.message);
            reject(err);
          } else {
            console.log('会話が正常にデータベースに保存されました。');
            resolve(this.lastID);
          }
        });
      });
    }
  } catch (err) {
    console.error('会話の保存に失敗しました:', err.message);
    throw err;
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

async function saveFeedback(conversationId, feedbackType) {
  const sql = isPostgres 
    ? `UPDATE conversations SET feedback_type = $1, feedback_timestamp = CURRENT_TIMESTAMP WHERE id = $2`
    : `UPDATE conversations SET feedback_type = ?, feedback_timestamp = CURRENT_TIMESTAMP WHERE id = ?`;
  
  try {
    if (isPostgres) {
      await db.query(sql, [feedbackType, conversationId]);
    } else {
      return new Promise((resolve, reject) => {
        db.run(sql, [feedbackType, conversationId], function(err) {
          if (err) {
            console.error('フィードバックの保存に失敗しました:', err.message);
            reject(err);
          } else {
            console.log('フィードバックが正常にデータベースに保存されました。');
            resolve(this.changes);
          }
        });
      });
    }
    console.log('フィードバックが正常にデータベースに保存されました。');
  } catch (err) {
    console.error('フィードバックの保存に失敗しました:', err.message);
    throw err;
  }
}

module.exports = { saveConversation, getConversationHistory, saveFeedback };