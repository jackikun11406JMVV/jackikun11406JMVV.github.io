import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { existsSync, unlinkSync } from "node:fs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const jobs = [
  ["images/hero-cuentos-v5.webp", "images/hero-cuentos-v5-720.webp", 720, 78],
  ["images/es/san-nicolas-hero.webp", "images/es/san-nicolas-hero-720.webp", 720, 80],
  ["images/es/san-nicolas-hero.webp", "images/es/san-nicolas-hero-1100.webp", 1100, 82],
  ["images/es/san-nicolas-cover.webp", "images/es/san-nicolas-cover-480.webp", 480, 80],
  ["images/es/perez-cover.webp", "images/es/perez-cover-480.webp", 480, 80],
  ["images/en/perez-cover.webp", "images/en/perez-cover-480.webp", 480, 80],
  ["images/fr/perez-cover.webp", "images/fr/perez-cover-480.webp", 480, 80],
  ["images/es/jara-cover.webp", "images/es/jara-cover-480.webp", 480, 80],
  ["images/en/jara-cover.webp", "images/en/jara-cover-480.webp", 480, 80],
  ["images/fr/jara-cover.webp", "images/fr/jara-cover-480.webp", 480, 80],
];

const originalsToOptimize = [
  ["images/hero-cuentos-v5.webp", 82],
  ["images/es/perez-page-02.webp", 82],
  ["images/en/perez-coloma-origin.webp", 82],
  ["images/fr/perez-coloma-origin.webp", 82],
  ["images/es/jara-back-cover.webp", 82],
  ["images/en/jara-back-cover.webp", 82],
  ["images/fr/jara-back-cover.webp", 82],
];

for (const [relative, quality] of originalsToOptimize) {
  const input = path.join(root, relative);
  const temporary = `${input}.optimized.webp`;
  if (existsSync(temporary)) unlinkSync(temporary);
  await sharp(input).webp({ quality, effort: 5 }).toFile(temporary);
  console.log(`${relative} prepared`);
}

for (const [input, output, width, quality] of jobs) {
  await sharp(path.join(root, input))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(path.join(root, output));
  console.log(output);
}
