import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "LaunchBase",
  description: "Premium business website template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${cinzel.variable}`}>
      <head>
        {/* Siterify domain verification */}
        <meta
          name="siterify-site-verification"
          content="3018df044fa6a8252bc7afcff8d27405"
        />
      </head>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
