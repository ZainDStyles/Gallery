"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/content/site";
import { WhatsApp } from "@/components/ui/icons";

/** Thumb-reachable actions on phones, shown once the visitor scrolls past the hero. */
export function MobileCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/assessment")) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-500 ease-[var(--ease-luxe)] md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div className="flex gap-2.5">
        <Link
          href="/assessment"
          tabIndex={show ? 0 : -1}
          className="flex flex-1 items-center justify-center rounded-full bg-charcoal py-3.5 text-[0.9rem] font-medium text-ivory"
        >
          Free hair assessment
        </Link>
        <a
          href={whatsappLink()}
          tabIndex={show ? 0 : -1}
          aria-label="Message us on WhatsApp"
          className="grid size-[3.25rem] place-items-center rounded-full border border-charcoal/15 text-[1.35rem] text-charcoal"
        >
          <WhatsApp />
        </a>
      </div>
    </div>
  );
}
