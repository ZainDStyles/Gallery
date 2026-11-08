import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ivory px-6 text-center">
      <div>
        <p className="eyebrow">Page not found</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,6vw,4.4rem)]">
          This page has <em>moved on.</em>
        </h1>
        <Link href="/" className={buttonClass("primary", "mt-10")}>
          Return home
        </Link>
      </div>
    </main>
  );
}
