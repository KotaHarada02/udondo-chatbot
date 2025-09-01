// server/services/chatService.js
const fs = require('fs').promises;
const path = require('path');
const { getChatResponse: getGeminiResponse } = require('./geminiApiService');

const kbPath = path.join(__dirname, '..', 'data', 'kb.json');

// 知識ベース(kb.json)を読み込む関数
async function loadKnowledgeBase() {
  const data = await fs.readFile(kbPath, 'utf8');
  return JSON.parse(data);
}

// LLMが意味的に最も近いQ&Aを探す関数
async function findRelevantQa(userMessage, kb) {
  const questions = kb.map(qa => qa.question);

  const prompt = `
    以下の【ユーザーの質問】に意味的に最も関連性が高い【お店のFAQリスト】の項目を一つだけ選び、その文章を完全にそのままの形で返してください。余計なテキストは含めないでください。

    【ユーザーの質問】
    ${userMessage}

    【お店のFAQリスト】
${questions.map(q => `- ${q}`).join('\n')}
  `;

  const bestQuestion = await getGeminiResponse(prompt);
  const foundQa = kb.find(qa => bestQuestion.trim().includes(qa.question));
  
  return foundQa ? foundQa.answer : null;
}

// RAGを使って応答を生成するメイン関数
async function generateRagResponse(userMessage) {
  const kb = await loadKnowledgeBase();
  const context = await findRelevantQa(userMessage, kb);

  // 言語判定
  const langDetectionPrompt = `
    以下のテキストがどの言語で書かれているか、"Japanese" または "English" のどちらか一言で答えてください。
    Text: "${userMessage}"
  `;
  let lang = await getGeminiResponse(langDetectionPrompt);
  lang = lang.trim().toLowerCase().includes('japanese') ? 'ja' : 'en';

  // ここでペルソナを支持できる。今は端的に答えるようにしている
  const personaPrompts = {
    ja: `あなたは「惑星のウドンド」の案内チャットボットです。`,
    en: `You are the guidance chatbot for "Wakusei no Udondo."`
  };
  const personaPrompt = personaPrompts[lang];

  let finalPrompt;

  if (context) {
    // 【変更点】回答の仕方をより具体的に指示。うどんどらしいoutputをさせたいならここで性格を指定する
    const instructions = {
      ja: `以下の【お店の情報】を使い、お客さんの【質問】に簡潔に答えてください。情報は要約しても構いませんが、余計な言葉や会話的な表現は加えないでください。`,
      en: `Use the [Store Information] below to answer the customer's [Question] concisely. You may summarize the information, but do not add any extra words or conversational expressions.`
    };
    finalPrompt = `
      ${personaPrompt}
      ${instructions[lang]}

      【Store Information / お店の情報】
      ${context}

      【Question / 質問】
      ${userMessage}
    `;
  } else {
    // 【変更点】不明時の回答もシンプルに
    const instructions = {
      ja: `お客さんの【質問】に対する答えが分かりません。「申し訳ありません、その質問にはお答えできません。」とだけ返答してください。`,
      en: `You do not know the answer to the customer's [Question]. Reply only with "I'm sorry, I cannot answer that question."`
    };
    finalPrompt = `
      ${personaPrompt}
      ${instructions[lang]}

      【Question / 質問】
      ${userMessage}
    `;
  }

  return getGeminiResponse(finalPrompt);
}

module.exports = { generateRagResponse };