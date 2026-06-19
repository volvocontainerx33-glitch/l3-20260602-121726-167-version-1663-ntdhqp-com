(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
    var controls = searchInputs.concat(selects);

    controls.forEach(function (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

    function applyFilters() {
      var scopes = {};
      searchInputs.forEach(function (input) {
        scopes[input.getAttribute('data-card-search')] = true;
      });
      selects.forEach(function (select) {
        scopes[select.getAttribute('data-filter-scope')] = true;
      });
      Object.keys(scopes).forEach(function (scope) {
        var grid = document.getElementById(scope);
        if (!grid) {
          return;
        }
        var queryInput = document.querySelector('[data-card-search="' + scope + '"]');
        var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
        var yearSelect = document.querySelector('[data-card-filter="year"][data-filter-scope="' + scope + '"]');
        var typeSelect = document.querySelector('[data-card-filter="type"][data-filter-scope="' + scope + '"]');
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
          var searchBody = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var matchQuery = !query || searchBody.indexOf(query) !== -1;
          var matchYear = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
          var matchType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1 || searchBody.indexOf(type.toLowerCase()) !== -1;
          card.classList.toggle('is-filter-hidden', !(matchQuery && matchYear && matchType));
        });
      });
    }
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[id]'));
    videos.forEach(function (video) {
      var source = video.querySelector('source');
      var src = source ? source.getAttribute('src') : video.getAttribute('src');
      var overlay = document.querySelector('[data-play-target="' + video.id + '"]');

      if (src) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          video.addEventListener('emptied', function () {
            hls.destroy();
          }, { once: true });
        }
      }

      function playVideo() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', playVideo);
      }
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    });
  }
})();
