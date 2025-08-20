document.addEventListener('DOMContentLoaded', function() {
    
    // --- グローバル変数定義 ---
    const slides = Array.from(document.querySelectorAll('.slide'));
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const slideCounter = document.getElementById('slideCounter');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    let currentAudio = null;

    // --- 関数定義 ---
    window.playAudio = function(audioId, event) {
        if (event) {
            event.stopPropagation();
        }
        const audio = document.getElementById(audioId);
        if (!audio) return;
        const playerIcon = document.querySelector(`[onclick^="playAudio('${audioId}'"]`);

        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            const playingIcon = document.querySelector('.audio-player.playing');
            if(playingIcon) playingIcon.classList.remove('playing');
        }

        if (audio.paused) {
            audio.play();
            if(playerIcon) playerIcon.classList.add('playing');
            currentAudio = audio;
        } else {
            audio.pause();
            audio.currentTime = 0;
            if(playerIcon) playerIcon.classList.remove('playing');
            currentAudio = null;
        }

        audio.onended = () => {
            if(playerIcon) playerIcon.classList.remove('playing');
            currentAudio = null;
        };
    }

    function stopAllAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            const playingIcon = document.querySelector('.audio-player.playing');
            if(playingIcon) playingIcon.classList.remove('playing');
            currentAudio = null;
        }
    }

    function goToSlide(slideIndex) {
        stopAllAudio();
        currentIndex = slideIndex;
        
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        const currentSlide = slides[currentIndex];
        if (currentSlide.classList.contains('quiz-slide')) {
            const feedback = currentSlide.querySelector('.quiz-feedback');
            if (feedback.style.display === 'none') {
                shuffleOptions(currentSlide);
            }
        }
        
        updateNav();
    }

    function updateNav() {
        if (!slides.length) return;
        const currentSlide = slides[currentIndex];
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === totalSlides - 1;

        if (currentSlide.classList.contains('quiz-slide')) {
            const feedback = currentSlide.querySelector('.quiz-feedback');
            if (feedback.style.display === 'none' || feedback.classList.contains('feedback-incorrect')) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'block';
            }
        } else {
            nextBtn.style.display = 'block';
        }

        if (slideCounter) {
            slideCounter.textContent = `${currentIndex + 1} / ${totalSlides}`;
        }
    }
    
    function shuffleOptions(quizSlide) {
        const optionsContainer = quizSlide.querySelector('.quiz-options');
        const options = Array.from(optionsContainer.children);
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        options.forEach(option => optionsContainer.appendChild(option));
    }

    window.resetQuiz = function(quizId) {
        const quizSlide = document.getElementById(quizId);
        if (!quizSlide) return;
        const feedbackElement = quizSlide.querySelector('.quiz-feedback');
        const options = quizSlide.querySelectorAll('.quiz-option');

        feedbackElement.style.display = 'none';
        options.forEach(option => {
            option.style.pointerEvents = 'auto';
        });
        shuffleOptions(quizSlide);
        updateNav();
    }
    
    function getExplanation(quizId) {
        const explanations = {
            quiz1: "その通り！AIは「人工知能」の略。データからルールを見つけ出すプログラムのことです。",
            quiz2: "正解です！リモコンの電源ボタンは、単純なオン・オフの信号を送るだけで、AIのような学習や判断はしていません。他の2つはAIが活躍しています。",
            quiz3: "AIは、たくさんのデータから「猫はこういう見た目だ」というルールを見つけ出すのが大得意。ゼロからのひらめきや身体的な感覚は、今のAIにはない人間ならではのものです。",
            quiz4: "過去の売上という「データ」から、「こういう時は、これが売れる」という「ルール」を見つけ出して、おすすめ（提案）することができます。",
            quiz5: "これがレッスン1で一番覚えてほしいこと。AIは魔法ではなく、たくさんのデータから賢くルールを見つけ出してくれる、便利な「プログラム」なんです。"
        };
        return explanations[quizId] || "解説はありません。";
    }
    
    window.checkAnswer = function(button) {
        stopAllAudio();
        const isCorrect = button.dataset.correct === "true";
        const quizSlide = button.closest(".quiz-slide");
        const feedbackElement = quizSlide.querySelector(".quiz-feedback");
        const options = quizSlide.querySelectorAll(".quiz-option");
        const quizId = quizSlide.id;

        options.forEach(option => option.style.pointerEvents = "none");

        if (isCorrect) {
            const isLastQuiz = quizId === "quiz5";
            const correctSound = document.getElementById(isLastQuiz ? "clearSound" : "correctSound");
            if (correctSound) correctSound.play();
            
            const buttonText = isLastQuiz ? "クリア！次のスライドへ" : "正解！次の問題へ";
            const explanation = getExplanation(quizId);
            
            feedbackElement.className = "quiz-feedback feedback-correct";
            feedbackElement.innerHTML = `
                <div class="feedback-title">🎉 正解！</div>
                <div class="feedback-explanation">
                    ${explanation}
                    <span class="audio-player" onclick="playAudio('explanation_${quizId}', event)"><i class="fas fa-volume-up"></i></span>
                </div>
                <button class="quiz-nav-button" onclick="document.getElementById('nextBtn').click()">
                    ${buttonText}
                </button>
            `;
        } else {
            const incorrectSound = document.getElementById("incorrectSound");
            if (incorrectSound) incorrectSound.play();
            
            feedbackElement.className = "quiz-feedback feedback-incorrect";
            feedbackElement.innerHTML = `
                <div class="feedback-title">🤔 おしい！</div>
                <div class="feedback-explanation">
                    もう一度考えてみましょう。
                    <span class="audio-player" onclick="playAudio('feedback_incorrect', event)"><i class="fas fa-volume-up"></i></span>
                </div>
                <button class="quiz-nav-button" onclick="resetQuiz('${quizId}')">
                    もう一度挑戦！
                </button>
            `;
        }
        feedbackElement.style.display = 'block';
        updateNav();
    }

    // --- イベントリスナー設定 ---
    
    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
            goToSlide(currentIndex + 1);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        }
    });

    // --- 初期化処理 ---
    goToSlide(0);
});