(() => {
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
      || timeZone === "Atlantic/Canary";

  const universalToSpain = {
    "https://www.letraminuscula.com/amz/B0HLYNHB35": "https://link.amazon/B0d90zCpt",
    "https://www.letraminuscula.com/amz/8409927810": "https://link.amazon/B07hbUgj0",
    "https://www.letraminuscula.com/amz/B0H2C62YNM": "https://link.amazon/B0gMEXdKP",
    "https://www.letraminuscula.com/amz/B0H12YB6KW": "https://link.amazon/B07UnTZPu",
    "https://www.letraminuscula.com/amz/B0HB9VHXXD": "https://link.amazon/B0dJAdadw",
    "https://www.letraminuscula.com/amz/B0HBBZ1M5L": "https://link.amazon/B0ajsMq6j",
    "https://www.letraminuscula.com/amz/8409924986": "https://link.amazon/B0fYmijyV",
    "https://www.letraminuscula.com/amz/B0H98JJD4W": "https://link.amazon/B05N1OlMw"
  };

  document.querySelectorAll("a.buy-amazon, a[data-amazon-spain]").forEach((link) => {
    const universalUrl = link.dataset.amazonUniversal || link.href;
    const spainUrl = link.dataset.amazonSpain || universalToSpain[universalUrl];
    if (!spainUrl) return;
    link.href = isSpain ? spainUrl : universalUrl;
    link.dataset.amazonDestination = isSpain ? "spain" : "universal";
    link.rel = "sponsored nofollow noopener noreferrer";
  });

  const copy = {
    es: isSpain
      ? "Destino de compra: Amazon España · enlace de asociado"
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

  document.querySelectorAll(".buy-accordion, .publication-actions").forEach((block) => {
    if (!block.querySelector("a[data-amazon-destination]")) return;
    const note = document.createElement("p");
    note.className = "amazon-routing-note";
    note.textContent = copy[document.documentElement.lang] || copy.es;
    block.insertAdjacentElement("afterend", note);
    const affiliateNote = document.createElement("p");
    affiliateNote.className = "amazon-affiliate-note";
    affiliateNote.textContent = disclosure[document.documentElement.lang] || disclosure.es;
    note.insertAdjacentElement("afterend", affiliateNote);
  });
})();
