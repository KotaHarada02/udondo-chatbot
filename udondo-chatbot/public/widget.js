// public/widget.js
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('messagesContainer');
    const sendButton = document.getElementById('sendButton');
    const quickReplyContainer = document.getElementById('quickReplyContainer'); // コンテナを取得
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // よくある質問のリスト（kb.jsonの質問と一致させる）
    const quickReplies = [
        "注文方法を教えてください",
        "商品はどこにありますか？かけうどんはどれですか？",
        "おすすめのメニューはなんですか？",
        "お店のルールや注意事項はありますか？",
        "商品の作り方、調理方法を教えてください"
    ];

    // kb.jsonから回答を取得する関数（API呼び出しなし）
    const getAnswerFromKb = async (question) => {
        try {
            const response = await fetch('/api/chat/faq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question: question, 
                    sessionId: sessionId 
                })
            });

            if (!response.ok) throw new Error('FAQ回答の取得に失敗しました');
            return await response.json();
        } catch (error) {
            console.error('FAQ回答の取得中にエラー:', error);
            throw error;
        }
    };

    // メッセージを送信するメインの関数
    const sendMessage = async (messageText) => {
        if (!messageText) return;

        addMessage(messageText, 'user');
        chatInput.value = ''; // 質問ボタンから送信した場合も入力欄を空にする
        showLoadingMessage();
        sendButton.disabled = true;

        try {
            // よくある質問かどうかをチェック
            const isQuickReply = quickReplies.includes(messageText);
            
            let data;
            if (isQuickReply) {
                // よくある質問の場合：kb.jsonから直接回答を取得（API節約）
                data = await getAnswerFromKb(messageText);
            } else {
                // 通常の質問の場合：Gemini APIを使用
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: messageText, sessionId: sessionId }),
                });

                if (!response.ok) throw new Error('サーバーからの応答が正常ではありません。');
                data = await response.json();
            }

            removeLoadingMessage();
            addMessage(data.reply, 'assistant', data.conversationId);
        } catch (error) {
            console.error('メッセージの送受信中にエラーが発生しました:', error);
            removeLoadingMessage();
            addMessage('エラーが発生しました。もう一度お試しください。', 'assistant');
        } finally {
            sendButton.disabled = false;
        }
    };
    
    // チャットの初期化処理
    const initializeChat = () => {
        // 1. 挨拶メッセージの取得
        sendMessage("こんにちは"); // 裏側で「こんにちは」を送信して挨拶を受け取る

        // 2. よくある質問ボタンの生成
        quickReplies.forEach(text => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add('quick-reply-btn');
            button.type = 'button'; // formのsubmitを防止
            button.addEventListener('click', () => {
                sendMessage(text);
            });
            quickReplyContainer.appendChild(button);
        });
    };

    initializeChat();

    // ユーザーが手入力で送信する処理
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        sendMessage(userInput);
    });

  // 4. メッセージをチャット欄に追加するための関数
  function addMessage(text, role, conversationId) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(role === 'user' ? 'user-message' : 'assistant-message');
    
    // アバター作成
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.classList.add(role === 'user' ? 'user-avatar' : 'bot-avatar');
    
    if (role === 'user') {
      avatar.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      `;
    } else {
      avatar.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="18" height="10" x="3" y="11" rx="2"/>
          <circle cx="12" cy="5" r="2"/>
          <path d="m12 7 2 3H10l2-3Z"/>
        </svg>
      `;
    }
    
    // メッセージコンテンツ作成
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    
    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageContent.appendChild(paragraph);

    // 【新機能】assistantのメッセージの場合のみボタンを追加
    if (role === 'assistant' && conversationId) {
      const feedbackContainer = document.createElement('div');
      feedbackContainer.classList.add('feedback-buttons');
      
      const goodBtn = document.createElement('button');
      goodBtn.textContent = '👍 良い';
      goodBtn.classList.add('feedback-btn');
      
      const badBtn = document.createElement('button');
      badBtn.textContent = '👎 悪い';
      badBtn.classList.add('feedback-btn');
      
      feedbackContainer.appendChild(goodBtn);
      feedbackContainer.appendChild(badBtn);
      messageContent.appendChild(feedbackContainer);
      
      // ボタンクリック時のイベントリスナー
      const handleFeedbackClick = async (feedbackType) => {
        // ボタンを無効化して多重送信を防ぐ
        goodBtn.disabled = true;
        badBtn.disabled = true;
        
        try {
          await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: conversationId,
              feedbackType: feedbackType
            })
          });
          // 成功したら見た目を少し変えるなどしても良い
        } catch (error) {
          console.error('フィードバック送信エラー:', error);
          // エラーが出てもボタンは無効のままにする
        }
      };
      
      goodBtn.addEventListener('click', () => handleFeedbackClick('good'));
      badBtn.addEventListener('click', () => handleFeedbackClick('bad'));
    }
    
    messageContent.appendChild(timestamp);
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    
    chatMessages.appendChild(messageElement);
    // 自動で一番下までスクロールします
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 5. ローディング表示関数
  function showLoadingMessage() {
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('loading-message');
    loadingElement.id = 'loadingMessage';
    
    const avatar = document.createElement('div');
    avatar.classList.add('avatar', 'bot-avatar');
    avatar.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect width="18" height="10" x="3" y="11" rx="2"/>
        <circle cx="12" cy="5" r="2"/>
        <path d="m12 7 2 3H10l2-3Z"/>
      </svg>
    `;
    
    const loadingContent = document.createElement('div');
    loadingContent.classList.add('loading-content');
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.classList.add('loading-dot');
      loadingContent.appendChild(dot);
    }
    
    loadingElement.appendChild(avatar);
    loadingElement.appendChild(loadingContent);
    
    chatMessages.appendChild(loadingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 6. ローディング表示を削除する関数
  function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }
});