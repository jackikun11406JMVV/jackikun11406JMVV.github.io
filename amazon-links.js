(() => {
  const affiliateTag = "jmvv-21";
  const amazonProductPattern = /^https:\/\/(?:www\.)?amazon\.es\/dp\/([A-Z0-9]+)(?:[/?#]|$)/i;
  const newTabCopy = {
    es: "se abre en una pestaña nueva",
    en: "opens in a new tab",
    fr: "s’ouvre dans un nouvel onglet"
  };
  const routingCopy = {
    es: "Destino de compra: Amazon España · enlace de afiliado",
    en: "Shopping destination: Amazon Spain · affiliate link",
    fr: "Destination d’achat : Amazon Espagne · lien affilié"
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

    const productUrl = new URL(`https://www.amazon.es/dp/${match[1].toUpperCase()}`);
    productUrl.searchParams.set("tag", affiliateTag);
    link.href = productUrl.toString();
    link.dataset.amazonDestination = "spain-affiliate";
    link.rel = "sponsored nofollow noopener noreferrer";

    if (link.target === "_blank") {
      const label = link.textContent.replace(/\s*→\s*$/, "").trim();
      link.setAttribute("aria-label", `${label} (${newTabCopy[language] || newTabCopy.es})`);
    }
  });

  document.querySelectorAll(".buy-accordion, .publication-actions").forEach((block) => {
    if (!block.querySelector("a[data-amazon-destination='spain-affiliate']")) return;

    const note = document.createElement("p");
    note.className = "amazon-routing-note";
    note.textContent = routingCopy[language] || routingCopy.es;
    block.insertAdjacentElement("afterend", note);

    const affiliateNote = document.createElement("p");
    affiliateNote.className = "amazon-affiliate-note";
    affiliateNote.textContent = disclosure[language] || disclosure.es;
    note.insertAdjacentElement("afterend", affiliateNote);
  });
})();
