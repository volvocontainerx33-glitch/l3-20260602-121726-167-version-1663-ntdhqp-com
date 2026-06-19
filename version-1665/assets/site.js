(() => {
    const toggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", () => {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".spotlight-slide"));
    const dots = Array.from(document.querySelectorAll(".spotlight-dot"));
    let current = 0;
    let timer = null;

    const activateSlide = index => {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };

    const scheduleSlide = () => {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(() => {
                activateSlide(current + 1);
            }, 5200);
        }
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            activateSlide(index);
            scheduleSlide();
        });
    });

    activateSlide(0);
    scheduleSlide();

    const grids = Array.from(document.querySelectorAll(".searchable-grid"));

    grids.forEach(grid => {
        const section = grid.closest("section") || document;
        const input = section.querySelector(".card-search");
        const buttons = Array.from(section.querySelectorAll("[data-year-filter]"));
        const cards = Array.from(grid.querySelectorAll(".movie-card"));
        let activeYear = "all";

        const applyFilter = () => {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                const year = card.getAttribute("data-year") || "";
                const keywordMatched = !keyword || text.includes(keyword);
                const yearMatched = activeYear === "all" || year === activeYear;
                card.classList.toggle("is-filtered-out", !(keywordMatched && yearMatched));
            });
        };

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        buttons.forEach(button => {
            button.addEventListener("click", () => {
                activeYear = button.getAttribute("data-year-filter") || "all";
                buttons.forEach(item => item.classList.toggle("is-active", item === button));
                applyFilter();
            });
        });

        applyFilter();
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    const mainSearch = document.querySelector(".main-search");

    if (query && mainSearch) {
        mainSearch.value = query;
        mainSearch.dispatchEvent(new Event("input", { bubbles: true }));
    }
})();
