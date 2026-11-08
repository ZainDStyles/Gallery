"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, site, whatsappLink } from "@/content/site";
import { buttonClass } from "@/components/ui/Button";
import { Close, Menu, WhatsApp } from "@/components/ui/icons";
import { onImmersive } from "@/lib/immersive";

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-baseline gap-2.5 ${light ? "text-on-dark" : "text-charcoal"}`}>
      <span className="font-display text-[1.65rem] leading-none tracking-[0.01em]">{site.brand}</span>
      <span className={`hidden text-[0.58rem] font-semibold uppercase tracking-[0.28em] sm:inline ${light ? "text-bronze-soft" : "text-bronze"}`}>
        {site.descriptor}
      </span>
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => onImmersive(setDark), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-charcoal focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <header
        data-dark={dark && !open ? "" : undefined}
        className={`group/header fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter,color] duration-500 ${
          dark && !open
            ? "bg-[#141311]/70 text-on-dark shadow-[0_1px_0_rgb(243_236_225/0.08)] backdrop-blur-xl"
            : scrolled || open
              ? "bg-ivory/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl"
              : "bg-transparent"
        }`}
      >
        <div className="container-site flex h-[4.5rem] items-center justify-between gap-6 md:h-20">
          <Link href="/" aria-label={`${site.brand} ${site.descriptor} — home`} className="relative z-10">
            <Wordmark light={dark && !open} />
          </Link>

          <nav
            aria-label="Main"
            className={`hidden items-center gap-7 rounded-full px-7 py-3 transition-[background-color,box-shadow] duration-500 lg:flex ${
              scrolled || dark ? "" : "bg-ivory/75 shadow-[0_0_0_1px_rgb(221_211_195/0.7)] backdrop-blur-md"
            }`}
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-[0.86rem] tracking-[0.01em] transition-colors hover:text-bronze group-data-[dark]/header:hover:text-bronze-soft ${
                  isActive(item.href) ? "text-bronze" : "text-charcoal group-data-[dark]/header:text-on-dark"
                } after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-10 flex items-center gap-2">
            <Link href="/assessment" className={buttonClass(dark && !open ? "light" : "primary", "px-5 py-2.5 text-[0.82rem] max-sm:hidden")}>
              Free hair assessment
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center rounded-full border border-charcoal/15 bg-ivory/60 text-xl text-charcoal backdrop-blur transition-colors group-data-[dark]/header:border-on-dark/20 group-data-[dark]/header:bg-on-dark/10 group-data-[dark]/header:text-on-dark lg:hidden"
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-ivory pt-24 transition-[opacity,visibility] duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="container-site flex flex-1 flex-col">
          <ul className="border-t border-line">
            {[{ href: "/", label: "Home" }, ...NAV].map((item, i) => (
              <li
                key={item.href}
                style={{ transitionDelay: open ? `${60 + i * 45}ms` : "0ms" }}
                className={`border-b border-line transition-[opacity,transform] duration-700 ease-[var(--ease-luxe)] ${
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <Link href={item.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-4">
                  <span className="font-display text-[2rem] leading-none">{item.label}</span>
                  <span className="text-xs text-muted">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8">
            <Link href="/assessment" onClick={() => setOpen(false)} className={buttonClass("primary", "w-full py-4")}>
              Get your free hair assessment
            </Link>
            <a href={whatsappLink()} className={buttonClass("outline", "w-full py-4")}>
              <WhatsApp className="size-5" /> Message on WhatsApp
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
