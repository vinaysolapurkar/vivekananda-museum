import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Viveka Smaraka Museum",
  description:
    "Digital Experience Platform — Ramakrishna Ashram, Mysore",
  manifest: "/manifest.json",
  icons: { apple: "/icons/icon-192.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#14100D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Self-hosted app fonts — a plain <link> so the browser fetches it
            directly, bypassing the CSS bundler's module resolution (which
            can't resolve a public/ path the way a raw @import url() in a
            static HTML file can). */}
        <link rel="stylesheet" href="/fonts/app/fonts.css" />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
