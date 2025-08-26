document.addEventListener('DOMContentLoaded', () => {

    // --- サイト共通の機能 ---

    const loadComponentsAndInit = async () => {
        const loadComponent = async (id, url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                const text = await response.text();
                const element = document.getElementById(id);
                if (element) element.innerHTML = text;
            } catch (error) {
                console.error(`Component load error for ${id}:`, error);
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
        if (header) {
            window.addEventListener('scroll', () => {
                header.classList.toggle('scrolled', window.scrollY > 50);
            });
        }
    };

    const initActiveNavLinks = () => {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            const isHomePage = (currentPath === '/' || currentPath.endsWith('/index.html'));
            const isLinkToHome = (linkPath === '/' || linkPath.endsWith('/index.html'));
            if ((isHomePage && isLinkToHome) || (!isLinkToHome && currentPath.includes(link.getAttribute('href')))) {
                link.classList.add('nav-active');
            }
        });
    };
    
    /**
     * [最終修正版] フィルター機能
     * クリックイベントを各ボタンに直接設定する、より確実な方式に変更
     */
    const initFilter = () => {
        const categoryButtons = document.querySelectorAll('#category-filters .category-btn');
        const levelButtons = document.querySelectorAll('#level-filters .category-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        // フィルターボタンがないページでは、この先の処理を一切行わない
        if (categoryButtons.length === 0 && levelButtons.length === 0) {
            return;
        }

        // フィルターを適用するメインの関数
        const applyFilters = () => {
            // 現在アクティブなカテゴリとレベルを取得
            const activeCategory = document.querySelector('#category-filters .active')?.dataset.category || 'all';
            const activeLevel = document.querySelector('#level-filters .active')?.dataset.level || 'all';

            // すべてのカードをチェック
            portfolioItems.forEach(item => {
                const itemCategories = item.dataset.category ? item.dataset.category.split(' ') : [];
                const itemLevel = item.dataset.level || '';

                const categoryMatch = activeCategory === 'all' || itemCategories.includes(activeCategory);
                const levelMatch = activeLevel === 'all' || itemLevel === activeLevel;

                // 両方の条件に一致する場合のみ表示
                item.style.display = (categoryMatch && levelMatch) ? '' : 'none';
            });
        };

        // カテゴリボタンのクリックイベントを設定
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                applyFilters();
            });
        });

        // レベルボタンのクリックイベントを設定
        levelButtons.forEach(button => {
            button.addEventListener('click', () => {
                levelButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                applyFilters();
            });
        });
    };

    // --- その他の共通機能（変更なし） ---
    // (initGalleryToggle, initpromptCopy, initSiteWideSpeech, initImageSpeechなど)

    // --- サイト全体の機能を初期化して実行 ---
    loadComponentsAndInit();
    initScrollAnimation();
    // initGalleryToggle();
    // initpromptCopy();
    initFilter(); // フィルター機能を呼び出し
    // initSiteWideSpeech();
    // initImageSpeech();
});