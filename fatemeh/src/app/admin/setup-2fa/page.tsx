import { redirect } from "next/navigation";
import { confirmTotpSetup, pendingTotpSecret } from "@/app/actions/auth";
import { AuthForm } from "@/components/admin/AuthForm";
import { AuthShell } from "@/components/admin/AuthShell";
import { getSession } from "@/lib/auth/session";
import { totpQrDataUrl } from "@/lib/auth/totp";

export const metadata = { title: "Set up two-factor authentication" };
export const dynamic = "force-dynamic";

export default async function SetupTwoFactorPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.user.totpEnabledAt) redirect(session.mfaVerified ? "/admin" : "/admin/verify");
  const secret = await pendingTotpSecret();
  const { qr } = await totpQrDataUrl(secret, session.user.email);
  return (
    <AuthShell title="Protect your account" intro="Patient data requires a second step at sign-in. Scan this code with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…).">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="QR code for your authenticator app" width={220} height={220} className="rounded-xl border border-line" />
      <details className="mt-3 text-xs text-stone">
        <summary className="cursor-pointer">Can&apos;t scan? Enter this key instead</summary>
        <code className="mt-2 block break-all rounded-lg bg-sand px-3 py-2 tracking-wider">{secret.match(/.{1,4}/g)?.join(" ")}</code>
      </details>
      <div className="mt-8">
        <AuthForm action={confirmTotpSetup} submit="Turn on two-factor" fields={[{ name: "code", label: "Enter the 6-digit code shown in the app", autoComplete: "one-time-code", inputMode: "numeric", pattern: "[0-9 ]*", maxLength: 7 }]} />
      </div>
    </AuthShell>
  );
}
