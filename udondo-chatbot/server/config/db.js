// server/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbName = process.env.API_SERVICE === 'test' 
  ? 'chatlog_test.db' 
  : 'chatlog.db';

const dbPath = path.join(__dirname, '..', 'data', dbName);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log(`データベース (${dbName}) に正常に接続しました。`);
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL, -- この行を追加
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('テーブル作成エラー:', err.message);
      }
    });

    // 【新機能】feedbackテーブル作成
    db.run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        feedback_type TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id)
      )
    `, (err) => {
      if (err) {
        console.error('フィードバックテーブル作成エラー:', err.message);
      }
    });
  }
});

module.exports = db;