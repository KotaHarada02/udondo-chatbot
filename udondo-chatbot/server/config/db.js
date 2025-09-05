// server/config/db.js
const path = require('path');
const fs = require('fs');

// Render環境（DATABASE_URLがある場合）はPostgreSQL、それ以外はSQLiteを使う
if (process.env.DATABASE_URL) {
  // --- PostgreSQL用の設定 ---
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const createTable = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        chat_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await pool.query(query);
      console.log('PostgreSQLのテーブルが正常に準備できました。');
    } catch (err) {
      console.error('テーブル作成エラー:', err);
    }
  };
  createTable();
  module.exports = { db: pool, isPostgres: true };

} else {
  // --- SQLite用の設定 ---
  const sqlite3 = require('sqlite3').verbose();
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  
  const dbPath = path.join(dataDir, 'chatlog.db');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error('SQLite接続エラー:', err.message);
    
    console.log(`SQLiteに正常に接続しました。パス: ${dbPath}`);
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
  module.exports = { db, isPostgres: false };
}