(() => {
  const samples = [...document.querySelectorAll(".inside-card img, .saint-journey-media img, .jara-gallery-card img")];
  const photos = [...document.querySelectorAll(".real-book-thumbs img")];
  const allImages = [...samples, ...photos];
  let images = samples;
  if (!allImages.length) return;

  const lang = document.documentElement.lang || "es";
  const labels = {
    es: { open: "Ampliar imagen", close: "Cerrar imagen ampliada", previous: "Imagen anterior", next: "Imagen siguiente", buy: "Ver opciones de compra", count: "Imagen" },
    en: { open: "Enlarge image", close: "Close enlarged image", previous: "Previous image", next: "Next image", buy: "See buying options", count: "Image" },
    fr: { open: "Agrandir l’image", close: "Fermer l’image agrandie", previous: "Image précédente", next: "Image suivante", buy: "Voir les options d’achat", count: "Image" },
  }[lang] || { open: "Ampliar imagen", close: "Cerrar imagen ampliada", previous: "Imagen anterior", next: "Imagen siguiente", buy: "Ver opciones de compra", count: "Imagen" };

  const purchaseSection = document.querySelector("#comprar, #estado-publicacion, #publication-status, #statut-publication");
  const purchaseHref = purchaseSection?.id ? `#${purchaseSection.id}` : "#comprar";

  const dialog = document.createElement("dialog");
  dialog.className = "image-lightbox";
  dialog.setAttribute("aria-label", labels.open);
  dialog.innerHTML = `<button class="image-lightbox-close" type="button" aria-label="${labels.close}">×</button><figure><img alt=""/><figcaption></figcaption></figure><div class="image-lightbox-controls"><button type="button" class="image-lightbox-previous" aria-label="${labels.previous}">←</button><span class="image-lightbox-count" aria-live="polite"></span><button type="button" class="image-lightbox-next" aria-label="${labels.next}">→</button><a class="image-lightbox-buy" href="${purchaseHref}">${labels.buy} →</a></div>`;
  document.body.append(dialog);

  const largeImage = dialog.querySelector("img");
  const caption = dialog.querySelector("figcaption");
  const count = dialog.querySelector(".image-lightbox-count");
  let trigger = null;
  let currentIndex = 0;
  const close = () => dialog.close();

  const showImage = index => {
    currentIndex = (index + images.length) % images.length;
    const image = images[currentIndex];
    largeImage.src = image.dataset.fullSrc || image.currentSrc || image.src;
    largeImage.alt = image.alt;
    caption.textContent = image.closest("figure, .inside-card")?.querySelector("figcaption, p")?.textContent || image.alt;
    count.textContent = `${labels.count} ${currentIndex + 1} / ${images.length}`;
  };

  const openAt = (index, source, group = samples) => {
    if (!group.length) return;
    images = group;
    trigger = source;
    showImage(index);
    dialog.showModal();
  };

  dialog.querySelector("button").addEventListener("click", close);
  dialog.querySelector(".image-lightbox-previous").addEventListener("click", () => showImage(currentIndex - 1));
  dialog.querySelector(".image-lightbox-next").addEventListener("click", () => showImage(currentIndex + 1));
  dialog.querySelector(".image-lightbox-buy").addEventListener("click", close);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") showImage(currentIndex - 1);
    if (event.key === "ArrowRight") showImage(currentIndex + 1);
  });
  dialog.addEventListener("close", () => {
    trigger?.focus();
    trigger = null;
  });

  allImages.forEach((image) => {
    const group = photos.includes(image) ? photos : samples;
    const index = group.indexOf(image);
    const link = image.closest(".real-book-thumbs a");
    if (link) {
      link.setAttribute("aria-label", `${labels.open}: ${image.alt}`);
      link.addEventListener("click", event => { event.preventDefault(); openAt(index, link, group); });
      return;
    }
    image.classList.add("is-zoomable");
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `${labels.open}: ${image.alt}`);
    const open = () => openAt(index, image, group);
    image.addEventListener("click", open);
    image.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  document.querySelectorAll("[data-sample-open]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openAt(0, button);
    });
  });
})();
