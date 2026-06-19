(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', menu.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
                dot.setAttribute('aria-pressed', dotIndex === active ? 'true' : 'false');
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stop();
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initHeroSearch() {
        var forms = selectAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = 'search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-filter-grid]');
        if (!panel || !grid) {
            return;
        }
        var cards = selectAll('[data-filter-card]', grid);
        var keyword = panel.querySelector('[data-filter-keyword]');
        var category = panel.querySelector('[data-filter-category]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && keyword) {
            keyword.value = query;
        }
        function includesText(source, value) {
            if (!value) {
                return true;
            }
            return (source || '').toLowerCase().indexOf(value.toLowerCase()) !== -1;
        }
        function apply() {
            var keywordValue = keyword ? keyword.value.trim() : '';
            var categoryValue = category ? category.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var matchesKeyword = includesText(card.getAttribute('data-search'), keywordValue);
                var matchesCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
                var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
                var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var matches = matchesKeyword && matchesCategory && matchesType && matchesYear;
                card.style.display = matches ? '' : 'none';
                if (matches) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        [keyword, category, type, year].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
        apply();
    }

    window.initMoviePlayer = function (videoId, streamUrl) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var box = video.closest('[data-player-box]');
        var button = box ? box.querySelector('[data-play-button]') : null;
        var message = box ? box.querySelector('[data-player-message]') : null;
        var loaded = false;
        var loading = false;
        var hls = null;
        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add('is-visible');
            }
        }
        function loadVideo(resolve, reject) {
            if (loaded) {
                resolve();
                return;
            }
            if (loading) {
                var wait = window.setInterval(function () {
                    if (loaded) {
                        window.clearInterval(wait);
                        resolve();
                    }
                }, 120);
                return;
            }
            loading = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    loaded = true;
                    loading = false;
                    resolve();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        loading = false;
                        showMessage('视频加载失败，请稍后重试');
                        reject();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', function () {
                    loaded = true;
                    loading = false;
                    resolve();
                }, { once: true });
                video.load();
            } else {
                loading = false;
                showMessage('暂时无法播放该影片');
                reject();
            }
        }
        function startPlayback() {
            if (button) {
                button.classList.add('is-loading');
            }
            new Promise(loadVideo).then(function () {
                video.setAttribute('controls', 'controls');
                if (button) {
                    button.classList.add('is-hidden');
                    button.classList.remove('is-loading');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }).catch(function () {
                if (button) {
                    button.classList.remove('is-loading');
                }
            });
        }
        if (button) {
            button.addEventListener('click', startPlayback);
        }
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initHeroSearch();
        initFilters();
    });
}());
