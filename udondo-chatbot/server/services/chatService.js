// server/services/chatService.js
const fs = require('fs').promises;
const path = require('path');
const { getChatResponse: getGeminiResponse } = require('./geminiApiService');
// DBサービスから履歴取得関数をインポート
const { getConversationHistory } = require('./databaseService');

const kbPath = path.join(__dirname, '..', 'data', 'kb.json');

async function loadKnowledgeBase() {
  const data = await fs.readFile(kbPath, 'utf8');
  return JSON.parse(data);
}

async function findRelevantQa(userMessage, kb) {
  const questions = kb.map(qa => qa.question);
  const prompt = `
    以下の【ユーザーの質問】に意味的に最も関連性が高い【お店のFAQリスト】の項目を一つだけ選び、その文章を完全にそのままの形で返してください。余計なテキストは含めないでください。
    【ユーザーの質問】: ${userMessage}
    【お店のFAQリスト】:\n${questions.map(q => `- ${q}`).join('\n')}
  `;
  const bestQuestion = await getGeminiResponse(prompt);
  const foundQa = kb.find(qa => bestQuestion.trim().includes(qa.question));
  return foundQa ? foundQa.answer : null;
}

// 【変更点】引数を sessionId に統一
async function generateRagResponse(userMessage, sessionId) {
  const kb = await loadKnowledgeBase();
  
  // 会話履歴を取得
  const history = await getConversationHistory(sessionId);
  const formattedHistory = history.map(h => `ユーザー: ${h.user_message}\nあなた: ${h.bot_response}`).join('\n\n');

  const context = await findRelevantQa(userMessage, kb);

  const langDetectionPrompt = `以下のテキストがどの言語か、"Japanese"か"English"で答えてください: "${userMessage}"`;
  let lang = await getGeminiResponse(langDetectionPrompt);
  lang = lang.trim().toLowerCase().includes('japanese') ? 'ja' : 'en';

  const personaPrompts = {
    ja: `あなたは「惑星のウドンド」の案内チャットボットです。`,
    en: `You are the guidance chatbot for "Wakusei no Udondo."`
  };
  const personaPrompt = personaPrompts[lang];

  let finalPrompt;

  if (context) {
    const instructions = {
      ja: `以下の【これまでの会話】と【お店の情報】を参考に、お客さんの最後の【質問】に簡潔に答えてください。情報は要約しても構いませんが、URLや作り方のような情報は省略せず、伝えてください。また、余計な言葉や会話的な表現は加えないでください。`,
      en: `Based on the [Previous Conversation] and [Store Information], answer the customer's final [Question] concisely. Do not add extra words or conversational expressions.`
    };
    finalPrompt = `
      ${personaPrompt}
      ${instructions[lang]}

      【これまでの会話】
      ${formattedHistory}

      【お店の情報】
      ${context}

      【質問】
      ${userMessage}
    `;
  } else {
    // コンテキストが見つからない場合は、会話履歴を考慮しないシンプルな応答
    const instructions = {
      ja: `お客さんの【質問】に対する答えが分かりません。「申し訳ありません、その質問にはお答えできません。」とだけ返答してください。`,
      en: `You do not know the answer to the customer's [Question]. Reply only with "I'm sorry, I cannot answer that question."`
    };
    finalPrompt = `
      ${personaPrompt}
      ${instructions[lang]}

      【これまでの会話】
      ${formattedHistory}

      【質問】
      ${userMessage}
    `;
  }

  return getGeminiResponse(finalPrompt);
}

module.exports = { generateRagResponse };