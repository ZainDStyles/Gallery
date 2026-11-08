/**
 * BEFORE & AFTER PHOTO PREPARATION
 *
 *   npm run results:prepare
 *
 * Put each case in its own folder:
 *
 *   content/results-source/<case-id>/before.jpg   (any JPEG/PNG/WebP/TIFF)
 *   content/results-source/<case-id>/after.jpg
 *   content/results-source/<case-id>/case.json
 *
 * case.json:
 *   {
 *     "title": "Hairline restoration",
 *     "categories": ["fue", "hairline"],        // any of: fue, dhi, hairline, crown
 *     "technique": "FUE",
 *     "grafts": "2,800 grafts",                 // optional
 *     "timeAfter": "12 months after",
 *     "note": "optional one-line note",
 *     "consentConfirmed": true,                 // REQUIRED: written consent for website use
 *     "consentRecord": "Signed form 2026-11-02", // where the consent is filed
 *     "crop": {                                 // optional, in source pixels, to line both up
 *       "before": { "left": 0, "top": 120, "width": 1600, "height": 2000 },
 *       "after":  { "left": 40, "top": 100, "width": 1600, "height": 2000 }
 *     }
 *   }
 *
 * What it does, identically for before and after:
 *   - applies camera rotation and converts to sRGB,
 *   - crops both to the same 4:5 frame (centre, or your manual crop),
 *   - resizes both to exactly the same pixel size,
 *   - strips ALL metadata (location, device, dates),
 *   - writes public/results/<case-id>/{before,after}.jpg and the gallery manifest.
 *
 * What it deliberately does NOT do: upscale, sharpen, retouch, filter or
 * "enhance". Small photos stay small, so the comparison stays honest.
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "content/results-source");
const OUT = path.join(ROOT, "public/results");
const MANIFEST = path.join(ROOT, "src/content/results.generated.json");

const RATIO = 4 / 5; // width / height — matches the slider frame on the site
const MAX_W = 1600;
const MIN_W = 800; // below this we warn: ask the clinic for the original files
const CATEGORIES = new Set(["fue", "dhi", "hairline", "crown"]);

type Box = { left: number; top: number; width: number; height: number };
type CaseFile = {
  title: string;
  categories: string[];
  technique: string;
  grafts?: string;
  timeAfter: string;
  note?: string;
  consentConfirmed: boolean;
  consentRecord?: string;
  order?: number;
  crop?: { before?: Box; after?: Box };
};

const findImage = async (dir: string, base: string) => {
  const files = await readdir(dir);
  const hit = files.find((f) => f.toLowerCase().startsWith(base) && /\.(jpe?g|png|webp|tiff?)$/i.test(f));
  return hit ? path.join(dir, hit) : null;
};

/** Largest 4:5 box centred in the image (or the manual crop, if given). */
async function frame(file: string, manual?: Box) {
  const img = sharp(file).rotate();
  const { data, info } = await img.toBuffer({ resolveWithObject: true }); // apply rotation first
  if (manual) return { data, box: manual };
  const w = info.width;
  const h = info.height;
  const box =
    w / h > RATIO
      ? { width: Math.round(h * RATIO), height: h, left: Math.round((w - h * RATIO) / 2), top: 0 }
      : { width: w, height: Math.round(w / RATIO), left: 0, top: Math.round((h - w / RATIO) / 2) };
  return { data, box };
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.log(`No ${path.relative(ROOT, SOURCE)} folder yet. Create it and add one folder per case (see the notes at the top of this script).`);
    return;
  }
  const ids = (await readdir(SOURCE, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const cases: object[] = [];
  const problems: string[] = [];

  await rm(OUT, { recursive: true, force: true });

  for (const id of ids) {
    const dir = path.join(SOURCE, id);
    const slug = id.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    try {
      const meta = JSON.parse(await readFile(path.join(dir, "case.json"), "utf8")) as CaseFile;
      if (meta.consentConfirmed !== true) throw new Error("consentConfirmed is not true: skipped (no written consent, no publication)");
      if (!meta.title || !meta.technique || !meta.timeAfter) throw new Error("title, technique and timeAfter are required");
      const bad = (meta.categories ?? []).filter((c) => !CATEGORIES.has(c));
      if (!meta.categories?.length || bad.length) throw new Error(`categories must be from: ${[...CATEGORIES].join(", ")}`);

      const beforeFile = await findImage(dir, "before");
      const afterFile = await findImage(dir, "after");
      if (!beforeFile || !afterFile) throw new Error("needs both a before.* and an after.* image");

      const [b, a] = await Promise.all([frame(beforeFile, meta.crop?.before), frame(afterFile, meta.crop?.after)]);
      // Same output size for both, never larger than the smaller of the two crops.
      const width = Math.min(MAX_W, b.box.width, a.box.width, Math.floor(Math.min(b.box.height, a.box.height) * RATIO));
      const height = Math.round(width / RATIO);
      if (width < MIN_W) problems.push(`${id}: low resolution (${width}×${height}). Ask for the original, uncompressed photos.`);

      await mkdir(path.join(OUT, slug), { recursive: true });
      const render = (src: { data: Buffer; box: Box }, name: string) =>
        sharp(src.data)
          .extract(src.box)
          .resize(width, height, { fit: "fill" }) // box already has the right ratio
          .toColourspace("srgb")
          .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" }) // no metadata is written
          .toFile(path.join(OUT, slug, `${name}.jpg`));
      await Promise.all([render(b, "before"), render(a, "after")]);

      cases.push({
        id: slug,
        order: meta.order ?? 0,
        title: meta.title,
        categories: meta.categories,
        technique: meta.technique,
        grafts: meta.grafts,
        timeAfter: meta.timeAfter,
        note: meta.note,
        before: { src: `/results/${slug}/before.jpg`, width, height },
        after: { src: `/results/${slug}/after.jpg`, width, height },
      });
      console.log(`✓ ${id}  →  ${width}×${height}`);
    } catch (err) {
      problems.push(`${id}: ${(err as Error).message}`);
    }
  }

  cases.sort((x, y) => (x as { order: number }).order - (y as { order: number }).order);
  await writeFile(MANIFEST, JSON.stringify({ generatedAt: new Date().toISOString(), cases: cases.map(({ order: _o, ...c }: { order?: number }) => c) }, null, 2) + "\n");
  console.log(`\n${cases.length} case(s) written to ${path.relative(ROOT, MANIFEST)}`);
  if (problems.length) console.log(`\nNeeds attention:\n${problems.map((p) => `  ! ${p}`).join("\n")}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
