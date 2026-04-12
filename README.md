# udondo-chatbot

ご提示いただいたコードとアーキテクチャ（Next.js + FastAPI + Supabase + Gemini のRAG構成）を元に、データの流れやAPI・UIの関連性を可視化するための各種図（Mermaid）と解説を作成しました。

### 1. APIとUI用ファイルの流れ（データフロー）
まず、ユーザーが画面を操作してからAPIを通り、回答が返ってくるまでのファイル間のつながりを解説します。

**【UI側の流れ (Frontend: Next.js)】**
1. `app/page.tsx` が起点となり、メインコンポーネントである `components/planet-guide-chat.tsx` を呼び出します。
2. `PlanetGuideChat` は会話履歴（状態）を保持し、以下のコンポーネントを組み立てます：
   - ヘッダー操作：`chat-header.tsx`
   - 表示切替：`text-mode-chat.tsx` または `avatar-mode-chat.tsx`（中で `chat-bubble.tsx` などを呼び出し）
   - 入力欄：`chat-input.tsx`
3. ユーザーが `ChatInput` から送信すると、`PlanetGuideChat` の `handleSendMessage` 関数が発火し、`/api/v1/chat` にPOSTリクエストを送ります。
4. レスポンスはSSE（Server-Sent Events）でチャンクごとに返ってくるため、ストリームを読み取りながらリアルタイムにUIのメッセージ状態を更新します。

**【API側の流れ (Backend: FastAPI)】**
1. リクエストは `api/index.py`（Vercel Serverless Function）を通り、`src/main.py` の FastAPI アプリケーションに到達します。
2. `src/api/v1/chat.py` のルーティングがリクエストを受け取り、`ChatService` (`src/application/chat_service.py`) を呼び出します。
3. `ChatService` は依存性の注入（DI）を利用して以下の処理をオーケストレーションします：
   - **検索 (Retrieval):** `SupabaseKnowledgeRetriever` (`src/infrastructure/supabase/`) がユーザーの質問をベクトル化し、Supabaseから関連情報を取得します。
   - **生成 (Generation):** `GeminiAdapter` (`src/infrastructure/llm/`) が、検索した知識と質問を元に回答をストリーミング生成します。
   - **保存 (Logging):** 回答完了後、`SupabaseChatLogAdapter` がチャット履歴をデータベースに保存します。

---

以下に、システム全体を把握するための各種Mermaid図を示します。

### 2. ユースケース図
システムが「誰に」「どのような機能」を提供しているかを表します。

```mermaid
flowchart LR
    User([ユーザー])
    Gemini([Gemini API])
    Supabase([Supabase DB])

    subgraph 惑星のウドンド チャットボット
        UC1(チャットモード切替\nテキスト/アバター)
        UC2(言語選択)
        UC3(メッセージを送信する)
        UC4(回答をストリーミング受信する)
        UC5(回答を評価する\nGood/Bad)
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5

    UC3 <-->|質問のベクトル化/回答生成| Gemini
    UC3 <-->|類似知識の検索| Supabase
    UC5 -->|評価の保存| Supabase
```

### 3. 状態遷移図
チャット画面における、メッセージ送信から受信までの状態の変化を表します。

```mermaid
stateDiagram-v2
    [*] --> 初期状態
    初期状態 --> 入力待機中 : アプリ起動完了
    
    入力待機中 --> 生成中 : ユーザーがメッセージを送信
    
    state 生成中 {
        [*] --> チャンク受信待ち
        チャンク受信待ち --> テキスト描画 : SSEデータ受信
        テキスト描画 --> チャンク受信待ち : 継続
    }
    
    生成中 --> 入力待機中 : ストリーム完了 (done: true)
    生成中 --> エラー : 通信エラー / サーバーエラー
    エラー --> 入力待機中 : リセット / 再試行
```

### 4. アクティビティ図
ユーザーがメッセージを送信した際の、RAG（検索拡張生成）の具体的な処理フローを表します。

```mermaid
flowchart TD
    Start([ユーザーがメッセージを送信]) --> F1[フロントエンド: /api/v1/chat を呼び出す]
    F1 --> B1{バックエンド: リクエスト受付}
    
    subgraph RAGプロセス
        B1 --> B2[Retriever: 質問をGeminiでベクトル化]
        B2 --> B3[(Supabase: match_knowledge 関数で\n類似ドキュメントを検索)]
        B3 --> B4[LLM: 検索結果をコンテキストとしてプロンプトを構築]
        B4 --> B5[LLM: Geminiにプロンプトを送信し生成開始]
    end
    
    B5 --> Stream((SSE\nストリーム))
    Stream --> F2[フロントエンド: 受け取った文字を逐次UIに反映]
    
    B5 --> B6[(Supabase: チャットログとメタデータを非同期保存)]
    
    F2 --> End([ストリーム完了・UI更新停止])
```

### 5. クラス図
バックエンドのクリーンアーキテクチャ（ポートとアダプター）の構造と、フロントエンドの主要コンポーネントの関係性を表します。

```mermaid
classDiagram
    %% バックエンド (Backend)
    class ChatService {
        - llm: LLMPort
        - retriever: RetrieverPort
        - chat_log: ChatLogPort
        + chat_stream(message, history, language)
    }

    class LLMPort {
        <<interface>>
        + generate_stream()
    }
    class GeminiAdapter {
        + generate_stream()
    }
    LLMPort <|.. GeminiAdapter

    class RetrieverPort {
        <<interface>>
        + retrieve()
    }
    class SupabaseKnowledgeRetriever {
        + retrieve()
    }
    RetrieverPort <|.. SupabaseKnowledgeRetriever

    class ChatLogPort {
        <<interface>>
        + save_message()
        + update_evaluation()
    }
    class SupabaseChatLogAdapter {
        + save_message()
        + update_evaluation()
    }
    ChatLogPort <|.. SupabaseChatLogAdapter

    ChatService --> LLMPort : 依存
    ChatService --> RetrieverPort : 依存
    ChatService --> ChatLogPort : 依存

    %% フロントエンド (Frontend)
    class PlanetGuideChat {
        + mode: "text" | "avatar"
        + messages: Message[]
        + handleSendMessage()
        + handleEvaluate()
    }
    class ChatInput {
        + onSendMessage()
    }
    class TextModeChat {
        + messages: Message[]
    }
    class AvatarModeChat {
        + latestMessage: Message
    }
    class ChatBubble {
        + message: Message
    }

    PlanetGuideChat *-- ChatInput : 含む
    PlanetGuideChat *-- TextModeChat : 含む
    PlanetGuideChat *-- AvatarModeChat : 含む
    TextModeChat *-- ChatBubble : 含む
    
    %% API通信
    PlanetGuideChat ..> ChatService : API呼出 (POST /api/v1/chat)
```

現在の実装は、バックエンド側が「ドメイン/インターフェース」と「インフラ（外部API/DB）」を明確に分離しているため、今後別のLLMや別のデータベースに乗り換える際も `Adapter` 部分を書き換えるだけで済む、非常に拡張性の高い設計になっています。追加機能（認証機能やチャット履歴の永続化など）を実装する際も、この構造に沿って機能追加を行っていくことが可能です。