document.addEventListener('DOMContentLoaded', () => {

    // --- サイト共通の機能 ---

    // ヘッダーとフッターを読み込んでから各種機能を初期化するメイン関数
    const loadComponentsAndInit = async () => {
        // コンポーネントを読み込む関数
        const loadComponent = async (id, url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                const text = await response.text();
                const element = document.getElementById(id);
                if (element) {
                    element.innerHTML = text;
                }
            } catch (error) {
                console.error('Component load error:', error);
            }
        };

        // ヘッダーとフッターの非同期読み込みを待つ
        await Promise.all([
            loadComponent('header-placeholder', '/header.html'),
            loadComponent('footer-placeholder', '/footer.html')
        ]);

        // ▼▼▼ ヘッダー/フッター読み込み完了後に実行する処理 ▼▼▼
        initMobileMenu();
        initHeaderScrollEffect();
        initActiveNavLinks(); // アクティブなナビゲーションリンクをハイライトする関数を追加
    };

    const initMobileMenu = () => {
        const toggleButton = document.querySelector('.mobile-nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (toggleButton && navLinks) {
            toggleButton.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                toggleButton.classList.toggle('active');
            });
        }
    };

    const initScrollAnimation = () => {
        const fadeInElements = document.querySelectorAll('.fade-in');
        if (fadeInElements.length === 0) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        fadeInElements.forEach(el => observer.observe(el));
    };

    const initHeaderScrollEffect = () => {
        const header = document.querySelector('.site-header');
        if (!header) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    };
    
    // 現在のページに応じてナビゲーションリンクをハイライトする関数
    const initActiveNavLinks = () => {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            // href属性からファイル名を取得
            const linkPath = new URL(link.href).pathname;
            
            // トップページ(index.html)の場合、または他のページでパスが一致する場合
            if ((currentPath === '/' || currentPath.endsWith('/index.html')) && (linkPath === '/' || linkPath.endsWith('/index.html'))) {
                 link.classList.add('nav-active');
            } else if (linkPath !== '/' && !linkPath.endsWith('/index.html') && currentPath.includes(linkPath)) {
                link.classList.add('nav-active');
            }
        });
    };

    const initGalleryToggle = () => {
        const toggleButtons = document.querySelectorAll('.gallery-toggle-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const portfolioCard = button.closest('.portfolio-card');
                const galleryWrapper = portfolioCard.querySelector('.thumbnail-gallery-wrapper');
                if (galleryWrapper) {
                    galleryWrapper.classList.toggle('open');
                    button.innerHTML = galleryWrapper.classList.contains('open') ?
                        '<i class="fas fa-times-circle"></i> ギャラリーを閉じる' :
                        '<i class="fas fa-images"></i> ギャラリーを見る';
                }
            });
        });
    };

    const initPromptCopy = () => {
        const promptLists = document.querySelectorAll('.prompt-list');
        if (promptLists.length === 0) return;

        promptLists.forEach(promptList => {
            promptList.addEventListener('click', (e) => {
                const copyButton = e.target.closest('.copy-btn');
                if (!copyButton || copyButton.classList.contains('copied')) return;
                
                const promptBox = copyButton.closest('.prompt-box');
                if (!promptBox) return;

                const textElement = promptBox.querySelector('.prompt-text');
                if (!textElement) return;
                
                const codeElement = textElement.querySelector('code');
                const textToCopy = codeElement ? codeElement.innerText : textElement.innerText;
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = copyButton.innerHTML;
                    copyButton.classList.add('copied');
                    copyButton.innerHTML = '<i class="fas fa-check"></i> コピー完了';
                    setTimeout(() => {
                        copyButton.classList.remove('copied');
                        copyButton.innerHTML = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('クリップボードへのコピーに失敗しました: ', err);
                    alert('コピーに失敗しました。');
                });
            });
        });
    };
    
    const initPortfolioModal = () => {
        // この機能は現在サイトでは使われていないようですが、将来のためにコードは残しておきます。
        // もしモーダル用のHTMLが存在すれば、この関数が動作します。
        const modal = document.getElementById('portfolio-modal');
        if (!modal) return;
        // ... (以下、モーダル関連のロジックが続く) ...
    };
    
    const initFilter = () => {
        const categoryFilters = document.getElementById('category-filters');
        const levelFilters = document.getElementById('level-filters');
        if (!categoryFilters && !levelFilters) return;

        const items = document.querySelectorAll('.portfolio-item');
        let currentCategory = 'all';
        let currentLevel = 'all';

        const applyFilters = () => {
            items.forEach(item => {
                const itemCategories = item.dataset.category ? item.dataset.category.split(' ') : [];
                const itemLevel = item.dataset.level || 'all';

                const categoryMatch = currentCategory === 'all' || itemCategories.includes(currentCategory);
                const levelMatch = currentLevel === 'all' || itemLevel === currentLevel;

                item.style.display = (categoryMatch && levelMatch) ? 'block' : 'none';
            });
        };

        if (categoryFilters) {
            categoryFilters.addEventListener('click', (e) => {
                const button = e.target.closest('.category-btn');
                if (!button) return;
                currentCategory = button.dataset.category;
                categoryFilters.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                if (levelFilters) {
                    levelFilters.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                    levelFilters.querySelector('[data-level="all"]').classList.add('active');
                    currentLevel = 'all';
                }
                applyFilters();
            });
        }

        if (levelFilters) {
            levelFilters.addEventListener('click', (e) => {
                const button = e.target.closest('.category-btn');
                if (!button) return;
                currentLevel = button.dataset.level;
                levelFilters.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                if (categoryFilters) {
                    categoryFilters.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                    categoryFilters.querySelector('[data-category="all"]').classList.add('active');
                    currentCategory = 'all';
                }
                applyFilters();
            });
        }
    };
    
