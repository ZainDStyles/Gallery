import "server-only";
import { headers } from "next/headers";
import { hashIp } from "./crypto";
import { appUrl } from "./env";

/** Best-effort client IP (Vercel / most proxies set x-forwarded-for). */
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return hashIp(ip);
}

export async function userAgent(): Promise<string | null> {
  return (await headers()).get("user-agent")?.slice(0, 300) ?? null;
}

/**
 * Blocks cross-site requests to our JSON/upload routes.
 * (Server Actions already get this check from Next.js.)
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    const o = new URL(origin);
    return o.host === host || o.origin === new URL(appUrl()).origin;
  } catch {
    return false;
  }
}
