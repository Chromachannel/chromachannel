document.addEventListener('DOMContentLoaded', () => {
    // --- 変数定義 ---
    const items = [
        { id: '🍎', category: 'くだもの' }, { id: '🍌', category: 'くだもの' },
        { id: '🍇', category: 'くだもの' }, { id: '🐶', category: 'どうぶつ' },
        { id: '🐱', category: 'どうぶつ' }, { id: '🐘', category: 'どうぶつ' },
        { id: '🍓', category: 'くだもの' }, { id: '🦁', category: 'どうぶつ' },
    ];
    let learnedData = {}; // AIが学習したデータを保存する場所
    let currentItem = null;
    let islearnMode = true;
    let score = 0;

    // --- DOM要素の取得 ---
    const itemSourceEl = document.getElementById('item-source');
    const dropZones = document.querySelectorAll('.drop-zone');
    const feedbackEl = document.getElementById('ai-feedback');
    const modeTextEl = document.getElementById('mode-text');
    const scoreEl = document.getElementById('score');
    const switchModeBtn = document.getElementById('switch-mode-btn');
    const resetBtn = document.getElementById('reset-btn');

    // --- 関数定義 ---
    function showNextItem() {
        const randomIndex = Math.floor(Math.random() * items.length);
        currentItem = items[randomIndex];
        itemSourceEl.textContent = currentItem.id;
    }

    function updateFeedback(text, isCorrect = null) {
        feedbackEl.textContent = text;
        if (isCorrect === true) {
            feedbackEl.style.backgroundColor = '#d4edda'; // 正解の色
        } else if (isCorrect === false) {
            feedbackEl.style.backgroundColor = '#f8d7da'; // 不正解の色
        } else {
            feedbackEl.style.backgroundColor = '#e9ecef'; // 通常の色
        }
    }
    
    function updateScore() {
        scoreEl.textContent = score;
    }
    
    function resetGame() {
        learnedData = {};
        islearnMode = true;
        score = 0;
        updateScore();
        switchModeBtn.textContent = 'テストモードに切り替え';
        switchModeBtn.classList.remove('testing');
        modeTextEl.textContent = '学習モード';
        updateFeedback('記憶をリセットしたよ！また最初から教えてね！');
        showNextItem();
    }

    // --- イベントリスナー ---

    if (itemSourceEl) { // 要素が存在する場合のみリスナーを設定
        itemSourceEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', currentItem.id);
        });
    }

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const droppedItem = e.dataTransfer.getData('text/plain');
            const targetCategory = zone.dataset.category;

            if (islearnMode) {
                learnedData[droppedItem] = targetCategory;
                updateFeedback(`「${droppedItem}」は「${targetCategory}」だね！覚えたよ！`, true);
            } else {
                if (learnedData[droppedItem]) {
                    if (learnedData[droppedItem] === targetCategory) {
                        updateFeedback('知ってる！これは「' + targetCategory + '」だ！正解！', true);
                        score++;
                    } else {
                        updateFeedback('あれ？「' + learnedData[droppedItem] + '」だと思ってた…間違い？', false);
                        score--;
                    }
                } else {
                    updateFeedback('うーん…「' + droppedItem + '」は知らないなあ。教えてほしいな。', false);
                }
                updateScore();
            }
            
            setTimeout(showNextItem, 1500);
        });
    });

    if (switchModeBtn) {
        switchModeBtn.addEventListener('click', () => {
            islearnMode = !islearnMode;
            if (islearnMode) {
                modeTextEl.textContent = '学習モード';
                switchModeBtn.textContent = 'テストモードに切り替え';
                switchModeBtn.classList.remove('testing');
                updateFeedback('学習モードに戻ったよ！もっと色々教えて！');
            } else {
                modeTextEl.textContent = 'テストモード';
                switchModeBtn.textContent = '学習モードに戻る';
                switchModeBtn.classList.add('testing');
                updateFeedback('テストモード開始！僕の実力を見ててね！');
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }

    // --- ゲーム開始 ---
    if (itemSourceEl) {
        showNextItem();
    }
});