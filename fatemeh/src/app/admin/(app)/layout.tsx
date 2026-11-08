import { logout } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [newEnquiries, newMessages] = await Promise.all([
    db().enquiry.count({ where: { status: "NEW" } }),
    db().contactMessage.count({ where: { status: "NEW" } }),
  ]);
  const nav = [
    { href: "/admin", label: "Enquiries", count: newEnquiries },
    { href: "/admin/appointments", label: "Appointments" },
    { href: "/admin/messages", label: "Messages", count: newMessages },
    ...(user.role === "OWNER" ? [{ href: "/admin/audit", label: "Access log" }] : []),
    { href: "/admin/security", label: "Security" },
  ];
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 z-30 border-b border-line bg-ivory/95 backdrop-blur lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:block lg:px-5 lg:py-7">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-2xl">Fatemeh</span>
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-bronze">Dashboard</span>
          </p>
          <form action={logout} className="lg:hidden">
            <button className="text-xs text-stone underline-offset-2 hover:underline">Sign out</button>
          </form>
        </div>
        <div className="px-3 pb-3 lg:px-4">
          <AdminNav items={nav} />
        </div>
        <div className="absolute inset-x-0 bottom-0 hidden border-t border-line p-5 text-xs lg:block">
          <p className="font-medium">{user.name}</p>
          <p className="truncate text-muted">{user.email}</p>
          <form action={logout} className="mt-3">
            <button className="text-stone underline-offset-2 hover:underline">Sign out</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-6 md:px-8 lg:py-10">{children}</div>
    </div>
  );
}
