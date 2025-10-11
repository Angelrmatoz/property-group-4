// lib/fbpixel.ts

export const FB_PIXEL_ID = "1063226029330522";

// Standard Meta Pixel script loader
export const pageview = () => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "PageView");
  }
};

export const event = (name: string, options = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", name, options);
  }
};

// Injects the Meta Pixel base script (should be called once, e.g. in _app or layout)
export function injectFbPixel() {
  if (typeof window === "undefined") return;
  if ((window as any).fbq) return; // Prevent double-injection
  const fbPixelLoader: any = function (
    f: any,
    b: any,
    e: any,
    v: any,
    n: any,
    t: any,
    s: any,
  ) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  };
  fbPixelLoader(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js",
  );
  (window as any).fbq("init", FB_PIXEL_ID);
}
