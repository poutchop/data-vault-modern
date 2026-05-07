import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Vault — Carbon Clarity dMRV Platform",
  description: "Advanced digital MRV (Measurement, Reporting, and Verification) platform for carbon assets. Supporting field audits, real-time analytics, and transparent carbon registries.",
  keywords: ["carbon credit", "dMRV", "blockchain carbon", "climate tech", "carbon verification", "Berekuso project"],
  authors: [{ name: "Carbon Clarity Team" }],
  openGraph: {
    title: "Data Vault — Carbon Clarity dMRV Platform",
    description: "Professional carbon asset registry and field audit platform.",
    url: "https://datavault.carbonclarity.org",
    siteName: "Data Vault",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Vault — Carbon Clarity dMRV Platform",
    description: "Professional carbon asset registry and field audit platform.",
    images: ["/icon-512.png"],
  },
  manifest: "/manifest.json",
  themeColor: "#0a0b14",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Data Vault",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col bg-bg text-text`}>
        {children}
      </body>
    </html>
  );
}
