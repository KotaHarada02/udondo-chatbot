document.addEventListener('DOMContentLoaded', () => {
    // 1. 必要なHTML要素を取得します
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('messagesContainer');
    const sendButton = document.getElementById('sendButton');
  
    // 2. 初期化処理
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
  
    // 3. メッセージが送信されたときの処理
    chatForm.addEventListener('submit', async (e) => {
      // ページが再読み込みされるのを防ぎます
      e.preventDefault();
      const userInput = chatInput.value.trim();
  
      // 入力が空の場合は何もしません
      if (!userInput) return;
  
      // 送信ボタンを無効化
      sendButton.disabled = true;
  
      // ユーザーが入力したメッセージを画面に表示します
      addMessage(userInput, 'user');
      chatInput.value = ''; // 入力欄を空にします
  
      // AIが考えている間のローディング表示を出します
      showLoadingMessage();
  
      try {
        // バックエンドのAPIにリクエストを送信します
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userInput }),
        });
  
        if (!response.ok) {
          // エラーが発生した場合
          throw new Error('サーバーからの応答が正常ではありません。');
        }
  
        const data = await response.json();
        
        // ローディング表示を削除して、実際の応答を表示
        removeLoadingMessage();
        addMessage(data.reply, 'assistant');
  
      } catch (error) {
        console.error('メッセージの送受信中にエラーが発生しました:', error);
        removeLoadingMessage();
        addMessage('エラーが発生しました。もう一度お試しください。', 'assistant');
      } finally {
        // 送信ボタンを有効化
        sendButton.disabled = false;
      }
    });
  
    // 4. メッセージをチャット欄に追加するための関数
    function addMessage(text, role) {
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