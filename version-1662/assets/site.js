(() => {
  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMenu() {
    const button = select(".menu-toggle");
    const panel = select(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", () => {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    const hero = select(".hero");
    if (!hero) {
      return;
    }
    const slides = selectAll(".hero-slide", hero);
    const dots = selectAll(".hero-dot", hero);
    if (!slides.length) {
      return;
    }
    let current = 0;
    const show = (index) => {
      current = index;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
    };
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => show(i));
    });
    window.setInterval(() => {
      show((current + 1) % slides.length);
    }, 5000);
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    const panel = select(".filter-panel");
    const cards = selectAll("[data-search]");
    if (!panel || !cards.length) {
      return;
    }
    const input = select(".filter-input", panel);
    const year = select(".filter-year", panel);
    const category = select(".filter-category", panel);
    const empty = select(".empty-state");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }
    const apply = () => {
      const keyword = normalize(input ? input.value : "");
      const yearValue = year ? year.value : "";
      const categoryValue = category ? category.value : "";
      let shown = 0;
      cards.forEach((card) => {
        const haystack = normalize(card.dataset.search);
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchYear = !yearValue || card.dataset.year === yearValue;
        const matchCategory = !categoryValue || card.dataset.category === categoryValue;
        const visible = matchKeyword && matchYear && matchCategory;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    };
    [input, year, category].forEach((control) => {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function startPlayer(frame) {
    const video = select("video", frame);
    const overlay = select(".player-overlay", frame);
    const source = frame.dataset.m3u8;
    if (!video || !source) {
      return;
    }
    if (!video.dataset.ready) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
      }
      video.dataset.ready = "true";
    }
    video.controls = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function initPlayers() {
    selectAll(".player-frame").forEach((frame) => {
      const overlay = select(".player-overlay", frame);
      const video = select("video", frame);
      if (overlay) {
        overlay.addEventListener("click", () => startPlayer(frame));
      }
      if (video) {
        video.addEventListener("click", () => {
          if (!video.dataset.ready) {
            startPlayer(frame);
          }
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
