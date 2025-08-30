const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベースファイルのパスを指定 (server/data/chatlog.db)
const dbPath = path.join(__dirname, '..', 'data', 'chatlog.db');

// データベースに接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log('データベースに正常に接続しました。');
    // データベース接続後にテーブルを作成
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('テーブル作成エラー:', err.message);
      }
    });
  }
});

module.exports = db;