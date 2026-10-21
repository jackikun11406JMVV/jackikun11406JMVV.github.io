(() => {
  const affiliateTag = "jmvv-21";
  const amazonProductPattern = /^https:\/\/(?:www\.)?amazon\.es\/dp\/([A-Z0-9]+)(?:[/?#]|$)/i;
  let timeZone = "";

  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (_) {}

  const localPreviewCountry = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
    ? new URLSearchParams(location.search).get("country")
    : null;
  const isSpain = localPreviewCountry
    ? localPreviewCountry === "es"
    : timeZone === "Europe/Madrid"
      || timeZone === "Atlantic/Canary"
      || timeZone === "Africa/Ceuta";

  const newTabCopy = {
    es: "se abre en una pestaña nueva",
    en: "opens in a new tab",
    fr: "s’ouvre dans un nouvel onglet"
  };
  const routingCopy = {
    es: isSpain
      ? "Destino de compra: Amazon España · enlace de afiliado"
      : "Destino de compra: Amazon de tu país · enlace universal",
    en: isSpain
      ? "Shopping destination: Amazon Spain · affiliate link"
      : "Shopping destination: Amazon for your country · universal link",
    fr: isSpain
      ? "Destination d’achat : Amazon Espagne · lien affilié"
      : "Destination d’achat : Amazon de votre pays · lien universel"
  };
  const disclosure = {
    es: "En calidad de Afiliado de Amazon, el titular de esta web obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables.",
    en: "As an Amazon Associate, the owner of this website earns from qualifying purchases.",
    fr: "En tant que Partenaire Amazon, le propriétaire de ce site perçoit une rémunération sur les achats admissibles."
  };

  const language = document.documentElement.lang || "es";

  document.querySelectorAll("a.buy-amazon").forEach((link) => {
    const sourceUrl = link.dataset.amazonProduct || link.href;
    const match = sourceUrl.match(amazonProductPattern);
    if (!match) return;

    const productCode = match[1].toUpperCase();
    const destination = isSpain
      ? new URL(`https://www.amazon.es/dp/${productCode}`)
      : new URL(link.dataset.amazonUniversal || `https://www.letraminuscula.com/amz/${productCode}`);

    if (isSpain) destination.searchParams.set("tag", affiliateTag);
    link.href = destination.toString();
    link.dataset.amazonDestination = isSpain ? "spain-affiliate" : "universal";
    link.rel = "sponsored nofollow noopener noreferrer";

    if (link.target === "_blank") {
      const label = link.getAttribute("aria-label")
        || link.textContent.replace(/\s*→\s*$/, "").trim();
      link.setAttribute("aria-label", `${label} (${newTabCopy[language] || newTabCopy.es})`);
    }
  });

  document.querySelectorAll(".buy-accordion, .publication-actions").forEach((block) => {
    if (!block.querySelector("a[data-amazon-destination]")) return;

    const note = document.createElement("p");
    note.className = "amazon-routing-note";
    note.textContent = routingCopy[language] || routingCopy.es;
    block.insertAdjacentElement("afterend", note);

    if (!isSpain) return;
    const affiliateNote = document.createElement("p");
    affiliateNote.className = "amazon-affiliate-note";
    affiliateNote.textContent = disclosure[language] || disclosure.es;
    note.insertAdjacentElement("afterend", affiliateNote);
  });

  document.querySelectorAll("[data-amazon-routing-label]").forEach((label) => {
    label.textContent = isSpain
      ? (language === "fr" ? "Lien affilié Amazon Espagne" : language === "en" ? "Amazon Spain affiliate link" : "Enlace afiliado de Amazon España")
      : (language === "fr" ? "Lien universel vers votre boutique Amazon" : language === "en" ? "Universal link to your Amazon store" : "Enlace universal a tu tienda Amazon");
  });
})();
