document.addEventListener('DOMContentLoaded', () => {
    // --- 要素の取得 ---
    const scenes = {
        start: document.getElementById('scene-start'),
        select: document.getElementById('scene-select'),
        supervised: document.getElementById('scene-supervised'),
        unsupervised: document.getElementById('scene-unsupervised'),
        result: document.getElementById('scene-result'),
    };

    const baby = {
        start: document.getElementById('baby-start'),
        supervised: document.getElementById('baby-supervised'),
        unsupervised: document.getElementById('baby-unsupervised'),
    };

    const thoughts = {
        supervised: document.getElementById('thought-supervised'),
        unsupervised: document.getElementById('thought-unsupervised'),
    };

    const dataContainers = {
        supervised: document.getElementById('supervised-data'),
        unsupervised: document.getElementById('unsupervised-data'),
    };

    const resultContent = document.getElementById('result-content');

    const dataItems = [
        { name: 'りんご', emoji: '🍎', group: 'A' },
        { name: 'みかん', emoji: '🍊', group: 'B' },
    ];

    let learningCount = 0;

    // --- 関数定義 ---

    function switchScene(sceneName) {
        Object.values(scenes).forEach(scene => scene.classList.remove('active'));
        if (scenes[sceneName]) {
            scenes[sceneName].classList.add('active');
        }
    }

    function updateThought(mode, text, emoji) {
        if (thoughts[mode] && baby[mode]) {
            thoughts[mode].textContent = text;
            baby[mode].textContent = emoji;
            baby[mode].style.transform = 'scale(1.1)';
            setTimeout(() => {
                baby[mode].style.transform = 'scale(1)';
            }, 300);
        }
    }

    function setupSupervisedlearning() {
        learningCount = 0;
        dataContainers.supervised.innerHTML = '';
        dataItems.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('data-item');
            div.textContent = item.emoji;
            div.dataset.name = item.name;
            div.addEventListener('click', handleSupervisedClick);
            dataContainers.supervised.appendChild(div);
        });
        updateThought('supervised', 'これは...なに？', '🤔');
    }
    
    function handleSupervisedClick(event) {
        const selectedName = event.target.dataset.name;
        updateThought('supervised', `ふむふむ、これは「${selectedName}」なんだ！`, '💡');
        learningCount++;
        if (learningCount >= dataItems.length) {
            setTimeout(() => showResult('supervised'), 1500);
        }
    }

    function setupUnsupervisedlearning() {
        dataContainers.unsupervised.innerHTML = '';
        const allToys = [...dataItems, ...dataItems, ...dataItems, ...dataItems].sort(() => 0.5 - Math.random());
        allToys.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('data-item');
            div.textContent = item.emoji;
            dataContainers.unsupervised.appendChild(div);
        });
        updateThought('unsupervised', 'ふむふむ...なんとなく、仲間わけできそう...', '🧐');
        setTimeout(() => showResult('unsupervised'), 2500);
    }

    function showResult(mode) {
        let html = '';
        if (mode === 'supervised') {
            html = `
                <div class="description">
                    <h3>【教師あり学習の結果】</h3>
                    <p>あなたは先生として、AIに「りんご」と「みかん」それぞれの正解を教えました。</p>
                    <p>その結果、AIは<strong>「名前（ラベル）とその特徴」を関連付けて学習</strong>し、新しいりんごを見ても「これはりんごだ！」と正確に判断できる賢い子になりました！</p>
                </div>
                <div class="ai-area">
                    <div class="ai-baby">🎓</div>
                    <p class="ai-thought">僕はもう、りんごとみかんを見分けられるよ！</p>
                </div>
            `;
        } else {
            html = `
                <div class="description">
                    <h3>【教師なし学習の結果】</h3>
                    <p>あなたはAIを見守り、ただたくさんのおもちゃを与えました。正解は教えていません。</p>
                    <p>その結果、AIは自分なりに考えて、<strong>見た目の特徴だけで「赤くて丸いグループ」と「オレンジで丸いグループ」に仲間分け</strong>しました。名前は分かりませんが、分類はできる子になりました！</p>
                </div>
                <div class="ai-area">
                    <div class="ai-baby">🧩</div>
                    <p class="ai-thought">名前はわからないけど、こっちとこっちは仲間だね！</p>
                </div>
            `;
        }
        resultContent.innerHTML = html;
        switchScene('result');
    }

    // --- イベントリスナー ---
    const startBtn = document.getElementById('start-btn');
    const selectSupervisedBtn = document.getElementById('select-supervised');
    const selectUnsupervisedBtn = document.getElementById('select-unsupervised');
    const restartBtn = document.getElementById('restart-btn');

    if (startBtn) startBtn.addEventListener('click', () => switchScene('select'));
    if (selectSupervisedBtn) selectSupervisedBtn.addEventListener('click', () => {
        setupSupervisedlearning();
        switchScene('supervised');
    });
    if (selectUnsupervisedBtn) selectUnsupervisedBtn.addEventListener('click', () => {
        setupUnsupervisedlearning();
        switchScene('unsupervised');
    });
    if (restartBtn) restartBtn.addEventListener('click', () => {
        switchScene('start');
        if (baby.start) {
            baby.start.textContent = '👶';
            const startThought = baby.start.nextElementSibling;
            if (startThought) startThought.textContent = '（...なにもわからない...）';
        }
    });
});