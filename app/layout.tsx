import type { Metadata } from "next";
import "../styles/globals.css";
import FbPixel from "../components/FbPixel";

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
        <link rel="icon" href="./images/icons/PG-icon-dorado.png" />
        {/* Meta Pixel handled by FbPixel component */}
      </head>
      <body>
        <FbPixel />
        {children}
      </body>
    </html>
  );
}
