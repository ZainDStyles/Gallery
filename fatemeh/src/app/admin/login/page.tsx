import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/admin/AuthForm";
import { AuthShell } from "@/components/admin/AuthShell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.mfaVerified) redirect("/admin");
  return (
    <AuthShell title="Sign in" intro="Private dashboard for the clinical team.">
      <AuthForm
        action={login}
        submit="Continue"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "username" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
      />
    </AuthShell>
  );
}
