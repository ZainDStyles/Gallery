"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpHash } from "@/lib/request";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSession, markSessionMfaVerified, requireAdmin } from "@/lib/auth/session";
import { checkTotp, newTotpSecret, openTotpSecret, sealTotpSecret } from "@/lib/auth/totp";

export type FormState = { error?: string; ok?: string; values?: Record<string, string> } | undefined;

const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;
const GENERIC = "Email or password is incorrect.";

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) }).safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  const kept = { email: String(form.get("email") ?? "").slice(0, 200) }; // React clears the form after submit; keep the email
  if (!parsed.success) return { error: GENERIC, values: kept };
  const { email, password } = parsed.data;

  const ip = await clientIpHash();
  if (!(await rateLimit("login-ip", ip, 20, 900)) || !(await rateLimit("login-email", email, 10, 900))) {
    return { error: "Too many attempts. Please wait 15 minutes.", values: kept };
  }

  const user = await db().adminUser.findUnique({ where: { email } });
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    await verifyPassword(null, password); // keep timing consistent
    return { error: "This account is temporarily locked after failed attempts. Try again later.", values: kept };
  }

  const ok = await verifyPassword(user?.passwordHash ?? null, password);
  if (!user || !ok) {
    if (user) {
      const failed = user.failedLogins + 1;
      const lock = failed >= LOCK_AFTER;
      await db().adminUser.update({
        where: { id: user.id },
        data: { failedLogins: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null },
      });
      await audit({ action: lock ? "LOGIN_LOCKED" : "LOGIN_FAILED", actorId: user.id });
    }
    return { error: GENERIC, values: kept };
  }

  await db().adminUser.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } });
  const needsMfa = !!user.totpEnabledAt || env().REQUIRE_2FA;
  await createSession(user.id, !needsMfa);
  await audit({ action: "LOGIN_SUCCEEDED", actorId: user.id });

  if (user.totpEnabledAt) redirect("/admin/verify");
  if (env().REQUIRE_2FA) redirect("/admin/setup-2fa");
  redirect("/admin");
}

export async function verifyTotp(_: FormState, form: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const user = session.user;
  if (!user.totpEnabledAt || !user.totpSecretEnc) redirect("/admin/setup-2fa");

  if (!(await rateLimit("totp", user.id, 8, 900))) return { error: "Too many attempts. Please wait 15 minutes." };

  const secret = openTotpSecret(user.totpSecretEnc, user.id);
  const step = checkTotp(secret, user.email, String(form.get("code") ?? ""), user.totpLastStep);
  if (step === null) {
    await audit({ action: "MFA_FAILED", actorId: user.id });
    return { error: "That code didn't work. Check your authenticator app and try again." };
  }
  await db().adminUser.update({ where: { id: user.id }, data: { totpLastStep: step } });
  await markSessionMfaVerified();
  redirect("/admin");
}

/** Creates (or reuses) a pending secret for the setup screen. */
export async function pendingTotpSecret(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const user = session.user;
  // Already enrolled: never silently replace an active second factor.
  if (user.totpEnabledAt) redirect(session.mfaVerified ? "/admin" : "/admin/verify");
  if (user.totpSecretEnc) return openTotpSecret(user.totpSecretEnc, user.id);
  const secret = newTotpSecret();
  await db().adminUser.update({ where: { id: user.id }, data: { totpSecretEnc: sealTotpSecret(secret, user.id), totpEnabledAt: null } });
  return secret;
}

export async function confirmTotpSetup(_: FormState, form: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const user = session.user;
  if (user.totpEnabledAt) redirect(session.mfaVerified ? "/admin" : "/admin/verify");
  if (!user.totpSecretEnc) return { error: "Setup expired. Reload the page." };
  if (!(await rateLimit("totp-setup", user.id, 10, 900))) return { error: "Too many attempts. Please wait 15 minutes." };

  const secret = openTotpSecret(user.totpSecretEnc, user.id);
  const step = checkTotp(secret, user.email, String(form.get("code") ?? ""), null);
  if (step === null) return { error: "That code didn't match. Make sure your phone's clock is set automatically." };

  await db().adminUser.update({ where: { id: user.id }, data: { totpEnabledAt: new Date(), totpLastStep: step } });
  await markSessionMfaVerified();
  await audit({ action: "MFA_ENABLED", actorId: user.id });
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  if (session) await audit({ action: "LOGOUT", actorId: session.userId });
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return { error: "The new passwords don't match." };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  if (!(await verifyPassword(user.passwordHash, current))) return { error: "Your current password is incorrect." };
  await db().adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  // Sign out every other session.
  const session = await getSession();
  await db().adminSession.deleteMany({ where: { userId: user.id, NOT: { id: session!.id } } });
  await audit({ action: "PASSWORD_CHANGED", actorId: user.id });
  return { ok: "Password updated. Other devices have been signed out." };
}

export async function signOutEverywhere() {
  const user = await requireAdmin();
  await db().adminSession.deleteMany({ where: { userId: user.id } });
  await destroySession();
  redirect("/admin/login");
}
