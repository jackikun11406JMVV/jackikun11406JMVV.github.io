#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  "index.html",
  "el-origen-del-ratoncito-perez.html",
  "jara-la-noble-ppp.html",
  "origen-ratoncito-perez.html",
  "san-nicolas.html",
  "en/index.html",
  "en/el-origen-del-ratoncito-perez.html",
  "en/jara-la-noble-ppp.html",
  "en/origen-ratoncito-perez.html",
  "en/san-nicolas.html",
  "fr/index.html",
  "fr/el-origen-del-ratoncito-perez.html",
  "fr/jara-la-noble-ppp.html",
  "fr/origen-ratoncito-perez.html",
  "fr/san-nicolas.html",
  "404.html",
];

const copy = {
  es: {
    skip: "Saltar al contenido",
    nav: "Navegación principal",
    languages: "Seleccionar idioma",
  },
  en: {
    skip: "Skip to content",
    nav: "Main navigation",
    languages: "Choose language",
  },
  fr: {
    skip: "Aller au contenu",
    nav: "Navigation principale",
    languages: "Choisir la langue",
  },
};

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"))?.[1];
}

function setAttribute(tag, name, value) {
  const matcher = new RegExp(`\\s${name}=["'][^"']*["']`, "i");
  if (matcher.test(tag)) return tag.replace(matcher, ` ${name}="${value}"`);
  return tag.replace(/\s*\/>$|>$/, (ending) => ` ${name}="${value}"${ending}`);
}

function addBooleanAttribute(tag, name) {
  if (new RegExp(`\\s${name}(?:\\s|=|/?>)`, "i").test(tag)) return tag;
  return tag.replace(/\s*\/>$|>$/, (ending) => ` ${name}${ending}`);
}

function localImagePath(pagePath, src) {
  if (!src || /^(?:https?:|data:|mailto:|tel:|#)/i.test(src)) return null;
  const clean = src.split(/[?#]/, 1)[0];
  if (clean.startsWith("/")) return join(repoRoot, clean.slice(1));
  return resolve(dirname(pagePath), clean);
}

function imageDimensions(path) {
  try {
    const result = execFileSync("identify", ["-format", "%w %h", path], { encoding: "utf8" }).trim();
    const [width, height] = result.split(/\s+/).map(Number);
    return Number.isFinite(width) && Number.isFinite(height) ? { width, height } : null;
  } catch {
    return null;
  }
}

for (const page of pages) {
  const pagePath = join(repoRoot, page);
  let html = readFileSync(pagePath, "utf8");
  const language = html.match(/<html[^>]*\blang=["'](es|en|fr)["']/i)?.[1]?.toLowerCase() ?? "es";
  const labels = copy[language];

  if (!html.includes('class="skip-link"')) {
    html = html.replace(/<body([^>]*)>/i, `<body$1><a class="skip-link" href="#contenido">${labels.skip}</a>`);
  }
  html = html.replace(/<main(?![^>]*\bid=)([^>]*)>/i, '<main id="contenido"$1>');
  html = html.replace(/<nav class="navlinks"(?![^>]*aria-label)([^>]*)>/gi, `<nav class="navlinks" aria-label="${labels.nav}"$1>`);
  html = html.replace(/<div class="lang-switch"(?![^>]*aria-label)([^>]*)>/gi, `<div class="lang-switch" role="navigation" aria-label="${labels.languages}"$1>`);
  html = html.replace(/<strong>(ES|EN|FR)<\/strong>/g, '<strong aria-current="page">$1</strong>');

  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = attribute(tag, "src");
    if (!src || /logo\.svg(?:[?#]|$)/i.test(src)) return tag;
    const asset = localImagePath(pagePath, src);
    const dimensions = asset ? imageDimensions(asset) : null;
    if (dimensions) {
      tag = setAttribute(tag, "width", dimensions.width);
      tag = setAttribute(tag, "height", dimensions.height);
    }
    if (!attribute(tag, "decoding")) tag = setAttribute(tag, "decoding", "async");
    return tag;
  });

  html = html.replace(/<div class="book-img">\s*(<img\b[^>]*>)/gi, (whole, img) => {
    return whole.replace(img, setAttribute(img, "loading", "lazy"));
  });
  html = html.replace(/<div class="cover">\s*(<img\b[^>]*>)/gi, (whole, img) => {
    img = setAttribute(img, "loading", "eager");
    img = setAttribute(img, "fetchpriority", "high");
    return whole.replace(/<img\b[^>]*>/i, img);
  });

  html = html.replace(/<details class="buy-item"[^>]*>[\s\S]*?<\/details>/gi, (details) => {
    if (!details.includes('class="buy-card featured"')) return details;
    let featuredLabel = "Edición más completa";
    if (/buy-language-title">(?:English|Anglais)</i.test(details)) featuredLabel = "Most complete edition";
    if (/buy-language-title">Français</i.test(details)) featuredLabel = "Édition la plus complète";
    return details.replace(
      '<div class="buy-card featured">',
      `<div class="buy-card featured" data-featured-label="${featuredLabel}">`,
    );
  });

  html = html.replace(/<a\b[^>]*class="buy-amazon"[^>]*>/gi, (tag) => {
    tag = setAttribute(tag, "target", "_blank");
    tag = setAttribute(tag, "rel", "noopener noreferrer");
    return tag;
  });
  html = html.replace(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>/gi, (tag) => addBooleanAttribute(tag, "defer"));

  if (["index.html", "en/index.html", "fr/index.html"].includes(page)) {
    html = html.replace(/<link\b(?=[^>]*\bas=["']image["'])(?=[^>]*\brel=["']preload["'])[^>]*\/?>/gi, "");
    const hero = page === "index.html" ? "images/hero-2026.webp" : "../images/hero-2026.webp";
    html = html.replace(
      /(<link\b[^>]*\brel=["']stylesheet["'][^>]*\/?>)/i,
      `$1\n<link rel="preload" as="image" href="${hero}" fetchpriority="high"/>`,
    );
  } else {
    html = html.replace(/<link\b(?=[^>]*\bas=["']image["'])(?=[^>]*\brel=["']preload["'])[^>]*\/?>/gi, (tag) => setAttribute(tag, "fetchpriority", "high"));
  }

  writeFileSync(pagePath, html, "utf8");
  process.stdout.write(`updated ${relative(repoRoot, pagePath)}\n`);
}
