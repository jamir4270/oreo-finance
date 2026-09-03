import type { Metadata } from "next";
import { Fredoka, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegistration } from "@/components/PwaRegistration";

/**
 * Typography (Design Spec §3):
 *  - Fredoka: Display headings, nav labels, mascot-adjacent copy
 *  - Inter: Body/UI text, labels, descriptions, settings
 *  - JetBrains Mono: Monetary amounts, tabular data
 */

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oreo — Personal Finance Tracker",
  description:
    "Track income, expenses, and transfers across multiple accounts and currencies. A cozy, playful finance companion named after a beloved cat.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Oreo",
    startupImage: [
      { url: "/splash/iphone-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/iphone-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/iphone-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/ipad-1668x2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/ipad-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
    ],
  },
};


import { FakeSplash } from "@/components/landing/FakeSplash";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <FakeSplash />
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
