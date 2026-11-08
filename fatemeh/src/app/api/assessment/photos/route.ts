import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sha256 } from "@/lib/crypto";
import { env } from "@/lib/env";
import { ImageRejected, processUpload } from "@/lib/images";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpHash, isSameOrigin } from "@/lib/request";
import { newStorageKey, putPrivate, removePrivate } from "@/lib/storage";
import { PHOTO_SLOTS, type PhotoSlotName } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PHOTOS_PER_SESSION = 12; // 4 slots, allowing for a few replacements
const json = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function sessionFrom(req: Request) {
  const token = req.headers.get("x-upload-token");
  if (!token || token.length > 100) return null;
  const session = await db().uploadSession.findUnique({ where: { tokenHash: sha256(token) } });
  return session && session.expiresAt > new Date() ? session : null;
}

/** Receives one photograph, validates and re-encodes it, encrypts it, stores it privately. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);

  const maxBytes = env().MAX_UPLOAD_MB * 1024 * 1024;
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes + 64 * 1024) return json({ error: `Please use a photo under ${env().MAX_UPLOAD_MB} MB.` }, 413);

  const session = await sessionFrom(req);
  if (!session) return json({ error: "Your upload session has expired. Please tick the consent box again." }, 401);

  if (!(await rateLimit("photo-upload", await clientIpHash(), 40, 3600))) {
    return json({ error: "Too many uploads. Please wait a while and try again." }, 429);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "The upload didn't complete. Please try again." }, 400);
  }
  const slot = String(form.get("slot") ?? "") as PhotoSlotName;
  const file = form.get("file");
  if (!PHOTO_SLOTS.includes(slot)) return json({ error: "Unknown photo type." }, 400);
  if (!(file instanceof File) || file.size === 0) return json({ error: "No photo received." }, 400);
  if (file.size > maxBytes) return json({ error: `Please use a photo under ${env().MAX_UPLOAD_MB} MB.` }, 413);

  const count = await db().photo.count({ where: { sessionId: session.id } });
  if (count >= MAX_PHOTOS_PER_SESSION) return json({ error: "Upload limit reached for this assessment." }, 429);

  let processed: Awaited<ReturnType<typeof processUpload>>;
  try {
    processed = await processUpload(Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    if (err instanceof ImageRejected) return json({ error: err.message }, 415);
    console.error("[upload] processing failed", err);
    return json({ error: "We couldn't process that photo. Please try another." }, 500);
  }

  const storageKey = newStorageKey();
  const thumbKey = newStorageKey();
  try {
    await Promise.all([putPrivate(storageKey, processed.full), putPrivate(thumbKey, processed.thumb)]);
  } catch (err) {
    await removePrivate(storageKey, thumbKey);
    console.error("[upload] storage failed", err);
    return json({ error: "We couldn't store that photo securely. Please try again." }, 500);
  }

  // Replacing a photo in the same slot removes the previous one immediately.
  const previous = await db().photo.findMany({ where: { sessionId: session.id, slot } });
  const photo = await db().photo.create({
    data: {
      slot,
      sessionId: session.id,
      storageKey,
      thumbKey,
      width: processed.width,
      height: processed.height,
      bytes: processed.full.length,
    },
  });
  if (previous.length) {
    await db().photo.deleteMany({ where: { id: { in: previous.map((p) => p.id) } } });
    await removePrivate(...previous.flatMap((p) => [p.storageKey, p.thumbKey]));
  }

  return json({ id: photo.id, slot });
}

/** Lets the visitor remove a photo they uploaded before submitting. */
export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const session = await sessionFrom(req);
  if (!session) return json({ error: "Session expired." }, 401);
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return json({ error: "Missing photo." }, 400);
  const photo = await db().photo.findFirst({ where: { id, sessionId: session.id } });
  if (!photo) return json({ ok: true });
  await db().photo.delete({ where: { id: photo.id } });
  await removePrivate(photo.storageKey, photo.thumbKey);
  return json({ ok: true });
}
