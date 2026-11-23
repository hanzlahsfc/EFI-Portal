import type { Metadata } from "next";
import Script from "next/script";
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
      <body className={`${body.variable} ${display.variable} ${mono.variable} ${roboto.variable}`}>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-24RRDPL098" strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-24RRDPL098');
        `}</Script>
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '5556167904608209');
          fbq('init', '1454669306252556');
          fbq('track', 'PageView');
        `}</Script>
        {children}
      </body>
    </html>
  );
}
