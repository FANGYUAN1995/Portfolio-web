// 文件載入完成後執行
document.addEventListener('DOMContentLoaded', function () {
    // 初始化所有功能
    initHamburgerMenu();
    initHeroSlider();
    initWorkFilter();
    initScrollAnimations();
    initBackToTop();
    initSmoothScroll();
    initContactForm();
    initLazyLoading();
    initAdvancedParallax();
    initAuthHandlers();
    initValidationMessages(); // 自訂表單驗證訊息
});

// 漢堡選單功能
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // 點擊導航連結後關閉選單
    navLinksItems.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// hero區域輪播功能
function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length === 0) return;

    // 顯示指定幻燈片
    function showSlide(index) {
        // 移除所有活動狀態
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        // 新增目前活動狀態
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlide = index;
    }

    // 張幻燈片燈片
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }

    // 點擊指示器切換投影片
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            resetSlideInterval();
        });
    });

    // 重置自動播放計時器
    function resetSlideInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    // 初始化自動播放
    slideInterval = setInterval(nextSlide, 5000);

    // 滑鼠懸停時暫停自動播放
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mouseenter', () => clearInterval(slideInterval));
        hero.addEventListener('mouseleave', resetSlideInterval);
    }
}

// 高級視差引擎
function initAdvancedParallax() {
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const viewportHeight = window.innerHeight;

        // 1. Hero 區域視差 (0 ~ 100vh) - 支援所有幻燈片
        const heroProgress = Math.min(scrolled / viewportHeight, 1);
        const heroContainers = document.querySelectorAll('.hero .container');

        heroContainers.forEach(container => {
            container.style.setProperty('--scroll-y', `${scrolled * 0.4}px`);
            container.style.setProperty('--hero-opacity', 1 - heroProgress * 1.5);
            container.style.setProperty('--hero-scale', 1 + heroProgress * 0.15);
            container.style.setProperty('--hero-blur', `${heroProgress * 15}px`);
        });

        // 2. About 區域覆蓋效果
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            const aboutTop = aboutSection.offsetTop;
            const aboutHeight = aboutSection.offsetHeight;
            const aboutProgress = Math.min(Math.max((scrolled - aboutTop) / (aboutHeight * 0.5), 0), 1);

            if (aboutProgress > 0) {
                aboutSection.style.setProperty('--about-scale', 1 - aboutProgress * 0.1);
                aboutSection.style.setProperty('--about-brightness', 1 - aboutProgress * 0.5);
            } else {
                aboutSection.style.setProperty('--about-scale', '1');
                aboutSection.style.setProperty('--about-brightness', '1');
            }
        }

        // 3. Navbar 深度效果
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrolled > 50) {
                navbar.style.padding = '5px 0';
                navbar.style.background = 'rgba(102, 126, 234, 0.9)';
                navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            } else {
                navbar.style.padding = '10px 0';
                navbar.style.background = 'rgba(102, 126, 234, 0.7)';
                navbar.style.boxShadow = 'none';
            }
        }
    });
}

// 作品分類過濾功能
function initWorkFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const workItems = document.querySelectorAll('.work-item');

    if (categoryBtns.length === 0 || workItems.length === 0) return;

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // 更新按鈕狀態
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            let visibleCount = 0;

            // 過濾作品并添加交錯動畫
            workItems.forEach((item) => {
                const itemCategory = item.getAttribute('data-category');

                if (category === 'all' || itemCategory === category) {
                    item.classList.remove('hidden');
                    // 添加交錯延遲
                    item.style.transitionDelay = `${visibleCount * 0.1}s`;
                    visibleCount++;
                } else {
                    item.classList.add('hidden');
                    item.style.transitionDelay = '0s';
                }
            });
        });
    });
}

// 滾動動畫功能
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.scroll-animate');

    if (animateElements.length === 0) return;

    function checkScroll() {
        const windowHeight = window.innerHeight;
        const scrollPosition = window.pageYOffset + windowHeight * 0.8;

        animateElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            if (scrollPosition >= elementPosition) {
                element.classList.add('visible');
            }
        });
    }

    // 初始檢查
    checkScroll();

    // 滾動時檢查
    window.addEventListener('scroll', checkScroll);
}

// 返回頂部按鈕功能
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    if (!backToTop) return;

    function checkScrollPosition() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 初始檢查
    checkScrollPosition();

    // 滾動時檢查
    window.addEventListener('scroll', checkScrollPosition);

    // 點擊回到頂部
    backToTop.addEventListener('click', scrollToTop);
}

// 平滑滾動功能 (支持分類聯動)
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link, .btn-primary');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const targetFilter = this.getAttribute('data-filter');

            if (href.startsWith('#')) {
                e.preventDefault();

                // 1. 如果有指定的分類，先觸發分類點擊
                if (targetFilter) {
                    const filterBtn = document.querySelector(`.category-btn[data-category="${targetFilter}"]`);
                    if (filterBtn) {
                        filterBtn.click();
                    }
                }

                // 2. 滾動到目標位置
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (navbarHeight + 50);

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// 圖片欄加載功能
function initLazyLoading() {
    const lazyElements = document.querySelectorAll('.lazy-bg');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const bgSrc = element.getAttribute('data-bg-src');
                    if (bgSrc) {
                        element.style.backgroundImage = `url('${bgSrc}')`;
                        element.style.backgroundSize = 'cover';
                        element.style.backgroundPosition = 'center';
                        element.classList.remove('lazy-bg');
                        observer.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: '0px 0px 100px 0px'
        });

        lazyElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // 降級方案：如果瀏覽器不支援IntersectionObserver，則直接載入所有圖片
        lazyElements.forEach(element => {
            const bgSrc = element.getAttribute('data-bg-src');
            if (bgSrc) {
                element.style.backgroundImage = `url('${bgSrc}')`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
                element.classList.remove('lazy-bg');
            }
        });
    }
}

