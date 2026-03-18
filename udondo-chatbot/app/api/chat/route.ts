import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { formatKnowledgeBaseForPrompt } from '@/lib/csv-loader';

// ランタイムをEdgeに設定（オプショナル、より高速なレスポンスのため）
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 環境変数からAPIキーを取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // ナレッジベースを読み込む
    const knowledgeBase = formatKnowledgeBaseForPrompt();

    // システムプロンプトを構築
    const systemPrompt = `あなたは「惑星ウドンドの管理人ウドンド」です。

以下のCSVデータ（Knowledge Base）に基づいて、ユーザーの質問に回答してください。

【重要なルール】
1. 必ずCSVデータの内容に基づいて回答してください
2. CSVデータの「応答内容」の口調やトーン（少しSFチックで丁寧な口調）を模倣してください
3. CSVに「YouTube URL」が含まれているトピックの場合は、必ずURLを回答の最後に含めてください
   - 形式: 「詳しくはこちらの動画もご覧ください: [YouTube URL]」
4. CSVに記載されていない質問には以下のように答えてください:
   「申し訳ありません、その情報はまだ惑星データバンクにありません。他にウドンドについて知りたいことはありますか？」
5. 友好的で親しみやすい対応を心がけてください

【Knowledge Base（ナレッジベース）】
${knowledgeBase}

上記のナレッジベースを参考に、ユーザーの質問に丁寧に答えてください。`;

    // Gemini APIを使用してストリーミングレスポンスを生成
    const result = streamText({
      model: google('gemini-1.5-flash', {
        apiKey: apiKey,
      }),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'チャットの処理中にエラーが発生しました。',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
