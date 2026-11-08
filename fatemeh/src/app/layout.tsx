import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.brand} — ${site.descriptor} · FUE & DHI`,
    template: `%s · ${site.brand} ${site.descriptor}`,
  },
  description: site.defaultDescription,
  applicationName: `${site.brand} ${site.descriptor}`,
  openGraph: {
    type: "website",
    siteName: `${site.brand} ${site.descriptor}`,
    locale: "en_GB",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.brand} ${site.descriptor}` }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before first paint: enables entrance animations only for visitors who
// haven't asked for reduced motion, with a safety net if scripts fail to load.
const motionScript = `(function(){try{var d=document.documentElement;if(!window.matchMedia||matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion-ok');setTimeout(function(){if(!window.__motionReady)d.classList.remove('motion-ok')},6000)}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