// 聯絡表單功能
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // 取得表單數據
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // 簡單的表單驗證
        if (!data.name || !data.email || !data.subject || !data.message) {
            alert('請填寫所有必填欄位');
            return;
        }

        // 檢查是否登入 (使用後端 PHP 檢查)
        fetch('/api/check_auth')
            .then(response => response.json())
            .then(authData => {
                if (!authData.isLoggedIn) {
                    alert('請先登入會員後再發送留言！');
                    window.location.href = 'login.html';
                } else {
                    // 已登入，執行發送
                    submitMessage(contactForm);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // 如果檢查失敗，暫時允許嘗試發送或提示錯誤，這裡選擇提示登入
                // 為了更好的體驗，我們可以預設 localStorage 檢查作為後備，但既然有了後端，應以主要後端為主
                // 但為了相容性，如果 fetch 失敗（例如沒有 PHP 環境直接打開 HTML），則 fallback
                const fallbackLoggedIn = localStorage.getItem('isLoggedIn');
                if (!fallbackLoggedIn) {
                    alert('請先登入會員後再發送留言！(離線模式)');
                    window.location.href = 'login.html';
                } else {
                    submitMessage(contactForm);
                }
            });
    });
}

function submitMessage(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const formData = new FormData(form);

    submitBtn.textContent = '發送中...';
    submitBtn.disabled = true;

    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                form.reset();
            } else {
                alert(data.message || '發送失敗');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('系統錯誤，請確認網路連線或稍後再試');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// 認證相關功能處理 (PHP 版本)
function initAuthHandlers() {
    // 處理登入表單
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = '登入中...';
            submitBtn.disabled = true;

            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // 登入成功
                        localStorage.setItem('isLoggedIn', 'true'); // 前端備份狀態
                        localStorage.setItem('username', data.username);
                        alert('登入成功！');
                        window.location.href = 'index.html';
                    } else {
                        alert(data.message || '登入失敗');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('系統錯誤，請稍後再試');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // 處理註冊表單
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            // 前端簡單檢查密碼一致性
            if (formData.get('password') !== formData.get('confirm-password')) {
                alert('兩次輸入的密碼不一致');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = '註冊中...';
            submitBtn.disabled = true;

            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('username', data.username);
                        alert('註冊成功！歡迎加入。');
                        window.location.href = 'index.html';
                    } else {
                        alert(data.message || '註冊失敗');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('系統錯誤，請稍後再試');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // 頁面加載時同步後端登入狀態
    syncAuthStatus();
}

function syncAuthStatus() {
    fetch('/api/check_auth')
        .then(response => response.json())
        .then(data => {
            const navAuthContainer = document.getElementById('nav-auth-container');
            if (data.isLoggedIn) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', data.username);

                // 更新導航欄顯示
                if (navAuthContainer) {
                    let html = `<span class="nav-link" style="color: #fff; cursor: default;">${data.username}</span>`;

                    // 如果是管理員，顯示後台入口
                    if (data.username === 'admin') {
                        html += `<a href="admin.html" class="nav-link" style="color: #ffeb3b; border: 1px solid #ffeb3b; padding: 4px 10px; border-radius: 4px; margin: 0 5px;">後台管理</a>`;
                    }

                    html += `<a href="#" class="nav-link" id="nav-logout-btn">登出</a>`;
                    navAuthContainer.innerHTML = html;

                    // 綁定登出事件
                    document.getElementById('nav-logout-btn').addEventListener('click', function (e) {
                        e.preventDefault();
                        fetch('/api/logout').then(() => {
                            localStorage.removeItem('isLoggedIn');
                            localStorage.removeItem('username');
                            window.location.reload();
                        });
                    });
                }
            } else {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');

                if (navAuthContainer) {
                    navAuthContainer.innerHTML = `<a href="login.html" class="nav-link">登入</a> <a href="register.html" class="nav-link">註冊</a>`;
                }
            }
        })
        .catch(err => console.log('Auth check skipped (local mode)'));
}

// 自訂表單驗證訊息 (將瀏覽器預設提示改為繁體中文)
function initValidationMessages() {
    const inputs = document.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
        // 當驗證失敗時 (invalid 事件)
        input.addEventListener('invalid', function () {
            if (this.validity.valueMissing) {
                this.setCustomValidity('請填寫此欄位');
            } else if (this.validity.typeMismatch && this.type === 'email') {
                this.setCustomValidity('請輸入有效的電子郵件地址');
            }
        });

        // 當使用者開始輸入時 (input 事件) - 清除錯誤訊息
        input.addEventListener('input', function () {
            this.setCustomValidity('');
        });
    });
}