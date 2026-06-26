import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Rajdhani, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  weight: ["400", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Courtside Central — NBA Games & Trivia",
    template: "%s | Courtside Central",
  },
  description: "Free NBA trivia games: Franchise Mode simulator, Higher or Lower, Connections, Guess Who, Start Bench Cut, Stat Line Guesser, and more. Test your NBA knowledge.",
  keywords: ["NBA trivia", "NBA games", "NBA quiz", "basketball trivia", "NBA higher lower", "NBA connections", "NBA franchise mode", "start bench cut NBA", "NBA guess who"],
  icons: {
    icon: [{ url: "/logo-green.png", type: "image/png" }],
    shortcut: "/logo-green.png",
    apple: "/logo-green.png",
  },
  openGraph: {
    type: "website",
    siteName: "Courtside Central",
    title: "Courtside Central — NBA Games & Trivia",
    description: "Free NBA trivia and games. Franchise Mode, Higher or Lower, Connections, Guess Who, and more.",
    url: "https://courtsidecentral.com",
    images: [{ url: "/logo-green.png" }],
  },
  twitter: {
    card: "summary",
    title: "Courtside Central — NBA Games & Trivia",
    description: "Free NBA trivia and games. Test your NBA knowledge.",
    images: ["/logo-green.png"],
  },
  metadataBase: new URL("https://courtsidecentral.com"),
  verification: {
    google: "aiQs_7AQIqTFm18vHTzvagvbGZ6ICKT684r4S2spqa0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${rajdhani.variable} ${playfair.variable} h-full`}>
        <body className="min-h-full flex flex-col text-[#111827] antialiased" style={{ background: "#f4f0e6" }}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Courtside Central",
                url: "https://courtsidecentral.com",
              }),
            }}
          />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
