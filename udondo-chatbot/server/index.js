require('dotenv').config(); // .envファイルを最初に読み込む
const express = require('express');
const path = require('path');
const chatRoutes = require('./routes/chat');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 8787;

// JSONリクエストボディを解析するためのミドルウェア
app.use(express.json());

// 静的ファイル（HTML, CSS, JS）を配信
app.use(express.static(path.join(__dirname, '../public')));

// APIルートを設定
app.use('/api/chat', chatRoutes);
app.use('/api/feedback', feedbackRoutes);

app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});