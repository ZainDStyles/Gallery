import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { safeEqual } from "@/lib/crypto";
import { runRetention } from "@/lib/enquiries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily data-retention job. On Vercel, `vercel.json` schedules it and sends
 * `Authorization: Bearer $CRON_SECRET` automatically. Elsewhere, call it from
 * any scheduler with that header.
 */
export async function GET(req: Request) {
  const secret = env().CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const summary = await runRetention();
  return NextResponse.json({ ok: true, ...summary });
}
