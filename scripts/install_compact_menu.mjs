import { readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
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

const localeCopy = {
  es: {
    menu: "MENÚ",
    perezHistory: "SOBRE PÉREZ",
    saintHistory: "SOBRE SAN NICOLÁS",
  },
  en: {
    menu: "MENU",
    perezHistory: "ABOUT PÉREZ",
    saintHistory: "ABOUT SAINT NICHOLAS",
  },
  fr: {
    menu: "MENU",
    perezHistory: "SUR PÉREZ",
    saintHistory: "SUR SAINT NICOLAS",
  },
};

for (const page of pages) {
  const path = join(root, page);
  let html = readFileSync(path, "utf8");
  if (!html.includes('<header class="topbar"')) continue;

  const locale = page.startsWith("en/") ? "en" : page.startsWith("fr/") ? "fr" : "es";
  const copy = localeCopy[locale];
  const is404 = page === "404.html";
  const prefix = is404 ? "/" : "";
  const current = page.replace(/^(en|fr)\//, "");
  const navPattern = /<nav class="navlinks"([^>]*)>([\s\S]*?)<\/nav>/;
  const match = html.match(navPattern);

  if (!match) throw new Error(`No se encontró la navegación en ${relative(root, path)}`);
  if (html.includes('<details class="site-menu">')) continue;

  const perezCurrent = current === "origen-ratoncito-perez.html" ? ' aria-current="page"' : "";
  const saintCurrent = current === "origen-san-nicolas-papa-noel.html" ? ' aria-current="page"' : "";
  const extraLinks = `<a class="nav-story-link" href="${prefix}origen-ratoncito-perez.html"${perezCurrent}>${copy.perezHistory}</a><a class="nav-story-link" href="${prefix}origen-san-nicolas-papa-noel.html"${saintCurrent}>${copy.saintHistory}</a>`;
  const nav = `<nav class="navlinks"${match[1]}>${match[2]}${extraLinks}</nav>`;
  const menu = `<details class="site-menu"><summary><span class="site-menu-label">${copy.menu}</span><span class="site-menu-icon" aria-hidden="true"><i></i><i></i><i></i></span></summary><div class="site-menu-panel">${nav}</div></details>`;

  html = html.replace(navPattern, menu);
  html = html.replace(/styles\.css\?v=20261010-2/g, "styles.css?v=20261010-3");
  writeFileSync(path, html, "utf8");
}

console.log(`Menú compacto instalado en ${pages.length} páginas.`);
