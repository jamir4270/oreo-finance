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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
