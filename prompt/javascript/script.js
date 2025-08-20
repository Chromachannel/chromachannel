document.addEventListener('DOMContentLoaded', () => {

    // --- サイト共通の機能 ---

    const loadComponentsAndInit = async () => {
        // コンポーネントを読み込む関数（パス自動調整機能付き）
        const loadComponent = async (id, url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                let text = await response.text();
                const element = document.getElementById(id);
                
                if (element) {
                    // 現在のページの階層を判断
                    const pagePath = window.location.pathname;
                    const depth = (pagePath.match(/\//g) || []).length - 1;

                    // ルートディレクトリ以外の場合（例: /blog/ や /portfolio/Fuwamoco/）
                    if (depth > 0) {
                        // / を階層の数だけ先頭に追加する
                        const prefix = '/'.repeat(depth);
                        
                        // HTML内の src="/..." や href="/..." といったルートパスを、
                        // 正しい相対パスに自動で書き換える
                        text = text.replace(/(src="|href=")\//g, `$1${prefix}`);
                    }

                    element.innerHTML = text;
                }
            } catch (error) {
                console.error('Component load error:', error);
            }
        };

        await Promise.all([
            loadComponent('header-placeholder', '/header.html'),
            loadComponent('footer-placeholder', '/footer.html')
        ]);

        initMobileMenu();
        initHeaderScrollEffect();
        initActiveNavLinks();
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
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    };
    
    const initActiveNavLinks = () => {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            const isHomePage = (currentPath === '/' || currentPath.endsWith('/index.html'));
            const isLinkToHome = (linkPath === '/' || linkPath.endsWith('/index.html'));
            if (isHomePage && isLinkToHome) {
                link.classList.add('nav-active');
            } else if (!isLinkToHome && currentPath.includes(linkPath.substring(1))) { // substring(1)で先頭の'/'を除く
                link.classList.add('nav-active');
            }
        });
    };

    const initGalleryToggle = () => {
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('.gallery-toggle-btn');
            if (!button) return;
            const portfolioCard = button.closest('.portfolio-card');
            const galleryWrapper = portfolioCard.querySelector('.thumbnail-gallery-wrapper');
            if (galleryWrapper) {
                galleryWrapper.classList.toggle('open');
                button.innerHTML = galleryWrapper.classList.contains('open') ?
                    '<i class="fas fa-times-circle"></i> ギャラリーを閉じる' :
                    '<i class="fas fa-images"></i> ギャラリーを見る';
            }
        });
    };

    const initpromptCopy = () => {
        document.body.addEventListener('click', (e) => {
            const copyButton = e.target.closest('.copy-btn');
            if (!copyButton || copyButton.classList.contains('copied')) return;
            const promptBox = copyButton.closest('.prompt-box');
            if (!promptBox) return;
            const textElement = promptBox.querySelector('.prompt-text');
            if (!textElement) return;
            const textToCopy = textElement.innerText;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyButton.innerHTML;
                copyButton.classList.add('copied');
                copyButton.innerHTML = '<i class="fas fa-check"></i> コピー完了';
                setTimeout(() => {
                    copyButton.classList.remove('copied');
                    copyButton.innerHTML = originalText;
                }, 2000);
            }).catch(err => console.error('クリップボードへのコピーに失敗しました: ', err));
        });
    };
    
    const initFilter = () => {
        const filterContainer = document.querySelector('.portfolio-categories, #level-filters');
        if (!filterContainer) return;

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
        
        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('.category-btn');
            if (!button) return;

            const parentId = button.parentElement.id;
            if (parentId === 'category-filters') {
                currentCategory = button.dataset.category;
                document.querySelectorAll('#category-filters .category-btn').forEach(btn => btn.classList.remove('active'));
                const levelAllBtn = document.querySelector('#level-filters [data-level="all"]');
                if(levelAllBtn) levelAllBtn.click();
            } else if (parentId === 'level-filters') {
                currentLevel = button.dataset.level;
                 document.querySelectorAll('#level-filters .category-btn').forEach(btn => btn.classList.remove('active'));
                 const categoryAllBtn = document.querySelector('#category-filters [data-category="all"]');
                 if(categoryAllBtn) categoryAllBtn.click();
            }
            button.classList.add('active');
            applyFilters();
        });
    };
    
    // --- ★★★ サイトワイド音声合成機能（最終版） ★★★ ---
    const initSiteWideSpeech = () => {
        setTimeout(() => {
            if (typeof SiteWideSpeaker === 'undefined' || !window.siteSpeaker || window.siteSpeaker.isLoading) {
                setTimeout(initSiteWideSpeech, 200);
                return;
            }

            const readableElements = document.querySelectorAll(
                '.article-content p, .article-content h2, .article-content h3, .article-content li, ' +
                '.lesson-content p, .lesson-content h2, .lesson-content h3, .lesson-content li, ' +
                '.novel-content p, .novel-content h2, .readable'
            );

            readableElements.forEach(el => {
                // 親が既に読み上げ対象の場合、子にはボタンを追加しないロジック
                if (el.parentElement.closest('.readable') && !el.classList.contains('readable')) {
                    return;
                }

                if (el.textContent.trim() === '' || el.classList.contains('post-card-category') || el.classList.contains('article-meta') || el.querySelector('.speech-button')) {
                    return;
                }

                const playBtn = document.createElement('button');
                playBtn.className = 'speech-button';
                playBtn.innerHTML = '<i class="fas fa-volume-up" style="font-size: 12px;"></i>';
                playBtn.title = 'この部分を読み上げる';
                
                playBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let finalTextToSpeak;
                    // パターン1：要素自身がdata-speechを持つ場合 (ブロック読み上げ)
                    if (el.dataset.speech) {
                        finalTextToSpeak = el.dataset.speech;
                    } else {
                    // パターン2：子要素にdata-speechを持つ場合 (部分読み替え)
                        const elementForSpeech = el.cloneNode(true);
                        const buttonToRemove = elementForSpeech.querySelector('.speech-button');
                        if (buttonToRemove) buttonToRemove.remove();
                        
                        const speechSpans = elementForSpeech.querySelectorAll('[data-speech]');
                        speechSpans.forEach(span => {
                            span.textContent = span.dataset.speech;
                        });
                        
                        finalTextToSpeak = elementForSpeech.textContent.trim();
                    }

                    window.siteSpeaker.speak(finalTextToSpeak, el);
                });

                el.appendChild(playBtn);
            });
        }, 300); // コンポーネント描画などを待つため少し長めに
    };

    const initImageSpeech = () => {
        setTimeout(() => {
            if (typeof SiteWideSpeaker === 'undefined' || !window.siteSpeaker || window.siteSpeaker.isLoading) {
                setTimeout(initImageSpeech, 200);
                return;
            }
            const imageContainers = document.querySelectorAll('.article-content, .lesson-content, .novel-content');
            imageContainers.forEach(container => {
                container.querySelectorAll('img').forEach(img => {
                    const altText = img.getAttribute('alt');
                    if (altText && altText.trim() !== '') {
                        img.classList.add('speech-target-image');
                        img.setAttribute('title', 'クリックして画像の説明を読み上げる');
                        img.addEventListener('click', (e) => {
                            e.stopPropagation();
                            img.classList.add('speaking-image');
                            window.siteSpeaker.speak(altText, null, () => {
                                img.classList.remove('speaking-image');
                            });
                        });
                    }
                });
            });
        }, 300);
    };

    // --- サイト全体の機能を初期化して実行 ---
    loadComponentsAndInit();
    initScrollAnimation();
    initGalleryToggle();
    initpromptCopy();
    initFilter();
    initSiteWideSpeech();
    initImageSpeech();
});