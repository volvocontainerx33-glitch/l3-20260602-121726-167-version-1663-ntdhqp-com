(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function setSlide(index) {
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

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        startTimer();
      });
    });

    startTimer();
  }

  var localSearch = document.querySelector('[data-local-search]');
  var categoryFilter = document.querySelector('[data-filter-category]');
  var yearFilter = document.querySelector('[data-filter-year]');
  var grid = document.querySelector('[data-card-grid]');
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter() {
    if (!grid) {
      return;
    }

    var keyword = normalize(localSearch ? localSearch.value : '');
    var category = normalize(categoryFilter ? categoryFilter.value : '');
    var year = normalize(yearFilter ? yearFilter.value : '');
    var items = Array.prototype.slice.call(grid.children);
    var visibleCount = 0;

    items.forEach(function (item) {
      var haystack = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-year'),
        item.getAttribute('data-category'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-region'),
        item.textContent
      ].join(' '));
      var itemCategory = normalize(item.getAttribute('data-category'));
      var itemYear = normalize(item.getAttribute('data-year'));
      var show = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        show = false;
      }
      if (category && itemCategory !== category) {
        show = false;
      }
      if (year && itemYear !== year) {
        show = false;
      }

      item.hidden = !show;
      if (show) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  [localSearch, categoryFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', runFilter);
      control.addEventListener('change', runFilter);
    }
  });
})();
