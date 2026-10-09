import fs from "node:fs";
import path from "node:path";

const pages = [
  "404.html",
  "index.html",
  "el-origen-del-ratoncito-perez.html",
  "jara-la-noble-ppp.html",
  "san-nicolas.html",
  "origen-ratoncito-perez.html",
  "origen-san-nicolas-papa-noel.html",
  "en/index.html",
  "en/el-origen-del-ratoncito-perez.html",
  "en/jara-la-noble-ppp.html",
  "en/san-nicolas.html",
  "en/origen-ratoncito-perez.html",
  "en/origen-san-nicolas-papa-noel.html",
  "fr/index.html",
  "fr/el-origen-del-ratoncito-perez.html",
  "fr/jara-la-noble-ppp.html",
  "fr/san-nicolas.html",
  "fr/origen-ratoncito-perez.html",
  "fr/origen-san-nicolas-papa-noel.html",
];

const localeOf = (file) => file.startsWith("en/") ? "en" : file.startsWith("fr/") ? "fr" : "es";

const labels = {
  es: { aria: "Navegación principal", home: "INICIO", perez: "PÉREZ", jara: "JARA", saint: "SAN NICOLÁS", saintFooter: "San Nicolás", about: "SOBRE MÍ", footer: "Navegación secundaria", history: "Historia de Pérez" },
  en: { aria: "Main navigation", home: "HOME", perez: "PÉREZ", jara: "JARA", saint: "SAINT NICHOLAS", saintFooter: "Saint Nicholas", about: "ABOUT ME", footer: "Secondary navigation", history: "Pérez history" },
  fr: { aria: "Navigation principale", home: "ACCUEIL", perez: "PÉREZ", jara: "JARA", saint: "SAINT NICOLAS", saintFooter: "Saint Nicolas", about: "À PROPOS", footer: "Navigation secondaire", history: "Histoire de Pérez" },
};

function currentFor(file) {
  const base = path.basename(file);
  if (base === "index.html") return "home";
  if (base === "el-origen-del-ratoncito-perez.html") return "perez";
  if (base === "jara-la-noble-ppp.html") return "jara";
  if (base === "san-nicolas.html") return "saint";
  return "";
}

function currentAttr(active, key) {
  return active === key ? ' aria-current="page"' : "";
}

function navigation(file) {
  const locale = localeOf(file);
  const copy = labels[locale];
  const active = currentFor(file);
  const is404 = file === "404.html";
  const home = is404 ? "/" : "./";
  const perez = is404 ? "/el-origen-del-ratoncito-perez.html" : "el-origen-del-ratoncito-perez.html";
  const jara = is404 ? "/jara-la-noble-ppp.html" : "jara-la-noble-ppp.html";
  const saint = is404 ? "/san-nicolas.html" : "san-nicolas.html";
  const about = is404 ? "/#autor" : "./#autor";
  return `<nav class="navlinks" aria-label="${copy.aria}"><a href="${home}"${currentAttr(active, "home")}>${copy.home}</a><a href="${perez}"${currentAttr(active, "perez")}>${copy.perez}</a><a href="${jara}"${currentAttr(active, "jara")}>${copy.jara}</a><a href="${saint}"${currentAttr(active, "saint")}>${copy.saint}</a><a href="${about}">${copy.about}</a></nav>`;
}

function footerNavigation(file) {
  const locale = localeOf(file);
  const copy = labels[locale];
  const base = path.basename(file);
  const active = currentFor(file);
  const historyCurrent = base === "origen-ratoncito-perez.html" ? ' aria-current="page"' : "";
  return `<nav class="footer-nav" aria-label="${copy.footer}"><a href="./"${currentAttr(active, "home")}>${copy.home[0]}${copy.home.slice(1).toLowerCase()}</a><a href="el-origen-del-ratoncito-perez.html"${base === "el-origen-del-ratoncito-perez.html" ? ' aria-current="page"' : ""}>Pérez</a><a href="origen-ratoncito-perez.html"${historyCurrent}>${copy.history}</a><a href="jara-la-noble-ppp.html"${currentAttr(active, "jara")}>Jara</a><a href="san-nicolas.html"${active === "saint" ? ' aria-current="page"' : ""}>${copy.saintFooter}</a></nav>`;
}

