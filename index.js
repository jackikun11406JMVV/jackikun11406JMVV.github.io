document.addEventListener("DOMContentLoaded",()=>{

    const hero=document.querySelector(".hero-content");

    hero.classList.add("show");

    const cards=document.querySelectorAll(".book-card");

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.animate([

                    {
                        opacity:0,
                        transform:"translateY(30px)"
                    },

                    {
                        opacity:1,
                        transform:"translateY(0)"
                    }

                ],{

                    duration:600,
                    easing:"ease-out",
                    fill:"forwards"

                });

                observer.unobserve(entry.target);

            }

        });

    },{

        threshold:.2

    });

    cards.forEach(card=>{

        observer.observe(card);

    });

});