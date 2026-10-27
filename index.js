document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded",()=>{

    const seasonalCampaign=document.querySelector("[data-seasonal-campaign]");
    if(seasonalCampaign){
        const today=new Date();
        const month=today.getMonth();
        const day=today.getDate();
        const isChristmasSeason=month>=9||(month===0&&day<=6);
        seasonalCampaign.hidden=!isChristmasSeason;
    }

    const hero=document.querySelector(".hero-content");

    if(hero){

        hero.classList.add("show");

    }

    const cards=document.querySelectorAll(".book-card");

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) entry.target.animate([

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
