import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminForApi } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { getPrivate } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The ONLY way a patient photograph leaves storage: decrypted on the fly for a
 * signed-in, two-factor-verified admin, never cached, never given a public URL.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await adminForApi();
  if (!user) return new NextResponse("Not found", { status: 404 });

  const { id } = await params;
  const size = new URL(req.url).searchParams.get("size") === "full" ? "full" : "thumb";
  const photo = await db().photo.findUnique({ where: { id }, include: { enquiry: { select: { reference: true } } } });
  if (!photo?.enquiryId) return new NextResponse("Not found", { status: 404 });

  let body: Buffer;
  try {
    body = await getPrivate(size === "full" ? photo.storageKey : photo.thumbKey);
  } catch (err) {
    console.error("[photos] could not read", err);
    return new NextResponse("Unavailable", { status: 500 });
  }

  if (size === "full") {
    await audit({ action: "PHOTO_VIEWED", actorId: user.id, targetType: "Photo", targetId: photo.id, reference: photo.enquiry?.reference, detail: photo.slot });
  }

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(body.length),
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `inline; filename="${photo.slot.toLowerCase()}.jpg"`,
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
