import type { Metadata } from "next";
import "../styles/globals.css";
import FbPixel from "@/components/FbPixel";
import { NotificationProvider } from "@/components/Notification";

export const metadata: Metadata = {
  title: "Property Group",
  description: "Created Next.js app with Tailwind CSS and Shadcn UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Use absolute path so the favicon is requested from the site root
            instead of being resolved relative to the current URL path. */}
        <link rel="icon" href="/images/icons/PG-icon-dorado.png" />
        {/* Preconnect to Cloudinary CDN to speed up image fetches and reduce
            browser heuristics that defer loading of important images. */}
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin=""
        />
        {/* Meta Pixel handled by FbPixel component */}
      </head>
      <body>
        <FbPixel />
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
