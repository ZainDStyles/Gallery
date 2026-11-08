"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string; count?: number }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/enquiries") : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-charcoal text-ivory" : "text-stone hover:bg-sand hover:text-charcoal"}`}
          >
            {i.label}
            {!!i.count && <span className={`rounded-full px-1.5 text-[0.7rem] ${active ? "bg-ivory/20" : "bg-bronze text-ivory"}`}>{i.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
