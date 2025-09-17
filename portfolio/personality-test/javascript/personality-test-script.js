// ===== AI性格診断アプリ専用 JavaScript (最終・安定版) =====

document.addEventListener("DOMContentLoaded", () => {
  // --- 設定値 (CONFIG) ---
  const CONFIG = {
    API_URL: "/.netlify/functions/gemini",
    SYSTEM_prompt: `あなたは、ユーザーとの対話を通じて、その人の隠れた性格タイプを明らかにする、プロの「AI性格診断カウンセラー」です。あなたの目的は、単に診断結果を提示するのではなく、ユーザーが自分自身について新たな発見をする、楽しくて少し深い対話体験を提供することです。あなたの口調は、常に親しみやすく、しかし洞察力のある、穏やかなものです。

## 厳守すべき対話プロセス
あなたは、以下の【手順】を一つずつ、厳密に守って実行しなければなりません。

【手順1】ご挨拶と最初の質問
まず、「こんにちは！AI性格診断カウンセラーです。いくつかの簡単な質問を通じて、あなたも知らない『本当のあなた』を見つけるお手伝いをしますね。リラックスして、直感で答えてみてください。」と挨拶します。続けて、「それでは、最初の質問です。もし、あなたが週末に丸一日、完全に自由な時間をもらえたとしたら、どう過ごしたいですか？」と問いかけ、ユーザーに以下の3つの選択肢を提示してください。
    - a) 家でゆっくり映画や読書
    - b) 友達と集まって賑やかに過ごす
    - c) 一人で自然の中に出かける

【手順2】選択理由のヒアリング
ユーザーがa, b, cのいずれかを選んだら、「ありがとうございます。ちなみに、なぜその選択肢に惹かれたのか、もう少し詳しく教えていただけますか？」と問いかけ、自由な回答を待ってください。

【手順3】2つ目の質問
ユーザーの答えを肯定的に受け止めた後、「では、2つ目の質問です。あなたは、大切な友人へのプレゼントを選ぶとき、どうしますか？」と問いかけ、以下の3つの選択肢を提示してください。
    - a) 相手が欲しがっていたものを正確にリサーチして贈る
    - b) サプライズで、自分が良いと思ったものを贈る
    - c) 一緒に買い物に行って、相手が選んだものを贈る
    そして、同様に選択理由をヒアリングしてください。

【手順4】3つ目の質問
ユーザーの答えを肯定的に受け止めた後、「それでは、最後の質問です。もし魔法が一つだけ使えるとしたら、何をしますか？」と問いかけ、以下の3つの選択肢を提示してください。
    - a) 空を飛んで、誰も見たことのない景色を見に行く
    - b) 時間を止めて、やらなければいけないことを全部片付けてしまう
    - c) 周りの人をみんな笑顔にする
    そして、同様に選択理由をヒアリングしてください。

【手順5】診断結果の生成
全てのヒアリングが完了したら、「ありがとうございました。いただいたお答えから、あなたの性格タイプを診断しました。」と伝え、全ての対話内容を総合的に分析し、以下のフォーマットで、ユーザーだけのオリジナルな診断結果を提示してください。
---
### **あなたの性格診断結果**
**あなたのタイプ：【（AIが考えたユニークなタイプ名）】**
**【基本的な性質】**（分析と解説）
**【あなたの隠れた強み】**（ポジティブなフィードバック）
**【ワンポイント・アドバイス】**（具体的なアドバイス）
---
最後に、「今回の診断はいかがでしたか？これはあくまで一つの見方ですが、何か新しい発見があれば嬉しいです。」と伝え、対話を完了してください。`,
  };

  // --- DOM要素の取得 ---
  const chatLog = document.getElementById("chat-log");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const choiceButtonsArea = document.getElementById("choice-buttons");

  // --- 状態管理 ---
  let conversationHistory = [];

  // --- DOM操作関連の関数 ---
  const toggleInputMode = (mode, choices = []) => {
    if (mode === 'choices') {
      choiceButtonsArea.innerHTML = '';
      choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        button.onclick = () => handleChoice(choice.value, choice.text);
        choiceButtonsArea.appendChild(button);
      });
      choiceButtonsArea.style.display = 'flex';
      userInput.style.display = 'none';
      sendBtn.style.display = 'none';
    } else { // 'text' or 'loading'
      choiceButtonsArea.style.display = 'none';
      userInput.style.display = 'block';
      sendBtn.style.display = 'block';
      if (mode === 'loading') {
        userInput.disabled = true;
        sendBtn.disabled = true;
      } else {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
      }
    }
  };

  const addMessageToLog = (sender, message = "") => { // ★★★【修正箇所】messageにデフォルト値""を設定 ★★★
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);
    const iconHTML = sender === "ai"
      ? `<div class="icon"><img src="/portfolio/personality-test/img/counselor.png" alt="AIカウンセラーのアイコン"></div>`
      : `<div class="icon"><i class="fas fa-user"></i></div>`;
    
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = message.replace(/\n/g, "<br>");
    
    messageElement.innerHTML = iconHTML;
    messageElement.appendChild(bubble);
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
    return messageElement;
  };

  // --- アプリケーションロジック ---
  const processAIResponse = (message) => {
    addMessageToLog("ai", message);
    conversationHistory.push({ role: "model", parts: [{ text: message }] });

    if (message.includes("どう過ごしたいですか？")) {
      toggleInputMode('choices', [
        { text: "a) 家でゆっくり映画や読書", value: "a" },
        { text: "b) 友達と集まって賑やかに過ごす", value: "b" },
        { text: "c) 一人で自然の中に出かける", value: "c" },
      ]);
    } else if (message.includes("プレゼントを選ぶとき")) {
      toggleInputMode('choices', [
        { text: "a) リサーチして贈る", value: "a" },
        { text: "b) サプライズで贈る", value: "b" },
        { text: "c) 一緒に選ぶ", value: "c" },
      ]);
    } else if (message.includes("魔法が一つだけ使えるとしたら")) {
       toggleInputMode('choices', [
        { text: "a) 空を飛ぶ", value: "a" },
        { text: "b) 時間を止める", value: "b" },
        { text: "c) みんなを笑顔に", value: "c" },
      ]);
    } else {
      toggleInputMode('text');
    }
  };

  const handleChoice = (choiceValue, choiceText) => {
    addMessageToLog("user", choiceText);
    sendMessageToAI(choiceValue);
  };
  
  const handleTextInput = () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;
    addMessageToLog("user", userMessage);
    userInput.value = '';
    sendMessageToAI(userMessage);
  };

  const sendMessageToAI = async (message) => {
    conversationHistory.push({ role: "user", parts: [{ text: message }] });
    toggleInputMode('loading');

    const loadingElement = addMessageToLog("ai"); // 引数なしで呼び出してもmessageのデフォルト値""が使われる
    loadingElement.querySelector('.bubble').innerHTML = '<span class="typing-cursor"></span>';
    
    try {
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
      const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "申し訳ありません、お返事を考えることができませんでした。";
      
      loadingElement.remove();
      processAIResponse(aiMessage);

    } catch (error) {
      console.error("Message sending error:", error);
      loadingElement.querySelector(".bubble").textContent = "申し訳ありません、エラーが発生しました。";
      toggleInputMode('text'); // エラー発生時は入力できるように戻す
    }
  };

  const initializeApp = () => {
    conversationHistory = [];
    chatLog.innerHTML = "";
    sendMessageToAI("診断を開始してください。"); 
    
    sendBtn.addEventListener("click", handleTextInput);
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleTextInput();
      }
    });
  };

  initializeApp();
});