// --- サイトワイド音声合成機能の初期化（親要素と子要素のdata-speech両対応版） ---
    const initSiteWideSpeech = () => {
        setTimeout(() => {
            // voice-module.jsの読み込みを待つ
            if (typeof SiteWideSpeaker === 'undefined' || !window.siteSpeaker || window.siteSpeaker.isLoading) {
                setTimeout(initSiteWideSpeech, 200);
                return;
            }

            // 読み上げ対象となる可能性のある要素をすべて取得
            const readableElements = document.querySelectorAll(
                '.article-content p, .article-content h2, .article-content h3, .article-content li, ' +
                '.lesson-content p, .lesson-content h2, .lesson-content h3, .lesson-content li, ' +
                '.novel-content p, .novel-content h2, .readable'
            );

            readableElements.forEach(el => {
                // 空の要素や、特定のクラスを持つ要素、既にボタンがある要素はスキップ
                if (el.textContent.trim() === '' || el.classList.contains('post-card-category') || el.classList.contains('article-meta') || el.querySelector('.speech-button')) {
                    return;
                }

                const playBtn = document.createElement('button');
                playBtn.className = 'speech-button';
                playBtn.innerHTML = '<i class="fas fa-volume-up" style="font-size: 12px;"></i>';
                playBtn.title = 'この部分を読み上げる';
                
                playBtn.addEventListener('click', (e) => {
                    e.preventDefault();  // リンクへ飛ぶなどのデフォルト動作をキャンセル
                    e.stopPropagation(); // 親要素（<a>タグなど）へのイベント伝播をストップ
                    
                    // ▼▼▼ ここからが新しいロジックです ▼▼▼

                    let finalTextToSpeak;

                    // パターン1：読み上げ対象の要素自身がdata-speech属性を持っているか？
                    if (el.dataset.speech) {
                        // 持っていれば、そのテキストを最優先で採用
                        finalTextToSpeak = el.dataset.speech;
                    } else {
                        // パターン2：持っていなければ、これまで通りの「子要素のdata-speechを探す」処理を実行
                        const elementForSpeech = el.cloneNode(true);
                        
                        const buttonToRemove = elementForSpeech.querySelector('.speech-button');
                        if (buttonToRemove) buttonToRemove.remove();

                        const speechSpans = elementForSpeech.querySelectorAll('[data-speech]');
                        speechSpans.forEach(span => {
                            span.textContent = span.dataset.speech;
                        });
                        
                        finalTextToSpeak = elementForSpeech.textContent.trim();
                    }
                    
                    // ▲▲▲ ここまで ▲▲▲

                    window.siteSpeaker.speak(finalTextToSpeak, el);
                });

                el.appendChild(playBtn);
            });

        }, 100);
    };

    // --- サイト全体の機能を初期化して実行 ---
    
    // まず、コンポーネント（ヘッダー/フッター）を読み込み、それに依存する機能を初期化
    loadComponentsAndInit();

    // 次に、コンポーネントに依存しない、各ページで必要な機能を初期化
    initScrollAnimation();
    initGalleryToggle();
    initPromptCopy();
    initPortfolioModal();
    initFilter();
    
    // 最後に、サイトワイド音声合成機能を初期化（voice-module.jsの読み込みを待つため、少し遅延させる）
    initSiteWideSpeech();

});