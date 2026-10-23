(() => {
  const bar = document.querySelector(".mobile-buy-bar");
  if (!bar) return;

  const hero = document.querySelector(".inner-hero .inner-grid, .saint-cinematic-hero");
  const purchase = document.querySelector(".book-purchase-panel, .saint-buy-section");
  const footer = document.querySelector("footer");
  const mobile = window.matchMedia("(max-width: 560px)");
  let frame = 0;

  const isInView = element => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight - 20 && rect.bottom > 80;
  };

  const update = () => {
    frame = 0;
    const heroPassed = !hero || hero.getBoundingClientRect().bottom <= 90;
    const visible = mobile.matches && heroPassed && !isInView(purchase) && !isInView(footer);
    bar.classList.toggle("is-visible", visible);
    bar.setAttribute("aria-hidden", String(!visible));
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  mobile.addEventListener?.("change", schedule);
  update();
})();
