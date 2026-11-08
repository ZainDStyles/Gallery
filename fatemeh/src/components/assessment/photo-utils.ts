"use client";

/**
 * Shrinks a phone photo in the browser before upload: faster on mobile data,
 * stays under hosting upload limits, and converts iPhone HEIC to JPEG where
 * the browser can decode it. The server still validates and re-encodes.
 */
const MAX_EDGE = 2400;

async function decode(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Safari can decode HEIC through <img> even when createImageBitmap can't.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      return Object.assign(img, { width: img.naturalWidth, height: img.naturalHeight });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

export async function preparePhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error("Please choose a photo (JPEG, PNG, WebP or iPhone HEIC).");
  }
  if (file.size > 40 * 1024 * 1024) throw new Error("That file is too large. Please choose a photo under 40 MB.");

  let source: Awaited<ReturnType<typeof decode>>;
  try {
    source = await decode(file);
  } catch {
    throw new Error("This browser can't read that photo format. Please choose a JPEG, or take a screenshot of the photo and upload that.");
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
  const w = Math.round(source.width * scale);
  const h = Math.round(source.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't prepare this photo.");
  ctx.drawImage(source, 0, 0, w, h);
  if ("close" in source && typeof source.close === "function") source.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  canvas.width = canvas.height = 0; // free memory promptly on iOS
  if (!blob) throw new Error("Your browser couldn't prepare this photo.");
  return blob;
}

export type UploadResult = { id: string } | { error: string; status: number };

export function uploadPhoto(blob: Blob, slot: string, token: string, onProgress: (fraction: number) => void): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/assessment/photos");
    xhr.setRequestHeader("x-upload-token", token);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      const body = (xhr.response ?? {}) as { id?: string; error?: string };
      if (xhr.status === 200 && body.id) resolve({ id: body.id });
      else resolve({ error: body.error ?? "Upload failed. Please try again.", status: xhr.status });
    };
    xhr.onerror = () => resolve({ error: "Connection lost during upload. Please try again.", status: 0 });
    xhr.ontimeout = xhr.onerror;
    xhr.timeout = 120_000;
    const form = new FormData();
    form.append("slot", slot);
    form.append("file", blob, `${slot.toLowerCase()}.jpg`);
    xhr.send(form);
  });
}

export async function deletePhoto(id: string, token: string) {
  await fetch("/api/assessment/photos", {
    method: "DELETE",
    headers: { "content-type": "application/json", "x-upload-token": token },
    body: JSON.stringify({ id }),
  }).catch(() => undefined);
}
