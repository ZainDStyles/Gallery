import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../db";
import { randomToken, sha256 } from "../crypto";
import { env, isProduction } from "../env";
import { clientIpHash, userAgent } from "../request";

const ABSOLUTE_HOURS = 12;
const IDLE_MINUTES = 120;
const TOUCH_EVERY_MS = 5 * 60 * 1000;

/** `__Host-` cookies must be Secure, path=/ and host-only — the strictest kind. */
export const sessionCookieName = () => (isProduction() ? "__Host-fatemeh_admin" : "fatemeh_admin");

export async function createSession(userId: string, mfaVerified: boolean) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + ABSOLUTE_HOURS * 3600_000);
  await db().adminSession.create({
    data: { id: sha256(token), userId, mfaVerified, expiresAt, userAgent: await userAgent(), ipHash: await clientIpHash() },
  });
  (await cookies()).set(sessionCookieName(), token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(sessionCookieName())?.value;
  if (token) await db().adminSession.deleteMany({ where: { id: sha256(token) } });
  jar.delete(sessionCookieName());
}

/** Reads and validates the admin session. Cached per request. */
export const getSession = cache(async () => {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (!token) return null;
  const id = sha256(token);
  const session = await db().adminSession.findUnique({ where: { id }, include: { user: true } });
  if (!session) return null;

  const now = Date.now();
  const idleExpired = now - session.lastSeenAt.getTime() > IDLE_MINUTES * 60_000;
  if (session.expiresAt.getTime() < now || idleExpired) {
    await db().adminSession.delete({ where: { id } }).catch(() => undefined);
    return null;
  }
  if (now - session.lastSeenAt.getTime() > TOUCH_EVERY_MS) {
    await db().adminSession.update({ where: { id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
  }
  return session;
});

export async function markSessionMfaVerified() {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (token) await db().adminSession.update({ where: { id: sha256(token) }, data: { mfaVerified: true } });
}

/**
 * Use at the top of every admin page, server action and API route.
 * Redirects to login / two-factor screens as needed.
 */
export async function requireAdmin(opts: { owner?: boolean } = {}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!session.mfaVerified) {
    if (session.user.totpEnabledAt) redirect("/admin/verify");
    if (env().REQUIRE_2FA) redirect("/admin/setup-2fa");
  }
  if (opts.owner && session.user.role !== "OWNER") redirect("/admin?denied=1");
  return session.user;
}

/** Same checks for API routes, returning null instead of redirecting. */
export async function adminForApi(opts: { owner?: boolean } = {}) {
  const session = await getSession();
  if (!session) return null;
  if (!session.mfaVerified && (session.user.totpEnabledAt || env().REQUIRE_2FA)) return null;
  if (opts.owner && session.user.role !== "OWNER") return null;
  return session.user;
}
