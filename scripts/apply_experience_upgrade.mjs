import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function write(relative, html) {
  fs.writeFileSync(path.join(root, relative), html);
}

function replaceRequired(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`Missing ${label}`);
  return text.replace(before, after);
}

function insertBeforeSectionEnd(html, marker, addition) {
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`Missing section marker ${marker}`);
  const end = html.indexOf("</div></div></section>", start);
  if (end < 0) throw new Error(`Missing section end after ${marker}`);
  return html.slice(0, end) + addition + html.slice(end);
}

function insertAfterSection(html, marker, addition) {
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`Missing section marker ${marker}`);
  const end = html.indexOf("</section>", start);
  if (end < 0) throw new Error(`Missing section end after ${marker}`);
  const at = end + "</section>".length;
  return html.slice(0, at) + addition + html.slice(at);
}

const sanPages = [
  {
    file: "san-nicolas.html",
    prefix: "",
    trust: '<div class="purchase-trust" aria-label="Información de compra"><span>Compra gestionada por Amazon</span><span>Enlaces internacionales automáticos</span><span>Información editorial verificable</span></div>',
    ids: '<dl class="book-identifiers"><div><dt>Tapa dura · identificador Amazon</dt><dd>8409924986</dd></div><div><dt>Kindle · ASIN</dt><dd>B0H98JJD4W</dd></div></dl>',
    teaser: '<section class="history-teaser"><div class="container"><div><div class="eyebrow">Historia y tradición</div><h2>¿Quién fue San Nicolás y cómo inspiró a Papá Noel?</h2><p>Separa los hechos históricos, las tradiciones europeas y la conexión popular con España.</p></div><a class="btn" href="origen-san-nicolas-papa-noel.html">LEER LA HISTORIA DOCUMENTADA →</a></div></section>',
    bar: '<div class="mobile-buy-bar"><span>El origen de Papá Noel</span><a href="#estado-publicacion">COMPRAR</a></div>',
  },
  {
    file: "en/san-nicolas.html",
    prefix: "../",
    trust: '<div class="purchase-trust" aria-label="Purchase information"><span>Purchase handled by Amazon</span><span>Automatic international links</span><span>Verifiable edition details</span></div>',
    ids: '<dl class="book-identifiers"><div><dt>Spanish hardback · Amazon ID</dt><dd>8409924986</dd></div><div><dt>Spanish Kindle · ASIN</dt><dd>B0H98JJD4W</dd></div></dl>',
    teaser: '<section class="history-teaser"><div class="container"><div><div class="eyebrow">History and tradition</div><h2>Who was Saint Nicholas and how did he inspire Santa Claus?</h2><p>Explore the historical figure, the European traditions and the popular connection with Spain.</p></div><a class="btn" href="origen-san-nicolas-papa-noel.html">READ THE DOCUMENTED STORY →</a></div></section>',
    bar: '<div class="mobile-buy-bar"><span>The Origin of Santa Claus</span><a href="#publication-status">BUY</a></div>',
  },
  {
    file: "fr/san-nicolas.html",
    prefix: "../",
    trust: '<div class="purchase-trust" aria-label="Informations d’achat"><span>Achat géré par Amazon</span><span>Liens internationaux automatiques</span><span>Données éditoriales vérifiables</span></div>',
    ids: '<dl class="book-identifiers"><div><dt>Relié espagnol · identifiant Amazon</dt><dd>8409924986</dd></div><div><dt>Kindle espagnol · ASIN</dt><dd>B0H98JJD4W</dd></div></dl>',
    teaser: '<section class="history-teaser"><div class="container"><div><div class="eyebrow">Histoire et tradition</div><h2>Qui était saint Nicolas et comment a-t-il inspiré le Père Noël ?</h2><p>Découvrez le personnage historique, les traditions européennes et le lien populaire avec l’Espagne.</p></div><a class="btn" href="origen-san-nicolas-papa-noel.html">LIRE L’HISTOIRE DOCUMENTÉE →</a></div></section>',
    bar: '<div class="mobile-buy-bar"><span>L’origine du Père Noël</span><a href="#statut-publication">ACHETER</a></div>',
  },
];

for (const page of sanPages) {
  let html = read(page.file);
  const source = `${page.prefix}images/es/san-nicolas-hero.webp`;
  const replacement = `${source}\" srcset=\"${page.prefix}images/es/san-nicolas-hero-720.webp 720w, ${page.prefix}images/es/san-nicolas-hero-1100.webp 1100w, ${source} 1440w\" sizes=\"(max-width:1050px) 100vw, 68vw`;
  html = replaceRequired(html, `${source}\" width=\"1440`, `${replacement}\" width=\"1440`, `${page.file} hero backdrop`);
  html = replaceRequired(html, `${source}\" width=\"1440`, `${replacement}\" width=\"1440`, `${page.file} hero image`);
  html = insertBeforeSectionEnd(html, 'class="saint-buy-section"', page.trust);
  html = insertBeforeSectionEnd(html, 'class="saint-edition"', page.ids);
  html = insertAfterSection(html, 'class="saint-story"', page.teaser);
  html = replaceRequired(html, "</body>", `<script src=\"${page.prefix}gallery.js?v=20261008-1\" defer></script>${page.bar}</body>`, `${page.file} body`);
  write(page.file, html);
}

const homeImages = {
  "index.html": [
    ["images/es/perez-cover.webp", "images/es/perez-cover-480.webp", 893],
    ["images/es/jara-cover.webp", "images/es/jara-cover-480.webp", 1200],
    ["images/es/san-nicolas-cover.webp", "images/es/san-nicolas-cover-480.webp", 888],
  ],
  "en/index.html": [
    ["../images/en/perez-cover.webp", "../images/en/perez-cover-480.webp", 893],
    ["../images/en/jara-cover.webp", "../images/en/jara-cover-480.webp", 1183],
    ["../images/es/san-nicolas-cover.webp", "../images/es/san-nicolas-cover-480.webp", 888],
  ],
  "fr/index.html": [
    ["../images/fr/perez-cover.webp", "../images/fr/perez-cover-480.webp", 893],
    ["../images/fr/jara-cover.webp", "../images/fr/jara-cover-480.webp", 1183],
    ["../images/es/san-nicolas-cover.webp", "../images/es/san-nicolas-cover-480.webp", 888],
  ],
};

for (const [file, images] of Object.entries(homeImages)) {
  let html = read(file);
  for (const [source, small, width] of images) {
    html = replaceRequired(html, `src=\"${source}\" width=\"${width}\"`, `src=\"${source}\" srcset=\"${small} 480w, ${source} ${width}w\" sizes=\"(max-width:850px) calc(100vw - 64px), 30vw\" width=\"${width}\"`, `${file} ${source}`);
  }
  write(file, html);
}

console.log("Experience upgrade applied");
