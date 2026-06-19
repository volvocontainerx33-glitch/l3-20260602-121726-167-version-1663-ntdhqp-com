
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]')).forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var typeFilter = scope.querySelector('[data-type-filter]');
    var yearFilter = scope.querySelector('[data-year-filter]');
    var sortSelect = scope.querySelector('[data-sort-select]');
    var container = scope.querySelector('[data-card-container]');

    if (!container) {
      return;
    }

    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var typeMatched = !typeValue || card.getAttribute('data-type') === typeValue;
        var yearMatched = !yearValue || card.getAttribute('data-year') === yearValue;
        var queryMatched = !query || haystack.indexOf(query) !== -1;

        card.classList.toggle('is-hidden', !(typeMatched && yearMatched && queryMatched));
      });
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();

      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      if (mode === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }

      if (mode === 'title') {
        sorted.sort(function (a, b) {
          return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
        });
      }

      sorted.forEach(function (card) {
        container.appendChild(card);
      });
    }

    [input, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        sortCards();
        applyFilters();
      });
    }

    applyFilters();
  });
})();

function initVideoPlayer(source) {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-play-button]');

  if (!video || !source) {
    return;
  }

  function bindSource(done) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      done();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      return;
    }

    video.src = source;
    done();
  }

  function startPlay() {
    if (button) {
      button.classList.add('hidden');
    }

    bindSource(function () {
      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    });
  }

  if (button) {
    button.addEventListener('click', startPlay);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });
}
