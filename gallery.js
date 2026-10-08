(() => {
  const images = document.querySelectorAll(".inside-card img, .saint-journey-media img");
  if (!images.length) return;

  const lang = document.documentElement.lang || "es";
  const labels = {
    es: { open: "Ampliar imagen", close: "Cerrar imagen ampliada" },
    en: { open: "Enlarge image", close: "Close enlarged image" },
    fr: { open: "Agrandir l’image", close: "Fermer l’image agrandie" },
  }[lang] || { open: "Ampliar imagen", close: "Cerrar imagen ampliada" };

  const dialog = document.createElement("dialog");
  dialog.className = "image-lightbox";
  dialog.innerHTML = `<button class="image-lightbox-close" type="button" aria-label="${labels.close}">×</button><figure><img alt=""/><figcaption></figcaption></figure>`;
  document.body.append(dialog);

  const largeImage = dialog.querySelector("img");
  const caption = dialog.querySelector("figcaption");
  const close = () => dialog.close();

  dialog.querySelector("button").addEventListener("click", close);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) close();
  });

  for (const image of images) {
    image.classList.add("is-zoomable");
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${labels.open}: ${image.alt}`);
    const open = () => {
      largeImage.src = image.currentSrc || image.src;
      largeImage.alt = image.alt;
      caption.textContent = image.closest("figure, .inside-card")?.querySelector("figcaption, p")?.textContent || image.alt;
      dialog.showModal();
    };
    image.addEventListener("click", open);
    image.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  }
})();
