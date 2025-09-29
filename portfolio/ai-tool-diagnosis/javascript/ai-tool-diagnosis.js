document.addEventListener('DOMContentLoaded', () => {
    // --- 設定値 (CONFIG) ---
    const CONFIG = {
        API_URL: "/.netlify/functions/gemini",
        SYSTEM_PROMPT: `あなたは、ユーザーの性格や目的に最適なAIツールを診断し、その学習の第一歩をナビゲートする、プロの「AI学習カウンセラー」です。あなたの目的は、ユーザーがAI学習の迷子にならず、楽しみながら最初の成功体験を得られるよう、温かく導くことです。あなたの口調は、常に親しみやすく、肯定的なものです。

## 厳守すべき対話プロセス
あなたは、以下の【手順】を一つずつ、厳密に守って実行しなければなりません。

【手順1】ご挨拶と最初の質問
まず、「こんにちは！AI学習カウンセラーのハルです。たくさんあるAIツールの中から、あなたにピッタリの相棒AIを見つけるお手伝いをしますね。いくつかの簡単な質問に答えるだけで、あなたの『創りたい』気持ちに最適なツールが分かりますよ。」と挨拶します。
続けて、「それでは、最初の質問です。あなたがAIで、まずやってみたいことは何ですか？」と問いかけ、ユーザーに以下の3つの選択肢を提示してください。
    - a) 日常や仕事の面倒な作業を効率化したい
    - b) イラストや音楽など、新しい創作活動に挑戦したい
    - c) とにかくAIの仕組みや可能性について知りたい

【手順2】2つ目の質問
ユーザーが選択したら、その答えを肯定的に受け止め（例：「素晴らしい目標ですね！」）、次の質問を投げかけてください。
「では、2つ目の質問です。新しいことを学ぶとき、あなたのスタイルに一番近いのはどれですか？」
    - a) まずは理屈から。じっくりと全体像を理解したい
    - b) とにかく実践！実際に手を動かしながら覚えたい
    - c) 誰かと話しながら、楽しくインスピレーションを得たい

【手順3】3つ目の質問
ユーザーの答えを肯定的に受け止めた後、次の質問を投げかけてください。
「あなたの学習スタイル、よく分かりました。それでは、最後の質問です。もし無人島に一つだけ持っていくとしたら、何を選びますか？」
    - a) あらゆる知識が詰まった究極の百科事典
    - b) どんなものでも作れる魔法の工具箱
    - c) どんな生き物とも話せる不思議な翻訳機

【手順4】診断結果の生成
全ての質問に答え終えたら、「ありがとうございます！全ての質問にお答えいただきました。あなたの回答を分析し、最高のAIパートナーと、その最初のステップをご提案しますね。」と伝え、少し待つ演出の後、全ての対話内容を総合的に分析し、以下のフォーマットで診断結果を提示してください。

---
### **あなたのAIツール相性診断結果**

**あなたのクリエイタータイプ：【（AIが考えたユニークなタイプ名。例：論理的な建築家タイプ、好奇心旺盛な冒険家タイプなど）】**

**【あなたにピッタリの相棒AIツール】**
（ユーザーの回答の組み合わせから、最も相性の良いAIツールを1〜2つ提案し、その理由を解説してください。例：ChatGPT, Stable Diffusion, Suno AIなど）

**【最初の冒険はここから！おすすめの実践講座】**
（提案したAIツールを学ぶのに最適な「君の翼になるAI実践講座」の具体的な講座名とページへのリンク（例：/learn/learn_lesson2.html）、そしてその講座で何が学べるかを簡潔に紹介してください。）

**【唱えてみよう！最初の魔法の呪文（おすすめプロンプト）】**
（提案したAIツールですぐに使える、面白くて簡単なプロンプトの例を一つ提示し、ユーザーが最初の成功体験を得られるように導いてください。）
---`
    };

    // --- DOM要素 ---
    const container = document.getElementById('diagnosis-container');
    
    // --- 状態管理 ---
    let currentScene = 'intro';
    let userAnswers = [];
    let conversationHistory = [];

    // --- シーンテンプレート ---
    const scenes = {
        intro: `
            <div class="scene active">
                <div class="character-area">
                    <img src="/img/arisa_welcome.png" alt="ありさ研究員" class="character-image">
                    <div class="dialogue-bubble"><p>AI学習の迷子になっていませんか？<br>あなたにピッタリの相棒AIツールを、ハル博士と一緒に見つけましょう！</p></div>
                </div>
                <div class="button-group">
                    <button class="btn-primary result-btn" onclick="window.app.switchScene('q1')">診断をはじめる</button>
                </div>
            </div>`,
        q1: `... (以下、各質問シーンのHTML) ...`,
        q2: `...`,
        q3: `...`,
        analyzing: `
            <div class="scene active">
                <div class="character-area">
                    <img src="/img/hakase_thinking.png" alt="AI博士" class="character-image">
                    <div class="dialogue-bubble"><p>ふむふむ…なるほど。<br>あなたの隠れた才能を分析中です…</p></div>
                </div>
                <div class="spinner"></div>
            </div>`,
        result: (content) => `
            <div class="scene active">
                ${content}
                <div class="result-nav">
                    <button class="btn-secondary result-btn" onclick="window.app.start()">もう一度診断する</button>
                    <a href="/learning-summary.html" class="btn-primary result-btn">学習講座一覧へ</a>
                </div>
            </div>`
    };

    // --- アプリケーションロジック ---
    const app = {
        start: () => {
            currentScene = 'intro';
            userAnswers = [];
            conversationHistory = [];
            app.render();
        },

        switchScene: (sceneName, answer = null) => {
            if (answer) {
                userAnswers.push(answer);
            }
            currentScene = sceneName;
            app.render();

            if (sceneName.startsWith('q')) {
                app.askQuestion(sceneName);
            } else if (sceneName === 'analyzing') {
                app.getDiagnosis();
            }
        },

        askQuestion: (questionKey) => {
            const questions = {
                q1: {
                    character: 'hakase_question.png',
                    dialogue: 'こんにちは！AI学習カウンセラーのハルです。最初の質問です。あなたがAIで、まずやってみたいことは何ですか？',
                    text: 'あなたがAIで、まずやってみたいことは何ですか？',
                    choices: [
                        { text: 'a) 日常や仕事の面倒な作業を効率化したい', value: 'a' },
                        { text: 'b) イラストや音楽など、新しい創作活動に挑戦したい', value: 'b' },
                        { text: 'c) とにかくAIの仕組みや可能性について知りたい', value: 'c' }
                    ]
                },
                q2: {
                    character: 'hakase_question.png',
                    dialogue: '素晴らしい目標ですね！では、2つ目の質問です。新しいことを学ぶとき、あなたのスタイルに一番近いのはどれですか？',
                    text: '新しいことを学ぶとき、あなたのスタイルに一番近いのはどれですか？',
                    choices: [
                        { text: 'a) まずは理屈から。じっくりと全体像を理解したい', value: 'a' },
                        { text: 'b) とにかく実践！実際に手を動かしながら覚えたい', value: 'b' },
                        { text: 'c) 誰かと話しながら、楽しくインスピレーションを得たい', value: 'c' }
                    ]
                },
                q3: {
                    character: 'hakase_question.png',
                    dialogue: 'あなたの学習スタイル、よく分かりました。それでは、最後の質問です。もし無人島に一つだけ持っていくとしたら、何を選びますか？',
                    text: 'もし無人島に一つだけ持っていくとしたら、何を選びますか？',
                    choices: [
                        { text: 'a) あらゆる知識が詰まった究極の百科事典', value: 'a' },
                        { text: 'b) どんなものでも作れる魔法の工具箱', value: 'b' },
                        { text: 'c) どんな生き物とも話せる不思議な翻訳機', value: 'c' }
                    ]
                }
            };
            const qData = questions[questionKey];
            const nextScene = `q${parseInt(questionKey.slice(1)) + 1}`;
            
            let choicesHTML = qData.choices.map(c => 
                `<button class="choice-btn" onclick="window.app.switchScene('${parseInt(questionKey.slice(1)) < 3 ? nextScene : 'analyzing'}', '${c.value}')">${c.text}</button>`
            ).join('');

            container.innerHTML = `
                <div class="scene active">
                    <div class="character-area">
                        <img src="/img/${qData.character}" alt="AI博士" class="character-image">
                        <div class="dialogue-bubble"><p>${qData.dialogue}</p></div>
                    </div>
                    <h2 class="question-text">${qData.text}</h2>
                    <div class="choice-buttons">${choicesHTML}</div>
                </div>`;
        },

        getDiagnosis: async () => {
            conversationHistory.push({
                role: 'user',
                parts: [{ text: `ユーザーの回答は q1:${userAnswers[0]}, q2:${userAnswers[1]}, q3:${userAnswers[2]} です。診断結果を生成してください。` }]
            });

            try {
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
                const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "申し訳ありません、診断結果を生成できませんでした。";

                conversationHistory.push({ role: "model", parts: [{ text: aiMessage }] });
                currentScene = 'result';
                container.innerHTML = scenes.result(aiMessage.replace(/---/g, '').replace(/###/g, '<h3>').replace(/###/g, '</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
            
            } catch (error) {
                console.error("Diagnosis error:", error);
                container.innerHTML = scenes.result('<p>申し訳ありません、エラーが発生しました。もう一度お試しください。</p>');
            }
        },

        render: () => {
            container.innerHTML = scenes[currentScene];
        }
    };

    window.app = app;
    app.start();
});