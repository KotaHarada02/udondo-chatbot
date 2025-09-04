// public/widget.js
document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('messageInput');
  const chatMessages = document.getElementById('messagesContainer');
  const sendButton = document.getElementById('sendButton');
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  //【新機能】チャットセッションごとに一意のIDを生成
  let chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  function initializeTimestamp() {
    const timestampElement = document.getElementById('initialTimestamp');
    if (timestampElement) {
      const now = new Date();
      timestampElement.textContent = now.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
  initializeTimestamp();

  // 初期メッセージを表示（サーバーが起動していなくても表示される）
  addMessage('こんにちは！ウドンドAIです。宇宙のうどんについて何でもお聞きください！', 'assistant');

  // 【新機能】テキストを音声で読み上げる関数
  const udondoAvatar = document.getElementById('udondoAvatar'); // 【追加】アバター画像要素を取得

  // テキストを音声で読み上げる関数
  const speak = (text) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'ja-JP';
          utterance.rate = 2.0;

          // 【新機能】音声再生開始時にアニメーションを適用
          utterance.onstart = () => {
              if (udondoAvatar) {
                  udondoAvatar.parentElement.classList.add('is-speaking');
              }
          };

          // 【新機能】音声再生終了時にアニメーションを解除
          utterance.onend = () => {
              if (udondoAvatar) {
                  udondoAvatar.parentElement.classList.remove('is-speaking');
              }
          };
          
          // 【新機能】エラー時もアニメーションを解除
          utterance.onerror = (event) => {
              console.error('音声合成エラー:', event);
              if (udondoAvatar) {
                  udondoAvatar.parentElement.classList.remove('is-speaking');
              }
          };

          window.speechSynthesis.speak(utterance);
      } else {
          console.log('このブラウザは音声合成に対応していません。');
      }
  };
  

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = chatInput.value.trim();

    if (!userInput) return;

    sendButton.disabled = true;
    addMessage(userInput, 'user');
    chatInput.value = '';
    showLoadingMessage();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 【変更】リクエストボディにsessionIdを追加
        body: JSON.stringify({ message: userInput, sessionId: sessionId }), 
      });

      if (!response.ok) {
        throw new Error('サーバーからの応答が正常ではありません。');
      }

      const data = await response.json();
      removeLoadingMessage();
      // 【変更】応答データから conversationId を受け取り、addMessageに渡す
      addMessage(data.reply, 'assistant', data.conversationId);

    } catch (error) {
      console.error('メッセージの送受信中にエラーが発生しました:', error);
      removeLoadingMessage();
      addMessage('エラーが発生しました。もう一度お試しください。', 'assistant');
    } finally {
      sendButton.disabled = false;
    }
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
      speak(text);
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