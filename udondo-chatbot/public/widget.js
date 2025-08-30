document.addEventListener('DOMContentLoaded', () => {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWidget = document.getElementById('chat-widget');
    const closeBtn = document.getElementById('close-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
  
    // チャットを開く
    chatBubble.addEventListener('click', () => {
      chatWidget.classList.remove('hidden');
      chatBubble.classList.add('hidden');
    });
  
    // チャットを閉じる
    closeBtn.addEventListener('click', () => {
      chatWidget.classList.add('hidden');
      chatBubble.classList.remove('hidden');
    });
    
    // public/widget.js の該当箇所を書き換え

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput) return;
    
        addMessage(userInput, 'user');
        chatInput.value = '';
        
        // ローディング表示（任意）
        addMessage('...', 'assistant', true);
    
        try {
        // バックエンドのAPIにリクエストを送信
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput }),
        });
    
        if (!response.ok) {
            throw new Error('ネットワーク応答が正常ではありませんでした。');
        }
    
        const data = await response.json();
        
        // ローディング表示を削除し、APIからの応答に置き換える
        updateLastMessage(data.reply);
    
        } catch (error) {
        console.error('Fetchエラー:', error);
        updateLastMessage('エラーが発生しました。');
        }
    });
    
    // メッセージを画面に追加する関数（少し変更）
    function addMessage(text, role, isLoading = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', role);
        if (isLoading) {
        messageElement.classList.add('loading');
        }
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // ローディング表示を実際のメッセージに更新する関数（新規追加）
    function updateLastMessage(text) {
        const loadingMessage = chatMessages.querySelector('.message.loading');
        if (loadingMessage) {
            loadingMessage.textContent = text;
            loadingMessage.classList.remove('loading');
        }
    }
  });