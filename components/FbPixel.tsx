"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { injectFbPixel, pageview } from "../lib/fbpixel";

export default function FbPixel() {
  const pathname = usePathname();

  // Inject pixel script once on mount
  useEffect(() => {
    injectFbPixel();
  }, []);

  // Track pageview on route change
  useEffect(() => {
    pageview();
  }, [pathname]);

  return null;
}
