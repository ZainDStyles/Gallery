import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { deleteMessage, setMessageStatus } from "@/app/actions/admin";
import { Pill, btnGhostCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { fmtDate } from "@/components/admin/labels";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const user = await requireAdmin();
  const { show } = await searchParams;
  const archived = show === "archived";
  const messages = await db().contactMessage.findMany({
    where: archived ? { status: "ARCHIVED" } : { status: { in: ["NEW", "READ"] } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl">Messages</h1>
        <a href={archived ? "/admin/messages" : "/admin/messages?show=archived"} className="text-sm text-stone underline-offset-2 hover:underline">
          {archived ? "Show inbox" : "Show archived"}
        </a>
      </div>
      <ul className="mt-8 grid gap-3">
        {messages.map((m) => (
          <li key={m.id} className={`rounded-2xl border p-5 ${m.status === "NEW" ? "border-bronze/40 bg-ivory-raised" : "border-line"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                <span className="font-medium">{m.name}</span> <span className="text-muted">· {m.reference} · {fmtDate(m.createdAt, true)}</span>
              </p>
              <div className="flex gap-2">
                <Pill tone={m.topic.startsWith("Privacy") ? "warn" : "neutral"}>{m.topic}</Pill>
                {m.status === "NEW" && <Pill tone="warn">new</Pill>}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
            <p className="mt-3 text-xs text-stone">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: your message (${m.reference})`)}`} className="text-bronze hover:underline">
                {m.email}
              </a>
              {m.phone ? ` · ${m.phone}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {m.status !== "READ" && (
                <form action={setMessageStatus}>
                  <input type="hidden" name="messageId" value={m.id} />
                  <input type="hidden" name="status" value="READ" />
                  <SubmitButton className={btnGhostCls}>Mark read</SubmitButton>
                </form>
              )}
              {m.status !== "ARCHIVED" && (
                <form action={setMessageStatus}>
                  <input type="hidden" name="messageId" value={m.id} />
                  <input type="hidden" name="status" value="ARCHIVED" />
                  <SubmitButton className={btnGhostCls}>Archive</SubmitButton>
                </form>
              )}
              {user.role === "OWNER" && (
                <form action={deleteMessage}>
                  <input type="hidden" name="messageId" value={m.id} />
                  <SubmitButton className={`${btnGhostCls} text-danger`}>Delete</SubmitButton>
                </form>
              )}
            </div>
          </li>
        ))}
        {messages.length === 0 && <li className="py-12 text-center text-sm text-muted">No messages.</li>}
      </ul>
    </div>
  );
}
