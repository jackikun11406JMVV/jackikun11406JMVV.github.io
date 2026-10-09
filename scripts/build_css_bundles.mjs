import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = join(import.meta.dirname, "..");
const sourcePath = join(root, "styles.css");
const outputDir = join(root, "assets", "css");
const lines = readFileSync(sourcePath, "utf8").split(/\r?\n/);

if (lines.length < 2627 || !lines[2493]?.includes("Menú global compacto")) {
  throw new Error("styles.css cambió: revisa los rangos de build_css_bundles.mjs antes de regenerar los paquetes.");
}

const ranges = {
  perez: [[131, 131], [226, 245], [263, 277], [2203, 2287], [2290, 2294]],
  jara: [[170, 180], [247, 261], [1336, 1336], [1345, 1345], [1369, 1397], [1552, 1558]],
  saint: [
    [1113, 1178], [1200, 1202], [1228, 1229], [1528, 1551], [1559, 1612],
    [1627, 1631], [1635, 1643], [1646, 1785], [1838, 1844], [1882, 1928],
    [2143, 2148], [2335, 2443], [2447, 2455], [2462, 2491],
  ],
};

const inRanges = (lineNumber, group) => ranges[group].some(([start, end]) => lineNumber >= start && lineNumber <= end);
const groupForLine = lineNumber => Object.keys(ranges).find(group => inRanges(lineNumber, group)) || "core";

function minifyCss(source) {
  let output = "";
  let quote = "";
  let comment = false;
  let whitespace = false;

  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    const next = source[index + 1];

    if (comment) {
      if (char === "*" && next === "/") {
        comment = false;
        index++;
      }
      continue;
    }
    if (!quote && char === "/" && next === "*") {
      comment = true;
      index++;
      continue;
    }
    if (quote) {
      output += char;
      if (char === "\\") {
        output += next || "";
        index++;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === '"' || char === "'") {
      if (whitespace && output && !"{}:;,>~(".includes(output.at(-1))) output += " ";
      whitespace = false;
      quote = char;
      output += char;
      continue;
    }
    if (/\s/.test(char)) {
      whitespace = true;
      continue;
    }

    const noSpaceAfter = "{}:;,>~(";
    const noSpaceBefore = "{}:;,>~)";
    if (whitespace && output && !noSpaceAfter.includes(output.at(-1)) && !noSpaceBefore.includes(char)) {
      output += " ";
    }
    whitespace = false;
    if (char === "}" && output.endsWith(";")) output = output.slice(0, -1);
    output += char;
  }
  return output.trim();
}

function buildBundle(group) {
  const source = lines
    .filter((_, index) => {
      const owner = groupForLine(index + 1);
      return owner === "core" || owner === group;
    })
    .join("\n");
  return minifyCss(source).replace(/url\((["']?)images\//g, "url($1../../images/");
}

function assertBalanced(css, fileName) {
  const opens = [...css].filter(character => character === "{").length;
  const closes = [...css].filter(character => character === "}").length;
  if (opens !== closes) {
    throw new Error(`${fileName}.min.css no es válido: ${opens} aperturas y ${closes} cierres.`);
  }
}

mkdirSync(outputDir, { recursive: true });
const bundleNames = { core: "site", perez: "perez", jara: "jara", saint: "san-nicolas" };
const sizes = {};

for (const [group, fileName] of Object.entries(bundleNames)) {
  const css = buildBundle(group);
  assertBalanced(css, fileName);
  writeFileSync(join(outputDir, `${fileName}.min.css`), `${css}\n`, "utf8");
  sizes[fileName] = Buffer.byteLength(css, "utf8");
}

const pages = [
  "404.html", "index.html", "el-origen-del-ratoncito-perez.html", "jara-la-noble-ppp.html",
  "san-nicolas.html", "origen-ratoncito-perez.html", "origen-san-nicolas-papa-noel.html",
  "en/index.html", "en/el-origen-del-ratoncito-perez.html", "en/jara-la-noble-ppp.html",
  "en/san-nicolas.html", "en/origen-ratoncito-perez.html", "en/origen-san-nicolas-papa-noel.html",
  "fr/index.html", "fr/el-origen-del-ratoncito-perez.html", "fr/jara-la-noble-ppp.html",
  "fr/san-nicolas.html", "fr/origen-ratoncito-perez.html", "fr/origen-san-nicolas-papa-noel.html",
];

for (const page of pages) {
  const path = join(root, page);
  const name = basename(page);
  const group = name === "el-origen-del-ratoncito-perez.html" || name === "origen-ratoncito-perez.html"
    ? "perez"
    : name === "jara-la-noble-ppp.html"
      ? "jara"
      : name === "san-nicolas.html" || name === "origen-san-nicolas-papa-noel.html"
        ? "saint"
        : "core";
  const prefix = page.includes("/") ? "../" : "";
  let html = readFileSync(path, "utf8");
  html = html.replace(/(?:\.\.\/)?styles\.css\?v=[^"']+/g, `${prefix}assets/css/${bundleNames[group]}.min.css?v=20261010-4`);
  writeFileSync(path, html, "utf8");
}

console.log(JSON.stringify({ sourceBytes: Buffer.byteLength(readFileSync(sourcePath)), bundleBytes: sizes }, null, 2));
