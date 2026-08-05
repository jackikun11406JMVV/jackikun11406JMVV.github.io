#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workDir = mkdtempSync(join(tmpdir(), "jmvv-svg-"));

const assets = [
  {
    source: join(repoRoot, "images", "logo.svg"),
    size: 256,
    viewBox: "0 0 151 151",
    width: 151,
    height: 151,
  },
  {
    source: join(repoRoot, "images", "favicon", "favicon.svg"),
    size: 256,
    viewBox: "0 0 512 512",
    width: 512,
    height: 512,
  },
];

try {
  for (const [index, asset] of assets.entries()) {
    const rendered = join(workDir, `asset-${index}.png`);
    const optimized = join(workDir, `asset-${index}-optimized.png`);
    const currentSvg = readFileSync(asset.source, "utf8");
    const embedded = currentSvg.match(/data:image\/png;base64,([^\"']+)/)?.[1];
    let encoded = embedded;

    if (!encoded) {
      execFileSync("inkscape", [
        asset.source,
        "--export-type=png",
        `--export-width=${asset.size}`,
        `--export-height=${asset.size}`,
        `--export-filename=${rendered}`,
      ]);
      execFileSync("convert", [
        rendered,
        "-strip",
        "-define",
        "png:compression-level=9",
        optimized,
      ]);
      encoded = readFileSync(optimized).toString("base64");
    }
    const svg = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${asset.viewBox}" width="${asset.width}" height="${asset.height}" role="img" aria-hidden="true">`,
      `  <image width="${asset.width}" height="${asset.height}" xlink:href="data:image/png;base64,${encoded}"/>`,
      "</svg>",
      "",
    ].join("\n");

    writeFileSync(asset.source, svg, "utf8");
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
