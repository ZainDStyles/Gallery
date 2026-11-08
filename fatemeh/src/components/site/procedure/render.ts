import { HAIR_LENGTH, hairStrokes, headOutline, insideHead, headRx, type Scalp } from "@/lib/scalp";

/**
 * Draws one frame of the procedure scene for a progress value p (0 → 1).
 * Everything is a pure function of p, so scrolling backwards just works.
 *
 * Chapters:  1 Assessment · 2 Design · 3 Extraction · 4 Implantation · 5 Growth
 */
export const CHAPTERS = [0, 0.17, 0.35, 0.55, 0.78, 1] as const;

const IVORY = "233,225,212";
const BRONZE = "201,162,122";
const BRONZE_DEEP = "184,138,90";
const LINE = "74,68,61";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ch = (p: number, i: number) => seg(p, CHAPTERS[i], CHAPTERS[i + 1]);

/** Camera per chapter: centre (unit space) and zoom. */
const CAMS = [
  { x: 0, y: 0, z: 1 },
  { x: 0, y: -0.42, z: 1.32 },
  { x: 0, y: 0.46, z: 1.25 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: 1 },
];

function camera(p: number) {
  let i = 0;
  while (i < 4 && p >= CHAPTERS[i + 1]) i++;
  const t = ease(seg(p, CHAPTERS[i], CHAPTERS[i] + (CHAPTERS[i + 1] - CHAPTERS[i]) * 0.35));
  const from = CAMS[Math.max(0, i - 1)];
  const to = CAMS[i];
  return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t), z: lerp(from.z, to.z, t) };
}

export type SceneCache = { outline: { x: number; y: number }[]; outlineLen: number; order: number[]; rank: number[]; font: string };

export function prepare(scalp: Scalp): SceneCache {
  const outline = headOutline(180);
  let outlineLen = 0;
  for (let i = 1; i < outline.length; i++) outlineLen += Math.hypot(outline[i].x - outline[i - 1].x, outline[i].y - outline[i - 1].y);
  // Extraction happens in a scattered order, like a real session.
  const order = scalp.grafts.map((_, i) => i).sort((a, b) => ((a * 7919) % 97) - ((b * 7919) % 97));
  const rank: number[] = [];
  order.forEach((g, k) => (rank[g] = k));
  const font = typeof document !== "undefined" ? getComputedStyle(document.body).fontFamily : "sans-serif";
  return { outline, outlineLen, order, rank, font };
}

