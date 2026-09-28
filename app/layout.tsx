import type { Metadata, Viewport } from "next";
import { mono, sans, serif } from "./fonts";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Endrit, brand and motion designer",
    template: "%s · Endrit",
  },
  description:
    "Independent brand and motion designer based in Gjilan, Kosovo. I find the idea that makes an identity inevitable.",
  openGraph: { type: "website", siteName: "Endrit" },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
