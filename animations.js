document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("js");

/* ===========================================
   SCROLL REVEAL (Safari compatible)
=========================================== */

const revealElements = document.querySelectorAll(
    ".cover, .buy-accordion, .inside, .press-section, .author-story, .seo, .jara-gallery, .jara-mission"
);

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");
                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold: 0.10,
        rootMargin: "0px 0px -40px 0px"

    });

    revealElements.forEach(el => {

        el.classList.add("reveal");
        observer.observe(el);

    });

    // Si Safari falla por cualquier motivo, mostrar todo tras 1 segundo

    setTimeout(() => {

        revealElements.forEach(el => {

            el.classList.add("visible");

        });

    }, 1000);

} else {

    // Navegador sin soporte

    revealElements.forEach(el => {

        el.classList.add("visible");

    });

}


    /* ===========================================
       PORTADA 3D
    =========================================== */

    const cover = document.querySelector(".cover");

    if (cover) {

        let raf = null;

        cover.addEventListener("mousemove", e => {

            if (raf) cancelAnimationFrame(raf);

            raf = requestAnimationFrame(() => {

                const rect = cover.getBoundingClientRect();

                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                const rotateY = (x - 0.5) * 5;
                const rotateX = (0.5 - y) * 5;

                cover.style.transform = `
                    perspective(1200px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateY(-5px)
                    scale(1.015)
                `;

            });

        });

        cover.addEventListener("mouseleave", () => {

            cover.style.transform = "";

        });

    }


    /* ===========================================
       ACORDEONES
    =========================================== */

    function animateCards(details) {

        const cards = details.querySelectorAll(".buy-card");

        cards.forEach((card, index) => {

            card.style.animation = "none";

            void card.offsetWidth;

            card.style.animation =
                `cardReveal .45s ease ${index * 70}ms forwards`;

        });

    }

    document.querySelectorAll(".buy-item").forEach(details => {

        if (details.open) {
            animateCards(details);
        }

        details.addEventListener("toggle", () => {

            if (details.open) {
                animateCards(details);
            }

        });

    });


    /* ===========================================
       BOTÓN COMPRAR
    =========================================== */

    document.querySelectorAll('a[href="#comprar"]').forEach(button => {

        button.addEventListener("click", () => {

            setTimeout(() => {

                const accordion = document.querySelector(".buy-accordion");

                if (!accordion) return;

                accordion.animate(

                    [
                        { transform: "scale(1)" },
                        { transform: "scale(1.02)" },
                        { transform: "scale(1)" }
                    ],

                    {
                        duration: 260,
                        easing: "ease-out"
                    }

                );

            }, 350);

        });

    });

});