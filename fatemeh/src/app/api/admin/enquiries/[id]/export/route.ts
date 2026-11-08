import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminForApi } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { getPrivate } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Subject access request export: everything held about one enquiry,
 * including the photographs, as a single JSON file. Owner only.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await adminForApi({ owner: true });
  if (!user) return new NextResponse("Not found", { status: 404 });
  const { id } = await params;

  const e = await db().enquiry.findUnique({
    where: { id },
    include: {
      photos: true,
      notes: { select: { body: true, createdAt: true } },
      quotes: { omit: { enquiryId: true } },
      appointments: { omit: { enquiryId: true } },
      deposits: { omit: { enquiryId: true } },
    },
  });
  if (!e) return new NextResponse("Not found", { status: 404 });

  const photos = await Promise.all(
    e.photos.map(async (p) => ({
      area: p.slot,
      uploadedAt: p.createdAt,
      image: `data:image/jpeg;base64,${(await getPrivate(p.storageKey)).toString("base64")}`,
    })),
  );
  const { photos: _p, retentionHold, lastActivityAt, ...rest } = e;
  const body = {
    exportedAt: new Date().toISOString(),
    note: "Copy of personal data held for this hair assessment enquiry.",
    enquiry: rest,
    photographs: photos,
    retention: { retentionHold, lastActivityAt },
  };

  await audit({ action: "ENQUIRY_EXPORTED", actorId: user.id, targetType: "Enquiry", targetId: e.id, reference: e.reference });
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.reference}-data-export.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
