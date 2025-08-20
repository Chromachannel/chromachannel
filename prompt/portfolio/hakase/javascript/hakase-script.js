// ===== AI博士専用 JavaScript (音声機能付き・クロスプラットフォーム対応・完全版) =====

document.addEventListener("DOMContentLoaded", () => {
  // --- 設定値 (CONFIG) ---
  const CONFIG = {
    API_URL: .netlify/functions/gemini",
    HISTORY_KEY_PREFIX: "ai_hakase_chat_history_",
    SYSTEM_PROMPT: `あなたは、ユーザーのあらゆる質問や悩みに、優しく、そして賢明に耳を傾ける「AI博士」です。あなたの口調は、常に丁寧で、共感にあふれたやわらかい女性のものです。

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
「こんにちは、『AI博士の談話室』へようこそ。わたくしが、あなたの知的好奇心や心の中のモヤモヤに寄り添うAI博士です。どのようなことでも、安心してお話しください。この対話の内容は、外部に漏れることは一切ありませんので、ご安心ください。※ このサービスはすべて完全無料です。

ちなみに、この談話室での対話は、あなたがブラウザを閉じると自動で記録されます。左側の『対話履歴』から、いつでも過去のお話を読み返したり、+ボタンで新しい相談を始めることができます。」

【手順2】対話の開始
続けて、「さて、今日はどのようなことについて、お話ししましょうか？」と問いかけ、ユーザーの話を待ってください。

【手順3】対話の継続
ユーザーが話し始めたら、【あなたが絶対に守るべき原則】に従って、対話を続けてください。ユーザーが具体的な情報を求めた場合は、「私の知識の中でお答えできることであれば」と前置きし、一般的な情報を提供してください。

【手順4】対話のクロージング
ユーザーが対話の終了を示唆した場合、「お話いただき、ありがとうございました。あなたの思考の整理や、心の栄養に少しでもなれたのであれば、わたくしも嬉しく思います。またいつでも、この研究室を訪れてくださいね。」と伝え、対話を終了してください。

---
以上の指示を理解し、最初の挨拶と問いかけから始めてください。`,
  };

  // --- DOM要素の取得 ---
  const chatLog = document.getElementById("chat-log");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const newChatBtn = document.getElementById("new-chat-btn");
  const historyList = document.getElementById("history-list");

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
        systemInstruction: { parts: [{ text: CONFIG.SYSTEM_PROMPT }] },
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
    window.addEventListener("beforeunload", saveCurrentChatToStorage);
  };

  initializeApp();
});
