// server/services/chatService.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Gemini APIを呼び出すための関数をインポート
import { getChatResponse as getGeminiResponse } from './geminiApiService.js';

// __dirname をESM環境で使えるようにするための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// kb.jsonのパスを解決
const kbPath = path.join(__dirname, '..', 'data', 'kb.json');

// 知識ベース(kb.json)を読み込む関数
async function loadKnowledgeBase() {
  const data = await fs.readFile(kbPath, 'utf8');
  return JSON.parse(data);
}

// ユーザーの質問から関連情報を探すシンプルな関数
function findRelevantInfo(message, kb) {
  for (const key in kb) {
    if (kb[key].keywords) {
      for (const keyword of kb[key].keywords) {
        if (message.includes(keyword)) {
          return kb[key].info;
        }
      }
    }
  }
  return null; // 関連情報が見つからなかった
}

// RAGを使って応答を生成するメイン関数
async function generateRagResponse(userMessage) {
  const kb = await loadKnowledgeBase();
  const context = findRelevantInfo(userMessage, kb);

  // あなたは「惑星のウドンド」の案内人「ウドンド」です。
  // ゆっくり、穏やかな口調で、少し比喩を交えながら話します。
  // 以下の情報を元に、お客さんの質問に答えてください。
  // もし情報にないことを聞かれたら、正直に「その問いには、まだ星の導きがないようです」などと答えてください。
  const personaPrompt = `
    あなたは「惑星のウドンド」の案内人「ウドンド」です。
    ゆっくり、穏やかな口調（例：「…ですね。」「…ですよ。」）で、少し宇宙や旅にまつわる比喩を交えながら話します。
  `;

  let finalPrompt;

  if (context) {
    // 関連情報が見つかった場合
    finalPrompt = `
      ${personaPrompt}
      以下の【お店の情報】を忠実に使って、お客さんの【質問】に答えてください。

      【お店の情報】
      ${context}

      【質問】
      ${userMessage}
    `;
  } else {
    // 関連情報が見つからなかった場合
    finalPrompt = `
      ${personaPrompt}
      お客さんが【質問】をしていますが、あなたはその答えを知りません。
      正直に、あなたの言葉で「分からない」ということを伝えてください。
      例えば、「その問いには、まだ星の導きがないようです…」のように答えてください。

      【質問】
      ${userMessage}
    `;
  }

  // 最終的なプロンプトをGeminiに渡して回答を生成
  return getGeminiResponse(finalPrompt);
}

export { generateRagResponse };