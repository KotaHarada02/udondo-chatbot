// server/services/geminiApiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// .envファイルからAPIキーを読み込む
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getChatResponse(message) {
  if (!process.env.GEMINI_API_KEY) {
    return 'Gemini APIキーが設定されていません。';
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Gemini APIの呼び出し中にエラーが発生しました:', error);
    return 'AIの応答に失敗しました。';
  }
}

module.exports = { getChatResponse };