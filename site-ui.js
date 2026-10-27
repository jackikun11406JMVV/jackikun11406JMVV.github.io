(() => {
  const menu = document.querySelector('.site-menu');
  const closeMenu = (restoreFocus = false) => {
    if (!menu?.open) return;
    menu.open = false;
    if (restoreFocus) menu.querySelector('summary').focus();
  };
  menu?.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    closeMenu();
    const url = new URL(link.href, location.href);
    if (url.pathname === location.pathname && url.hash) {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({preventScroll:true});
      }
    }
  });
  document.addEventListener('click', event => {
    if (menu && !menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.open) { event.preventDefault(); closeMenu(true); }
  });
  document.querySelectorAll('.guide-index a').forEach(link => link.addEventListener('click', () => {
    link.closest('details').open = false;
  }));
  document.querySelectorAll('.guide-back').forEach(link => link.addEventListener('click', () => {
    const index = document.getElementById('guide-index');
    if (index) index.open = true;
  }));
})();
