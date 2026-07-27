document.addEventListener("DOMContentLoaded", () => {

    // Solo una vez por sesión
    if (!sessionStorage.getItem("bookIntro")) {

        sessionStorage.setItem("bookIntro", "true");

        const cover = document.querySelector(".cover");
        const info = document.querySelector(".inner-grid > div:last-child");
        const buy = document.querySelector(".buy-accordion");

        if (cover) cover.classList.add("intro-cover");

        setTimeout(() => {
            if (info) info.classList.add("intro-show");
        }, 220);

        setTimeout(() => {
            if (buy) buy.classList.add("intro-show");
        }, 520);

    } else {

        document.querySelector(".cover")?.classList.add("intro-show");
        document.querySelector(".inner-grid > div:last-child")?.classList.add("intro-show");
        document.querySelector(".buy-accordion")?.classList.add("intro-show");

    }


    // Animación de las tarjetas al abrir un acordeón

    document.querySelectorAll(".buy-item").forEach(details => {

        details.addEventListener("toggle", () => {

            if (!details.open) return;

            const cards = details.querySelectorAll(".buy-card");

            cards.forEach((card, i) => {

                card.style.animation = "none";

                requestAnimationFrame(() => {

                    card.style.animation =
                        `cardReveal .45s ease ${i * 70}ms forwards`;

                });

            });

        });

    });

});