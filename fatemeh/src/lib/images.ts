import "server-only";
import sharp, { type Metadata } from "sharp";

const ALLOWED = new Set(["jpeg", "png", "webp"]);

export class ImageRejected extends Error {}

/**
 * Validates an uploaded photo by decoding it (not by trusting its name or
 * MIME type), then re-encodes it. Re-encoding:
 *  - removes ALL metadata, including GPS location from phone cameras,
 *  - neutralises files that are "images" on the outside but carry other payloads,
 *  - applies the camera's rotation so photos display upright.
 */
export async function processUpload(input: Buffer) {
  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: 60_000_000, failOn: "error" }).metadata();
  } catch {
    throw new ImageRejected("This file couldn't be read as an image. Please upload a JPEG, PNG or WebP photo.");
  }
  if (!meta.format || !ALLOWED.has(meta.format)) {
    throw new ImageRejected("Please upload a JPEG, PNG or WebP photo.");
  }
  if ((meta.width ?? 0) < 400 || (meta.height ?? 0) < 400) {
    throw new ImageRejected("This photo is too small to assess. Please use a photo at least 400 pixels wide.");
  }

  const base = sharp(input, { limitInputPixels: 60_000_000 }).rotate();
  const full = await base
    .clone()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  const thumb = await base
    .clone()
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 76, mozjpeg: true })
    .toBuffer();

  return { full: full.data, thumb, width: full.info.width, height: full.info.height };
}
