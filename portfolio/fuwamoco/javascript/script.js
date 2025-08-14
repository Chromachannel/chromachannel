document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const pcGnavi = document.getElementById('pc-gnavi');
    const headerHamburger = document.getElementById('header-hamburger');
    const floatingHamburger = document.getElementById('floating-hamburger');
    const hamburgerNav = document.getElementById('hamburger-nav');
    // const closeHamburgerBtn = document.getElementById('close-hamburger'); // ← この行を削除
    const body = document.body;

    let lastScrollY = 0;
    let ticking = false;
    const scrollThreshold = 100;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        if (window.innerWidth > 1024) { // PC版
            if (currentScrollY <= scrollThreshold) {
                header.classList.remove('hidden');
                pcGnavi.style.display = 'block';
                floatingHamburger.classList.remove('visible');
                headerHamburger.style.display = 'none'; // PCではヘッダーのハンバーガーは常に非表示
            } else {
                header.classList.add('hidden');
                pcGnavi.style.display = 'none';
                if (!hamburgerNav.classList.contains('active')) {
                    floatingHamburger.classList.add('visible');
                }
                headerHamburger.style.display = 'none'; // PCではヘッダーのハンバーガーは常に非表示
            }
        } else { // モバイル版
            header.classList.remove('hidden');
            floatingHamburger.classList.remove('visible');
            pcGnavi.style.display = 'none';
            // ハンバーガーメニューが開いている/閉じている状態にかかわらず、常にheaderHamburgerを表示
            headerHamburger.style.display = 'flex';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });

    handleScroll(); // 初期状態を設定

    window.addEventListener('resize', function() {
        header.classList.remove('hidden');
        floatingHamburger.classList.remove('visible');
        hamburgerNav.classList.remove('active');
        // headerHamburger.classList.remove('active'); // activeクラスもリセット - これは不要になるかもしれません
        // floatingHamburger.classList.remove('active'); // activeクラスもリセット - これは不要になるかもしれません
        body.classList.remove('no-scroll');

        if (window.innerWidth > 1024) {
            floatingHamburger.classList.remove('visible');
            headerHamburger.style.display = 'none'; // PC時は常に非表示
        } else {
            headerHamburger.style.display = 'flex'; // モバイル時は常に表示
        }

        handleScroll();
    });

    // --- ハンバーガーメニューを開く/閉じる関数 (統合) ---
    function toggleHamburgerMenu() {
        if (hamburgerNav.classList.contains('active')) {
            // メニューが開いている場合、閉じる
            hamburgerNav.classList.remove('active');
            body.classList.remove('no-scroll');

            // 閉じた後、アイコンの表示をスクロール状態に合わせて更新
            if (window.innerWidth > 1024) {
                if (window.scrollY > scrollThreshold) {
                    floatingHamburger.classList.add('visible');
                }
            } else {
                headerHamburger.style.display = 'flex'; // モバイル版のヘッダーアイコンを表示
            }
        } else {
            // メニューが閉じている場合、開く
            hamburgerNav.classList.add('active');
            body.classList.add('no-scroll');

            // 開いた際、PCではフローティングを非表示に、モバイルではヘッダーハンバーガーを非表示に（今回の変更でこれは不要）
            // 今回はハンバーガーアイコンは常に表示されるため、ここで非表示にする処理は削除します。
            // 実際は、ハンバーガーアイコンが閉じるアイコンに切り替わるUIが一般的ですが、
            // 「ハンバーガーアイコンは残し、閉じる役割も兼ねる」という要件なので、アイコンの見た目の変化は行いません。
        }
    }

    // ハンバーガーアイコンをクリックすると、メニューの開閉をトグルする
    headerHamburger.addEventListener('click', toggleHamburgerMenu);
    floatingHamburger.addEventListener('click', toggleHamburgerMenu);

    // closeHamburgerBtn.addEventListener('click', function() { // ← このイベントリスナーを削除
    //     closeHamburgerMenu();
    // });

    const accordionMenus = document.querySelectorAll('.accordion-menu');

    accordionMenus.forEach(menu => {
        menu.addEventListener('click', function() {
            const contentId = this.dataset.accordion;
            const accordionContent = document.getElementById(contentId);

            if (accordionContent) {
                accordionMenus.forEach(otherMenu => {
                    if (otherMenu !== this && otherMenu.classList.contains('active')) {
                        otherMenu.classList.remove('active');
                        const otherContent = document.getElementById(otherMenu.dataset.accordion);
                        if (otherContent) {
                            otherContent.style.display = 'none';
                        }
                    }
                });

                this.classList.toggle('active');
                if (accordionContent.style.display === 'block') {
                    accordionContent.style.display = 'none';
                } else {
                    accordionContent.style.display = 'block';
                }
            }
        });
    });
});