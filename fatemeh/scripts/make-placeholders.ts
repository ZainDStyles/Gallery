/**
 * Renders the ILLUSTRATED placeholders used by the results gallery until real,
 * consented patient photographs are supplied:  npm run placeholders:make
 *
 * They are diagrams of a scalp map (the same drawing as the procedure scene),
 * with transplanted grafts shown in bronze. They're labelled "Illustration"
 * wherever they appear, and are never presented as a patient result.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { buildScalp, hairStrokes, HAIR_LENGTH, headOutline, type Pattern } from "../src/lib/scalp";

const OUT = path.join(process.cwd(), "public/placeholders");
const W = 1200;
const H = 1500;
const S = 560; // px per unit
const cx = W / 2;
const cy = H / 2 + 20;
const px = (x: number) => (cx + x * S).toFixed(1);
const py = (y: number) => (cy + y * S).toFixed(1);

export const STAGES = [
  { key: "before", growth: 0 },
  { key: "3-months", growth: 0.22 },
  { key: "6-months", growth: 0.6 },
  { key: "12-months", growth: 1 },
] as const;

function svg(pattern: Pattern, growth: number, after: boolean) {
  const scalp = buildScalp(pattern);
  const extracted = new Set(after ? scalp.grafts.map((g) => g.from) : []);
  let native = "";
  let transplanted = "";
  let sites = "";
  scalp.follicles.forEach((f, i) => {
    if (!f.native) return;
    if (extracted.has(i)) {
      sites += `M${px(f.x)} ${py(f.y)}m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0`;
      return;
    }
    for (const [x1, y1, x2, y2] of hairStrokes(f.x, f.y, f.angle, f.hairs, HAIR_LENGTH * (0.85 + f.seed * 0.3)))
      native += `M${px(x1)} ${py(y1)}L${px(x2)} ${py(y2)}`;
  });
  if (after && growth > 0) {
    for (const g of scalp.grafts)
      for (const [x1, y1, x2, y2] of hairStrokes(g.to.x, g.to.y, g.to.angle, g.hairs, Math.max(0.006, HAIR_LENGTH * growth)))
        transplanted += `M${px(x1)} ${py(y1)}L${px(x2)} ${py(y2)}`;
  }
  const outline = headOutline().map((p, i) => `${i ? "L" : "M"}${px(p.x)} ${py(p.y)}`).join("") + "Z";
  const ear = (side: 1 | -1) => `M${px(side * 0.74)} ${py(-0.1)}q${side * 34} 40 0 120`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><radialGradient id="g" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="#2a2723"/><stop offset="1" stop-color="#161513"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <path d="${outline}" fill="#221f1c" stroke="#4a443d" stroke-width="2"/>
  <path d="${ear(1)}${ear(-1)}" fill="none" stroke="#4a443d" stroke-width="2"/>
  <path d="M${px(-0.05)} ${py(-1.02)}L${px(0)} ${py(-1.1)}L${px(0.05)} ${py(-1.02)}" fill="none" stroke="#4a443d" stroke-width="2"/>
  <path d="${sites}" fill="none" stroke="#6a6158" stroke-width="1.2"/>
  <path d="${native}" stroke="#e9e1d4" stroke-opacity="0.82" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="${transplanted}" stroke="#c9a27a" stroke-width="2.6" stroke-linecap="round" fill="none"/>
</svg>`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const pattern of ["recession", "crown", "both"] as const) {
    for (const stage of STAGES) {
      const file = path.join(OUT, `${pattern}-${stage.key}.webp`);
      await sharp(Buffer.from(svg(pattern, stage.growth, stage.key !== "before")))
        .webp({ quality: 82 })
        .toFile(file);
      console.log("✓", path.relative(process.cwd(), file));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
