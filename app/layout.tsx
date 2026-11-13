import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono, Roboto } from "next/font/google";
import "./globals.css";
import "./harness.css";

const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });

export const metadata: Metadata = {
  metadataBase: new URL("https://efifutureintelligence.institute"),
  title: { default: "EFI Future Intelligence Institute — Auto EFI & Electrical Courses in Lahore", template: "%s · EFI Institute" },
  description:
    "Hands-on automotive electrical and EFI diagnostics training in Lahore. 3-month and 6-month certified courses, weekend batches, verifiable roll-number certificates.",
  keywords: [
    "EFI course Lahore",
    "auto electrician course Lahore",
    "automotive diagnostics training Pakistan",
    "EFI diagnostics certification",
    "auto electrical course",
  ],
  openGraph: {
    siteName: "EFI Future Intelligence Institute",
    title: "EFI Future Intelligence Institute — Auto EFI & Electrical Courses in Lahore",
    description:
      "Hands-on automotive electrical and EFI diagnostics training in Lahore. Certified courses, weekend batches, verifiable certificates.",
    url: "https://efifutureintelligence.institute",
    type: "website",
    images: [{ url: "/assets/efi-hero.jpeg", width: 1920, height: 1080, alt: "EFI Future Intelligence Institute" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/brand/efi-logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} ${mono.variable} ${roboto.variable}`}>{children}</body>
    </html>
  );
}
