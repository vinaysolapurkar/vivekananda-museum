import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#7B2D26",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ background: '#1a0f0a', color: '#F5EDE0', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
