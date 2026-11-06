import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono, Roboto } from "next/font/google";
import "./globals.css";
import "./harness.css";

const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });

export const metadata: Metadata = {
  title: { default: "EFI Future Intelligence Institute", template: "%s · EFI" },
  description: "Automotive electrical and EFI diagnostics training in Lahore. Weekday and weekend lab batches, ISO-registered certificates.",
  icons: { icon: "/brand/efi-logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} ${mono.variable} ${roboto.variable}`}>{children}</body>
    </html>
  );
}
