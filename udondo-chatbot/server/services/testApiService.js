// node-fetchをインポート
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getChatResponse(message) {
  try {
    // JSONPlaceholderのAPIを叩いて、ダミーの応答を取得
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();

    // 実際はAPIの応答を整形するが、今回はテストなので固定の応答を返す
    return `【テストAPIより】: 「${message}」というメッセージを受け取りました。`;

  } catch (error) {
    console.error('テストAPIの呼び出し中にエラーが発生しました:', error);
    return 'テスト用APIの応答に失敗しました。';
  }
}

module.exports = { getChatResponse };