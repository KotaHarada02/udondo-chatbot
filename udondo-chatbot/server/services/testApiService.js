// server/services/testApiService.js
const { getConversationHistory } = require('./databaseService');

// 【変更】引数にsessionIdを追加
async function getChatResponse(message, sessionId) {
  try {
    // 【変更】現在のセッションの履歴のみを取得
    const history = await getConversationHistory(sessionId, 5);

    let logText = `【ログ (Session ID: ${sessionId})】\n`;
    if (history.length > 0) {
      logText += history.map(log => 
        `ID ${log.id}: User: "${log.user_message}" -> Bot: "${log.bot_response}"`
      ).join('\n');
    } else {
      logText += '（このセッションの履歴はまだありません）';
    }

    const responseText = `【テストAPIより】: 「${message}」というメッセージを受け取りました。\n${logText}`;
    
    return responseText;

  } catch (error) {
    console.error('テストAPIの処理中にエラーが発生しました:', error);
    return 'テスト用APIの応答に失敗しました。';
  }
}

module.exports = { getChatResponse };