for (const file of pages) {
  let html = fs.readFileSync(file, "utf8");
  const headerPattern = /<nav\b[^>]*\bclass="navlinks"[^>]*>[\s\S]*?<\/nav>/;
  if (!headerPattern.test(html)) throw new Error(`No se encontró el menú principal en ${file}`);
  html = html.replace(headerPattern, navigation(file));

  const footerPattern = /<nav\b[^>]*\bclass="footer-nav"[^>]*>[\s\S]*?<\/nav>/;
  if (footerPattern.test(html)) html = html.replace(footerPattern, footerNavigation(file));

  html = html.replaceAll("styles.css?v=20261008-11", "styles.css?v=20261008-12");
  html = html.replaceAll('"dateModified": "2026-10-08"', '"dateModified": "2026-10-09"');
  html = html.replaceAll('"dateModified":"2026-10-08"', '"dateModified":"2026-10-09"');
  fs.writeFileSync(file, html);
}

const homeFeatures = {
  es: `<section class="perez-discovery" aria-labelledby="perez-descubrimiento"><div class="container perez-discovery-grid"><figure><img src="images/perez-coloma/raton-perez-luis-coloma-casa.webp" alt="La familia del Ratón Pérez en su casa inspirada en el cuento de Luis Coloma" loading="lazy" decoding="async" width="703" height="469"/></figure><div><div class="eyebrow">Historia, tradición y curiosidades</div><h2 id="perez-descubrimiento">Pérez tiene mucho más que contar.</h2><p>¿Quién fue Luis Coloma? ¿Cómo describió al ratón, dónde vivía y qué papel tuvo el rey Bubi? Descubre una guía ilustrada y documentada, pensada para leer en familia y conectada con Jerez.</p><a class="btn" href="origen-ratoncito-perez.html">EXPLORAR LA HISTORIA DE PÉREZ →</a></div></div></section>`,
  en: `<section class="perez-discovery" aria-labelledby="perez-discovery"><div class="container perez-discovery-grid"><figure><img src="../images/perez-coloma/raton-perez-luis-coloma-casa.webp" alt="The Pérez mouse family in their home inspired by Luis Coloma's story" loading="lazy" decoding="async" width="703" height="469"/></figure><div><div class="eyebrow">History, tradition and curiosities</div><h2 id="perez-discovery">Pérez has much more to tell.</h2><p>Who was Luis Coloma? How did he describe the mouse, where did Pérez live and what part did King Bubi play? Explore an illustrated, documented guide made for family reading and connected with Jerez.</p><a class="btn" href="origen-ratoncito-perez.html">EXPLORE THE HISTORY OF PÉREZ →</a></div></div></section>`,
  fr: `<section class="perez-discovery" aria-labelledby="decouvrir-perez"><div class="container perez-discovery-grid"><figure><img src="../images/perez-coloma/raton-perez-luis-coloma-casa.webp" alt="La famille de la Petite Souris Pérez dans sa maison inspirée du conte de Luis Coloma" loading="lazy" decoding="async" width="703" height="469"/></figure><div><div class="eyebrow">Histoire, tradition et curiosités</div><h2 id="decouvrir-perez">Pérez a encore beaucoup à raconter.</h2><p>Qui était Luis Coloma ? Comment décrivait-il la souris, où vivait Pérez et quel rôle jouait le roi Bubi ? Découvrez un guide illustré et documenté, conçu pour une lecture en famille et lié à Jerez.</p><a class="btn" href="origen-ratoncito-perez.html">EXPLORER L’HISTOIRE DE PÉREZ →</a></div></div></section>`,
};

const authorNotes = {
  es: `<div class="author-story"><h3>Historias nacidas cerca 📖</h3><p>Jerez, los animales y las tradiciones son el punto de partida de cuentos que buscan emocionar, despertar curiosidad y acompañar la lectura en familia.</p></div>`,
  en: `<div class="author-story"><h3>Stories born close to home 📖</h3><p>Jerez, animals and living traditions are the starting point for stories created to move readers, spark curiosity and bring families together.</p></div>`,
  fr: `<div class="author-story"><h3>Des histoires nées tout près 📖</h3><p>Jerez, les animaux et les traditions vivantes sont le point de départ de contes conçus pour émouvoir, éveiller la curiosité et réunir les familles.</p></div>`,
};