/** `intro` (0 → 1) draws the head outline as the section scrolls into view, before the pin starts. */
export function draw(ctx: CanvasRenderingContext2D, w: number, h: number, p: number, intro: number, scalp: Scalp, cache: SceneCache) {
  ctx.clearRect(0, 0, w, h);
  const cam = camera(p);
  const base = Math.min(w / 1.8, h / 2.3);
  const S = base * cam.z;
  const X = (x: number) => w / 2 + (x - cam.x) * S;
  const Y = (y: number) => h / 2 + (y - cam.y) * S;
  const lw = Math.max(1, S / 300); // hair line width scales with zoom

  const c1 = ch(p, 0);
  const c2 = ch(p, 1);
  const c3 = ch(p, 2);
  const c4 = ch(p, 3);
  const c5 = ch(p, 4);

  // ── Head ────────────────────────────────────────────────────────────────
  const outlineT = ease(clamp(Math.max(intro, p > 0 ? 1 : 0)));
  ctx.save();
  ctx.beginPath();
  cache.outline.forEach((pt, i) => (i ? ctx.lineTo(X(pt.x), Y(pt.y)) : ctx.moveTo(X(pt.x), Y(pt.y))));
  ctx.closePath();
  ctx.fillStyle = `rgba(34,31,28,${0.35 + 0.65 * outlineT})`;
  ctx.fill();
  ctx.setLineDash([cache.outlineLen * S * outlineT, cache.outlineLen * S]);
  ctx.strokeStyle = `rgba(${LINE},1)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
  // nose & ears for orientation
  ctx.globalAlpha = outlineT;
  ctx.beginPath();
  ctx.moveTo(X(-0.05), Y(-1.02));
  ctx.lineTo(X(0), Y(-1.1));
  ctx.lineTo(X(0.05), Y(-1.02));
  for (const s of [1, -1]) {
    ctx.moveTo(X(s * 0.75), Y(-0.12));
    ctx.quadraticCurveTo(X(s * 0.86), Y(0.0), X(s * 0.75), Y(0.12));
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Chapter 1: thinning "heat" + scan line ──────────────────────────────
  const heat = seg(c1, 0.55, 0.9) * (1 - seg(c2, 0.2, 0.7));
  if (heat > 0) {
    const pulse = 0.85 + 0.15 * Math.sin(p * 120);
    for (const [hx, hy, hr] of [
      [0, -0.62, 0.42],
      [scalp.crown.x, scalp.crown.y, 0.3],
    ]) {
      const g = ctx.createRadialGradient(X(hx), Y(hy), 0, X(hx), Y(hy), hr * S);
      g.addColorStop(0, `rgba(${BRONZE},${0.32 * heat * pulse})`);
      g.addColorStop(1, `rgba(${BRONZE},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(X(hx), Y(hy), hr * S, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Native hair, revealed by the scan line (top → bottom) in chapter 1.
  const scanY = lerp(-1.05, 1.05, ease(seg(c1, 0.2, 0.85)));
  const extractedUpTo = c3 > 0 ? ease(seg(c3, 0.15, 0.95)) * scalp.grafts.length : 0;
  const extracted = new Set<number>();
  for (let k = 0; k < Math.floor(extractedUpTo); k++) extracted.add(scalp.grafts[cache.order[k]].from);

  ctx.beginPath();
  const L = HAIR_LENGTH;
  for (let i = 0; i < scalp.follicles.length; i++) {
    const f = scalp.follicles[i];
    if (!f.native || f.y > scanY || extracted.has(i)) continue;
    for (const [x1, y1, x2, y2] of hairStrokes(f.x, f.y, f.angle, f.hairs, L * (0.85 + f.seed * 0.3))) {
      ctx.moveTo(X(x1), Y(y1));
      ctx.lineTo(X(x2), Y(y2));
    }
  }
  ctx.strokeStyle = `rgba(${IVORY},0.82)`;
  ctx.lineWidth = lw * 1.1;
  ctx.lineCap = "round";
  ctx.stroke();

  if (c1 > 0.15 && c1 < 0.95) {
    const sy = Y(scanY);
    const half = headRx(clamp(scanY, -0.99, 0.99)) * Math.sqrt(Math.max(0, 1 - scanY * scanY)) * S;
    const g = ctx.createLinearGradient(0, sy - 40, 0, sy + 2);
    g.addColorStop(0, `rgba(${BRONZE},0)`);
    g.addColorStop(1, `rgba(${BRONZE},0.28)`);
    ctx.fillStyle = g;
    ctx.fillRect(X(0) - half, sy - 40, half * 2, 42);
    ctx.strokeStyle = `rgba(${BRONZE},0.9)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(X(0) - half, sy);
    ctx.lineTo(X(0) + half, sy);
    ctx.stroke();
  }

  // ── Chapter 2: hairline design ──────────────────────────────────────────
  const design = ease(seg(c2, 0.25, 0.85));
  const designFade = 1 - seg(c4, 0.5, 1) * 0.8 - seg(c5, 0, 0.3) * 0.2;
  if (design > 0) {
    // area to restore, between the planned hairline and today's hairline
    ctx.save();
    ctx.globalAlpha = design * 0.16 * (1 - seg(c4, 0.3, 0.9));
    ctx.fillStyle = `rgb(${BRONZE})`;
    ctx.beginPath();
    scalp.hairline.forEach((pt, i) => (i ? ctx.lineTo(X(pt.x), Y(pt.y)) : ctx.moveTo(X(pt.x), Y(pt.y))));
    [...scalp.oldHairline].reverse().forEach((pt) => ctx.lineTo(X(pt.x), Y(pt.y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // planned hairline, drawn like a marker on skin
    const n = Math.max(2, Math.floor(scalp.hairline.length * design));
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const pt = scalp.hairline[i];
      if (i) ctx.lineTo(X(pt.x), Y(pt.y));
      else ctx.moveTo(X(pt.x), Y(pt.y));
    }
    ctx.strokeStyle = `rgba(${BRONZE},${0.95 * designFade})`;
    ctx.lineWidth = Math.max(1.5, S / 260);
    ctx.stroke();

    // crown plan: dashed circle
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(X(scalp.crown.x), Y(scalp.crown.y), 0.27 * S, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * design);
    ctx.strokeStyle = `rgba(${BRONZE},${0.7 * designFade})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);

    // labels
    const labelA = seg(c2, 0.6, 0.9) * (1 - seg(c3, 0, 0.25));
    if (labelA > 0) label(ctx, cache, X(0), Y(Math.min(...scalp.hairline.map((pt) => pt.y))) - 16, "Planned hairline", labelA, S);
  }

  // ── Chapter 3: donor area & extraction ──────────────────────────────────
  const donorA = seg(c3, 0, 0.25) * (1 - seg(c4, 0, 0.35));
  if (donorA > 0) {
    ctx.save();
    ctx.beginPath();
    cache.outline.forEach((pt, i) => (i ? ctx.lineTo(X(pt.x), Y(pt.y)) : ctx.moveTo(X(pt.x), Y(pt.y))));
    ctx.closePath();
    ctx.clip();
    ctx.lineWidth = 0.3 * S;
    ctx.strokeStyle = `rgba(${BRONZE},${0.1 * donorA})`;
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.02) {
      const a = lerp(Math.PI * 0.03, Math.PI * 0.97, t);
      const y = Math.sin(a) * 0.86;
      const x = Math.cos(a) * headRx(y) * 0.86;
      if (t === 0) ctx.moveTo(X(x), Y(y));
      else ctx.lineTo(X(x), Y(y));
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, cache, X(0), Y(0.98) + 22, "Donor area", seg(c3, 0.1, 0.3) * (1 - seg(c4, 0, 0.2)), S);
  }

  // Extraction sites: small rings that fade as the donor area heals (chapter 5).
  if (extracted.size) {
    const heal = 1 - seg(c5, 0.3, 1) * 0.8;
    ctx.beginPath();
    for (const i of extracted) {
      const f = scalp.follicles[i];
      ctx.moveTo(X(f.x) + 2.4, Y(f.y));
      ctx.arc(X(f.x), Y(f.y), 2.4, 0, Math.PI * 2);
    }
    ctx.strokeStyle = `rgba(176,160,140,${0.9 * heal})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ── Chapter 4: channels, then grafts fly to the recipient sites ─────────
  const channels = seg(c4, 0, 0.22);
  if (channels > 0 && c5 < 0.15) {
    const shown = Math.floor(scalp.grafts.length * channels);
    ctx.beginPath();
    for (let i = 0; i < shown; i++) {
      const g = scalp.grafts[i].to;
      const dx = Math.cos(g.angle) * 0.012;
      const dy = Math.sin(g.angle) * 0.012;
      ctx.moveTo(X(g.x - dx), Y(g.y - dy));
      ctx.lineTo(X(g.x + dx), Y(g.y + dy));
    }
    ctx.strokeStyle = `rgba(${BRONZE},${0.55 * (1 - seg(c5, 0, 0.15))})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Graft lengths over the growth timeline (chapter 5): fresh → shed → regrow.
  const growth =
    c5 <= 0
      ? 0.38
      : c5 < 0.22
        ? 0.38
        : c5 < 0.45
          ? lerp(0.38, 0.06, ease(seg(c5, 0.22, 0.45)))
          : lerp(0.06, 1, ease(seg(c5, 0.45, 0.95)));
  const shedAlpha = c5 > 0.22 && c5 < 0.5 ? lerp(1, 0.55, Math.sin(Math.PI * seg(c5, 0.22, 0.5))) : 1;

  const glow: [number, number][] = [];
  ctx.beginPath();
  for (let k = 0; k < scalp.grafts.length; k++) {
    const g = scalp.grafts[k];
    const src = scalp.follicles[g.from];
    const lifted = cache.rank[k] < extractedUpTo;
    if (!lifted) continue;

    // flight progress for this graft (hairline grafts are placed first)
    const start = 0.22 + (g.order / scalp.grafts.length) * 0.62;
    const fly = ease(seg(c4, start, start + 0.16));
    let x: number;
    let y: number;
    let angle: number;
    let len: number;
    if (fly <= 0) {
      // waiting in a "lifted" state just outside its donor site
      const out = Math.atan2(src.y, src.x);
      const lift = 0.04 * ease(seg(c3, 0, 0.3));
      glow.push([src.x + Math.cos(out) * lift, src.y + Math.sin(out) * lift]);
      x = src.x + Math.cos(out) * lift;
      y = src.y + Math.sin(out) * lift;
      angle = src.angle;
      len = 0.6;
    } else {
      const mx = (src.x + g.to.x) / 2;
      const my = (src.y + g.to.y) / 2 - 0.35;
      const t = fly;
      x = (1 - t) ** 2 * src.x + 2 * (1 - t) * t * mx + t * t * g.to.x;
      y = (1 - t) ** 2 * src.y + 2 * (1 - t) * t * my + t * t * g.to.y;
      angle = lerp(src.angle, g.to.angle, t);
      len = lerp(0.6, 0.38, t);
      if (t < 1) glow.push([x, y]);
    }
    if (fly >= 1) len = growth;
    for (const [x1, y1, x2, y2] of hairStrokes(x, y, angle, g.hairs, Math.max(0.004, L * len))) {
      ctx.moveTo(X(x1), Y(y1));
      ctx.lineTo(X(x2), Y(y2));
    }
  }
  ctx.strokeStyle = `rgba(${BRONZE},${shedAlpha})`;
  ctx.lineWidth = lw * 1.25;
  ctx.stroke();

  // a soft glow on grafts in flight
  for (const [gx, gy] of glow) {
    const r = Math.max(7, S / 55);
    const gr = ctx.createRadialGradient(X(gx), Y(gy), 0, X(gx), Y(gy), r);
    gr.addColorStop(0, `rgba(${BRONZE_DEEP},0.5)`);
    gr.addColorStop(1, `rgba(${BRONZE_DEEP},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(X(gx) - r, Y(gy) - r, r * 2, r * 2);
  }
}

function label(ctx: CanvasRenderingContext2D, cache: SceneCache, x: number, y: number, text: string, alpha: number, S: number) {
  if (alpha <= 0) return;
  const size = Math.max(10, Math.min(13, S / 30));
  ctx.save();
  ctx.font = `600 ${size}px ${cache.font}`;
  ctx.letterSpacing = "2px";
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(${BRONZE},${alpha})`;
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.restore();
}

// Re-exported for the static storyboard.
export { insideHead };
