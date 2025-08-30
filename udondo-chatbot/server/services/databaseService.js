const db = require('../config/db');

// 受け取ったメッセージと返信をデータベースに保存する関数
function saveConversation(userMessage, botResponse) {
  // SQL文を定義します
  const sql = `INSERT INTO conversations (user_message, bot_response) VALUES (?, ?)`;

  // SQL文を実行します
  db.run(sql, [userMessage, botResponse], (err) => {
    if (err) {
      console.error('会話の保存に失敗しました:', err.message);
    } else {
      console.log('会話が正常にデータベースに保存されました。');
    }
  });
}

module.exports = { saveConversation };