for (const file of ["index.html", "en/index.html", "fr/index.html"]) {
  const locale = localeOf(file);
  let html = fs.readFileSync(file, "utf8");
  const aboutMarker = '<section class="about" id="autor">';
  if (!html.includes(aboutMarker)) throw new Error(`No se encontró la sección del autor en ${file}`);
  if (!html.includes('class="perez-discovery"')) html = html.replace(aboutMarker, `${homeFeatures[locale]}\n\n${aboutMarker}`);
  html = html.replace(/<div class="author-story">[\s\S]*?<\/div>\s*(?=<div class="goodreads-card">)/, `${authorNotes[locale]}\n`);
  html = html.replace(/\s*<section class="paper story-links">[\s\S]*?<\/section>/, "");
  fs.writeFileSync(file, html);
}

const productFeatures = {
  es: `<section class="perez-origin-feature" aria-labelledby="historia-perez"><div class="container perez-origin-feature-grid"><div><div class="eyebrow">Más allá del cuento</div><h2 id="historia-perez">Descubre la historia que convirtió a Pérez en leyenda.</h2><p>Una guía ilustrada para conocer cómo describió Luis Coloma al Ratón Pérez, dónde vivía, la aventura del rey Bubi y la conexión literaria con Jerez.</p><ul><li>Luis Coloma y el pequeño rey Bubi</li><li>Arenal 8 y la casa en una caja de galletas</li><li>La familia Pérez y su vínculo con Jerez</li></ul><a class="btn" href="origen-ratoncito-perez.html">LEER LA HISTORIA DE PÉREZ →</a></div><figure><img src="images/perez-coloma/raton-perez-luis-coloma-casa.webp" alt="La familia Pérez en su casa dentro de una caja de galletas" loading="lazy" decoding="async" width="703" height="469"/></figure></div></section>`,
  en: `<section class="perez-origin-feature" aria-labelledby="perez-history"><div class="container perez-origin-feature-grid"><div><div class="eyebrow">Beyond the storybook</div><h2 id="perez-history">Discover the history that turned Pérez into a legend.</h2><p>An illustrated guide to Luis Coloma's description of Pérez, his home, King Bubi's adventure and the literary connection with Jerez.</p><ul><li>Luis Coloma and the young King Bubi</li><li>Arenal 8 and the biscuit-box home</li><li>The Pérez family and its connection with Jerez</li></ul><a class="btn" href="origen-ratoncito-perez.html">READ THE HISTORY OF PÉREZ →</a></div><figure><img src="../images/perez-coloma/raton-perez-luis-coloma-casa.webp" alt="The Pérez family in their biscuit-box home" loading="lazy" decoding="async" width="703" height="469"/></figure></div></section>`,
  fr: `<section class="perez-origin-feature" aria-labelledby="histoire-perez"><div class="container perez-origin-feature-grid"><div><div class="eyebrow">Au-delà du conte</div><h2 id="histoire-perez">Découvrez l’histoire qui a fait de Pérez une légende.</h2><p>Un guide illustré pour découvrir la description de Pérez par Luis Coloma, sa maison, l’aventure du roi Bubi et le lien littéraire avec Jerez.</p><ul><li>Luis Coloma et le jeune roi Bubi</li><li>Arenal 8 et la maison dans une boîte à biscuits</li><li>La famille Pérez et son lien avec Jerez</li></ul><a class="btn" href="origen-ratoncito-perez.html">LIRE L’HISTOIRE DE PÉREZ →</a></div><figure><img src="../images/perez-coloma/raton-perez-luis-coloma-casa.webp" alt="La famille Pérez dans sa maison installée dans une boîte à biscuits" loading="lazy" decoding="async" width="703" height="469"/></figure></div></section>`,
};

for (const file of ["el-origen-del-ratoncito-perez.html", "en/el-origen-del-ratoncito-perez.html", "fr/el-origen-del-ratoncito-perez.html"]) {
  const locale = localeOf(file);
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes('class="perez-origin-feature"')) {
    const start = html.indexOf('<section class="seo">');
    const end = html.indexOf('<section class="press-section">', start);
    if (start < 0 || end < 0) throw new Error(`No se encontró el bloque redundante de Pérez en ${file}`);
    html = `${html.slice(0, start)}${productFeatures[locale]}\n${html.slice(end)}`;
  }
  html = html.replace('class="seo faq faq-reference"', 'class="seo faq faq-reference product-faq-only"');
  html = html.replace(/<div class="reference-intro">[\s\S]*?<\/div>(?=<div class="faq-block">)/, "");
  fs.writeFileSync(file, html);
}

console.log(`Actualizadas ${pages.length} páginas públicas.`);
