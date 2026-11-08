/**
 * A top-down "scalp map": the same view clinicians use to plan a transplant.
 *
 * Pure geometry with no DOM, so it can drive the canvas scroll scene in the
 * browser AND render the illustrated placeholders in Node (scripts/make-placeholders.ts).
 *
 * Unit space: centre (0,0), front of the head is negative y (top of the
 * screen), the head is roughly 1.56 units wide and 2 units long.
 */

export type Zone = "forehead" | "front" | "temple" | "mid" | "crown" | "donor";
export type Pattern = "recession" | "crown" | "both";

export type Follicle = {
  x: number;
  y: number;
  angle: number; // growth direction, radians
  hairs: 1 | 2 | 3;
  zone: Zone;
  native: boolean; // present before treatment
  seed: number; // 0..1, for per-follicle variation
};

export type Graft = {
  from: number; // index of donor follicle
  to: { x: number; y: number; angle: number };
  hairs: 1 | 2 | 3;
  order: number; // 0 = placed first (hairline)
};

export type Scalp = {
  follicles: Follicle[];
  grafts: Graft[];
  hairline: { x: number; y: number }[];
  oldHairline: { x: number; y: number }[];
  crown: { x: number; y: number };
};

/** Small deterministic PRNG so every render is identical. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const HEAD_RY = 1;
/** Head half-width at height y: slightly narrower at the front (egg shape). */
export const headRx = (y: number) => 0.76 * (1 + 0.07 * y);
export const insideHead = (x: number, y: number, inset = 0) => {
  const rx = headRx(y) - inset;
  const ry = HEAD_RY - inset;
  return (x / rx) ** 2 + (y / ry) ** 2 <= 1;
};

/** Outline of the head as a closed polygon (for drawing). */
export function headOutline(steps = 160) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const y = Math.sin(t) * HEAD_RY;
    pts.push({ x: Math.cos(t) * headRx(y), y });
  }
  return pts;
}

const CROWN = { x: 0.03, y: 0.4 };

/** The designed hairline: soft curve, higher at the temples, with micro-irregularity. */
const designedHairline = (x: number) => -0.8 + 0.42 * (x / 0.62) ** 2 + 0.012 * Math.sin(x * 47) + 0.008 * Math.sin(x * 113);
/** Where hair currently starts in the "recession" patterns. */
const recededHairline = (x: number) => -0.62 + 0.62 * (x / 0.62) ** 2;

export function buildScalp(pattern: Pattern = "both", seed = 11): Scalp {
  const r = rng(seed);
  const follicles: Follicle[] = [];
  const spacing = 0.046;

  for (let gy = -HEAD_RY; gy <= HEAD_RY; gy += spacing) {
    for (let gx = -0.8; gx <= 0.8; gx += spacing) {
      const x = gx + (r() - 0.5) * spacing * 0.9;
      const y = gy + (r() - 0.5) * spacing * 0.9;
      if (!insideHead(x, y, 0.035)) continue;

      const hl = designedHairline(x);
      const nr = Math.sqrt((x / headRx(y)) ** 2 + y ** 2);
      const dCrown = Math.hypot(x - CROWN.x, y - CROWN.y);

      let zone: Zone;
      if (y < hl) zone = "forehead";
      else if (nr > 0.7 && y > -0.08) zone = "donor";
      else if (dCrown < 0.3) zone = "crown";
      else if (y < -0.36 && Math.abs(x) > 0.36) zone = "temple";
      else if (y < -0.3) zone = "front";
      else zone = "mid";
      if (zone === "forehead") continue;

      // Growth direction radiates from the crown whorl, with a spiral near it.
      const base = Math.atan2(y - CROWN.y, x - CROWN.x);
      const twist = 1.25 * Math.exp(-dCrown / 0.22);
      const angle = base + twist + (r() - 0.5) * 0.25;

      const p = r();
      const hairs: 1 | 2 | 3 = p < 0.32 ? 1 : p < 0.78 ? 2 : 3;

      // Which hair is present before treatment.
      let keep = 0.96;
      const receded = y < recededHairline(x);
      if (pattern !== "crown") {
        if (zone === "temple") keep = receded ? 0.06 : 0.55;
        else if (zone === "front") keep = receded ? 0.12 : 0.6;
      }
      if (pattern !== "recession" && zone === "crown") keep = 0.12 + 0.75 * Math.min(1, (dCrown / 0.3) ** 2);
      if (pattern === "both" && zone === "mid") keep = 0.8;

      follicles.push({ x, y, angle, hairs, zone, native: r() < keep, seed: r() });
    }
  }

  // Recipient sites: empty spots in the zones being restored, nearest the hairline
  // (or the crown centre) first.
  const empty = (zones: Zone[]) => follicles.filter((f) => !f.native && zones.includes(f.zone));
  const frontSites = pattern === "crown" ? [] : empty(["front", "temple"]).sort((a, b) => a.y - designedHairline(a.x) - (b.y - designedHairline(b.x)));
  const crownSites = pattern === "recession" ? [] : empty(["crown"]).sort((a, b) => Math.hypot(a.x - CROWN.x, a.y - CROWN.y) - Math.hypot(b.x - CROWN.x, b.y - CROWN.y));

  // Donor picks: spread out so the donor area keeps its density (donor hair is finite).
  const donorIdx = follicles.map((f, i) => (f.zone === "donor" && f.native ? i : -1)).filter((i) => i >= 0);
  const picks = donorIdx.filter((_, k) => k % 2 === 0).slice(0, frontSites.length + crownSites.length);
  // Shared plan: the front takes priority, the crown gets what remains (at least 40% when both are treated).
  const frontShare = crownSites.length ? Math.min(frontSites.length, Math.ceil(picks.length * 0.6)) : picks.length;
  const recipients = [...frontSites.slice(0, frontShare), ...crownSites.slice(0, picks.length - Math.min(frontShare, frontSites.length))];
  // Single-hair grafts go to the very front of the hairline, as in real planning.
  picks.sort((a, b) => follicles[a].hairs - follicles[b].hairs);

  const grafts: Graft[] = recipients.slice(0, picks.length).map((to, order) => ({
    from: picks[order],
    to: { x: to.x, y: to.y, angle: to.angle },
    hairs: follicles[picks[order]].hairs,
    order,
  }));

  const line = (fn: (x: number) => number) =>
    Array.from({ length: 61 }, (_, i) => {
      const x = -0.62 + (i / 60) * 1.24;
      return { x, y: fn(x) };
    }).filter((p) => insideHead(p.x, p.y, 0.02));

  return { follicles, grafts, hairline: line(designedHairline), oldHairline: line(recededHairline), crown: CROWN };
}

/** Strokes for one follicular unit (1–3 hairs fanning slightly). */
export function hairStrokes(x: number, y: number, angle: number, hairs: number, length: number) {
  const out: [number, number, number, number][] = [];
  const spread = [0, -0.16, 0.16];
  for (let h = 0; h < hairs; h++) {
    const a = angle + spread[h];
    const ox = Math.cos(angle + Math.PI / 2) * 0.006 * (h === 0 ? 0 : h === 1 ? -1 : 1);
    const oy = Math.sin(angle + Math.PI / 2) * 0.006 * (h === 0 ? 0 : h === 1 ? -1 : 1);
    out.push([x + ox, y + oy, x + ox + Math.cos(a) * length, y + oy + Math.sin(a) * length]);
  }
  return out;
}

export const HAIR_LENGTH = 0.056;
