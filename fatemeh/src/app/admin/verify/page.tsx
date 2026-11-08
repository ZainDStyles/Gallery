import { redirect } from "next/navigation";
import { verifyTotp } from "@/app/actions/auth";
import { AuthForm } from "@/components/admin/AuthForm";
import { AuthShell } from "@/components/admin/AuthShell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Two-factor check" };
export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.mfaVerified) redirect("/admin");
  if (!session.user.totpEnabledAt) redirect("/admin/setup-2fa");
  return (
    <AuthShell title="Enter your code" intro="Open your authenticator app and enter the 6-digit code for Fatemeh Admin.">
      <AuthForm
        action={verifyTotp}
        submit="Verify"
        fields={[{ name: "code", label: "6-digit code", autoComplete: "one-time-code", inputMode: "numeric", pattern: "[0-9 ]*", maxLength: 7 }]}
      />
    </AuthShell>
  );
}
