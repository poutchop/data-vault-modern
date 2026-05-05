import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Vault — Carbon Clarity dMRV Platform",
  description: "Bridging rural Ghana with global carbon markets",
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
