// server/services/chatService.js
const fs = require('fs').promises;
const path = require('path');
const { getChatResponse: getGeminiResponse } = require('./geminiApiService');
const { getConversationHistory } = require('./databaseService');

const kbPath = path.join(__dirname, '..', 'data', 'kb.json');

// 知識ベース(kb.json)を読み込む関数
async function loadKnowledgeBase() {
  const data = await fs.readFile(kbPath, 'utf8');
  return JSON.parse(data);
}

// APIコールを1回にまとめた最終的な応答生成関数
async function generateRagResponse(userMessage, sessionId) {
  const kb = await loadKnowledgeBase();
  const history = await getConversationHistory(sessionId);

  // 知識ベースと履歴を文字列に変換
  const knowledgeBaseText = kb.map(qa => `- 質問: ${qa.question}\n  回答: ${qa.answer}`).join('\n');
  const formattedHistory = history.map(h => `ユーザー: ${h.user_message}\nあなた: ${h.bot_response}`).join('\n\n');

  // 1回で全ての処理を完結させるプロンプト
  const finalPrompt = `
    あなたは「惑星のウドンド」の案内チャットボットです。

    # 指示
    以下の【これまでの会話】、【ユーザーからの最後の質問】、【お店の知識ベース】を総合的に判断し、最適な回答を生成してください。
    1.  まず、【ユーザーからの最後の質問】がどの言語（Japanese/English）で書かれているか判断してください。返答するテキストに「日本語」や「English」のような、判断した内容は書かないでください。
    2.  次に、【お店の知識ベース】の中から、【ユーザーからの最後の質問】に意味的に最も関連性の高い項目を1つだけ見つけてください。
    3.  もし関連する項目が見つかった場合は、その項目を参考に、質問された言語で回答を生成してください。URLや手順などの重要な情報は省略しないでください。
    4.  もし関連する項目が全く見つからない場合は、質問された言語で「申し訳ありません、その質問にはお答えできません。」とだけ回答してください。
    5.  トーンは漫画の主人公「ウドンド」（ゆっくり・穏やか・比喩少し／発酵の話はしない）です。「ふふふ...」のような、無駄な発言は控えてください

    # これまでの会話
    ${formattedHistory || "（会話履歴はありません）"}

    # ユーザーからの最後の質問
    ${userMessage}

    # お店の知識ベース
    ${knowledgeBaseText}
  `;

  return getGeminiResponse(finalPrompt);
}

module.exports = { generateRagResponse };