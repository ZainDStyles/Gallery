import { changePassword, signOutEverywhere } from "@/app/actions/auth";
import { AuthForm } from "@/components/admin/AuthForm";
import { Card, DL, btnGhostCls } from "@/components/admin/ui";
import { fmtDate } from "@/components/admin/labels";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  const user = await requireAdmin();
  const sessions = await db().adminSession.findMany({ where: { userId: user.id }, orderBy: { lastSeenAt: "desc" } });
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <h1 className="font-display text-4xl">Security</h1>
      <Card title="Your account">
        <DL
          rows={[
            ["Name", user.name],
            ["Email", user.email],
            ["Role", user.role === "OWNER" ? "Owner" : "Staff"],
            ["Two-factor", user.totpEnabledAt ? `On since ${fmtDate(user.totpEnabledAt)}` : "Off"],
            ["Last sign-in", fmtDate(user.lastLoginAt, true)],
          ]}
        />
      </Card>
      <Card title={`Signed-in devices (${sessions.length})`}>
        <ul className="grid gap-2 text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="flex justify-between gap-4 border-b border-line pb-2">
              <span className="truncate text-stone">{s.userAgent ?? "Unknown device"}</span>
              <span className="shrink-0 text-xs text-muted">active {fmtDate(s.lastSeenAt, true)}</span>
            </li>
          ))}
        </ul>
        <form action={signOutEverywhere} className="mt-4">
          <button className={btnGhostCls}>Sign out of all devices</button>
        </form>
      </Card>
      <Card title="Change password">
        <div className="max-w-sm">
          <AuthForm
            action={changePassword}
            submit="Update password"
            autoFocusFirst={false}
            fields={[
              { name: "current", label: "Current password", type: "password", autoComplete: "current-password" },
              { name: "next", label: "New password (12+ characters)", type: "password", autoComplete: "new-password" },
              { name: "confirm", label: "Confirm new password", type: "password", autoComplete: "new-password" },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
