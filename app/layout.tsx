import type { Metadata } from "next";
import "../styles/globals.css";

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
      </head>
      <body>{children}</body>
    </html>
  );
}
