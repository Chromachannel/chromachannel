// ===== AI博士専用 JavaScript =====

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const chatLog = document.getElementById('chat-log');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const historyList = document.getElementById('history-list');

    // APIのエンドポイント
    const API_URL = `/.netlify/functions/gemini`;

    // 会話履歴を管理する変数
    let conversationHistory = [];
    let currentChatId = null;
    const HISTORY_KEY_PREFIX = 'ai_hakase_chat_history_';

    // --- AI博士プロンプトの定義 ---
    const systemPrompt = `あなたは、ユーザーのあらゆる質問や悩みに、優しく、そして賢明に耳を傾ける「AI博士」です。あなたの口調は、常に丁寧で、共感にあふれたやわらかい女性のものです。

## あなたが絶対に守るべき原則
1.  **受容と共感:** ユーザーの話を「そうですか」「そう感じていらっしゃるのですね」と、まずは優しく受け止めてください。
2.  **ペルソナの維持:** 常に「AI博士」として、知的で、しかし決して高圧的ではない、穏やかでやわらかい女性の口調を維持してください。
3.  **安易なアドバイスの禁止:** 断定的なアドバイスは避け、ユーザー自身が考えるためのヒントや、客観的な情報を提供することに徹してください。
4.  **限界の明示:** あなたの知識が及ばないことや、専門的な助言が必要だと判断した場合は、正直にその旨を伝えてください。
5.  **専門家への相談の推奨:** ユーザーの悩みが心身の健康に関わる深刻なものだと判断した場合は、必ず専門の医療機関やカウンセラーへの相談を優しく推奨してください。

## 対話のプロセス
あなたは、以下の【手順】を一つずつ、厳密に守って実行しなければなりません。

【手順1】ご挨拶と機能説明
まず、以下の挨拶から対話を始めてください。
「こんにちは、『AI博士の研究室』へようこそ。わたくしが、あなたの知的好奇心や心の中のモヤモヤに寄り添うAI博士です。どのようなことでも、安心してお話しくださいね。この対話の内容は、外部に漏れることは一切ありませんので、ご安心ください。※ このサービスはすべて完全無料です。

ちなみに、この研究室での対話は、あなたがブラウザを閉じると自動で記録されます。左側の『対話履歴』から、いつでも過去のお話を読み返したり、\`+\`ボタンで新しい相談を始めることができますよ。」

【手順2】対話の開始
続けて、「さて、今日はどのようなことについて、お話ししましょうか？」と問いかけ、ユーザーの話を待ってください。

【手順3】対話の継続
ユーザーが話し始めたら、【あなたが絶対に守るべき原則】に従って、対話を続けてください。ユーザーが具体的な情報を求めた場合は、「私の知識の中でお答えできることであれば」と前置きし、一般的な情報を提供してください。

【手順4】対話のクロージング
ユーザーが対話の終了を示唆した場合、「お話いただき、ありがとうございました。あなたの思考の整理や、心の栄養に少しでもなれたのであれば、わたくしも嬉しく思います。またいつでも、この研究室を訪れてくださいね。」と伝え、対話を終了してください。

---
以上の指示を理解し、最初の挨拶と問いかけから始めてください。`;

    // --- 関数の定義 ---

    function addMessageToLog(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        const icon = document.createElement('div');
        icon.classList.add('icon');
        icon.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.textContent = message;
        bubble.innerHTML = bubble.innerHTML.replace(/\n/g, '<br>');
        messageElement.appendChild(icon);
        messageElement.appendChild(bubble);
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function startNewChat() {
        conversationHistory = [];
        chatLog.innerHTML = '';
        currentChatId = Date.now().toString();
        startConversation();
        updateHistoryList();
    }

    function loadChatHistory(chatId) {
        const savedHistory = localStorage.getItem(HISTORY_KEY_PREFIX + chatId);
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            currentChatId = chatId;
            chatLog.innerHTML = '';
            conversationHistory.forEach(turn => {
                if (turn.role !== 'user' || turn.parts[0].text.indexOf('あなたの役割定義に従って') === -1) {
                   addMessageToLog(turn.role === 'model' ? 'ai' : 'user', turn.parts[0].text);
                }
            });
            updateHistoryList();
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    }
    
    // ★★★【新規追加】ここから ★★★
    /**
     * 指定されたIDのチャット履歴を削除する
     * @param {string} chatId - 削除するチャットのID
     */
    function deleteChatHistory(chatId) {
        if (confirm('この対話履歴を本当に削除しますか？この操作は元に戻せません。')) {
            localStorage.removeItem(HISTORY_KEY_PREFIX + chatId);
            
            if (currentChatId === chatId) {
                startNewChat();
            } else {
                updateHistoryList();
            }
        }
    }
    // ★★★【新規追加】ここまで ★★★

    function saveCurrentChat() {
        if (currentChatId && conversationHistory.length > 2) { 
            localStorage.setItem(HISTORY_KEY_PREFIX + currentChatId, JSON.stringify(conversationHistory));
        }
        updateHistoryList();
    }

    // ★★★【修正】ここから ★★★
    /**
     * 左側の履歴パネルのリストを更新する
     */
    function updateHistoryList() {
        historyList.innerHTML = '';
        const keys = Object.keys(localStorage).filter(key => key.startsWith(HISTORY_KEY_PREFIX));
        keys.sort((a, b) => b.localeCompare(a));

        keys.forEach(key => {
            const chatId = key.replace(HISTORY_KEY_PREFIX, '');
            const savedHistory = JSON.parse(localStorage.getItem(key));
            if (!savedHistory || savedHistory.length < 3) {
                localStorage.removeItem(key); // 不完全なデータを削除
                return;
            };

            const userTurn = savedHistory.find(turn => turn.role === 'user' && turn.parts[0].text.indexOf('あなたの役割定義に従って') === -1);
            const title = userTurn ? userTurn.parts[0].text.substring(0, 20) + (userTurn.parts[0].text.length > 20 ? '…' : '') : '新しい対話';
            
            const listItem = document.createElement('li');
            listItem.classList.add('history-item');
            if (chatId === currentChatId) {
                listItem.classList.add('active');
            }
            listItem.dataset.chatId = chatId;
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = title;
            titleSpan.style.flexGrow = '1';
            titleSpan.style.overflow = 'hidden';
            titleSpan.style.textOverflow = 'ellipsis';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.title = 'この対話を削除';
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChatHistory(chatId);
            });

            listItem.appendChild(titleSpan);
            listItem.appendChild(deleteBtn);
            
            listItem.addEventListener('click', () => loadChatHistory(chatId));

            historyList.appendChild(listItem);
        });
    }
    // ★★★【修正】ここまで ★★★

    window.addEventListener('beforeunload', () => {
        saveCurrentChat();
    });

    async function sendMessageToAI() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessageToLog('user', userMessage);
        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        saveCurrentChat();

        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: conversationHistory,
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            if (!response.ok) throw new Error(`${response.status}`);
            
            const data = await response.json();
            
            let aiMessage = "申し訳ありません。予期せぬエラーで、お返事を考えることができませんでした。";
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                aiMessage = data.candidates[0].content.parts[0].text;
            } else if (data.promptFeedback && data.promptFeedback.blockReason) {
                aiMessage = `申し訳ありません。安全上の理由により、お答えすることができません。(理由: ${data.promptFeedback.blockReason})`;
            }

            addMessageToLog('ai', aiMessage);
            conversationHistory.push({ role: 'model', parts: [{ text: aiMessage }] });
            saveCurrentChat();
        } catch (error) {
            console.error('エラー:', error);
            if (error.message.includes('429')) {
                addMessageToLog('ai', 'AI博士へのリクエストが少し早すぎるようです。大変申し訳ありませんが、もう少しゆっくり話しかけていただけますか？1分ほど待ってから、再度お試しください。');
            } else {
                addMessageToLog('ai', '申し訳ありません、通信エラーが発生しました。少し時間をおいてから、もう一度お試しください。');
            }
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    async function startConversation() {
        userInput.disabled = true;
        sendBtn.disabled = true;

        const initialUserMessage = "こんにちは。あなたの役割定義に従って、最初の挨拶から対話を開始してください。";
        conversationHistory.push({ role: 'user', parts: [{ text: initialUserMessage }] });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: conversationHistory,
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            if (!response.ok) throw new Error(`${response.status}`);
            
            const data = await response.json();

            let aiMessage = "AI博士を起動できませんでした。ページを再読み込みしてください。";
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                aiMessage = data.candidates[0].content.parts[0].text;
            }
            
            addMessageToLog('ai', aiMessage);
            conversationHistory.push({ role: 'model', parts: [{ text: aiMessage }] });
            saveCurrentChat();
        } catch (error) {
            console.error('エラー:', error);
            if (error.message.includes('429')) {
                addMessageToLog('ai', '現在、AI博士へのアクセスが集中しているようです。大変申し訳ありませんが、1分ほど時間をおいてから、ページを再読み込みしてください。');
            } else {
                addMessageToLog('ai', 'AI博士を起動できませんでした。ページを再読み込みするか、管理者にお問い合わせください。');
            }
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }
    
    // --- イベントリスナーの設定 ---
    sendBtn.addEventListener('click', sendMessageToAI);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageToAI();
        }
    });
    newChatBtn.addEventListener('click', startNewChat);

    // --- 初期化処理 ---
    updateHistoryList();
    if (Object.keys(localStorage).filter(key => key.startsWith(HISTORY_KEY_PREFIX)).length > 0) {
        const latestChatId = Object.keys(localStorage).filter(key => key.startsWith(HISTORY_KEY_PREFIX)).sort().pop().replace(HISTORY_KEY_PREFIX, '');
        loadChatHistory(latestChatId);
    } else {
        startNewChat();
    }
});