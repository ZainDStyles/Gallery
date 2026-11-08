import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.brand} ${site.descriptor}`,
    short_name: site.brand,
    start_url: "/",
    display: "browser",
    background_color: "#f6f1e9",
    theme_color: "#f6f1e9",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
