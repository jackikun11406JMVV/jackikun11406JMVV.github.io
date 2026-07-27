document.addEventListener("DOMContentLoaded", () => {

    const cover = document.querySelector(".cover");
    const info = document.querySelector(".inner-grid > div:last-child");
    const buy = document.querySelector(".buy-accordion");

    function reveal(element, className = "intro-show") {
        if (element) {
            element.classList.add(className);
        }
    }

    // ==========================
    // INTRO (solo la primera vez)
    // ==========================

    if (!localStorage.getItem("bookIntroPlayed")) {

        localStorage.setItem("bookIntroPlayed", "true");

        reveal(cover, "intro-cover");

        setTimeout(() => {
            reveal(info);
        }, 220);

        setTimeout(() => {
            reveal(buy);
        }, 520);

    } else {

        reveal(cover);
        reveal(info);
        reveal(buy);

    }

    // ==========================
    // ANIMACIÓN DE TARJETAS
    // ==========================

    function animateCards(details) {

        const cards = details.querySelectorAll(".buy-card");

        cards.forEach((card, index) => {

            card.style.animation = "none";
            card.style.opacity = "0";
            card.style.transform = "translateY(18px) scale(.98)";

            requestAnimationFrame(() => {

                card.style.animation =
                    `cardReveal .45s ease ${index * 70}ms forwards`;

            });

        });

    }

    // Si un acordeón ya viene abierto al cargar

    document.querySelectorAll(".buy-item[open]").forEach(details => {

        animateCards(details);

    });

    // Al abrir un acordeón

    document.querySelectorAll(".buy-item").forEach(details => {

        details.addEventListener("toggle", () => {

            if (details.open) {

                animateCards(details);

            }

        });

    });

    // ==========================
    // EFECTO 3D PORTADA
    // ==========================

    if (cover) {

        cover.addEventListener("mousemove", e => {

            const rect = cover.getBoundingClientRect();

            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            cover.style.transform = `
                perspective(900px)
                rotateY(${x * 4}deg)
                rotateX(${-y * 4}deg)
                translateY(-6px)
                scale(1.02)
            `;

        });

        cover.addEventListener("mouseleave", () => {

            cover.style.transform = "";

        });

    }

});