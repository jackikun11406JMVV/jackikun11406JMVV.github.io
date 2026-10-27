(() => {
  const reveal = () => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const disclosure = target?.matches("details.book-disclosure") ? target : target?.querySelector("details.book-disclosure");
    if (disclosure && location.hash === "#carta-gratis") disclosure.open = true;
  };
  reveal();
  window.addEventListener("hashchange", reveal);
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.pathname === location.pathname && url.hash === "#carta-gratis") {
      const panel = document.querySelector(".letter-disclosure");
      if (panel) panel.open = true;
    }
  });
})();
