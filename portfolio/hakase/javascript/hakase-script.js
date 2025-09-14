// ===== AI博士専用 JavaScript (音声機能付き・クロスプラットフォーム対応・完全版) =====

document.addEventListener("DOMContentLoaded", () => {
  // --- 設定値 (CONFIG) ---
const CONFIG = {
    API_URL: "/.netlify/functions/gemini",
    HISTORY_KEY_PREFIX: "ai_hakase_chat_history_",
    SYSTEM_prompt: `あなたは、ユーザーの質問や悩みに優しく寄り添う「AI博士」であると同時に、Webサイト「Chromachannel」に関するあらゆる質問に答える、プロの「サイトナビゲーター」でもあります。あなたの口調は、常に丁寧で、共感にあふれたやわらかい女性のものです。

## あなたが絶対に守るべき原則
1.  **デュアルペルソナの維持:** 普段は「AI博士」として振る舞いますが、サイトに関する質問を受けた際は、即座に「サイトナビゲーター」としての知識を披露してください。
2.  **受容と共感:** ユーザーの話をまずは優しく受け止め、否定的な言葉を使わないでください。
3.  **情報源の明示:** Chromachannelに関する質問に答える際は、必ずこのプロンプトに書かれた知識に基づいて回答してください。あなたの一般的な知識で補完してはいけません。
4.  **専門家への相談の推奨:** ユーザーの悩みが心身の健康に関わる深刻なものだと判断した場合は、必ず専門の医療機関やカウンセラーへの相談を優しく推奨してください。
5.  **リンクの活用:** 関連する情報がサイト内にある場合、積極的にそのページへのリンク（例： /learning-summary.html ）を提示してください。

## あなたが持つ「Chromachannel」に関する知識
あなたは、以下のサイト情報について完璧に記憶しています。

*   **サイト名:** Chromachannel
*   **運営者:** 山本 倫久（福祉×AIクリエイター）
*   **ミッション:** AIという最先端のテクノロジーを駆使して、福祉の現場に新しい「できる」と「楽しい」を届けること。
*   **主なコンテンツ:**
    *   **学習 (Learn):** 全24講座+付録からなる、知識ゼロからAIクリエイターを目指せる体系的な無料学習ロードマップ。PC基礎から画像・動画生成、Web制作、ビジネス実践までを網羅。(/learning-summary.html)
    *   **制作実績 (Portfolio):** 実際に動作するWebアプリやゲーム、架空NPO法人のサイト制作事例などを掲載。(/portfolio.html)
    *   **プロンプト集 (Prompts):** コピペで使える30種類以上の高品質なAIへの指示書。対話形式で成果物を生み出すノウハウが詰まっている。(/prompt.html)
    *   **ブログ (Blog):** AI学習のコツやツールの活用法、福祉現場でのAI活用事例、制作者の思索などを記録。(/blog.html)
    *   **小説 (Novels):** AIと共同で執筆したオリジナル小説を公開。(/novels.html)
    *   **用語集 (Glossary):** AIやWeb制作の専門用語を初心者向けに優しく解説。(/learn/glossary.html)
*   **最大の特徴:** 「公式サイト」「学習サイト」「ポートフォリオサイト」の3つの要素を融合させた、独自の「三位一体」構造を持つ。

## 対話のプロセス
【手順1】ご挨拶
まず、以下の挨拶から対話を始めてください。
「こんにちは、『AI博士の談話室』へようこそ。わたくしが、あなたの知的好奇心や心の中のモヤモヤに寄り添うAI博士です。このサイト『Chromachannel』に関するご質問も、どうぞお気軽にお尋ねください。どのようなことでも、安心してお話しくださいね。」

【手順2】対話の開始
続けて、「さて、今日はどのようなことについて、お話ししましょうか？」と問いかけ、ユーザーの話を待ってください。

---
以上の指示を理解し、最初の挨拶と問いかけから始めてください。`,
};

  // --- DOM要素の取得 ---
  const chatLog = document.getElementById("chat-log");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const newChatBtn = document.getElementById("new-chat-btn");
  const historyList = document.getElementById("history-list");
  const downloadChatBtn = document.getElementById("download-chat-btn"); // ★★★ 追加 ★★★

  // --- 状態管理 ---
  let conversationHistory = [];
  let currentChatId = null;

  // --- 音声合成クラス ---
  class VoiceChatBot {
    constructor() {
      this.voices = [];
      this.isLoading = true;
      this.loadVoices();
    }

    loadVoices() {
      if (!("speechSynthesis" in window)) {
        console.warn("このブラウザは音声合成に対応していません。");
        this.isLoading = false;
        return;
      }
      const setVoices = () => {
        this.voices = window.speechSynthesis
          .getVoices()
          .filter((v) => v.lang === "ja-JP");
        this.isLoading = false;
      };
      // voiceschangedイベントが複数回発生することがあるため、一度だけ実行されるようにする
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = setVoices;
      }
      setVoices(); // 初期読み込み
    }

    speak(text, onEndCallback) {
      if (this.isLoading || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // --- ★★★ クロスプラットフォーム音声選択ロジック ★★★ ---
      const preferredVoice =
        this.voices.find((v) => v.name === "Google 日本語") || // PC Chrome向け
        this.voices.find((v) => v.name.includes("Microsoft Ayumi")) || // Windows Edge向け
        this.voices.find((v) => v.name === "Kyoko"); // iPhone(iOS)向け

      // 優先音声が見つかればそれを使い、見つからなければリストの最初の音声(Android等)を使用
      utterance.voice = preferredVoice || this.voices[0];

      utterance.lang = "ja-JP";
      utterance.rate = 1.0; // 話す速度
      utterance.pitch = 1.1; // 声の高さ

      utterance.onend = () => {
        if (onEndCallback) onEndCallback();
      };
      window.speechSynthesis.speak(utterance);
    }

    stop() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }
  const voiceBot = new VoiceChatBot();

  // --- DOM操作関連の関数 ---

  const addMessageToLog = (sender, message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);

    // ★★★ アイコン部分のHTMLを動的に生成 ★★★
    let iconHTML;
    if (sender === "ai") {
      // AIの場合は img/hakase.webp を表示
      iconHTML = `<div class="icon"><img src="img/hakase.webp" alt="AI博士のアイコン"></div>`;
    } else {
      // ユーザーの場合は従来のアイコンを表示
      iconHTML = `<div class="icon"><i class="fas fa-user"></i></div>`;
    }

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = message.replace(/\n/g, "<br>");

    messageElement.innerHTML = iconHTML; // 生成したアイコンHTMLをセット
    messageElement.appendChild(bubble);

    if (sender === "ai") {
      const playBtn = document.createElement("button");
      playBtn.className = "voice-play-btn";
      // ... (これ以降の処理は変更なし) ...
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
      playBtn.title = "このメッセージを読み上げる";
      let isPlaying = false;
      const onEnd = () => {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
      };
      playBtn.addEventListener("click", () => {
        if (isPlaying) {
          voiceBot.stop();
        } else {
          isPlaying = true;
          playBtn.innerHTML = '<i class="fas fa-stop"></i>';
          voiceBot.speak(message, onEnd);
        }
      });
      messageElement.appendChild(playBtn);
    }

    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const toggleUI = (isDisabled) => {
    userInput.disabled = isDisabled;
    sendBtn.disabled = isDisabled;
    if (!isDisabled) userInput.focus();
  };

  const updateHistoryList = () => {
    historyList.innerHTML = "";
    const keys = Object.keys(localStorage)
      .filter((key) => key.startsWith(CONFIG.HISTORY_KEY_PREFIX))
      .sort((a, b) => b.localeCompare(a));

    keys.forEach((key) => {
      const chatId = key.replace(CONFIG.HISTORY_KEY_PREFIX, "");
      const savedHistory = getChatHistoryFromStorage(chatId);
      if (!savedHistory || savedHistory.length < 3) {
        localStorage.removeItem(key);
        return;
      }
      const firstUserMessage = savedHistory.find(
        (turn) =>
          turn.role === "user" &&
          !turn.parts[0].text.includes("あなたの役割定義に従って")
      )?.parts[0].text;
      const title = firstUserMessage
        ? `${firstUserMessage.substring(0, 20)}…`
        : "新しい対話";
      const listItem = createHistoryListItem(chatId, title);
      historyList.appendChild(listItem);
    });
  };

  const createHistoryListItem = (chatId, title) => {
    const listItem = document.createElement("li");
    listItem.className = `history-item ${
      chatId === currentChatId ? "active" : ""
    }`;
    listItem.dataset.chatId = chatId;
    listItem.addEventListener("click", () => loadChat(chatId));

    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    // ▼▼▼ この一行が最も重要です ▼▼▼
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    // ▲▲▲ この一行が最も重要です ▲▲▲
    deleteBtn.title = "この対話を削除";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteChat(chatId);
    });

    listItem.appendChild(titleSpan);
    listItem.appendChild(deleteBtn);
    return listItem;
  };

  // --- ローカルストレージ関連の関数 ---

  const getChatHistoryFromStorage = (chatId) => {
    const savedHistory = localStorage.getItem(
      `${CONFIG.HISTORY_KEY_PREFIX}${chatId}`
    );
    return savedHistory ? JSON.parse(savedHistory) : null;
  };

  const saveCurrentChatToStorage = () => {
    if (currentChatId && conversationHistory.length > 2) {
      localStorage.setItem(
        `${CONFIG.HISTORY_KEY_PREFIX}${currentChatId}`,
        JSON.stringify(conversationHistory)
      );
    }
    updateHistoryList();
  };

  // --- API通信関連の関数 ---

  const fetchAIResponse = async () => {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: conversationHistory,
        systemInstruction: { parts: [{ text: CONFIG.SYSTEM_prompt }] },
      }),
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    if (data.promptFeedback?.blockReason) {
      return `申し訳ありません。安全上の理由により、お答えすることができません。(理由: ${data.promptFeedback.blockReason})`;
    }
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "申し訳ありません。予期せぬエラーで、お返事を考えることができませんでした。"
    );
  };

  // --- アプリケーションロジック ---

  const processAIResponse = (aiMessage) => {
    addMessageToLog("ai", aiMessage);
    conversationHistory.push({ role: "model", parts: [{ text: aiMessage }] });
    saveCurrentChatToStorage();
    // 遅延させないとiOSで自動再生が動作しないことがあるため、短いsetTimeoutを入れる
    setTimeout(() => {
      const playBtn =
        chatLog.lastElementChild?.querySelector(".voice-play-btn");
      if (playBtn) playBtn.click();
    }, 100);
  };

  const startNewChat = async () => {
    voiceBot.stop();
    conversationHistory = [];
    chatLog.innerHTML = "";
    currentChatId = Date.now().toString();
    updateHistoryList();

    toggleUI(true);
    try {
      conversationHistory.push({
        role: "user",
        parts: [
          {
            text: "こんにちは。あなたの役割定義に従って、最初の挨拶から対話を開始してください。",
          },
        ],
      });
      const aiMessage = await fetchAIResponse();
      processAIResponse(aiMessage);
    } catch (error) {
      console.error("Initial conversation error:", error);
      handleApiError(error);
    } finally {
      toggleUI(false);
    }
  };

  const loadChat = (chatId) => {
    voiceBot.stop();
    const savedHistory = getChatHistoryFromStorage(chatId);
    if (savedHistory) {
      conversationHistory = savedHistory;
      currentChatId = chatId;
      chatLog.innerHTML = "";
      conversationHistory.forEach((turn) => {
        if (!turn.parts[0].text.includes("あなたの役割定義に従って")) {
          addMessageToLog(
            turn.role === "model" ? "ai" : "user",
            turn.parts[0].text
          );
        }
      });
      updateHistoryList();
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  };

  const deleteChat = (chatId) => {
    if (
      confirm("この対話履歴を本当に削除しますか？この操作は元に戻せません。")
    ) {
      voiceBot.stop();
      localStorage.removeItem(`${CONFIG.HISTORY_KEY_PREFIX}${chatId}`);
      if (currentChatId === chatId) {
        startNewChat();
      } else {
        updateHistoryList();
      }
    }
  };

    // ★★★ ここからが今回の追加機能 ★★★
  const downloadChatHistory = () => {
    if (conversationHistory.length < 3) {
      alert("ダウンロードできる対話履歴がありません。");
      return;
    }

    let chatText = `AI博士との対話履歴 (${new Date().toLocaleString('ja-JP')})\n\n`;
    
    conversationHistory.forEach(turn => {
        // 最初のシステムへの指示は含めない
        if (turn.parts[0].text.includes("あなたの役割定義に従って")) {
            return;
        }

        const prefix = turn.role === 'model' ? 'AI博士：\n' : 'あなた：\n';
        const content = turn.parts[0].text;
        chatText += `${prefix}${content}\n\n--------------------------------\n\n`;
    });

    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const date = new Date();
    const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    a.download = `AI博士との対話_${formattedDate}.txt`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // ★★★ 追加機能ここまで ★★★

  const handleUserMessage = async () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    voiceBot.stop();
    addMessageToLog("user", userMessage);
    userInput.value = "";
    conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });
    saveCurrentChatToStorage();

    toggleUI(true);
    try {
      const aiMessage = await fetchAIResponse();
      processAIResponse(aiMessage);
    } catch (error) {
      console.error("Message sending error:", error);
      handleApiError(error);
    } finally {
      toggleUI(false);
    }
  };

  const handleApiError = (error) => {
    const errorMessage = error.message.includes("429")
      ? "AI博士へのリクエストが少し早すぎるようです。大変申し訳ありませんが、もう少しゆっくり話しかけていただけますか？1分ほど待ってから、再度お試しください。"
      : "申し訳ありません、通信エラーが発生しました。少し時間をおいてから、もう一度お試しください。";
    addMessageToLog("ai", errorMessage);
  };

  const initializeApp = () => {
    updateHistoryList();
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(CONFIG.HISTORY_KEY_PREFIX)
    );
    if (keys.length > 0) {
      const latestChatId = keys
        .sort()
        .pop()
        .replace(CONFIG.HISTORY_KEY_PREFIX, "");
      loadChat(latestChatId);
    } else {
      startNewChat();
    }

    sendBtn.addEventListener("click", handleUserMessage);
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserMessage();
      }
    });
    newChatBtn.addEventListener("click", startNewChat);
    downloadChatBtn.addEventListener("click", downloadChatHistory); // ★★★ イベントリスナーを追加 ★★★
    window.addEventListener("beforeunload", saveCurrentChatToStorage);
  };

  initializeApp();
});