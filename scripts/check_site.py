#!/usr/bin/env python3
"""Validación sin dependencias para la web estática de GitHub Pages."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
SITE_ORIGIN = "https://jackikun11406jmvv.github.io"
SITEMAP_NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
URL_ATTRS = {"a": ("href",), "img": ("src", "srcset"), "link": ("href",), "script": ("src",)}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.description = ""
        self.robots = ""
        self.canonical = ""
        self.language = ""
        self.h1_count = 0
        self.urls: list[tuple[str, str, str]] = []
        self.images: list[dict[str, str]] = []
        self.ids: list[str] = []
        self.alternates: dict[str, str] = {}
        self.json_ld: list[str] = []
        self.blank_links: list[dict[str, str]] = []
        self.structure: list[str] = []
        self._in_title = False
        self._in_json_ld = False
        self._json_buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key.lower(): (value or "") for key, value in attrs}
        tag = tag.lower()
        if tag == "html":
            self.language = data.get("lang", "")
        if tag in {"header", "main", "section", "article", "details", "footer"}:
            self.structure.append(f"{tag}:{data.get('class', '')}")
        if tag == "title":
            self._in_title = True
        if tag == "h1":
            self.h1_count += 1
        if data.get("id"):
            self.ids.append(data["id"])
        if tag == "meta":
            name = data.get("name", "").lower()
            if name == "description":
                self.description = data.get("content", "").strip()
            elif name == "robots":
                self.robots = data.get("content", "").lower()
        if tag == "link":
            rel = set(data.get("rel", "").lower().split())
            if "canonical" in rel:
                self.canonical = data.get("href", "")
            if "alternate" in rel and data.get("hreflang"):
                self.alternates[data["hreflang"].lower()] = data.get("href", "")
        if tag == "script" and data.get("type", "").lower() == "application/ld+json":
            self._in_json_ld = True
            self._json_buffer = []
        if tag == "img":
            self.images.append(data)
        if tag == "a" and data.get("target", "").lower() == "_blank":
            self.blank_links.append(data)
        for attr in URL_ATTRS.get(tag, ()):
            if value := data.get(attr):
                if attr == "srcset":
                    for item in value.split(","):
                        self.urls.append((tag, attr, item.strip().split()[0]))
                else:
                    self.urls.append((tag, attr, value))

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self._in_title = False
        if tag == "script" and self._in_json_ld:
            self._in_json_ld = False
            self.json_ld.append("".join(self._json_buffer).strip())
            self._json_buffer = []

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data
        if self._in_json_ld:
            self._json_buffer.append(data)


def parse_page(path: Path) -> PageParser:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.title = re.sub(r"\s+", " ", parser.title).strip()
    return parser


def url_to_path(source: Path, raw_url: str) -> tuple[Path | None, str]:
    raw_url = raw_url.strip()
    if not raw_url or raw_url.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
        return None, ""
    parsed = urlparse(raw_url)
    if parsed.scheme in {"http", "https"}:
        if f"{parsed.scheme}://{parsed.netloc}" != SITE_ORIGIN:
            return None, ""
        route = unquote(parsed.path)
        candidate = ROOT / route.lstrip("/")
    elif parsed.scheme or parsed.netloc:
        return None, ""
    else:
        route = unquote(parsed.path)
        candidate = ROOT / route.lstrip("/") if route.startswith("/") else source.parent / route
    if not route:
        candidate = ROOT / "index.html"
    elif route.endswith("/"):
        candidate = candidate / "index.html"
    return candidate.resolve(), unquote(parsed.fragment)


def iter_json_urls(value: object):
    if isinstance(value, dict):
        for child in value.values():
            yield from iter_json_urls(child)
    elif isinstance(value, list):
        for child in value:
            yield from iter_json_urls(child)
    elif isinstance(value, str) and value.startswith(SITE_ORIGIN):
        yield value


def json_ld_nodes(value: object) -> list[dict[str, object]]:
    """Devuelve solo entidades declaradas, no referencias @id anidadas."""
    if not isinstance(value, dict):
        return []
    graph = value.get("@graph")
    if isinstance(graph, list):
        return [node for node in graph if isinstance(node, dict)]
    return [value]


def schema_types(node: dict[str, object]) -> set[str]:
    value = node.get("@type")
    if isinstance(value, str):
        return {value}
    if isinstance(value, list):
        return {item for item in value if isinstance(item, str)}
    return set()


def fail(errors: list[str], path: Path, message: str) -> None:
    errors.append(f"{path.relative_to(ROOT)}: {message}")


def main() -> int:
    errors: list[str] = []
    html_files = sorted(ROOT.rglob("*.html"))
    pages = {path.resolve(): parse_page(path) for path in html_files}
    json_ld_by_page: dict[Path, list[object]] = {}

    for path, page in pages.items():
        duplicates = sorted({item for item in page.ids if page.ids.count(item) > 1})
        if duplicates:
            fail(errors, path, f"identificadores duplicados: {', '.join(duplicates)}")
        for image in page.images:
            if not image.get("alt", "").strip():
                fail(errors, path, f"imagen sin texto alternativo: {image.get('src', '(sin src)')}")
            if not image.get("width") or not image.get("height"):
                fail(errors, path, f"imagen sin dimensiones: {image.get('src', '(sin src)')}")
        for link in page.blank_links:
            rel = set(link.get("rel", "").lower().split())
            if "noopener" not in rel:
                fail(errors, path, f"enlace target=_blank sin rel=noopener: {link.get('href', '')}")

        for tag, attr, raw_url in page.urls:
            target, fragment = url_to_path(path, raw_url)
            if target is None:
                continue
            if target == ROOT or target.is_dir():
                target = target / "index.html"
            if not target.exists():
                fail(errors, path, f"recurso local inexistente en {tag}[{attr}]: {raw_url}")
                continue
            if fragment and target.suffix.lower() in {".html", ".htm"}:
                target_page = pages.get(target.resolve())
                if target_page and fragment not in target_page.ids:
                    fail(errors, path, f"fragmento inexistente: {raw_url}")

        parsed_json_ld: list[object] = []
        for index, block in enumerate(page.json_ld, start=1):
            try:
                data = json.loads(block)
            except json.JSONDecodeError as exc:
                fail(errors, path, f"JSON-LD {index} inválido: {exc.msg} (línea {exc.lineno})")
                continue
            parsed_json_ld.append(data)
            for raw_url in iter_json_urls(data):
                target, _ = url_to_path(path, raw_url)
                if target is not None and target.suffix and not target.exists():
                    fail(errors, path, f"URL local inexistente en JSON-LD: {raw_url}")
        json_ld_by_page[path] = parsed_json_ld

        declared_nodes = [node for data in parsed_json_ld for node in json_ld_nodes(data)]
        declared_ids = [node.get("@id") for node in declared_nodes if isinstance(node.get("@id"), str)]
        duplicate_schema_ids = sorted({item for item in declared_ids if declared_ids.count(item) > 1})
        if duplicate_schema_ids:
            fail(errors, path, f"entidades JSON-LD duplicadas: {', '.join(duplicate_schema_ids)}")

    language_clusters = [
        ["index.html", "en/index.html", "fr/index.html"],
        ["el-origen-del-ratoncito-perez.html", "en/el-origen-del-ratoncito-perez.html", "fr/el-origen-del-ratoncito-perez.html"],
        ["jara-la-noble-ppp.html", "en/jara-la-noble-ppp.html", "fr/jara-la-noble-ppp.html"],
        ["origen-ratoncito-perez.html", "en/origen-ratoncito-perez.html", "fr/origen-ratoncito-perez.html"],
        ["san-nicolas.html", "en/san-nicolas.html", "fr/san-nicolas.html"],
    ]
    for cluster in language_clusters:
        # La pagina editorial de origen puede tener una estructura distinta por idioma
        # sin que eso implique un error tecnico de la web.
        if cluster[0] == "origen-ratoncito-perez.html":
            continue
        reference = pages[(ROOT / cluster[0]).resolve()].structure
        for candidate in cluster[1:]:
            if pages[(ROOT / candidate).resolve()].structure != reference:
                errors.append(f"{candidate}: la estructura no coincide con la versión española {cluster[0]}")

    schema_requirements = {
        "home": ({"Person", "Organization", "WebSite", "WebPage", "CollectionPage", "CreativeWorkSeries"}, language_clusters[0]),
        "perez": ({"Person", "Organization", "BookPage", "Book", "BreadcrumbList", "FAQPage"}, language_clusters[1]),
        "jara": ({"Person", "Organization", "BookPage", "Book", "BreadcrumbList"}, language_clusters[2]),
        "origin": ({"Person", "Article", "BreadcrumbList", "FAQPage"}, language_clusters[3]),
        "saint": ({"Book", "BreadcrumbList"}, language_clusters[4]),
    }
    for cluster_name, (required_types, paths) in schema_requirements.items():
        for relative_path in paths:
            path = (ROOT / relative_path).resolve()
            nodes = [node for data in json_ld_by_page.get(path, []) for node in json_ld_nodes(data)]
            present_types = set().union(*(schema_types(node) for node in nodes)) if nodes else set()
            missing_types = sorted(required_types - present_types)
            if missing_types:
                fail(errors, path, f"schema {cluster_name} incompleto; faltan tipos: {', '.join(missing_types)}")
            if cluster_name == "perez":
                faq_count = sum("FAQPage" in schema_types(node) for node in nodes)
                if faq_count != 1:
                    fail(errors, path, f"debe declarar una sola FAQPage y declara {faq_count}")

    for css in sorted(ROOT.glob("*.css")):
        text = css.read_text(encoding="utf-8")
        for raw_url in re.findall(r"url\(\s*['\"]?([^)'\"]+)", text, flags=re.I):
            target, _ = url_to_path(css, raw_url)
            if target is not None and not target.exists():
                fail(errors, css, f"recurso CSS inexistente: {raw_url}")

    purchase_contracts = {
        "perez": {
            "es": {"B0H274BD3J", "B0H247GFV3", "B0H2CKRR67"},
            "en": {"B0H28NQ8SQ", "B0H2B5GT6J", "B0H2C62YNM"},
            "fr": {"B0H3KWF5YB", "B0H3LBXMHD", "B0H12YB6KW"},
        },
        "jara": {
            "es": {"B0H6KVFH2P", "B0H6NPP9KH"},
            "en": {"B0HBCZKTS2", "B0HB9VHXXD"},
            "fr": {"B0HBRW2QFQ", "B0HBBZ1M5L"},
        },
    }
    product_pages = {
        "perez": [ROOT / "el-origen-del-ratoncito-perez.html", ROOT / "en/el-origen-del-ratoncito-perez.html", ROOT / "fr/el-origen-del-ratoncito-perez.html"],
        "jara": [ROOT / "jara-la-noble-ppp.html", ROOT / "en/jara-la-noble-ppp.html", ROOT / "fr/jara-la-noble-ppp.html"],
    }
    language_names = {
        "es": {"Español", "Espagnol"},
        "en": {"English", "Anglais"},
        "fr": {"Français"},
    }
    for product, paths in product_pages.items():
        for path in paths:
            html = path.read_text(encoding="utf-8")
            page_language = "en" if path.parent.name == "en" else "fr" if path.parent.name == "fr" else "es"
            details_blocks = re.findall(r'<details class="buy-item"([^>]*)>([\s\S]*?)</details>', html, flags=re.I)
            seen_languages: set[str] = set()
            open_languages: set[str] = set()
            for attributes, block in details_blocks:
                title_match = re.search(r'buy-language-title">([^<]+)', block)
                title = title_match.group(1).strip() if title_match else ""
                language = next((code for code, names in language_names.items() if title in names), "")
                if not language:
                    fail(errors, path, f"idioma de compra no reconocido: {title!r}")
                    continue
                seen_languages.add(language)
                if re.search(r"\bopen\b", attributes):
                    open_languages.add(language)
                asins = set(re.findall(r"letraminuscula\.com/amz/([A-Z0-9]+)", block))
                expected = purchase_contracts[product][language]
                if asins != expected:
                    fail(errors, path, f"enlaces de compra {language} incorrectos: {sorted(asins)}; esperados {sorted(expected)}")
            if seen_languages != {"es", "en", "fr"}:
                fail(errors, path, f"faltan bloques de compra: {sorted({'es', 'en', 'fr'} - seen_languages)}")
            if open_languages != {page_language}:
                fail(errors, path, f"debe estar abierto solo el bloque {page_language} y están abiertos {sorted(open_languages)}")

    image_files = [path for path in (ROOT / "images").rglob("*") if path.is_file()]
    image_total = sum(path.stat().st_size for path in image_files)
    image_budget = 13 * 1024 * 1024
    file_budget = 600 * 1024
    if image_total > image_budget:
        errors.append(f"images/: supera el presupuesto de 13 MiB ({image_total / 1024 / 1024:.2f} MiB)")
    for image in image_files:
        if image.stat().st_size > file_budget:
            fail(errors, image, f"supera el presupuesto individual de 600 KiB ({image.stat().st_size / 1024:.0f} KiB)")

    sitemap_path = ROOT / "sitemap.xml"
    sitemap = ElementTree.parse(sitemap_path)
    sitemap_urls = sitemap.findall("s:url", SITEMAP_NS)
    locs = [node.text.strip() for node in sitemap.findall(".//s:loc", SITEMAP_NS) if node.text]
    if len(locs) != len(set(locs)):
        fail(errors, sitemap_path, "contiene URLs duplicadas")
    if len(locs) != 15:
        fail(errors, sitemap_path, f"debe contener 15 páginas publicables y contiene {len(locs)}")
    for url_node in sitemap_urls:
        loc_node = url_node.find("s:loc", SITEMAP_NS)
        lastmod_node = url_node.find("s:lastmod", SITEMAP_NS)
        loc = loc_node.text.strip() if loc_node is not None and loc_node.text else "(sin loc)"
        lastmod = lastmod_node.text.strip() if lastmod_node is not None and lastmod_node.text else ""
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", lastmod):
            fail(errors, sitemap_path, f"lastmod ausente o inválido para {loc}: {lastmod!r}")

    hreflang_reference: dict[str, dict[str, str]] = {}
    titles: dict[str, list[str]] = {}
    descriptions: dict[str, list[str]] = {}
    for loc in locs:
        target, _ = url_to_path(sitemap_path, loc)
        if target is None or not target.exists():
            fail(errors, sitemap_path, f"URL sin archivo local: {loc}")
            continue
        page = pages.get(target.resolve())
        if page is None:
            fail(errors, sitemap_path, f"URL no apunta a HTML analizable: {loc}")
            continue
        if page.canonical != loc:
            fail(errors, target, f"canonical {page.canonical!r} no coincide con sitemap {loc!r}")
        if page.language not in {"es", "en", "fr"}:
            fail(errors, target, f"idioma HTML inválido o ausente: {page.language!r}")
        if not page.title:
            fail(errors, target, "falta title")
        if not page.description:
            fail(errors, target, "falta meta description")
        if page.title:
            titles.setdefault(page.title.casefold(), []).append(loc)
        if page.description:
            descriptions.setdefault(page.description.casefold(), []).append(loc)
        if page.h1_count != 1:
            fail(errors, target, f"debe tener un H1 y tiene {page.h1_count}")
        if "noindex" in page.robots:
            fail(errors, target, "está en el sitemap pero tiene noindex")
        if not page.robots:
            fail(errors, target, "falta una directiva robots explícita")
        required = {"es", "en", "fr", "x-default"}
        if set(page.alternates) != required:
            missing = sorted(required - set(page.alternates))
            extra = sorted(set(page.alternates) - required)
            fail(errors, target, f"hreflang incompleto; faltan={missing}, sobran={extra}")
        hreflang_reference[loc] = page.alternates

    for value, urls in titles.items():
        if len(urls) > 1:
            errors.append(f"SEO: title duplicado en {', '.join(urls)}: {value!r}")
    for value, urls in descriptions.items():
        if len(urls) > 1:
            errors.append(f"SEO: meta description duplicada en {', '.join(urls)}: {value!r}")

    loc_set = set(locs)
    for loc, alternates in hreflang_reference.items():
        for language, alternate in alternates.items():
            if alternate not in loc_set:
                errors.append(f"sitemap.xml: hreflang {language} de {loc} no está en sitemap: {alternate}")
                continue
            other = hreflang_reference.get(alternate, {})
            if other != alternates:
                errors.append(f"sitemap.xml: clúster hreflang no recíproco entre {loc} y {alternate}")

    if errors:
        print("VALIDACIÓN FALLIDA")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"VALIDACIÓN CORRECTA: {len(html_files)} HTML, {len(locs)} páginas publicables y 0 enlaces locales rotos.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
